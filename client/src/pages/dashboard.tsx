import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Users, Newspaper, MessageCircle, ArrowRight, TrendingUp, DollarSign, Shield } from "lucide-react";
import { useAppState } from "@/lib/store";
import { getRecentNews } from "@/lib/news";

export default function DashboardPage() {
  const { state } = useAppState();
  const recentNews = getRecentNews(3);
  const memberCount = state.user?.householdMembers.length || 1;

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-xl font-bold" data-testid="text-welcome">
          Welcome{state.user?.name ? `, ${state.user.name.split(" ")[0]}` : ""}
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Find government benefits your household may qualify for.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Link href="/screener">
          <Card className="p-4 cursor-pointer hover:border-primary/30 transition-colors border border-card-border" data-testid="card-quick-screener">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <Search className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">Run Screener</p>
                <p className="text-[11px] text-muted-foreground">Check eligibility</p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
            </div>
          </Card>
        </Link>

        <Link href="/household">
          <Card className="p-4 cursor-pointer hover:border-primary/30 transition-colors border border-card-border">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">Household</p>
                <p className="text-[11px] text-muted-foreground">{memberCount} member{memberCount !== 1 ? "s" : ""}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
            </div>
          </Card>
        </Link>

        <Link href="/assistant">
          <Card className="p-4 cursor-pointer hover:border-primary/30 transition-colors border border-card-border">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-violet-500/10 flex items-center justify-center">
                <MessageCircle className="w-4 h-4 text-violet-600 dark:text-violet-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">AI Assistant</p>
                <p className="text-[11px] text-muted-foreground">Ask questions</p>
              </div>
              <Badge variant="secondary" className="h-4 text-[10px]">AI</Badge>
            </div>
          </Card>
        </Link>

        <Link href="/news">
          <Card className="p-4 cursor-pointer hover:border-primary/30 transition-colors border border-card-border">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Newspaper className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">News</p>
                <p className="text-[11px] text-muted-foreground">Policy updates</p>
              </div>
              <Badge variant="destructive" className="h-4 text-[10px]">3 new</Badge>
            </div>
          </Card>
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="p-4 border border-card-border">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Shield className="w-3.5 h-3.5" />
            <span className="text-xs font-medium uppercase tracking-wide">Programs Available</span>
          </div>
          <p className="text-2xl font-bold">335</p>
          <p className="text-xs text-muted-foreground">Federal & state programs</p>
        </Card>
        <Card className="p-4 border border-card-border">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <DollarSign className="w-3.5 h-3.5" />
            <span className="text-xs font-medium uppercase tracking-wide">Potential Value</span>
          </div>
          <p className="text-2xl font-bold">$5K-50K+</p>
          <p className="text-xs text-muted-foreground">Annual benefit estimate</p>
        </Card>
        <Card className="p-4 border border-card-border">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <TrendingUp className="w-3.5 h-3.5" />
            <span className="text-xs font-medium uppercase tracking-wide">States Covered</span>
          </div>
          <p className="text-2xl font-bold">50 + DC</p>
          <p className="text-xs text-muted-foreground">All states covered</p>
        </Card>
      </div>

      {/* Recent News */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold">Latest Policy Updates</h2>
          <Link href="/news">
            <Button variant="ghost" size="sm" className="text-xs gap-1 h-7">
              View all <ArrowRight className="w-3 h-3" />
            </Button>
          </Link>
        </div>
        <div className="space-y-2">
          {recentNews.map(item => (
            <Card key={item.id} className="p-3 border border-card-border">
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    {item.isBreaking && <Badge variant="destructive" className="h-4 text-[10px]">Breaking</Badge>}
                    <Badge variant="secondary" className="h-4 text-[10px] capitalize">{item.category.replace("-", " ")}</Badge>
                    <span className="text-[10px] text-muted-foreground">{new Date(item.date).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm font-medium leading-snug">{item.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{item.summary}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
