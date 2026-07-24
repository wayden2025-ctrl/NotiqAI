// Image lookup for slides. Tries several FREE sources of REAL photos in order and
// returns the first hit as a base64 data URI, so it drops straight into the slide
// preview, the PowerPoint export and the PDF with no cross-origin (CORS) headaches.
//
//   GET /api/image?q=roman+empire
//
// Fallback order (each step is skipped if unavailable, so a slide gets an on-topic
// photo instead of blank):
//   1. Pexels    — real stock photos       (needs free PEXELS_API_KEY  in Vercel env)
//   2. Pixabay   — real stock photos       (needs free PIXABAY_API_KEY in Vercel env)
//   3. Wikimedia — real encyclopedic photo (KEYLESS — great for history/science topics)
//
// Wikimedia needs no key, so photos work out of the box. Set a Pexels/Pixabay key for
// broader, higher-quality stock coverage; Wikimedia then just fills the gaps.
// No AI-generated images are used — every picture is a real photograph.

async function toDataUri(url, headers) {
  const r = await fetch(url, headers ? { headers } : undefined);
  if (!r.ok) return null;
  const type = r.headers.get("content-type") || "image/jpeg";
  if (!/^image\//i.test(type)) return null;          // not an image (error page etc.)
  const buf = Buffer.from(await r.arrayBuffer());
  if (buf.length < 900) return null;                 // 1px tracker / empty
  if (buf.length > 4000000) return null;             // keep decks a sane size
  return "data:" + type + ";base64," + buf.toString("base64");
}

// --- individual providers: each returns { pick, credit, source } or null ---

async function fromPexels(q) {
  if (!process.env.PEXELS_API_KEY) return null;
  const r = await fetch(
    "https://api.pexels.com/v1/search?orientation=landscape&per_page=1&query=" + encodeURIComponent(q),
    { headers: { Authorization: process.env.PEXELS_API_KEY } }
  );
  if (!r.ok) return null;
  const j = await r.json();
  const p = (j.photos || [])[0];
  const pick = p && p.src && (p.src.large || p.src.landscape || p.src.original);
  return pick ? { pick, credit: (p.photographer || "Pexels"), source: "pexels" } : null;
}

async function fromPixabay(q) {
  if (!process.env.PIXABAY_API_KEY) return null;
  const r = await fetch(
    "https://pixabay.com/api/?safesearch=true&orientation=horizontal&per_page=3&image_type=photo&key=" +
      encodeURIComponent(process.env.PIXABAY_API_KEY) + "&q=" + encodeURIComponent(q)
  );
  if (!r.ok) return null;
  const j = await r.json();
  const hit = (j.hits || [])[0];
  const pick = hit && (hit.webformatURL || hit.largeImageURL);
  return pick ? { pick, credit: (hit.user || "Pixabay"), source: "pixabay" } : null;
}

// Wikimedia: find the best-matching Wikipedia article and take its lead image
// (a real, on-topic photo). Keyless. We ask for a ~1200px thumbnail so it's not huge.
async function fromWikimedia(q) {
  const api = "https://en.wikipedia.org/w/api.php?format=json&origin=*&action=query" +
    "&generator=search&gsrsearch=" + encodeURIComponent(q) + "&gsrlimit=3&gsrnamespace=0" +
    "&prop=pageimages&piprop=thumbnail&pithumbsize=1200&pilimit=3";
  const r = await fetch(api, { headers: { "User-Agent": "NotiqSlides/1.0 (study app)" } });
  if (!r.ok) return null;
  const j = await r.json();
  const pages = j && j.query && j.query.pages;
  if (!pages) return null;
  // pick the first result that actually has a raster thumbnail (skip svg logos/flags)
  const list = Object.values(pages).sort((a, b) => (a.index || 99) - (b.index || 99));
  for (const p of list) {
    const src = p.thumbnail && p.thumbnail.source;
    if (src && !/\.svg/i.test(src)) return { pick: src, credit: "Wikimedia", source: "wikimedia" };
  }
  return null;
}

module.exports = async (req, res) => {
  const q = String((req.query && req.query.q) || "").trim().slice(0, 80);
  if (!q) { res.status(400).json({ error: "Missing q" }); return; }

  // cache the (base64) result at the CDN edge — topics repeat a lot
  res.setHeader("Cache-Control", "s-maxage=86400, stale-while-revalidate=604800");

  try {
    // real-photo provider chain, in priority order
    const chain = [fromPexels, fromPixabay, fromWikimedia];
    for (const provider of chain) {
      let hit = null;
      try { hit = await provider(q); } catch (e) { hit = null; }
      if (!hit || !hit.pick) continue;
      const data = await toDataUri(hit.pick);
      if (data) { res.status(200).json({ url: data, credit: hit.credit, source: hit.source }); return; }
    }

    res.status(200).json({ url: null, reason: "no-match" });
  } catch (e) {
    res.status(200).json({ url: null, reason: "error" });
  }
};
