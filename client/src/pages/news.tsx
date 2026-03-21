import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Newspaper, ExternalLink, AlertTriangle, TrendingUp, Clock, Sparkles, RefreshCw } from "lucide-react";
import { fetchNews, type NewsItem } from "@/lib/news";
import EmailCapture from "@/components/EmailCapture";

const CATEGORY_COLORS: Record<string, string> = {
  "policy-change": "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800/40",
  "new-program": "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40",
  "deadline": "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/40",
  "update": "bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-700/40",
};

const CATEGORY_ICONS: Record<string, typeof TrendingUp> = {
  "policy-change": TrendingUp,
  "new-program": Sparkles,
  "deadline": Clock,
  "update": Newspaper,
};

function NewsCard({ item }: { item: NewsItem }) {
  const colorClass = CATEGORY_COLORS[item.category] || CATEGORY_COLORS["update"];
  const Icon = CATEGORY_ICONS[item.category] || Newspaper;

  return (
    <Card className="p-4 border border-card-border" data-testid={`card-news-${item.id}`}>
      <div className="flex items-start gap-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClass.split(" ").slice(0, 1).join(" ")}`}>
          <Icon className={`w-4 h-4 ${colorClass.split(" ").slice(1, 3).join(" ")}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            {item.isBreaking && (
              <Badge variant="destructive" className="h-4 text-[10px] gap-0.5">
                <AlertTriangle className="w-2.5 h-2.5" /> Breaking
              </Badge>
            )}
            <Badge variant="outline" className={`h-4 text-[10px] capitalize border ${colorClass}`}>
              {item.category.replace("-", " ")}
            </Badge>
            <span className="text-[10px] text-muted-foreground">
              {new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </span>
          </div>
          <h3 className="text-sm font-semibold leading-snug mb-1">{item.title}</h3>
          <p className="text-xs text-muted-foreground leading-relaxed mb-2">{item.summary}</p>
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground">Source: {item.source}</span>
            <a
              href={item.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
            >
              Read more <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default function NewsPage() {
  const [tab, setTab] = useState("all");
  const [news, setNews] = useState<NewsItem[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNews().then(({ items, lastUpdated: lu }) => {
      const sorted = [...items].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setNews(sorted);
      setLastUpdated(lu);
      setLoading(false);
    });
  }, []);

  const filtered = tab === "all"
    ? news
    : news.filter(n => n.category === tab);

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Policy News & Updates</h1>
          {loading && <RefreshCw className="w-4 h-4 text-muted-foreground animate-spin" />}
        </div>
        <p className="text-sm text-muted-foreground mt-0.5">
          Stay informed about changes to benefit programs that may affect your eligibility.
        </p>
        {lastUpdated && (
          <p className="text-[10px] text-muted-foreground/60 mt-1">
            Last updated: {new Date(lastUpdated).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" })}
          </p>
        )}
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="h-8">
          <TabsTrigger value="all" className="text-xs h-7 px-3" data-testid="tab-all">All</TabsTrigger>
          <TabsTrigger value="policy-change" className="text-xs h-7 px-3" data-testid="tab-policy">Policy Changes</TabsTrigger>
          <TabsTrigger value="new-program" className="text-xs h-7 px-3" data-testid="tab-new">New Programs</TabsTrigger>
          <TabsTrigger value="deadline" className="text-xs h-7 px-3" data-testid="tab-deadlines">Deadlines</TabsTrigger>
          <TabsTrigger value="update" className="text-xs h-7 px-3" data-testid="tab-updates">Updates</TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="mt-4">
          <div className="space-y-3">
            {filtered.length > 0 ? (
              filtered.map(item => <NewsCard key={item.id} item={item} />)
            ) : (
              <div className="text-center py-12">
                <Newspaper className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No news in this category yet.</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <EmailCapture source="news" variant="banner" />

      <Card className="p-4 border border-amber-200 dark:border-amber-800/40 bg-amber-50/50 dark:bg-amber-950/20">
        <div className="flex gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-foreground/80">
            News is updated daily from official government sources. Program details change frequently —
            always verify current rules and deadlines on official government websites before taking action.
          </p>
        </div>
      </Card>
    </div>
  );
}
