// ─── Affiliate Click Tracking ────────────────────────────────────────────────
// Tracks clicks on affiliate/partner links and sends data to the API.
// Used by MonetizationCards sidebar and the affiliate dashboard.

export interface AffiliateClick {
  partner: string;
  url: string;
  timestamp: number;
  page: string;
}

// In-memory click log for the current session
const sessionClicks: AffiliateClick[] = [];

// Revenue estimates per partner (per click/signup)
export const PARTNER_REVENUE: Record<string, { perClick: number; perSignup: number }> = {
  "FreeTaxUSA": { perClick: 0.10, perSignup: 3.00 },
  "TaxSlayer": { perClick: 0.10, perSignup: 5.00 },
  "IRS Free File": { perClick: 0, perSignup: 0 },
  "Amazon Prime": { perClick: 0.05, perSignup: 2.00 },
  "Walmart+": { perClick: 0.05, perSignup: 1.50 },
  "Museums for All": { perClick: 0, perSignup: 0 },
  "Lifeline": { perClick: 0.05, perSignup: 1.00 },
  "Healthcare.gov": { perClick: 0.10, perSignup: 5.00 },
};

export function trackAffiliateClick(partner: string, url: string, page: string = "results", userId?: string) {
  // Add to session log
  sessionClicks.push({ partner, url, timestamp: Date.now(), page });

  // Send to API (fire-and-forget)
  try {
    fetch("/api/affiliate-clicks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ partner, url, page, userId }),
    }).catch(() => {
      // Silent fail — don't block the user from navigating
    });
  } catch {
    // Silent fail
  }
}

export function getSessionClicks(): AffiliateClick[] {
  return [...sessionClicks];
}

export function getSessionClicksByPartner(): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const click of sessionClicks) {
    counts[click.partner] = (counts[click.partner] || 0) + 1;
  }
  return counts;
}

// Fetch real stats from the API (for the dashboard)
export async function fetchAffiliateStats(): Promise<{
  totalClicks: number;
  stats: Record<string, { clicks: number; lastClick: string }>;
  recentClicks: Array<{ partner: string; url: string; page: string; created_at: string }>;
}> {
  try {
    const res = await fetch("/api/affiliate-clicks");
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // API unavailable
  }
  return { totalClicks: 0, stats: {}, recentClicks: [] };
}
