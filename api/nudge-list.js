// Nudge List Endpoint
// GET /api/nudge-list?type=no_scan|no_pay|abandoned

module.exports = async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { createClient } = require("@supabase/supabase-js");
    const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

    const { type } = req.query;
    if (!type || !["no_scan", "no_pay", "abandoned"].includes(type)) {
      return res.status(200).json({ error: "Use type=no_scan, no_pay, or abandoned" });
    }

    const { data: profiles } = await supabase
      .from("user_profiles")
      .select("id, email, name, subscription_tier, created_at")
      .not("email", "is", null);

    if (!profiles) return res.status(200).json({ count: 0, type: type, users: [] });

    var users = [];
    for (var i = 0; i < profiles.length; i++) {
      var p = profiles[i];
      var days = Math.floor((Date.now() - new Date(p.created_at).getTime()) / 86400000);
      if (days < 1) continue;

      var events = new Set();
      try {
        var r = await supabase.from("user_activity").select("event_type").eq("user_id", p.id);
        if (r.data) events = new Set(r.data.map(function(a) { return a.event_type; }));
      } catch (e) {}

      var match = false;
      if (type === "no_scan" && !events.has("completed_screener") && !events.has("started_screener")) match = true;
      if (type === "abandoned" && events.has("started_screener") && !events.has("completed_screener")) match = true;
      if (type === "no_pay" && events.has("completed_screener") && p.subscription_tier === "free" && days >= 2) match = true;

      if (match) {
        users.push({ id: p.id, email: p.email, name: p.name, days_since_signup: days, nudge_type: type });
      }
    }

    return res.status(200).json({ count: users.length, type: type, users: users });
  } catch (err) {
    return res.status(200).json({ count: 0, error: String(err) });
  }
};
