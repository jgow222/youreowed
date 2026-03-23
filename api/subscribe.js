// ─── Email Subscription Endpoint ────────────────────────────────────────────
// Captures email addresses for the weekly benefits newsletter.
// Deployed at: youreowed.org/api/subscribe

let createClient;
try { createClient = require("@supabase/supabase-js").createClient; } catch (e) {}

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { email, source } = req.body;

    if (!email || !email.includes("@")) {
      return res.status(400).json({ error: "Valid email is required" });
    }

    const { data, error } = await supabase
      .from("email_subscribers")
      .upsert(
        { email: email.toLowerCase().trim(), source: source || "dashboard" },
        { onConflict: "email" }
      );

    if (error) {
      console.error("Subscribe error:", error);
      // If it's a duplicate, still return success
      if (error.code === "23505") {
        return res.status(200).json({ success: true, message: "Already subscribed" });
      }
      return res.status(500).json({ error: "Failed to subscribe" });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Subscribe endpoint error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
