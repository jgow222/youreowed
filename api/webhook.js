// ─── Stripe Webhook Handler ─────────────────────────────────────────────────
// This Vercel Serverless Function receives payment events from Stripe
// and upgrades the user's subscription in Supabase.
//
// Deployed automatically at: youreowed.org/api/webhook

const Stripe = require("stripe");
const { createClient } = require("@supabase/supabase-js");
const { buffer } = require("micro");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Disable Vercel's default body parser so we can read the raw body for signature verification
module.exports.config = {
  api: {
    bodyParser: false,
  },
};

// Map Stripe price/product to subscription tier
function getTierFromPrice(amount) {
  if (amount >= 399 && amount <= 699) return "basic";
  if (amount >= 799 && amount <= 1299) return "premium";
  if (amount >= 1300 && amount <= 1799) return "premium";
  if (amount >= 4500 && amount <= 5500) return "basic";
  if (amount >= 9000 && amount <= 11000) return "premium";
  if (amount >= 13000 && amount <= 17000) return "premium";
  if (amount >= 200 && amount <= 399) return null;
  return "basic";
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const rawBody = await buffer(req);
    const sig = req.headers["stripe-signature"];

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        rawBody,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error("Signature verification failed:", err.message);
      return res.status(400).json({ error: "Invalid signature" });
    }

    console.log(`Webhook event received: ${event.type}`);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const customerEmail = session.customer_details?.email || session.customer_email;
      const amountTotal = session.amount_total;

      console.log(`Checkout completed: email=${customerEmail}, amount=${amountTotal}`);

      if (!customerEmail) {
        console.log("No customer email found in session");
        return res.status(200).json({ received: true });
      }

      const tier = getTierFromPrice(amountTotal);
      
      if (!tier) {
        console.log(`Guide purchase ($${amountTotal / 100}) — no tier change for ${customerEmail}`);
        return res.status(200).json({ received: true });
      }

      console.log(`Upgrading ${customerEmail} to ${tier} (amount: $${amountTotal / 100})`);

      const { data, error } = await supabase
        .from("user_profiles")
        .update({
          subscription_tier: tier,
          updated_at: new Date().toISOString(),
        })
        .eq("email", customerEmail);

      if (error) {
        console.error("Supabase update error:", error);
      } else {
        console.log(`Successfully upgraded ${customerEmail} to ${tier}`);
      }
    }

    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object;
      const customerEmail = subscription.customer_email;

      if (customerEmail) {
        await supabase
          .from("user_profiles")
          .update({
            subscription_tier: "free",
            updated_at: new Date().toISOString(),
          })
          .eq("email", customerEmail);

        console.log(`Downgraded ${customerEmail} to free`);
      }
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return res.status(400).json({ error: "Webhook processing failed" });
  }
};
