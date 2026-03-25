// Email Subscription Endpoint
// POST /api/subscribe

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { createClient } = require("@supabase/supabase-js");
    const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

    const { email, source } = req.body || {};
    if (!email || !email.includes("@")) {
      return res.status(400).json({ error: "Valid email is required" });
    }

    const { error } = await supabase
      .from("email_subscribers")
      .upsert({ email: email.toLowerCase().trim(), source: source || "dashboard" }, { onConflict: "email" });

    if (error && error.code !== "23505") {
      return res.status(200).json({ success: false, error: error.message });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(200).json({ success: false, error: String(err) });
  }
};
