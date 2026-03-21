import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Users, Newspaper, MessageCircle, ArrowRight, DollarSign, TrendingUp, Zap, ChevronRight } from "lucide-react";
import { useAppState } from "@/lib/store";
import { fetchNews, type NewsItem } from "@/lib/news";
import EmailCapture from "@/components/EmailCapture";

export default function DashboardPage() {
  const { state } = useAppState();
  const [recentNews, setRecentNews] = useState<NewsItem[]>([]);

  useEffect(() => {
    fetchNews().then(({ items }) => {
      const sorted = [...items].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setRecentNews(sorted.slice(0, 3));
    });
  }, []);
  const memberCount = state.user?.householdMembers.length || 1;

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-8">
      {/* Hero — Bold, direct */}
      <div className="py-4">
        <p className="text-sm font-medium text-primary tracking-wide uppercase mb-2">Welcome back</p>
        <h1 className="text-2xl md:text-3xl font-black tracking-tight leading-tight" data-testid="text-welcome">
          You might be leaving<br />
          <span className="text-primary money-glow">thousands on the table.</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-3 max-w-lg">
          The average household qualifies for $5,000–$50,000+ per year in government benefits they never claim. Let's find yours in 2 minutes.
        </p>
        <Link href="/screener">
          <Button size="lg" className="mt-4 gap-2 font-bold text-sm h-11 px-6" data-testid="button-hero-cta">
            Check what you're owed <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>

      {/* Stats — Big numbers, no fluff */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-4 border border-card-border bg-card">
          <p className="text-3xl font-black text-primary">335</p>
          <p className="text-xs text-muted-foreground mt-1">programs we check</p>
        </Card>
        <Card className="p-4 border border-card-border bg-card">
          <p className="text-3xl font-black">50<span className="text-lg text-muted-foreground">+DC</span></p>
          <p className="text-xs text-muted-foreground mt-1">states covered</p>
        </Card>
        <Card className="p-4 border border-card-border bg-card">
          <p className="text-3xl font-black text-primary">$50K<span className="text-lg text-muted-foreground">+</span></p>
          <p className="text-xs text-muted-foreground mt-1">potential per year</p>
        </Card>
      </div>

      {/* Quick actions — Bigger, bolder */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Link href="/screener">
          <Card className="p-5 cursor-pointer border border-primary/20 bg-primary/[0.03] hover:bg-primary/[0.06] transition-colors group" data-testid="card-quick-screener">
            <div className="flex items-center justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                  <Search className="w-5 h-5 text-primary" />
                </div>
                <p className="text-base font-bold">Run your screening</p>
                <p className="text-xs text-muted-foreground mt-0.5">Takes 2 minutes. 100% private.</p>
              </div>
              <ChevronRight className="w-5 h-5 text-primary group-hover:translate-x-1 transition-transform" />
            </div>
          </Card>
        </Link>

        <Link href="/assistant">
          <Card className="p-5 cursor-pointer border border-card-border hover:border-primary/20 transition-colors group">
            <div className="flex items-center justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center mb-3">
                  <MessageCircle className="w-5 h-5 text-violet-500" />
                </div>
                <p className="text-base font-bold">Ask the AI</p>
                <p className="text-xs text-muted-foreground mt-0.5">"How do I apply for SNAP?"</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </div>
          </Card>
        </Link>

        <Link href="/household">
          <Card className="p-5 cursor-pointer border border-card-border hover:border-primary/20 transition-colors group">
            <div className="flex items-center justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center mb-3">
                  <Users className="w-5 h-5 text-blue-500" />
                </div>
                <p className="text-base font-bold">Your household</p>
                <p className="text-xs text-muted-foreground mt-0.5">{memberCount} member{memberCount !== 1 ? "s" : ""} — add more for better results</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </div>
          </Card>
        </Link>

        <Link href="/news">
          <Card className="p-5 cursor-pointer border border-card-border hover:border-primary/20 transition-colors group">
            <div className="flex items-center justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center mb-3">
                  <Zap className="w-5 h-5 text-amber-500" />
                </div>
                <p className="text-base font-bold">Policy updates</p>
                <p className="text-xs text-muted-foreground mt-0.5">Rules change. Stay ahead.</p>
              </div>
              <Badge variant="destructive" className="h-5 text-[10px] px-2">3 new</Badge>
            </div>
          </Card>
        </Link>
      </div>

      {/* Email Capture — for non-subscribers */}
      {(!state.isLoggedIn || state.user?.subscriptionTier === "free") && (
        <EmailCapture source="dashboard" />
      )}

      {/* News — Compact */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Latest changes</h2>
          <Link href="/news">
            <Button variant="ghost" size="sm" className="text-xs gap-1 h-7">
              See all <ArrowRight className="w-3 h-3" />
            </Button>
          </Link>
        </div>
        <div className="space-y-2">
          {recentNews.map(item => (
            <Card key={item.id} className="p-3 border border-card-border">
              <div className="flex items-center gap-2 mb-0.5">
                {item.isBreaking && <Badge variant="destructive" className="h-4 text-[10px]">New</Badge>}
                <Badge variant="secondary" className="h-4 text-[10px] capitalize">{item.category.replace("-", " ")}</Badge>
                <span className="text-[10px] text-muted-foreground">{new Date(item.date).toLocaleDateString()}</span>
              </div>
              <p className="text-sm font-semibold leading-snug">{item.title}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
