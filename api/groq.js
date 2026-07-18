// Vercel serverless function — keeps the Groq API key private AND protects the quota.
//
// Protection layers (all tunable via Vercel env vars, no code changes needed):
//   RATE_PER_MIN  — max generations per IP per minute   (default 8)
//   RATE_PER_DAY  — max generations per IP per day      (default 120)
//   Payload guards — oversized requests are rejected before they cost tokens.
//   Optional login lock — if SUPABASE_URL and SUPABASE_ANON_KEY env vars are set,
//   only signed-in Notiq users can generate at all.

const hits = new Map(); // ip -> { minute: [timestamps], day: count, dayStart: ms }
const guestHits = new Map(); // ip -> { day: count, dayStart: ms } — signed-out "try it" visitors

function guestLimited(ip) {
  const perDay = parseInt(process.env.GUEST_RATE_PER_DAY || "3", 10);
  const now = Date.now();
  let g = guestHits.get(ip);
  if (!g || now - g.dayStart > 86400000) g = { day: 0, dayStart: now };
  if (g.day >= perDay) { guestHits.set(ip, g); return true; }
  g.day++;
  guestHits.set(ip, g);
  if (guestHits.size > 5000) guestHits.clear();
  return false;
}

function rateLimited(ip, isPro) {
  // Pro users get effectively-unlimited generous ceilings (still bot-proof);
  // free/anonymous traffic gets the tight defaults.
  const perMin = isPro
    ? parseInt(process.env.PRO_RATE_PER_MIN || "30", 10)
    : parseInt(process.env.RATE_PER_MIN || "8", 10);
  const perDay = isPro
    ? parseInt(process.env.PRO_RATE_PER_DAY || "3000", 10)
    : parseInt(process.env.RATE_PER_DAY || "120", 10);
  const now = Date.now();
  let h = hits.get(ip);
  if (!h || now - h.dayStart > 86400000) h = { minute: [], day: 0, dayStart: now };
  h.minute = h.minute.filter(t => now - t < 60000);
  if (h.minute.length >= perMin) { hits.set(ip, h); return "You're generating too fast — wait a minute and try again."; }
  if (h.day >= perDay) {
    hits.set(ip, h);
    return isPro
      ? "Daily generation limit reached — come back tomorrow."
      : "Daily generation limit reached — come back tomorrow, or upgrade to Pro for unlimited generations.";
  }
  h.minute.push(now);
  h.day++;
  hits.set(ip, h);
  if (hits.size > 5000) hits.clear(); // memory guard
  return null;
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: { message: "POST only" } });
    return;
  }
  if (!process.env.GROQ_API_KEY) {
    res.status(500).json({ error: { message: "GROQ_API_KEY is not set in Vercel environment variables." } });
    return;
  }

  const ip = ((req.headers["x-forwarded-for"] || "").split(",")[0] || "unknown").trim();

  // Detect the caller's plan so Pro users are never throttled like free ones.
  // (Requires SUPABASE_URL + SUPABASE_ANON_KEY env vars; without them everyone
  // gets the free-tier server limits, which is still safe.)
  let isPro = false;
  const token = req.headers["x-notiq-auth"];
  const sbBase = (process.env.SUPABASE_URL || "").trim().replace(/\/+$/, "");
  if (sbBase && process.env.SUPABASE_ANON_KEY) {
    if (!token) {
      // signed-out visitors get a tiny "try it" allowance per IP per day
      if (guestLimited(ip)) {
        res.status(401).json({ error: { message: "Sign in to keep generating — Notiq is still completely free." } });
        return;
      }
    } else {
    try {
      const u = await fetch(sbBase + "/auth/v1/user", {
        headers: { apikey: (process.env.SUPABASE_ANON_KEY || "").trim(), Authorization: "Bearer " + token },
      });
      if (u.status === 401 || u.status === 403) {
        res.status(401).json({ error: { message: "Session expired — sign in again." } });
        return;
      }
      // any other failure = our config/infra problem, never block the student
      const p = u.ok ? await fetch(sbBase + "/rest/v1/profiles?select=plan,plan_until", {
        headers: { apikey: (process.env.SUPABASE_ANON_KEY || "").trim(), Authorization: "Bearer " + token },
      }) : { ok: false };
      if (p.ok) {
        const rows = await p.json();
        const row = Array.isArray(rows) && rows[0];
        isPro = !!(row && row.plan === "pro" && (!row.plan_until || new Date(row.plan_until) > new Date()));
      }
    } catch (e) {
      // network hiccup verifying the session — let the request through on free-tier limits
    }
    }
  }

  const limitMsg = rateLimited(ip, isPro);
  if (limitMsg) {
    res.status(429).json({ error: { message: limitMsg } });
    return;
  }

  // Payload guards — reject before spending tokens
  const body = req.body || {};
  if (!Array.isArray(body.messages) || body.messages.length === 0 || body.messages.length > 6) {
    res.status(400).json({ error: { message: "Invalid request." } });
    return;
  }
  const totalChars = body.messages.reduce((n, m) => n + String(m.content || "").length, 0);
  if (totalChars > 60000) {
    res.status(413).json({ error: { message: "That request is too large — select fewer or smaller resources." } });
    return;
  }
  body.max_tokens = Math.min(Number(body.max_tokens) || 6000, 8000);

  const callGroq = (b) => fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + process.env.GROQ_API_KEY,
    },
    body: JSON.stringify(b),
  });

  try {
    let r = await callGroq(body);

    // Groq's free tier caps tokens-per-minute PER MODEL. If we hit that wall:
    // 1) if Groq says the wait is short, wait it out and retry the same model;
    // 2) still limited? switch to the fallback model (separate token bucket);
    // 3) still limited? return one clean, human message instead of Groq's raw error.
    if (r.status === 429) {
      let wait = 0;
      try {
        const errData = await r.json();
        const m = ((errData.error && errData.error.message) || "").match(/try again in ([\d.]+)s/i);
        if (m) wait = Math.ceil(parseFloat(m[1]));
      } catch (e) { /* ignore */ }
      if (wait > 0 && wait <= 25) {
        await new Promise(s => setTimeout(s, (wait + 1) * 1000));
        r = await callGroq(body);
      }
      if (r.status === 429) {
        r = await callGroq({ ...body, model: process.env.GROQ_FALLBACK_MODEL || "llama-3.1-8b-instant" });
      }
      // second engine: Google Gemini (free tier, separate allowance from Groq)
      if (r.status === 429 && process.env.GEMINI_API_KEY) {
        try {
          const g = await fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": "Bearer " + process.env.GEMINI_API_KEY,
            },
            body: JSON.stringify({ ...body, model: process.env.GEMINI_MODEL || "gemini-2.0-flash" }),
          });
          if (g.ok) { res.status(200).json(await g.json()); return; }
        } catch (e) { /* fall through to the friendly message */ }
      }
      if (r.status === 429) {
        res.status(429).json({ error: { message: "Too many people are generating at the same time right now — give it a minute and try again." } });
        return;
      }
    }

    const data = await r.json();
    res.status(r.status).json(data);
  } catch (e) {
    res.status(500).json({ error: { message: e.message } });
  }
};
