// Vercel serverless function — fetches a YouTube video's transcript (captions).
// GET /api/youtube?url=<youtube link>  ->  { title, text }
//
// Strategy 1: InnerTube player API with the ANDROID client (works far more
//             reliably from datacenter IPs than scraping the watch page).
// Strategy 2: fall back to scraping the watch page HTML.

const WEB_UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";
const ANDROID_UA = "com.google.android.youtube/19.09.37 (Linux; U; Android 11) gzip";
const INNERTUBE_KEY = "AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8";

async function captionText(baseUrl) {
  const sep = baseUrl.includes("?") ? "&" : "?";
  const res = await fetch(baseUrl + sep + "fmt=json3", { headers: { "User-Agent": WEB_UA } });
  if (!res.ok) return "";
  const cap = await res.json().catch(() => null);
  if (!cap) return "";
  return (cap.events || [])
    .map(e => (e.segs || []).map(s => s.utf8 || "").join(""))
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

function pickTrack(tracks) {
  if (!tracks || !tracks.length) return null;
  return tracks.find(t => (t.languageCode || "").startsWith("en") && !(t.vssId || "").startsWith("a.")) ||
         tracks.find(t => (t.languageCode || "").startsWith("en")) ||
         tracks[0];
}

async function viaInnertube(videoId) {
  const res = await fetch(
    "https://www.youtube.com/youtubei/v1/player?key=" + INNERTUBE_KEY + "&prettyPrint=false",
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "User-Agent": ANDROID_UA },
      body: JSON.stringify({
        videoId,
        context: { client: { clientName: "ANDROID", clientVersion: "19.09.37", androidSdkVersion: 30, hl: "en" } },
      }),
    }
  );
  if (!res.ok) throw new Error("player API " + res.status);
  const data = await res.json();
  const status = data.playabilityStatus && data.playabilityStatus.status;
  if (status && status !== "OK") throw new Error("video status " + status);
  const tracks = data.captions &&
    data.captions.playerCaptionsTracklistRenderer &&
    data.captions.playerCaptionsTracklistRenderer.captionTracks;
  const track = pickTrack(tracks);
  if (!track) throw new Error("NO_CAPTIONS");
  const text = await captionText(track.baseUrl);
  if (!text) throw new Error("empty transcript");
  const title = (data.videoDetails && data.videoDetails.title) || "YouTube video";
  return { title, text };
}

async function viaWatchPage(videoId) {
  const page = await (await fetch("https://www.youtube.com/watch?v=" + videoId + "&hl=en", {
    headers: { "User-Agent": WEB_UA, "Accept-Language": "en-US,en;q=0.9" },
  })).text();
  let m = page.match(/"captionTracks":(\[.*?\]),"audioTracks"/) || page.match(/"captionTracks":(\[.*?\])/);
  if (!m) {
    if (/consent\.youtube|action=["']https:\/\/consent/.test(page)) throw new Error("consent wall");
    throw new Error("NO_CAPTIONS");
  }
  const track = pickTrack(JSON.parse(m[1]));
  if (!track) throw new Error("NO_CAPTIONS");
  const text = await captionText(track.baseUrl);
  if (!text) throw new Error("empty transcript");
  let title = "YouTube video";
  const tm = page.match(/"videoDetails":\{[^{]*?"title":"((?:[^"\\]|\\.)*)"/);
  if (tm) { try { title = JSON.parse('"' + tm[1] + '"'); } catch (e) {} }
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
    for (const attempt of [viaInnertube, viaWatchPage]) {
      try {
        const out = await attempt(videoId);
        res.status(200).json(out);
        return;
      } catch (e) {
        errors.push(e.message);
      }
    }

    if (errors.some(e => e === "NO_CAPTIONS")) {
      res.status(404).json({ error: "This video has no captions/subtitles, so there's no transcript to read. Try a video that shows the CC button." });
    } else {
      res.status(502).json({ error: "YouTube refused the request (" + errors.join(" / ") + "). This happens sometimes from cloud servers — wait a minute and try again." });
    }
  } catch (e) {
    res.status(500).json({ error: "YouTube fetch failed: " + e.message });
  }
};
