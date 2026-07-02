// Vercel serverless function — fetches a YouTube video's transcript (captions).
// GET /api/youtube?url=<youtube link>  ->  { title, text }

const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

module.exports = async (req, res) => {
  try {
    const url = (req.query && req.query.url) || "";
    const idMatch = url.match(/(?:youtu\.be\/|[?&]v=|shorts\/|embed\/|live\/)([A-Za-z0-9_-]{11})/);
    if (!idMatch) {
      res.status(400).json({ error: "That doesn't look like a YouTube link." });
      return;
    }
    const videoId = idMatch[1];

    const page = await (await fetch("https://www.youtube.com/watch?v=" + videoId, {
      headers: { "User-Agent": UA, "Accept-Language": "en-US,en;q=0.9" },
    })).text();

    let m = page.match(/"captionTracks":(\[.*?\]),"audioTracks"/);
    if (!m) m = page.match(/"captionTracks":(\[.*?\])/);
    if (!m) {
      res.status(404).json({ error: "This video has no captions/subtitles, so there's no transcript to read. Try a video that has them (most lectures do)." });
      return;
    }
    const tracks = JSON.parse(m[1]);
    const track = tracks.find(t => (t.languageCode || "").startsWith("en")) || tracks[0];

    const cap = await (await fetch(track.baseUrl + "&fmt=json3", {
      headers: { "User-Agent": UA },
    })).json();
    const text = (cap.events || [])
      .map(e => (e.segs || []).map(s => s.utf8 || "").join(""))
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
    if (!text) {
      res.status(404).json({ error: "Couldn't read the transcript from this video." });
      return;
    }

    let title = "YouTube video";
    const tm = page.match(/"videoDetails":\{[^{]*?"title":"((?:[^"\\]|\\.)*)"/);
    if (tm) { try { title = JSON.parse('"' + tm[1] + '"'); } catch (e) {} }

    res.status(200).json({ title, text });
  } catch (e) {
    res.status(500).json({ error: "YouTube fetch failed: " + e.message });
  }
};
