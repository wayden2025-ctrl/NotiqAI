// Vercel serverless function — fetches a YouTube video's transcript (captions).
// GET /api/youtube?url=<youtube link>  ->  { title, text }
// Tries several of YouTube's internal player clients, since different ones
// include captions depending on YouTube's mood, then falls back to scraping.

const WEB_UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";
const ANDROID_UA = "com.google.android.youtube/19.09.37 (Linux; U; Android 11) gzip";
// NOTE: this is YouTube's OWN PUBLIC InnerTube web key (baked into youtube.com
// for every visitor) — NOT a private credential. Safe to be here.
const KEY = "AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8";

const CLIENTS = [
  { name: "tv", ua: WEB_UA, thirdParty: true,
    client: { clientName: "TVHTML5_SIMPLY_EMBEDDED_PLAYER", clientVersion: "2.0", hl: "en" } },
  { name: "web", ua: WEB_UA,
    client: { clientName: "WEB", clientVersion: "2.20240726.00.00", hl: "en" } },
  { name: "android", ua: ANDROID_UA,
    client: { clientName: "ANDROID", clientVersion: "19.09.37", androidSdkVersion: 30, hl: "en" } },
];

function decodeEntities(s) {
  return s
    .replace(/&#(\d+);/g, (m, n) => String.fromCharCode(+n))
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'");
}

async function captionText(baseUrl) {
  const sep = baseUrl.includes("?") ? "&" : "?";
  // try json3 first
  try {
    const res = await fetch(baseUrl + sep + "fmt=json3", { headers: { "User-Agent": WEB_UA } });
    if (res.ok) {
      const cap = await res.json().catch(() => null);
      if (cap) {
        const text = (cap.events || [])
          .map(e => (e.segs || []).map(s => s.utf8 || "").join(""))
          .join(" ").replace(/\s+/g, " ").trim();
        if (text) return text;
      }
    }
  } catch (e) {}
  // fall back to the XML format
  try {
    const res = await fetch(baseUrl, { headers: { "User-Agent": WEB_UA } });
    if (res.ok) {
      const xml = await res.text();
      const parts = [...xml.matchAll(/<text[^>]*>([\s\S]*?)<\/text>/g)].map(m => decodeEntities(m[1]));
      const text = parts.join(" ").replace(/\s+/g, " ").trim();
      if (text) return text;
    }
  } catch (e) {}
  return "";
}

function pickTrack(tracks) {
  if (!tracks || !tracks.length) return null;
  return tracks.find(t => (t.languageCode || "").startsWith("en") && !(t.vssId || "").startsWith("a.")) ||
         tracks.find(t => (t.languageCode || "").startsWith("en")) ||
         tracks[0];
}

async function viaInnertube(videoId, cfg) {
  const body = { videoId, context: { client: cfg.client } };
  if (cfg.thirdParty) body.context.thirdParty = { embedUrl: "https://www.youtube.com" };
  const res = await fetch("https://www.youtube.com/youtubei/v1/player?key=" + KEY + "&prettyPrint=false", {
    method: "POST",
    headers: { "Content-Type": "application/json", "User-Agent": cfg.ua },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(cfg.name + " " + res.status);
  const data = await res.json();
  const status = data.playabilityStatus && data.playabilityStatus.status;
  if (status && status !== "OK") throw new Error(cfg.name + " " + status);
  const tracks = data.captions &&
    data.captions.playerCaptionsTracklistRenderer &&
    data.captions.playerCaptionsTracklistRenderer.captionTracks;
  const track = pickTrack(tracks);
  if (!track) throw new Error(cfg.name + " NO_CAPTIONS");
  const text = await captionText(track.baseUrl);
  if (!text) throw new Error(cfg.name + " EMPTY_TRANSCRIPT");
  const title = (data.videoDetails && data.videoDetails.title) || "YouTube video";
  return { title, text };
}

async function viaWatchPage(videoId) {
  const page = await (await fetch("https://www.youtube.com/watch?v=" + videoId + "&hl=en", {
    headers: { "User-Agent": WEB_UA, "Accept-Language": "en-US,en;q=0.9" },
  })).text();
  let m = page.match(/"captionTracks":(\[.*?\]),"audioTracks"/) || page.match(/"captionTracks":(\[.*?\])/);
  if (!m) throw new Error("scrape NO_CAPTIONS");
  const track = pickTrack(JSON.parse(m[1]));
  if (!track) throw new Error("scrape NO_CAPTIONS");
  const text = await captionText(track.baseUrl);
  if (!text) throw new Error("scrape EMPTY_TRANSCRIPT");
  let title = "YouTube video";
  const tm = page.match(/"videoDetails":\{[^{]*?"title":"((?:[^"\\]|\\.)*)"/);
  if (tm) { try { title = JSON.parse('"' + tm[1] + '"'); } catch (e) {} }
  return { title, text };
}

// Optional: Supadata transcript API (set SUPADATA_KEY in Vercel env vars).
// Sidesteps YouTube's bot-blocking of cloud servers entirely.
async function viaSupadata(videoId) {
  const key = process.env.SUPADATA_KEY;
  if (!key) throw new Error("supadata not configured");
  const res = await fetch(
    "https://api.supadata.ai/v1/youtube/transcript?text=true&url=" +
      encodeURIComponent("https://www.youtube.com/watch?v=" + videoId),
    { headers: { "x-api-key": key } }
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error("supadata " + res.status + (err.message ? " " + err.message : ""));
  }
  const data = await res.json();
  let text = "";
  if (typeof data.content === "string") text = data.content;
  else if (Array.isArray(data.content)) text = data.content.map(c => c.text || "").join(" ");
  text = text.replace(/\s+/g, " ").trim();
  if (!text) throw new Error("supadata EMPTY_TRANSCRIPT");

  let title = "YouTube video";
  try {
    const meta = await (await fetch("https://api.supadata.ai/v1/youtube/video?id=" + videoId, {
      headers: { "x-api-key": key },
    })).json();
    if (meta && meta.title) title = meta.title;
  } catch (e) {}
  return { title, text };
}

module.exports = async (req, res) => {
  try {
    const url = (req.query && req.query.url) || "";
    const idMatch = url.match(/(?:youtu\.be\/|[?&]v=|shorts\/|embed\/|live\/)([A-Za-z0-9_-]{11})/);
    if (!idMatch) {
      res.status(400).json({ error: "That doesn't look like a YouTube link. Copy the full URL from the address bar or the Share button." });
      return;
    }
    const videoId = idMatch[1];

    const errors = [];
    if (process.env.SUPADATA_KEY) {
      try { res.status(200).json(await viaSupadata(videoId)); return; }
      catch (e) { errors.push(e.message); }
    }
    for (const cfg of CLIENTS) {
      try { res.status(200).json(await viaInnertube(videoId, cfg)); return; }
      catch (e) { errors.push(e.message); }
    }
    try { res.status(200).json(await viaWatchPage(videoId)); return; }
    catch (e) { errors.push(e.message); }

    const detail = errors.join(" | ");
    if (req.query && req.query.debug) { res.status(502).json({ error: detail }); return; }
    if (errors.every(e => /NO_CAPTIONS/.test(e))) {
      res.status(404).json({ error: "YouTube isn't giving us captions for this video right now (" + detail + "). Try again in a minute or try another video." });
    } else {
      res.status(502).json({ error: "YouTube refused the request (" + detail + "). Wait a minute and try again." });
    }
  } catch (e) {
    res.status(500).json({ error: "YouTube fetch failed: " + e.message });
  }
};
