// ─── Payment Configuration ────────────────────────────────────────────────
// Uses Stripe Payment Links for a backend-free checkout experience.
//
// IMPORTANT: You need to create NEW Stripe Payment Links at the updated prices:
//   Basic: $4.99/mo | $49.99/yr
//   Pro:   $9.99/mo | $99.99/yr
//   Family: $14.99/mo | $149.99/yr
//   Guide: $2.99 each
// Then replace the URLs below with your new payment links.

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
// TODO: Create new Stripe Payment Links at these prices and replace URLs
export const PLANS: Record<string, PlanConfig> = {
  basic: {
    id: "basic",
    name: "Basic",
    monthlyPrice: 4.99,
    annualPrice: 49.99,
    setupFee: 0,
    stripeLinkMonthly: "https://buy.stripe.com/4gM28tcd8cBKdm24MF7Zu07",
    stripeLinkAnnual: "https://buy.stripe.com/4gM28tcd8cBKdm24MF7Zu07",
  },
  pro: {
    id: "pro",
    name: "Pro",
    monthlyPrice: 9.99,
    annualPrice: 99.99,
    setupFee: 0,
    stripeLinkMonthly: "https://buy.stripe.com/fZuaEZ5OK31a3Ls5QJ7Zu05",
    stripeLinkAnnual: "https://buy.stripe.com/fZuaEZ5OK31a3Ls5QJ7Zu05",
  },
  family: {
    id: "family",
    name: "Family",
    monthlyPrice: 14.99,
    annualPrice: 149.99,
    setupFee: 0,
    stripeLinkMonthly: "https://buy.stripe.com/8x24gB4KG45efuacf77Zu06",
    stripeLinkAnnual: "https://buy.stripe.com/8x24gB4KG45efuacf77Zu06",
  },
};

// ─── Application Guides ─────────────────────────────────────────────────────
export const GUIDE_PRICE = 2.99;  // $2.99 for basic subscribers
export const AI_GUIDE_PRICE = 0; // Free for Pro/Family subscribers

export const GUIDES: GuideConfig[] = [
  {
    id: "guide-snap",
    programId: "snap",
    name: "SNAP Application Guide",
    price: GUIDE_PRICE,
    stripeLink: "https://buy.stripe.com/fZufZja50eJS3Lscf77Zu04",
  },
  {
    id: "guide-medicaid",
    programId: "medicaid-adult",
    name: "Medicaid Application Guide",
    price: GUIDE_PRICE,
    stripeLink: "https://buy.stripe.com/fZufZja50eJS3Lscf77Zu04",
  },
  {
    id: "guide-ssdi",
    programId: "ssdi",
    name: "SSDI Application Guide",
    price: GUIDE_PRICE,
    stripeLink: "https://buy.stripe.com/fZufZja50eJS3Lscf77Zu04",
  },
  {
    id: "guide-section8",
    programId: "section8",
    name: "Section 8 Application Guide",
    price: GUIDE_PRICE,
    stripeLink: "https://buy.stripe.com/fZufZja50eJS3Lscf77Zu04",
  },
  {
    id: "guide-eitc",
    programId: "eitc",
    name: "EITC Tax Credit Guide",
    price: GUIDE_PRICE,
    stripeLink: "https://buy.stripe.com/fZufZja50eJS3Lscf77Zu04",
  },
];

// ─── Checkout Helper ────────────────────────────────────────────────────────
export function openCheckout(stripeLink: string, options?: {
  email?: string;
  referralCode?: string;
}) {
  let url = stripeLink;
  const params = new URLSearchParams();
  if (options?.email) params.set("prefilled_email", options.email);
  if (options?.referralCode) params.set("client_reference_id", options.referralCode);
  
  const paramString = params.toString();
  if (paramString) {
    url += (url.includes("?") ? "&" : "?") + paramString;
  }

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
