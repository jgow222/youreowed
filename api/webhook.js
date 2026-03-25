// Stripe Webhook Handler
// POST /api/webhook

var config = { api: { bodyParser: false } };
module.exports.config = config;

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    var Stripe = require("stripe");
    var supabaseLib = require("@supabase/supabase-js");
    var micro = require("micro");

    var stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    var supabase = supabaseLib.createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

    var rawBody = await micro.buffer(req);
    var sig = req.headers["stripe-signature"];
    var event;

    try {
      event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      return res.status(400).json({ error: "Invalid signature" });
    }

    if (event.type === "checkout.session.completed") {
      var session = event.data.object;
      var email = session.customer_details && session.customer_details.email || session.customer_email;
      var amount = session.amount_total;

      if (!email) return res.status(200).json({ received: true });

      // Map amount to tier
      var tier = null;
      if (amount >= 399 && amount <= 699) tier = "basic";
      else if (amount >= 799 && amount <= 1799) tier = "premium";
      else if (amount >= 4500 && amount <= 5500) tier = "basic";
      else if (amount >= 9000 && amount <= 17000) tier = "premium";
      else if (amount >= 200 && amount <= 399) tier = null; // guide purchase
      else tier = "basic";

      if (tier) {
        await supabase.from("user_profiles").update({
          subscription_tier: tier, updated_at: new Date().toISOString()
        }).eq("email", email);
      }
    }

    if (event.type === "customer.subscription.deleted") {
      var sub = event.data.object;
      if (sub.customer_email) {
        await supabase.from("user_profiles").update({
          subscription_tier: "free", updated_at: new Date().toISOString()
        }).eq("email", sub.customer_email);
      }
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    return res.status(200).json({ error: String(err) });
  }
};
