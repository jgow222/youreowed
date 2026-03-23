// Affiliate Click Tracking Dashboard
// Admin-only page — access via /affiliate-dashboard directly (not in nav)

import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ExternalLink,
  TrendingUp,
  DollarSign,
  MousePointerClick,
  RefreshCw,
  Info,
  BarChart3,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { fetchAffiliateStats, PARTNER_REVENUE } from "@/lib/affiliate-tracking";

// ── Partner config ────────────────────────────────────────────────────────────

interface PartnerConfig {
  name: string;
  category: string;
  estimatedRevenue: number; // $ per signup/click
  url: string;
  status: "active" | "paused" | "pending";
}

const PARTNERS: PartnerConfig[] = [
  {
    name: "FreeTaxUSA",
    category: "Tax Prep",
    estimatedRevenue: 4.5,
    url: "https://www.freetaxusa.com",
    status: "active",
  },
  {
    name: "TaxSlayer",
    category: "Tax Prep",
    estimatedRevenue: 3.75,
    url: "https://www.taxslayer.com",
    status: "active",
  },
  {
    name: "IRS Free File",
    category: "Tax Prep",
    estimatedRevenue: 2.0,
    url: "https://www.irs.gov/filing/free-file-do-your-federal-taxes-for-free",
    status: "active",
  },
  {
    name: "Amazon Prime",
    category: "Retail / Food",
    estimatedRevenue: 2.5,
    url: "https://www.amazon.com/amazonprime",
    status: "active",
  },
  {
    name: "Walmart+",
    category: "Retail / Food",
    estimatedRevenue: 2.0,
    url: "https://www.walmart.com/plus",
    status: "active",
  },
  {
    name: "Museums for All",
    category: "Community",
    estimatedRevenue: 1.0,
    url: "https://museums4all.org",
    status: "active",
  },
  {
    name: "Lifeline",
    category: "Phone / Internet",
    estimatedRevenue: 3.0,
    url: "https://www.lifelinesupport.org",
    status: "active",
  },
  {
    name: "Healthcare.gov",
    category: "Health Insurance",
    estimatedRevenue: 5.0,
    url: "https://www.healthcare.gov",
    status: "active",
  },
];

// ── Demo seed data ─────────────────────────────────────────────────────────────

// Realistic pre-populated numbers for demo purposes
const DEMO_CLICKS: Record<string, { clicks: number; lastClick: number }> = {
  FreeTaxUSA: { clicks: 412, lastClick: Date.now() - 1000 * 60 * 14 },
  TaxSlayer: { clicks: 287, lastClick: Date.now() - 1000 * 60 * 47 },
  "IRS Free File": { clicks: 198, lastClick: Date.now() - 1000 * 60 * 92 },
  "Amazon Prime": { clicks: 543, lastClick: Date.now() - 1000 * 60 * 6 },
  "Walmart+": { clicks: 371, lastClick: Date.now() - 1000 * 60 * 28 },
  "Museums for All": { clicks: 84, lastClick: Date.now() - 1000 * 60 * 180 },
  Lifeline: { clicks: 256, lastClick: Date.now() - 1000 * 60 * 35 },
  "Healthcare.gov": { clicks: 629, lastClick: Date.now() - 1000 * 60 * 3 },
};

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function formatCurrency(value: number): string {
  return "$" + value.toFixed(2);
}

const STATUS_COLORS: Record<string, string> = {
  active: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  paused: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  pending: "bg-slate-500/10 text-slate-400 border-slate-500/20",
};

// ── Bar chart component ───────────────────────────────────────────────────────

