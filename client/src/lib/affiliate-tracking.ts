// Affiliate click tracking utility
// Wraps affiliate links to track clicks before redirecting

export interface AffiliateClick {
  partner: string;
  url: string;
  timestamp: number;
  page: string;
}

// In-memory click log (resets on page refresh — replace with API in production)
const clickLog: AffiliateClick[] = [];

export function trackAffiliateClick(partner: string, url: string, page: string = "results") {
  clickLog.push({ partner, url, timestamp: Date.now(), page });

  // Log for debugging
  console.log(`[Affiliate] Click: ${partner} → ${url} (from ${page})`);

  // In production: POST to /api/track-affiliate
  // fetch("/api/track-affiliate", { method: "POST", body: JSON.stringify({ partner, url, page }) });
}

export function getClickLog(): AffiliateClick[] {
  return [...clickLog];
}

export function getClicksByPartner(): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const click of clickLog) {
    counts[click.partner] = (counts[click.partner] || 0) + 1;
  }
  return counts;
}
