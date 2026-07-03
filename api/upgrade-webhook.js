// Stripe -> auto-upgrade webhook. When Stripe checkout is set up, point a
// Stripe webhook at:  https://YOUR-SITE.vercel.app/api/upgrade-webhook?key=YOUR_SECRET
//
// Required Vercel env vars:
//   WEBHOOK_KEY           — a long random string; the same one you put in the URL above
//   SUPABASE_URL          — your Supabase project URL
//   SUPABASE_SERVICE_KEY  — Supabase service_role key (Settings -> API). Server-only. NEVER put in client code.
//
// Handles: checkout.session.completed / invoice.paid  -> plan = 'pro'
//          customer.subscription.deleted              -> plan = 'free'

async function setPlanByEmail(email, plan) {
  const base = process.env.SUPABASE_URL;
  const svc = process.env.SUPABASE_SERVICE_KEY;
  const headers = { apikey: svc, Authorization: "Bearer " + svc, "Content-Type": "application/json" };

  // find the auth user by email (admin API)
  const u = await fetch(base + "/auth/v1/admin/users?page=1&per_page=1&email=" + encodeURIComponent(email), { headers });
  if (!u.ok) throw new Error("user lookup failed: " + u.status);
  const data = await u.json();
  const users = data.users || data;
  const user = (Array.isArray(users) ? users : []).find(x => (x.email || "").toLowerCase() === email.toLowerCase());
  if (!user) throw new Error("no account found for " + email);

  // upsert the profile plan (service role bypasses RLS)
  const r = await fetch(base + "/rest/v1/profiles?on_conflict=user_id", {
    method: "POST",
    headers: { ...headers, Prefer: "resolution=merge-duplicates" },
    body: JSON.stringify({ user_id: user.id, plan }),
  });
  if (!r.ok) throw new Error("profile update failed: " + r.status + " " + (await r.text()).slice(0, 200));
  return user.id;
}

module.exports = async (req, res) => {
  if (req.method !== "POST") { res.status(405).json({ error: "POST only" }); return; }
  if (!process.env.WEBHOOK_KEY || (req.query && req.query.key) !== process.env.WEBHOOK_KEY) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
    res.status(500).json({ error: "SUPABASE_URL / SUPABASE_SERVICE_KEY env vars not set" });
    return;
  }

  try {
    const event = req.body || {};
    const type = event.type || "";
    const obj = (event.data && event.data.object) || {};
    const email =
      (obj.customer_details && obj.customer_details.email) ||
      obj.customer_email ||
      (obj.customer && obj.customer.email) || "";

    if (type === "checkout.session.completed" || type === "invoice.paid") {
      if (!email) { res.status(400).json({ error: "no email on event" }); return; }
      await setPlanByEmail(email, "pro");
      res.status(200).json({ ok: true, upgraded: email });
    } else if (type === "customer.subscription.deleted") {
      if (email) await setPlanByEmail(email, "free");
      res.status(200).json({ ok: true, downgraded: email || "(no email — downgrade manually)" });
    } else {
      res.status(200).json({ ok: true, ignored: type });
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
