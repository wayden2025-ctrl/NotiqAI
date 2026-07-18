// OCR endpoint — reads text out of images and scanned pages via OCR.space.
// Needs the free OCR_SPACE_KEY env var (ocr.space/ocrapi -> free API key).
module.exports = async (req, res) => {
  if (req.method !== "POST") { res.status(405).json({ error: "POST only" }); return; }
  if (!process.env.OCR_SPACE_KEY) {
    res.status(501).json({ error: "Photo reading is not set up yet." });
    return;
  }
  const image = (req.body || {}).image;
  if (!image || typeof image !== "string" || !image.startsWith("data:image") || image.length > 1400000) {
    res.status(400).json({ error: "Bad image." });
    return;
  }
  try {
    const params = new URLSearchParams();
    params.set("base64Image", image);
    params.set("apikey", process.env.OCR_SPACE_KEY);
    params.set("OCREngine", "2");
    params.set("scale", "true");
    const r = await fetch("https://api.ocr.space/parse/image", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });
    const j = await r.json();
    if (j.IsErroredOnProcessing) {
      res.status(500).json({ error: (j.ErrorMessage && j.ErrorMessage[0]) || "Couldn't read that image." });
      return;
    }
    const text = (j.ParsedResults || []).map(p => p.ParsedText || "").join("\n").trim();
    res.status(200).json({ text });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
