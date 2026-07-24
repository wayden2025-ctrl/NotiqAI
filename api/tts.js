// Text-to-speech for the Video Overview feature.
// Primary: Google Gemini TTS (uses the same GEMINI_API_KEY you already set in Vercel —
// ~30 natural prebuilt voices, generous free tier). Returns 24kHz PCM which we wrap
// into a WAV data URI so the browser can decode & play it directly.
// Fallback: OpenAI TTS (tts-1) if OPENAI_API_KEY is set.
//
//   POST /api/tts   { text: "...", voice: "Kore", ovoice: "alloy" }
//   -> { audio: "data:audio/wav;base64,....", provider: "gemini" }

function pcmToWavDataUri(b64pcm, sampleRate) {
  const pcm = Buffer.from(b64pcm, "base64");        // 16-bit signed LE, mono
  const numCh = 1, bitsPerSample = 16;
  const byteRate = sampleRate * numCh * bitsPerSample / 8;
  const blockAlign = numCh * bitsPerSample / 8;
  const header = Buffer.alloc(44);
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + pcm.length, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);                       // PCM
  header.writeUInt16LE(numCh, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);
  header.write("data", 36);
  header.writeUInt32LE(pcm.length, 40);
  const wav = Buffer.concat([header, pcm]);
  return "data:audio/wav;base64," + wav.toString("base64");
}

module.exports = async (req, res) => {
  if (req.method !== "POST") { res.status(405).json({ error: "POST only" }); return; }

  let body = req.body;
  if (typeof body === "string") { try { body = JSON.parse(body); } catch (e) { body = {}; } }
  const text = String((body && body.text) || "").trim().slice(0, 8000);
  const voice = String((body && body.voice) || "Kore").trim();
  const ovoice = String((body && body.ovoice) || "alloy").trim();
  if (!text) { res.status(400).json({ error: "Missing text" }); return; }

  // ---- 1) Gemini TTS (free tier, uses your existing key) ----
  if (process.env.GEMINI_API_KEY) {
    try {
      const model = process.env.GEMINI_TTS_MODEL || "gemini-2.5-flash-preview-tts";
      const r = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent?key=" +
          encodeURIComponent(process.env.GEMINI_API_KEY),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text }] }],
            generationConfig: {
              responseModalities: ["AUDIO"],
              speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } },
            },
          }),
        }
      );
      if (r.ok) {
        const j = await r.json();
        const part = j && j.candidates && j.candidates[0] && j.candidates[0].content &&
          j.candidates[0].content.parts && j.candidates[0].content.parts[0];
        const data = part && part.inlineData && part.inlineData.data;
        if (data) {
          const mime = (part.inlineData.mimeType || "").toLowerCase();
          const m = mime.match(/rate=(\d+)/);
          const rate = m ? parseInt(m[1], 10) : 24000;
          res.status(200).json({ audio: pcmToWavDataUri(data, rate), provider: "gemini" });
          return;
        }
      }
      // fall through to OpenAI on any Gemini failure
    } catch (e) { /* fall through */ }
  }

  // ---- 2) OpenAI TTS fallback (only if a key is set) ----
  if (process.env.OPENAI_API_KEY) {
    try {
      const r = await fetch("https://api.openai.com/v1/audio/speech", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + process.env.OPENAI_API_KEY },
        body: JSON.stringify({ model: process.env.OPENAI_TTS_MODEL || "tts-1", voice: ovoice, input: text, response_format: "wav" }),
      });
      if (r.ok) {
        const buf = Buffer.from(await r.arrayBuffer());
        res.status(200).json({ audio: "data:audio/wav;base64," + buf.toString("base64"), provider: "openai" });
        return;
      }
    } catch (e) { /* fall through */ }
  }

  res.status(502).json({ error: "No TTS engine available. Set GEMINI_API_KEY (recommended) or OPENAI_API_KEY in Vercel." });
};
