// ─── Payment Configuration ────────────────────────────────────────────────
// Uses Stripe Payment Links for a backend-free checkout experience.
// Replace the placeholder URLs with real Stripe Payment Link URLs
// after creating products in your Stripe Dashboard.
//
// To set up:
// 1. Go to Stripe Dashboard → Products → Create products for each tier
// 2. Create Payment Links for each product
// 3. Replace the URLs below with your real payment links
// 4. For subscriptions, use recurring pricing in Stripe

export interface PlanConfig {
  id: string;
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  setupFee: number;
  stripeLinkMonthly: string;
  stripeLinkAnnual: string;
}

export interface GuideConfig {
  id: string;
  programId: string;
  name: string;
  price: number;
  stripeLink: string;
}

// ─── Subscription Plans ─────────────────────────────────────────────────────
// Replace these URLs with your actual Stripe Payment Links
export const PLANS: Record<string, PlanConfig> = {
  basic: {
    id: "basic",
    name: "Basic",
    monthlyPrice: 7,
    annualPrice: 70,
    setupFee: 29,
    stripeLinkMonthly: "https://buy.stripe.com/test_basic_monthly",
    stripeLinkAnnual: "https://buy.stripe.com/test_basic_annual",
  },
  pro: {
    id: "pro",
    name: "Pro",
    monthlyPrice: 19,
    annualPrice: 190,
    setupFee: 29,
    stripeLinkMonthly: "https://buy.stripe.com/test_pro_monthly",
    stripeLinkAnnual: "https://buy.stripe.com/test_pro_annual",
  },
  family: {
    id: "family",
    name: "Family",
    monthlyPrice: 29,
    annualPrice: 290,
    setupFee: 29,
    stripeLinkMonthly: "https://buy.stripe.com/test_family_monthly",
    stripeLinkAnnual: "https://buy.stripe.com/test_family_annual",
  },
};

// ─── Application Guides ─────────────────────────────────────────────────────
export const GUIDE_PRICE = 5;  // $5 for basic subscribers
export const AI_GUIDE_PRICE = 0; // Free for Pro/Family subscribers

export const GUIDES: GuideConfig[] = [
  {
    id: "guide-snap",
    programId: "snap",
    name: "SNAP Application Guide",
    price: GUIDE_PRICE,
    stripeLink: "https://buy.stripe.com/test_guide_snap",
  },
  {
    id: "guide-medicaid",
    programId: "medicaid-adult",
    name: "Medicaid Application Guide",
    price: GUIDE_PRICE,
    stripeLink: "https://buy.stripe.com/test_guide_medicaid",
  },
  {
    id: "guide-ssdi",
    programId: "ssdi",
    name: "SSDI Application Guide",
    price: GUIDE_PRICE,
    stripeLink: "https://buy.stripe.com/test_guide_ssdi",
  },
  {
    id: "guide-section8",
    programId: "section8",
    name: "Section 8 Application Guide",
    price: GUIDE_PRICE,
    stripeLink: "https://buy.stripe.com/test_guide_section8",
  },
  {
    id: "guide-eitc",
    programId: "eitc",
    name: "EITC Tax Credit Guide",
    price: GUIDE_PRICE,
    stripeLink: "https://buy.stripe.com/test_guide_eitc",
  },
];

// ─── Checkout Helper ────────────────────────────────────────────────────────
// Opens a Stripe Payment Link in a new tab. In production, you'd use
// Stripe Checkout Sessions via a backend API for more control.

export function openCheckout(stripeLink: string, options?: {
  email?: string;
  referralCode?: string;
}) {
  // Build URL with prefill params
  let url = stripeLink;
  const params = new URLSearchParams();
  if (options?.email) params.set("prefilled_email", options.email);
  if (options?.referralCode) params.set("client_reference_id", options.referralCode);
  
  const paramString = params.toString();
  if (paramString) {
    url += (url.includes("?") ? "&" : "?") + paramString;
  }

  // Open in new tab (required for sandboxed iframes)
  window.open(url, "_blank", "noopener,noreferrer");
}

// Check if real Stripe payment links are configured
export function isStripeConfigured(): boolean {
  return !PLANS.basic.stripeLinkMonthly.includes("test_");
}

// Redirect to pricing page when Stripe isn't configured yet
export function redirectToPricing() {
  window.location.hash = "/pricing";
}
