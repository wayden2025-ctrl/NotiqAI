// Stock-image lookup for slides. Uses a FREE Pexels key (PEXELS_API_KEY) and/or a
// free Pixabay key (PIXABAY_API_KEY). Add either in Vercel env vars — whichever is
// set gets used (Pexels first). Without a key it returns { url: null } so slides
// simply stay image-free instead of erroring.
//
//   GET /api/image?q=roman+empire
//
// The image is fetched server-side and returned as a base64 data URI, so it drops
// straight into the slide preview, the PowerPoint export, and the PDF with no
// cross-origin (CORS) headaches.

async function toDataUri(url) {
  const r = await fetch(url);
  if (!r.ok) return null;
  const type = r.headers.get("content-type") || "image/jpeg";
  const buf = Buffer.from(await r.arrayBuffer());
  if (buf.length > 2500000) return null; // keep decks a sane size
  return "data:" + type + ";base64," + buf.toString("base64");
}

module.exports = async (req, res) => {
  const q = String((req.query && req.query.q) || "").trim().slice(0, 80);
  if (!q) { res.status(400).json({ error: "Missing q" }); return; }

  const hasPexels = !!process.env.PEXELS_API_KEY;
  const hasPixabay = !!process.env.PIXABAY_API_KEY;
  if (!hasPexels && !hasPixabay) { res.status(200).json({ url: null, reason: "no-key" }); return; }

  // cache the (base64) result at the CDN edge — topics repeat a lot
  res.setHeader("Cache-Control", "s-maxage=86400, stale-while-revalidate=604800");

  try {
    let pick = null, credit = "", source = "";
    if (hasPexels) {
      const r = await fetch(
        "https://api.pexels.com/v1/search?orientation=landscape&per_page=1&query=" + encodeURIComponent(q),
        { headers: { Authorization: process.env.PEXELS_API_KEY } }
      );
      if (r.ok) {
        const j = await r.json();
        const p = (j.photos || [])[0];
        pick = p && p.src && (p.src.large || p.src.landscape || p.src.original);
        credit = (p && p.photographer) || "Pexels"; source = "pexels";
      }
    }
    if (!pick && hasPixabay) {
      const r = await fetch(
        "https://pixabay.com/api/?safesearch=true&orientation=horizontal&per_page=3&image_type=photo&key=" +
          encodeURIComponent(process.env.PIXABAY_API_KEY) + "&q=" + encodeURIComponent(q)
      );
      if (r.ok) {
        const j = await r.json();
        const hit = (j.hits || [])[0];
        pick = hit && (hit.webformatURL || hit.largeImageURL);
        credit = (hit && hit.user) || "Pixabay"; source = "pixabay";
      }
    }
    if (!pick) { res.status(200).json({ url: null, reason: "no-match" }); return; }

    const data = await toDataUri(pick);
    if (!data) { res.status(200).json({ url: null, reason: "too-big" }); return; }
    res.status(200).json({ url: data, credit, source });
  } catch (e) {
    res.status(200).json({ url: null, reason: "error" });
  }
};