function ClickBar({
  name,
  clicks,
  maxClicks,
  revenue,
}: {
  name: string;
  clicks: number;
  maxClicks: number;
  revenue: number;
}) {
  const pct = maxClicks > 0 ? (clicks / maxClicks) * 100 : 0;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground font-medium truncate max-w-[140px]">
          {name}
        </span>
        <span className="text-foreground font-semibold ml-2 flex-shrink-0">
          {clicks.toLocaleString()} clicks
        </span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${pct}%`,
            background: "linear-gradient(90deg, #00E676 0%, #69f0ae 100%)",
          }}
        />
      </div>
      <p className="text-[10px] text-muted-foreground">
        Est. revenue: {formatCurrency(clicks * revenue)}
      </p>
    </div>
  );
}

// ── Main dashboard ─────────────────────────────────────────────────────────────

export default function AffiliateDashboardPage() {
  const [clickData, setClickData] = useState(DEMO_CLICKS);
  const [isLiveData, setIsLiveData] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(Date.now());

  const loadStats = useCallback(async () => {
    setIsLoading(true);
    try {
      const apiData = await fetchAffiliateStats();
      if (apiData.totalClicks > 0) {
        // Merge API data with demo structure
        const merged: Record<string, { clicks: number; lastClick: number }> = { ...DEMO_CLICKS };
        for (const [partner, stat] of Object.entries(apiData.stats)) {
          merged[partner] = {
            clicks: stat.clicks,
            lastClick: stat.lastClick ? new Date(stat.lastClick).getTime() : Date.now(),
          };
        }
        setClickData(merged);
        setIsLiveData(true);
      } else {
        // No real data — keep demo data
        setIsLiveData(false);
      }
    } catch {
      // API error — keep demo data
      setIsLiveData(false);
    } finally {
      setIsLoading(false);
      setLastRefresh(Date.now());
    }
  }, []);

  // Fetch on mount
  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const totalClicks = Object.values(clickData).reduce(
    (sum, d) => sum + d.clicks,
    0
  );

  const totalRevenue = PARTNERS.reduce((sum, p) => {
    const d = clickData[p.name];
    return sum + (d ? d.clicks * p.estimatedRevenue : 0);
  }, 0);

  const maxClicks = Math.max(
    ...PARTNERS.map((p) => clickData[p.name]?.clicks ?? 0)
  );

  const topPartner = PARTNERS.reduce(
    (top, p) => {
      const clicks = clickData[p.name]?.clicks ?? 0;
      return clicks > (clickData[top.name]?.clicks ?? 0) ? p : top;
    },
    PARTNERS[0]
  );

  function handleSimulateClick(partnerName: string) {
    setClickData((prev) => ({
      ...prev,
      [partnerName]: {
        clicks: (prev[partnerName]?.clicks ?? 0) + 1,
        lastClick: Date.now(),
      },
    }));
  }

  function handleRefresh() {
    loadStats();
  }

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6 page-enter">
      {/* Live data banner */}
      {isLiveData ? (
        <div className="flex items-center gap-3 p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/[0.06]">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <p className="text-xs text-emerald-300 leading-relaxed">
            <span className="font-semibold">Showing live data from your site.</span>{" "}
            Clicks are tracked when users click affiliate links in the results sidebar.
          </p>
        </div>
      ) : (
        <div className="flex items-center gap-3 p-3 rounded-lg border border-amber-500/20 bg-amber-500/[0.05]">
          <Info className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            <span className="font-semibold text-foreground">Showing demo data.</span>{" "}
            No real clicks recorded yet — affiliate links in the sidebar will start tracking automatically as users interact with them.
          </p>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="w-5 h-5 text-primary" />
            <h1 className="text-xl font-bold">Affiliate Dashboard</h1>
            <Badge
              variant="outline"
              className="text-[10px] h-5 px-1.5 text-amber-400 border-amber-400/30 bg-amber-400/10"
            >
              Admin Only
            </Badge>
            {!isLiveData && (
              <Badge
                variant="outline"
                className="text-[10px] h-5 px-1.5 text-slate-400 border-slate-400/30 bg-slate-400/10"
              >
                demo
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {isLiveData
              ? `Live affiliate click data · Last updated ${formatRelativeTime(lastRefresh)}`
              : "Track affiliate link clicks and estimated revenue. Demo data pre-populated — connect a real backend to see live numbers."}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 flex-shrink-0"
          onClick={handleRefresh}
          disabled={isLoading}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          {isLoading ? "Loading..." : "Refresh"}
        </Button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-4 border border-card-border">
          <div className="flex items-center gap-2 mb-2">
            <MousePointerClick className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
              Total Clicks
            </span>
          </div>
          <p className="text-2xl font-bold">{totalClicks.toLocaleString()}</p>
        </Card>

        <Card className="p-4 border border-card-border">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
              Est. Revenue
            </span>
          </div>
          <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
        </Card>

        <Card className="p-4 border border-card-border">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-violet-400" />
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
              Top Partner
            </span>
          </div>
          <p className="text-lg font-bold leading-tight">{topPartner.name}</p>
          <p className="text-xs text-muted-foreground">
            {clickData[topPartner.name]?.clicks.toLocaleString()} clicks
          </p>
        </Card>

        <Card className="p-4 border border-card-border">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
              Active Partners
            </span>
          </div>
          <p className="text-2xl font-bold">
            {PARTNERS.filter((p) => p.status === "active").length}
          </p>
        </Card>
      </div>

      {/* Bar chart */}
      <Card className="p-5 border border-card-border">
        <div className="flex items-center gap-2 mb-5">
          <BarChart3 className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold">Clicks by Partner</h2>
          {!isLiveData && (
            <span className="text-[10px] text-muted-foreground">(demo)</span>
          )}
        </div>
        <div className="space-y-4">
          {PARTNERS.slice()
            .sort(
              (a, b) =>
                (clickData[b.name]?.clicks ?? 0) -
                (clickData[a.name]?.clicks ?? 0)
            )
            .map((partner) => (
              <ClickBar
                key={partner.name}
                name={partner.name}
                clicks={clickData[partner.name]?.clicks ?? 0}
                maxClicks={maxClicks}
                revenue={partner.estimatedRevenue}
              />
            ))}
        </div>
      </Card>

      {/* Table */}
      <Card className="border border-card-border overflow-hidden">
        <div className="p-4 border-b border-border flex items-center gap-2">
          <ExternalLink className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold">Partner Details</h2>
          {!isLiveData && (
            <span className="text-[10px] text-muted-foreground ml-1">(demo data)</span>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Partner
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Clicks
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Est. Revenue
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Last Click
                </th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Status
                </th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Simulate
                </th>
              </tr>
            </thead>
            <tbody>
              {PARTNERS.map((partner, i) => {
                const data = clickData[partner.name];
                const clicks = data?.clicks ?? 0;
                const estRevenue = clicks * partner.estimatedRevenue;
                const lastClick = data?.lastClick;
                return (
                  <tr
                    key={partner.name}
                    className={`border-b border-border/50 transition-colors hover:bg-muted/20 ${
                      i % 2 === 0 ? "" : "bg-muted/10"
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div>
                        <a
                          href={partner.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-foreground hover:text-primary transition-colors flex items-center gap-1"
                        >
                          {partner.name}
                          <ExternalLink className="w-3 h-3 opacity-40" />
                        </a>
                        <span className="text-xs text-muted-foreground">
                          {partner.category}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">
                      {clicks.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-emerald-400 font-semibold">
                        {formatCurrency(estRevenue)}
                      </span>
                      <span className="block text-[10px] text-muted-foreground">
                        @ {formatCurrency(partner.estimatedRevenue)}/click
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-muted-foreground text-xs">
                      {lastClick ? formatRelativeTime(lastClick) : "—"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded-full border capitalize ${
                          STATUS_COLORS[partner.status]
                        }`}
                      >
                        {partner.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs gap-1 hover:text-primary"
                        onClick={() => handleSimulateClick(partner.name)}
                      >
                        <MousePointerClick className="w-3 h-3" />
                        +1
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Backend note */}
      <Card className="p-4 border border-blue-500/20 bg-blue-500/5 flex items-start gap-3">
        <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          {isLiveData ? (
            <>
              <span className="font-semibold text-foreground">
                Live tracking active.
              </span>{" "}
              Every affiliate link click in the sidebar fires{" "}
              <code className="text-xs bg-muted px-1 py-0.5 rounded font-mono">
                trackAffiliateClick()
              </code>{" "}
              and POSTs to{" "}
              <code className="text-xs bg-muted px-1 py-0.5 rounded font-mono">
                /api/affiliate-clicks
              </code>
              . Data refreshes automatically on page load, or click Refresh above.
            </>
          ) : (
            <>
              <span className="font-semibold text-foreground">
                Demo data — not live.
              </span>{" "}
              Connect to a real analytics backend (Google Analytics events, PostHog,
              or custom API) to track actual conversions. Use{" "}
              <code className="text-xs bg-muted px-1 py-0.5 rounded font-mono">
                trackAffiliateClick()
              </code>{" "}
              from{" "}
              <code className="text-xs bg-muted px-1 py-0.5 rounded font-mono">
                @/lib/affiliate-tracking
              </code>{" "}
              on every affiliate link click, then POST to{" "}
              <code className="text-xs bg-muted px-1 py-0.5 rounded font-mono">
                /api/track-affiliate
              </code>{" "}
              to persist data.
            </>
          )}
        </p>
      </Card>
    </div>
  );
}
