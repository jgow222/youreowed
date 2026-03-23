// ─── Affiliate Click Tracking API ────────────────────────────────────────────
// POST /api/affiliate-clicks — log a click
// GET /api/affiliate-clicks — get click stats (for dashboard)

const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  if (!supabaseUrl || !supabaseKey) {
    return res.status(200).json({ success: false, error: "Supabase not configured" });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // POST — log a click
  if (req.method === "POST") {
    try {
      const { partner, url, page, userId } = req.body || {};

      if (!partner || !url) {
        return res.status(400).json({ error: "partner and url required" });
      }

      const { error } = await supabase.from("affiliate_clicks").insert({
        partner,
        url,
        page: page || "results",
        user_id: userId || null,
      });

      if (error) {
        console.error("Affiliate click log error:", error);
        // If table doesn't exist, still return success
        return res.status(200).json({ success: true, fallback: true });
      }

      return res.status(200).json({ success: true });
    } catch (err) {
      console.error("Affiliate click error:", err);
      return res.status(200).json({ success: true, fallback: true });
    }
  }

  // GET — read click stats for dashboard
  if (req.method === "GET") {
    try {
      // Get all clicks
      const { data: clicks, error } = await supabase
        .from("affiliate_clicks")
        .select("partner, url, page, created_at")
        .order("created_at", { ascending: false })
        .limit(1000);

      if (error) {
        return res.status(200).json({ clicks: [], stats: {}, error: error.message });
      }

      // Aggregate stats by partner
      const stats = {};
      for (const click of clicks || []) {
        if (!stats[click.partner]) {
          stats[click.partner] = { clicks: 0, lastClick: click.created_at };
        }
        stats[click.partner].clicks++;
      }

      return res.status(200).json({
        totalClicks: (clicks || []).length,
        stats,
        recentClicks: (clicks || []).slice(0, 20),
      });
    } catch (err) {
      console.error("Affiliate stats error:", err);
      return res.status(200).json({ clicks: [], stats: {}, error: err.message });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
};
