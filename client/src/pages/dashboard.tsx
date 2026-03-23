import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Users, Newspaper, MessageCircle, ArrowRight, DollarSign, TrendingUp, Zap, ChevronRight, Phone, Lock, ShieldCheck, CheckCircle2, Globe, Clock } from "lucide-react";
import { useAppState } from "@/lib/store";
import { useElderlyMode } from "@/lib/elderly-mode";
import { fetchNews, type NewsItem } from "@/lib/news";
import { useI18n } from "@/lib/i18n";
import EmailCapture from "@/components/EmailCapture";
import { ExitIntentPopup, SocialProofToast, PulseCTA } from "@/components/Animations";
import { ParticleBackground, AnimatedGradientText, CountUpOnScroll, HoverTilt, PulsingDot } from "@/components/Effects";

export default function DashboardPage() {
  const { state } = useAppState();
  const { isElderlyMode } = useElderlyMode();
  const { t } = useI18n();
  const [recentNews, setRecentNews] = useState<NewsItem[]>([]);

  useEffect(() => {
    fetchNews().then(({ items }) => {
      const sorted = [...items].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setRecentNews(sorted.slice(0, 3));
    });
  }, []);
  const memberCount = state.user?.householdMembers.length || 1;

  // ─── Elderly / Easy Mode layout ────────────────────────────────────────────
  if (isElderlyMode) {
    return (
      <div className="p-6 md:p-10 max-w-2xl mx-auto space-y-8">
        {/* Hero */}
        <div className="py-4">
          <p className="text-base font-medium text-primary tracking-wide uppercase mb-3">Welcome back</p>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight leading-tight" data-testid="text-welcome">
            Find out what benefits<br />
            <span className="text-primary money-glow">you're owed.</span>
          </h1>
          <p className="text-base text-muted-foreground mt-4 max-w-lg">
            We check over 415 government programs to find benefits you may qualify for — free of charge.
          </p>
        </div>

        {/* Two big action cards */}
        <div className="space-y-4">
          {/* Card 1: Check My Benefits */}
          <Link href="/screener">
            <Card className="w-full p-8 cursor-pointer border-2 border-primary/30 bg-primary/[0.04] hover:bg-primary/[0.08] transition-colors" data-testid="card-elderly-screener">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <Search className="w-7 h-7 text-primary" />
                  </div>
                  <p className="text-xl font-bold mb-2">Check My Benefits</p>
                  <p className="text-base text-muted-foreground">Answer a few simple questions to see which programs you may qualify for.</p>
                </div>
                <ChevronRight className="w-8 h-8 text-primary flex-shrink-0" />
              </div>
              <div className="mt-6">
                <Button className="h-16 text-xl px-10 gap-2 font-bold w-full sm:w-auto" data-testid="button-hero-cta">
                  Get Started <ArrowRight className="w-5 h-5" />
                </Button>
              </div>
            </Card>
          </Link>

          {/* Card 2: News & Updates */}
          <Link href="/news">
            <Card className="w-full p-8 cursor-pointer border border-card-border hover:border-primary/20 transition-colors" data-testid="card-elderly-news">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center mb-4">
                    <Newspaper className="w-7 h-7 text-amber-500" />
                  </div>
                  <p className="text-xl font-bold mb-2">News & Updates</p>
                  <p className="text-base text-muted-foreground">Stay up to date on the latest changes to benefit programs that may affect you.</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge variant="destructive" className="text-sm px-3 py-1">3 new</Badge>
                  <ChevronRight className="w-8 h-8 text-muted-foreground" />
                </div>
              </div>
            </Card>
          </Link>
        </div>

        {/* Help text */}
        <div className="pt-4 pb-2 border-t border-border">
          <p className="text-base text-muted-foreground flex items-start gap-2">
            <Phone className="w-5 h-5 flex-shrink-0 mt-0.5 text-muted-foreground/60" />
            Need help? Call a family member or visit your local benefits office.
          </p>
        </div>
      </div>
    );
  }

  // ─── Standard layout ────────────────────────────────────────────────────────
  return (
    <>
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-8 page-enter">
      {/* Hero — Bold, direct */}
      <div className="py-4 animate-fade-in-up relative">
        <ParticleBackground />
        <p className="text-sm font-medium text-primary tracking-wide uppercase mb-2">{t("dashboard.welcomeBack")}</p>
        <h1 className="text-2xl md:text-3xl font-black tracking-tight leading-tight" data-testid="text-welcome">
          {t("dashboard.heroHeadline")}<br />
          <AnimatedGradientText>{t("dashboard.heroHighlight")}</AnimatedGradientText>
        </h1>
        <p className="text-sm text-muted-foreground mt-3 max-w-lg">
          {t("dashboard.heroSubtext")}
        </p>
        <Link href="/screener">
          <PulseCTA active={!state.isLoggedIn}>
            <Button size="lg" className="mt-4 gap-2 font-bold text-sm h-11 px-6 btn-press" data-testid="button-hero-cta">
              {t("dashboard.heroCta")} <ArrowRight className="w-4 h-4" />
            </Button>
          </PulseCTA>
        </Link>

        {/* Trust badges */}
        <div className="flex flex-wrap items-center gap-4 md:gap-6 mt-6 animate-fade-in stagger-5">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
              <Lock className="w-4 h-4 text-emerald-500" />
            </div>
            <span>Your answers are <span className="text-foreground font-medium">100% private</span></span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-4 h-4 text-blue-500" />
            </div>
            <span>Won't affect <span className="text-foreground font-medium">current benefits</span></span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-4 h-4 text-primary" />
            </div>
            <span><span className="text-foreground font-medium">Free</span> to screen</span>
          </div>
        </div>
      </div>

      {/* Stats — Big numbers, no fluff */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-4 border border-card-border bg-card card-hover-lift animate-fade-in-up stagger-1">
          <p className="text-3xl font-black text-primary">
            <CountUpOnScroll target={415} />
          </p>
          <p className="text-xs text-muted-foreground mt-1">{t("dashboard.programsChecked")}</p>
        </Card>
        <Card className="p-4 border border-card-border bg-card card-hover-lift animate-fade-in-up stagger-2">
          <p className="text-3xl font-black">
            <CountUpOnScroll target={50} suffix="+" /><span className="text-lg text-muted-foreground">DC</span>
          </p>
          <p className="text-xs text-muted-foreground mt-1">{t("dashboard.statesCovered")}</p>
        </Card>
        <Card className="p-4 border border-card-border bg-card card-hover-lift animate-fade-in-up stagger-3">
          <p className="text-3xl font-black text-primary">
            $<CountUpOnScroll target={50} suffix="K+" />
          </p>
          <p className="text-xs text-muted-foreground mt-1">{t("dashboard.potentialPerYear")}</p>
        </Card>
      </div>

      {/* Quick actions — Bigger, bolder */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Link href="/screener">
          <HoverTilt className="animate-fade-in-up stagger-1">
            <Card className="p-5 cursor-pointer border border-primary/20 bg-primary/[0.03] hover:bg-primary/[0.06] transition-colors group card-hover-lift" data-testid="card-quick-screener">
              <div className="flex items-center justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                    <Search className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-base font-bold">{t("dashboard.runScreening")}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{t("dashboard.screeningSubtext")}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-primary group-hover:translate-x-1 transition-transform" />
              </div>
            </Card>
          </HoverTilt>
        </Link>

        <Link href="/assistant">
          <HoverTilt className="animate-fade-in-up stagger-2">
            <Card className="p-5 cursor-pointer border border-card-border hover:border-primary/20 transition-colors group card-hover-lift">
              <div className="flex items-center justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center mb-3">
                    <MessageCircle className="w-5 h-5 text-violet-500" />
                  </div>
                  <p className="text-base font-bold">{t("dashboard.askAI")}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{t("dashboard.askAISubtext")}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </div>
            </Card>
          </HoverTilt>
        </Link>

        <Link href="/household">
          <HoverTilt className="animate-fade-in-up stagger-3">
            <Card className="p-5 cursor-pointer border border-card-border hover:border-primary/20 transition-colors group card-hover-lift">
              <div className="flex items-center justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center mb-3">
                    <Users className="w-5 h-5 text-blue-500" />
                  </div>
                  <p className="text-base font-bold">{t("dashboard.yourHousehold")}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{memberCount} {t("dashboard.householdSubtext")}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </div>
            </Card>
          </HoverTilt>
        </Link>

        <Link href="/news">
          <HoverTilt className="animate-fade-in-up stagger-4">
            <Card className="p-5 cursor-pointer border border-card-border hover:border-primary/20 transition-colors group card-hover-lift">
              <div className="flex items-center justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center mb-3">
                    <Zap className="w-5 h-5 text-amber-500" />
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-base font-bold">{t("dashboard.policyUpdates")}</p>
                    <PulsingDot />
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{t("dashboard.policySubtext")}</p>
                </div>
                <Badge variant="destructive" className="h-5 text-[10px] px-2 badge-pop">3 new</Badge>
              </div>
            </Card>
          </HoverTilt>
        </Link>
      </div>

      {/* Testimonials */}
      <div className="animate-fade-in-up stagger-7">
        <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground mb-3">What people are finding</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { name: "Maria G.", state: "Texas", amount: "$14,200", quote: "I had no idea I qualified for so many programs. Between SNAP, Medicaid, and the EITC, I'm getting over $14,000 a year I was leaving on the table.", programs: 8 },
            { name: "James T.", state: "Ohio", amount: "$8,400", quote: "As a veteran, I didn't know about half the benefits available to me. YoureOwed found 11 programs in under 2 minutes. Already applied for three.", programs: 11 },
            { name: "Sandra L.", state: "Florida", amount: "$22,800", quote: "Single mom with 3 kids. The screener found CHIP, free school lunch, childcare assistance, and EITC. I'm saving almost $2,000 a month now.", programs: 14 },
          ].map((testimonial, i) => (
            <div key={i} className={`card-hover-lift p-4 rounded-xl border border-card-border bg-card stagger-${i + 1}`}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                  {testimonial.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div>
                  <p className="text-sm font-semibold">{testimonial.name}</p>
                  <p className="text-[10px] text-muted-foreground">{testimonial.state} · {testimonial.programs} programs found</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed mb-2">"{testimonial.quote}"</p>
              <p className="text-lg font-black text-primary">{testimonial.amount}<span className="text-xs font-normal text-muted-foreground">/year found</span></p>
            </div>
          ))}
        </div>
      </div>

      {/* Trust badges */}
      <div className="animate-fade-in stagger-8">
        <div className="flex flex-wrap items-center justify-center gap-6 py-4 px-6 rounded-xl border border-border/50 bg-muted/20">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            <div className="text-left">
              <p className="text-xs font-bold text-foreground">415+ Programs</p>
              <p className="text-[10px]">Verified &amp; updated daily</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Lock className="w-5 h-5 text-blue-500" />
            <div className="text-left">
              <p className="text-xs font-bold text-foreground">Data Never Stored</p>
              <p className="text-[10px]">Screening runs in your browser</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Globe className="w-5 h-5 text-primary" />
            <div className="text-left">
              <p className="text-xs font-bold text-foreground">50 States + DC</p>
              <p className="text-[10px]">Federal &amp; state programs</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-5 h-5 text-amber-500" />
            <div className="text-left">
              <p className="text-xs font-bold text-foreground">2-Minute Screening</p>
              <p className="text-[10px]">Fast, private, anonymous</p>
            </div>
          </div>
        </div>
      </div>

      {/* Email Capture — for non-subscribers */}
      {(!state.isLoggedIn || state.user?.subscriptionTier === "free") && (
        <div className="animate-fade-in stagger-6">
          <EmailCapture source="dashboard" />
        </div>
      )}

      {/* Social Proof Toast — visible on public page for non-logged-in users */}
      <SocialProofToast show={!state.isLoggedIn} />

      {/* News — Compact */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">{t("dashboard.latestChanges")}</h2>
          <Link href="/news">
            <Button variant="ghost" size="sm" className="text-xs gap-1 h-7">
              {t("dashboard.seeAll")} <ArrowRight className="w-3 h-3" />
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

    {/* Exit Intent Popup */}
    <ExitIntentPopup isLoggedIn={!!state.isLoggedIn} />
    </>
  );
}
