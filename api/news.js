// ─── News API Endpoint ──────────────────────────────────────────────────────
// Serves benefits news. The data file is bundled at deploy time.
// Updated daily by an automated task that pushes fresh content to GitHub.
//
// Deployed at: youreowed.org/api/news

const newsData = require("../data/news.json");

module.exports = function handler(req, res) {
  // Allow CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");
  res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=86400");

  try {
    const { category, limit } = req.query;

    let items = [...newsData.items];

    // Filter by category if provided
    if (category && category !== "all") {
      items = items.filter((item) => item.category === category);
    }

    // Sort by date descending
    items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Limit results
    const max = parseInt(limit) || 20;
    items = items.slice(0, max);

    return res.status(200).json({
      items,
      lastUpdated: newsData.lastUpdated,
      totalCount: items.length,
    });
  } catch (err) {
    console.error("News API error:", err);
    return res.status(500).json({ error: "Failed to load news" });
  }
};
