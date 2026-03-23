// ─── Affiliate Click Tracking API ────────────────────────────────────────────
// POST /api/affiliate-clicks — log a click
// GET /api/affiliate-clicks — get click stats (for dashboard)

let createClient;
try {
  createClient = require("@supabase/supabase-js").createClient;
} catch (e) {
  // Module not available
}

module.exports = async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

  if (!createClient || !supabaseUrl || !supabaseKey) {
    // Return empty data gracefully if Supabase isn't available
    if (req.method === "GET") {
      return res.status(200).json({ totalClicks: 0, stats: {}, recentClicks: [] });
    }
    return res.status(200).json({ success: true, fallback: true });
  }

  let supabase;
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
  } catch (e) {
    if (req.method === "GET") {
      return res.status(200).json({ totalClicks: 0, stats: {}, recentClicks: [], error: "Client init failed" });
    }
    return res.status(200).json({ success: true, fallback: true });
  }

  // POST — log a click
  if (req.method === "POST") {
    try {
      const body = req.body || {};
      const partner = body.partner;
      const url = body.url;
      const page = body.page || "results";
      const userId = body.userId || null;

      if (!partner || !url) {
        return res.status(200).json({ success: false, error: "partner and url required" });
      }

      await supabase.from("affiliate_clicks").insert({
        partner,
        url,
        page,
        user_id: userId,
      }).then(() => {}).catch(() => {});

      return res.status(200).json({ success: true });
    } catch (err) {
      return res.status(200).json({ success: true, fallback: true });
    }
  }

  // GET — read click stats for dashboard
  if (req.method === "GET") {
    try {
      const { data: clicks, error } = await supabase
        .from("affiliate_clicks")
        .select("partner, url, page, created_at")
        .order("created_at", { ascending: false })
        .limit(1000);

      if (error) {
        return res.status(200).json({ totalClicks: 0, stats: {}, recentClicks: [], error: error.message });
      }

      // Aggregate stats by partner
      const stats = {};
      for (const click of (clicks || [])) {
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
      return res.status(200).json({ totalClicks: 0, stats: {}, recentClicks: [], error: String(err) });
    }
  }

  return res.status(200).json({ error: "Method not allowed" });
};
