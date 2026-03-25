// Affiliate Click Tracking API
// POST /api/affiliate-clicks — log a click
// GET /api/affiliate-clicks — get click stats

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    var { createClient } = require("@supabase/supabase-js");
    var supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

    if (req.method === "POST") {
      var body = req.body || {};
      if (!body.partner || !body.url) return res.status(200).json({ success: false, error: "partner and url required" });

      try {
        await supabase.from("affiliate_clicks").insert({
          partner: body.partner, url: body.url, page: body.page || "results", user_id: body.userId || null
        });
      } catch (e) { /* table may not exist */ }

      return res.status(200).json({ success: true });
    }

    if (req.method === "GET") {
      var result = await supabase.from("affiliate_clicks").select("partner, url, page, created_at").order("created_at", { ascending: false }).limit(1000);
      var clicks = result.data || [];
      var stats = {};

      for (var i = 0; i < clicks.length; i++) {
        var c = clicks[i];
        if (!stats[c.partner]) stats[c.partner] = { clicks: 0, lastClick: c.created_at };
        stats[c.partner].clicks++;
      }

      return res.status(200).json({ totalClicks: clicks.length, stats: stats, recentClicks: clicks.slice(0, 20) });
    }

    return res.status(200).json({ error: "Method not allowed" });
  } catch (err) {
    if (req.method === "GET") return res.status(200).json({ totalClicks: 0, stats: {}, recentClicks: [] });
    return res.status(200).json({ success: true, fallback: true });
  }
};
