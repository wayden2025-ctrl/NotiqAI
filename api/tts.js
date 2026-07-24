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
  const gvoice = String((body && body.gvoice) || "Celeste-PlayAI").trim();
  if (!text) { res.status(400).json({ error: "Missing text" }); return; }

  // Remember WHY each provider failed so we can surface a real reason instead of
  // the misleading "set GEMINI_API_KEY" message when a key is actually present.
  let groqFail = null, geminiFail = null;

  // ---- 0) Groq TTS (PlayAI) — primary: reuses your GROQ_API_KEY, more generous
  // free tier than Gemini's preview TTS. OpenAI-compatible /audio/speech endpoint.
  if (process.env.GROQ_API_KEY) {
    try {
      const r = await fetch("https://api.groq.com/openai/v1/audio/speech", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + process.env.GROQ_API_KEY },
        body: JSON.stringify({ model: process.env.GROQ_TTS_MODEL || "playai-tts", voice: gvoice, input: text, response_format: "wav" }),
      });
      if (r.ok) {
        const buf = Buffer.from(await r.arrayBuffer());
        res.status(200).json({ audio: "data:audio/wav;base64," + buf.toString("base64"), provider: "groq" });
        return;
      }
      let detail = "";
      try { const eb = await r.json(); detail = (eb && eb.error && eb.error.message) || ""; }
      catch (e2) { try { detail = (await r.text()).slice(0, 300); } catch (e3) { /* ignore */ } }
      groqFail = { status: r.status, detail: detail || ("HTTP " + r.status) };
      // fall through to Gemini/OpenAI on any Groq failure
    } catch (e) { groqFail = { status: 0, detail: String(e && e.message || e) }; }
  }

  // ---- 1) Gemini TTS (free tier, uses your existing key) ----
  // Some keys/projects don't have access to a given preview TTS model, so try a
  // couple of known model names before giving up.
  if (process.env.GEMINI_API_KEY) {
    const models = [process.env.GEMINI_TTS_MODEL, "gemini-2.5-flash-preview-tts", "gemini-2.5-pro-preview-tts"]
      .filter(Boolean).filter((m, i, a) => a.indexOf(m) === i);   // de-dupe, keep order
    for (const model of models) {
      try {
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
          geminiFail = { model, status: r.status, detail: "Gemini returned no audio for this request." };
        } else {
          // capture the real API error (403 no access, 404 bad model, 429 quota, 400 bad request)
          let detail = "";
          try { const eb = await r.json(); detail = (eb && eb.error && eb.error.message) || ""; }
          catch (e2) { try { detail = (await r.text()).slice(0, 300); } catch (e3) { /* ignore */ } }
          geminiFail = { model, status: r.status, detail: detail || ("HTTP " + r.status) };
          // 404/400 usually = this model name isn't available to the key; try the next one.
          if (r.status !== 404 && r.status !== 400) break;   // 403/429/5xx won't be fixed by another model
        }
      } catch (e) { geminiFail = { model, status: 0, detail: String(e && e.message || e) }; }
    }
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

  // Report the real cause. If a key WAS present but the provider rejected the
  // request, show that — "set GEMINI_API_KEY" is wrong and confusing then.
  if (groqFail) {
    const s = groqFail.status;
    let hint = groqFail.detail || "the request was rejected";
    if (s === 400 || s === 403) {
      // Groq requires a one-time acceptance of the PlayAI TTS model terms.
      if (/terms|accept|agree/i.test(groqFail.detail || "")) hint = "Accept the playai-tts model terms once at console.groq.com (Playground → pick playai-tts), then retry. Details: " + groqFail.detail;
      else hint = "Groq rejected the TTS request (model '" + (process.env.GROQ_TTS_MODEL || "playai-tts") + "'). If you haven't yet, accept the playai-tts terms at console.groq.com. Details: " + groqFail.detail;
    } else if (s === 429) hint = "Groq TTS rate limit reached — wait a moment and try again. Details: " + groqFail.detail;
    res.status(502).json({ error: "Narration failed: " + hint, provider: "groq", status: s });
    return;
  }
  if (geminiFail) {
    const s = geminiFail.status;
    let hint = geminiFail.detail || "the request was rejected";
    if (s === 429) hint = "Gemini TTS free-tier quota reached — wait a bit and try again (or raise the limit in Google AI Studio). Details: " + geminiFail.detail;
    else if (s === 403) hint = "This Gemini key/project doesn't have access to the TTS model (" + geminiFail.model + "). Enable it in Google AI Studio or set GEMINI_TTS_MODEL. Details: " + geminiFail.detail;
    else if (s === 404 || s === 400) hint = "TTS model '" + geminiFail.model + "' isn't available to this key. Set GEMINI_TTS_MODEL to a TTS model you have access to. Details: " + geminiFail.detail;
    res.status(502).json({ error: "Narration failed: " + hint, provider: "gemini", status: s });
    return;
  }
  res.status(502).json({ error: "No TTS engine available. Set GROQ_API_KEY or GEMINI_API_KEY (both free) or OPENAI_API_KEY in Vercel." });
};
