// ─── Nudge List Endpoint ────────────────────────────────────────────────────
// Returns users who need reminder emails based on their activity.
// Protected by a simple API key check.
//
// GET /api/nudge-list?key=YOUR_SECRET&type=no_scan
//
// Types:
//   no_scan     — signed up 1+ days ago, never completed a screening
//   no_pay      — completed screening but still on free tier
//   abandoned   — started screener but never completed (1+ days ago)
//
// Deployed at: youreowed.org/api/nudge-list

let createClient;
try { createClient = require("@supabase/supabase-js").createClient; } catch (e) {}

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Simple API key protection
  const { key, type } = req.query;
  if (key !== process.env.NUDGE_API_KEY && key !== process.env.SUPABASE_SERVICE_KEY?.slice(0, 20)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    let users = [];

    if (type === "no_scan") {
      // Users who signed up but never completed a screening
      const { data: allProfiles } = await supabase
        .from("user_profiles")
        .select("id, email, name, created_at")
        .not("email", "is", null);

      if (allProfiles) {
        for (const profile of allProfiles) {
          const { data: activity } = await supabase
            .from("user_activity")
            .select("event_type")
            .eq("user_id", profile.id)
            .eq("event_type", "completed_screener")
            .limit(1);

          const daysSinceSignup = Math.floor(
            (Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24)
          );

          if ((!activity || activity.length === 0) && daysSinceSignup >= 1) {
            users.push({
              ...profile,
              days_since_signup: daysSinceSignup,
              nudge_type: "no_scan",
            });
          }
        }
      }
    } else if (type === "no_pay") {
      // Users who completed screening but haven't subscribed
      const { data: freeUsers } = await supabase
        .from("user_profiles")
        .select("id, email, name, subscription_tier, created_at")
        .eq("subscription_tier", "free")
        .not("email", "is", null);

      if (freeUsers) {
        for (const profile of freeUsers) {
          const { data: activity } = await supabase
            .from("user_activity")
            .select("event_type")
            .eq("user_id", profile.id)
            .eq("event_type", "completed_screener")
            .limit(1);

          if (activity && activity.length > 0) {
            const daysSinceSignup = Math.floor(
              (Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24)
            );
            users.push({
              ...profile,
              days_since_signup: daysSinceSignup,
              nudge_type: "no_pay",
            });
          }
        }
      }
    } else if (type === "abandoned") {
      // Users who started but never finished the screener
      const { data: allProfiles } = await supabase
        .from("user_profiles")
        .select("id, email, name, created_at")
        .not("email", "is", null);

      if (allProfiles) {
        for (const profile of allProfiles) {
          const { data: started } = await supabase
            .from("user_activity")
            .select("event_type")
            .eq("user_id", profile.id)
            .eq("event_type", "started_screener")
            .limit(1);

          const { data: completed } = await supabase
            .from("user_activity")
            .select("event_type")
            .eq("user_id", profile.id)
            .eq("event_type", "completed_screener")
            .limit(1);

          if (started?.length && !completed?.length) {
            const daysSinceSignup = Math.floor(
              (Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24)
            );
            if (daysSinceSignup >= 1) {
              users.push({
                ...profile,
                days_since_signup: daysSinceSignup,
                nudge_type: "abandoned",
              });
            }
          }
        }
      }
    } else {
      return res.status(400).json({ 
        error: "Invalid type. Use: no_scan, no_pay, or abandoned",
        example: "/api/nudge-list?key=YOUR_KEY&type=no_scan"
      });
    }

    return res.status(200).json({
      count: users.length,
      type,
      users,
    });
  } catch (err) {
    console.error("Nudge list error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
