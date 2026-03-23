// ─── News/Policy Updates Data ──────────────────────────────────────────────
// Fetches live news from the API endpoint, falls back to bundled data if unavailable.

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  category: "policy-change" | "new-program" | "deadline" | "update";
  date: string;
  source: string;
  sourceUrl: string;
  programs: string[];
  isBreaking?: boolean;
}

interface NewsResponse {
  items: NewsItem[];
  lastUpdated: string;
  totalCount: number;
}

let cachedNews: NewsItem[] | null = null;
let cachedLastUpdated: string | null = null;
let cacheTime: number = 0;

const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

// Bundled fallback news — imported at build time so it always works even if API is down
const FALLBACK_NEWS: NewsItem[] = [
  {
    id: "n-20260322-snap-work",
    title: "SNAP Work Requirements Now in Effect Nationwide",
    summary: "New SNAP rules from the One Big Beautiful Bill Act expanded work requirements to adults up to age 64, parents of children over 14, and removed exemptions for veterans and homeless individuals. Recipients must work, volunteer, or train 80 hours/month.",
    category: "policy-change",
    date: "2026-03-22",
    source: "NPR",
    sourceUrl: "https://www.npr.org/2026/03/02/nx-s1-5729137/across-the-u-s-changes-to-snap-benefits-are-kicking-in",
    programs: ["snap"],
    isBreaking: true,
  },
  {
    id: "n-20260322-ssi",
    title: "SSI & SSDI Benefits Increased 2.8% for 2026",
    summary: "The 2026 COLA brings SSI to $994/month for individuals and $1,491 for couples. Average SSDI payments rise to $1,630/month.",
    category: "policy-change",
    date: "2026-01-01",
    source: "Social Security Administration",
    sourceUrl: "https://www.ssa.gov/oact/cola/SSI.html",
    programs: ["ssi", "ssdi"],
  },
  {
    id: "n-20260322-tax",
    title: "Tax Filing Deadline: April 15, 2026",
    summary: "File your 2025 tax return by April 15 to claim EITC (up to $7,830) and Child Tax Credit ($2,200/child). Even if you don't owe taxes, you must file to claim refundable credits.",
    category: "deadline",
    date: "2026-03-21",
    source: "IRS",
    sourceUrl: "https://www.irs.gov/newsroom/irs-opens-2026-filing-season",
    programs: ["eitc", "ctc"],
    isBreaking: true,
  },
  {
    id: "n-20260322-medicaid",
    title: "Medicaid Work Requirements Coming January 2027 — States Preparing Now",
    summary: "States are preparing for Medicaid work requirements starting January 2027. Nebraska is implementing early (May 2026). An estimated 7.5 million people could lose coverage by 2034.",
    category: "policy-change",
    date: "2026-01-23",
    source: "KFF",
    sourceUrl: "https://www.kff.org/medicaid/medicaid-what-to-watch-in-2026/",
    programs: ["medicaid-adult"],
  },
  {
    id: "n-20260322-section8",
    title: "HUD Proposes Work Requirements and Time Limits for Section 8",
    summary: "HUD proposed new rules adding work requirements and two-year time limits to Section 8 housing vouchers. Public comments are open until May 1, 2026.",
    category: "policy-change",
    date: "2026-03-04",
    source: "HUD.gov",
    sourceUrl: "https://www.hud.gov/helping-americans/housing-choice-vouchers-tenants",
    programs: ["section-8"],
    isBreaking: true,
  },
  {
    id: "n-20260322-liheap",
    title: "LIHEAP Energy Assistance Still Available — Apply Before Funds Run Out",
    summary: "Many states still have LIHEAP funding available. Applications open through August in some states. Reconnection assistance up to $1,500 available for disconnected households.",
    category: "deadline",
    date: "2026-03-15",
    source: "ACF / HHS",
    sourceUrl: "https://www.acf.hhs.gov/ocs/low-income-home-energy-assistance-program-liheap",
    programs: ["liheap"],
  },
];

export async function fetchNews(): Promise<{ items: NewsItem[]; lastUpdated: string }> {
  // Return cache if fresh
  if (cachedNews && cachedLastUpdated && Date.now() - cacheTime < CACHE_DURATION) {
    return { items: cachedNews, lastUpdated: cachedLastUpdated };
  }

  try {
    const res = await fetch("/api/news?limit=30");
    if (res.ok) {
      const data: NewsResponse = await res.json();
      if (data.items && data.items.length > 0) {
        cachedNews = data.items;
        cachedLastUpdated = data.lastUpdated;
        cacheTime = Date.now();
        return { items: data.items, lastUpdated: data.lastUpdated };
      }
    }
  } catch (e) {
    // API unavailable — fall through to fallback
  }

  // Return cached data if available
  if (cachedNews && cachedLastUpdated) {
    return { items: cachedNews, lastUpdated: cachedLastUpdated };
  }

  // Return bundled fallback news
  return { items: FALLBACK_NEWS, lastUpdated: "2026-03-22T00:00:00Z" };
}

export function getNewsByProgram(programId: string): NewsItem[] {
  return cachedNews?.filter(n => n.programs.includes(programId)) || [];
}
