// Vercel serverless function — keeps the Groq API key private on the server.
// The key comes from the GROQ_API_KEY environment variable set in the
// Vercel dashboard (Project -> Settings -> Environment Variables).

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: { message: "POST only" } });
    return;
  }
  if (!process.env.GROQ_API_KEY) {
    res.status(500).json({ error: { message: "GROQ_API_KEY is not set in Vercel environment variables." } });
    return;
  }
  try {
    const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + process.env.GROQ_API_KEY,
      },
      body: JSON.stringify(req.body),
    });
    const data = await r.json();
    res.status(r.status).json(data);
  } catch (e) {
    res.status(500).json({ error: { message: e.message } });
  }
};
