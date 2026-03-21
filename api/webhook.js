// ─── Stripe Webhook Handler ─────────────────────────────────────────────────
// This Vercel Serverless Function receives payment events from Stripe
// and upgrades the user's subscription in Supabase.
//
// Deployed automatically at: youreowed.org/api/webhook

const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY // Use the SECRET key here, not the anon key
);

// Map Stripe price/product to subscription tier
function getTierFromPrice(amount) {
  // Match based on the price amount in cents
  if (amount === 700) return "basic";    // $7/month
  if (amount === 1900) return "premium"; // $19/month (pro)
  if (amount === 2900) return "premium"; // $29/month (family)
  if (amount === 7000) return "basic";   // $70/year
  if (amount === 19000) return "premium"; // $190/year
  if (amount === 29000) return "premium"; // $290/year
  return "basic"; // fallback
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const event = req.body;

    // Handle checkout completion
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const customerEmail = session.customer_details?.email || session.customer_email;
      const amountTotal = session.amount_total; // in cents

      if (!customerEmail) {
        console.log("No customer email found in session");
        return res.status(200).json({ received: true });
      }

      const tier = getTierFromPrice(amountTotal);

      // Update user's subscription tier in Supabase by email
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
        console.log(`Upgraded ${customerEmail} to ${tier}`);
      }
    }

    // Handle subscription cancellation
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
}
