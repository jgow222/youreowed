// ─── News/Policy Updates Data ──────────────────────────────────────────────
// Fetches live news from the API endpoint, falls back to empty state if unavailable.

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

export async function fetchNews(): Promise<{ items: NewsItem[]; lastUpdated: string }> {
  // Return cache if fresh
  if (cachedNews && cachedLastUpdated && Date.now() - cacheTime < CACHE_DURATION) {
    return { items: cachedNews, lastUpdated: cachedLastUpdated };
  }

  try {
    const res = await fetch("/api/news?limit=30");
    if (res.ok) {
      const data: NewsResponse = await res.json();
      cachedNews = data.items;
      cachedLastUpdated = data.lastUpdated;
      cacheTime = Date.now();
      return { items: data.items, lastUpdated: data.lastUpdated };
    }
  } catch (e) {
    // API unavailable
  }

  // Return cached data if available, otherwise empty
  if (cachedNews && cachedLastUpdated) {
    return { items: cachedNews, lastUpdated: cachedLastUpdated };
  }

  return { items: [], lastUpdated: "" };
}

export function getNewsByProgram(programId: string): NewsItem[] {
  return cachedNews?.filter(n => n.programs.includes(programId)) || [];
}
