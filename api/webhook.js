// ─── Stripe Webhook Handler ─────────────────────────────────────────────────
// This Vercel Serverless Function receives payment events from Stripe
// and upgrades the user's subscription in Supabase.
//
// Deployed automatically at: youreowed.org/api/webhook

import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { buffer } from "micro";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY // Use the SECRET key here, not the anon key
);

// Disable Vercel's default body parser so we can read the raw body for signature verification
export const config = {
  api: {
    bodyParser: false,
  },
};

// Map Stripe price/product to subscription tier
function getTierFromPrice(amount) {
  // Match based on the price amount in cents (with some flexibility for tax/rounding)
  if (amount >= 500 && amount <= 999) return "basic";      // ~$7/month Basic
  if (amount >= 1500 && amount <= 2200) return "premium";   // ~$19/month Pro
  if (amount >= 2500 && amount <= 3500) return "premium";   // ~$29/month Family
  if (amount >= 6000 && amount <= 8000) return "basic";     // ~$70/year
  if (amount >= 15000 && amount <= 22000) return "premium";  // ~$190/year
  if (amount >= 25000 && amount <= 35000) return "premium";  // ~$290/year
  // $5 application guide — don't change subscription
  if (amount >= 400 && amount <= 600) return null;
  return "basic"; // fallback for any other subscription amount
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Read raw body for signature verification
    const rawBody = await buffer(req);
    const sig = req.headers["stripe-signature"];

    let event;

    // Verify the webhook signature
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

    // Handle checkout completion
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const customerEmail = session.customer_details?.email || session.customer_email;
      const amountTotal = session.amount_total; // in cents

      console.log(`Checkout completed: email=${customerEmail}, amount=${amountTotal}`);

      if (!customerEmail) {
        console.log("No customer email found in session");
        return res.status(200).json({ received: true });
      }

      const tier = getTierFromPrice(amountTotal);
      
      // Skip tier update for one-time guide purchases
      if (!tier) {
        console.log(`Guide purchase ($${amountTotal / 100}) — no tier change for ${customerEmail}`);
        return res.status(200).json({ received: true });
      }

      console.log(`Upgrading ${customerEmail} to ${tier} (amount: $${amountTotal / 100})`);

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
        console.log(`Successfully upgraded ${customerEmail} to ${tier}`);
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
