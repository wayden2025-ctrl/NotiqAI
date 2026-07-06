// Auto-upgrade webhook — supports BOTH Ko-fi and Stripe.
//
// KO-FI (current setup):
//   Ko-fi Settings -> API -> Webhook URL:  https://notiqai.vercel.app/api/upgrade-webhook
//   Copy the "Verification Token" from that same page into a Vercel env var: KOFI_VERIFICATION_TOKEN
//   Membership tier payment  -> plan = 'pro' until +35 days (renewals keep extending it)
//   Shop order (Pro Yearly)  -> plan = 'pro' until +370 days
//   Plain donations do NOT upgrade anyone.
//
// STRIPE (future): point a Stripe webhook at ...?key=WEBHOOK_KEY (env var WEBHOOK_KEY).
//
// Also required (server-only, NEVER in client code):
//   SUPABASE_URL, SUPABASE_SERVICE_KEY  (Supabase Settings -> API -> service_role)

async function setPlanByEmail(email, plan, until) {
  const base = (process.env.SUPABASE_URL || "").trim().replace(/\/+$/, "");
  const svc = process.env.SUPABASE_SERVICE_KEY;
  const headers = { apikey: svc, Authorization: "Bearer " + svc, "Content-Type": "application/json" };

  const u = await fetch(base + "/auth/v1/admin/users?page=1&per_page=1&email=" + encodeURIComponent(email), { headers });
  if (!u.ok) throw new Error("user lookup failed: " + u.status);
  const data = await u.json();
  const users = data.users || data;
  const user = (Array.isArray(users) ? users : []).find(x => (x.email || "").toLowerCase() === email.toLowerCase());
  if (!user) throw new Error("no account found for " + email);

  const r = await fetch(base + "/rest/v1/profiles?on_conflict=user_id", {
    method: "POST",
    headers: { ...headers, Prefer: "resolution=merge-duplicates" },
    body: JSON.stringify({ user_id: user.id, plan, plan_until: until || null }),
  });
  if (!r.ok) throw new Error("profile update failed: " + r.status + " " + (await r.text()).slice(0, 200));
  return user.id;
}

const days = (n) => new Date(Date.now() + n * 86400000).toISOString();

module.exports = async (req, res) => {
  if (req.method !== "POST") { res.status(405).json({ error: "POST only" }); return; }
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
    res.status(500).json({ error: "SUPABASE_URL / SUPABASE_SERVICE_KEY env vars not set" });
    return;
  }

  try {
    // ---------- KO-FI (form-encoded, JSON in a `data` field) ----------
    const kofiRaw = req.body && req.body.data;
    if (kofiRaw) {
      const ev = typeof kofiRaw === "string" ? JSON.parse(kofiRaw) : kofiRaw;
      if (!process.env.KOFI_VERIFICATION_TOKEN || ev.verification_token !== process.env.KOFI_VERIFICATION_TOKEN) {
        res.status(401).json({ error: "bad ko-fi token" });
        return;
      }
      const email = (ev.email || "").trim();
      if (ev.type === "Subscription" || ev.is_subscription_payment) {
        // monthly membership — 35-day window; each renewal pushes it forward
        if (!email) { res.status(400).json({ error: "no email on event" }); return; }
        await setPlanByEmail(email, "pro", days(35));
        res.status(200).json({ ok: true, upgraded: email, until: "+35d" });
      } else if (ev.type === "Shop Order") {
        // Pro Yearly shop item — a year plus a few grace days
        if (!email) { res.status(400).json({ error: "no email on event" }); return; }
        await setPlanByEmail(email, "pro", days(370));
        res.status(200).json({ ok: true, upgraded: email, until: "+370d" });
      } else {
        // plain donations don't change anyone's plan
        res.status(200).json({ ok: true, ignored: ev.type });
      }
      return;
    }

    // ---------- STRIPE (JSON events, guarded by ?key=) ----------
    if (!process.env.WEBHOOK_KEY || (req.query && req.query.key) !== process.env.WEBHOOK_KEY) {
      res.status(401).json({ error: "unauthorized" });
      return;
    }
    const event = req.body || {};
    const type = event.type || "";
    const obj = (event.data && event.data.object) || {};
    const email =
      (obj.customer_details && obj.customer_details.email) ||
      obj.customer_email ||
      (obj.customer && obj.customer.email) || "";

    if (type === "checkout.session.completed" || type === "invoice.paid") {
      if (!email) { res.status(400).json({ error: "no email on event" }); return; }
      await setPlanByEmail(email, "pro", days(35));
      res.status(200).json({ ok: true, upgraded: email });
    } else if (type === "customer.subscription.deleted") {
      if (email) await setPlanByEmail(email, "free", null);
      res.status(200).json({ ok: true, downgraded: email || "(no email — downgrade manually)" });
    } else {
      res.status(200).json({ ok: true, ignored: type });
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
