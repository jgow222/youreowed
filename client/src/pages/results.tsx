import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ExternalLink,
  RotateCcw,
  CheckCircle2,
  HelpCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Utensils,
  Heart,
  Home,
  Briefcase,
  DollarSign,
  Medal,
  Wallet,
  Zap,
  ShieldCheck,
  Info,
  GraduationCap,
  Search,
  Lock,
  Sparkles,
  ArrowRight,
  Share2,
  Copy,
  ShoppingCart,
  TrendingUp,
} from "lucide-react";
import { type ProgramResult, type EligibilityStatus } from "@/lib/eligibility";
import { useAppState } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { PLANS, openCheckout, isStripeConfigured, simulatePurchase } from "@/lib/payments";
import { MonetizationSection, FreeTrialCard } from "@/components/MonetizationCards";

interface ResultsPageProps {
  results: ProgramResult[];
  onStartOver: () => void;
  userState: string;
}

const STATUS_CONFIG: Record<EligibilityStatus, {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: typeof CheckCircle2;
  textColor: string;
}> = {
  likely: {
    label: "Likely Eligible",
    color: "text-emerald-700 dark:text-emerald-400",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
    borderColor: "border-emerald-200 dark:border-emerald-800/40",
    icon: CheckCircle2,
    textColor: "text-emerald-600 dark:text-emerald-400",
  },
  maybe: {
    label: "Possibly Eligible",
    color: "text-amber-700 dark:text-amber-400",
    bgColor: "bg-amber-50 dark:bg-amber-950/30",
    borderColor: "border-amber-200 dark:border-amber-800/40",
    icon: HelpCircle,
    textColor: "text-amber-600 dark:text-amber-400",
  },
  unlikely: {
    label: "Unlikely",
    color: "text-slate-500 dark:text-slate-400",
    bgColor: "bg-slate-50 dark:bg-slate-900/30",
    borderColor: "border-slate-200 dark:border-slate-700/40",
    icon: XCircle,
    textColor: "text-slate-500 dark:text-slate-400",
  },
};

const CATEGORY_ICONS: Record<string, typeof Utensils> = {
  "Food Assistance": Utensils,
  "Healthcare": Heart,
  "Retirement & Disability": ShieldCheck,
  "Employment": Briefcase,
  "Housing": Home,
  "Tax Credits": DollarSign,
  "Veterans": Medal,
  "Cash Assistance": Wallet,
  "Utilities": Zap,
  "Education": GraduationCap,
  "Telecommunications": Zap,
};

function formatEstimate(min: number, max: number): string {
  if (min === max) return `$${min.toLocaleString()}`;
  return `$${min.toLocaleString()} – $${max.toLocaleString()}`;
}

// ─── Animated counter that counts up from 0 to target over ~2 seconds ────────

function AnimatedCounter({ target, prefix = "$", suffix = "" }: { target: number; prefix?: string; suffix?: string }) {
  const [current, setCurrent] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const duration = 2000; // 2 seconds

  useEffect(() => {
    if (target <= 0) {
      setCurrent(0);
      return;
    }

    startTimeRef.current = null;

    function animate(timestamp: number) {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out cubic for a satisfying deceleration
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.round(eased * target));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    }

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target]);

  return (
    <span>
      {prefix}{current.toLocaleString()}{suffix}
    </span>
  );
}

// ─── Full program card (for paid users) ─────────────────────────────────────

function ProgramCard({ result, showApplyGuide = false }: { result: ProgramResult; showApplyGuide?: boolean }) {
  const [expanded, setExpanded] = useState(result.status !== "unlikely");
  const config = STATUS_CONFIG[result.status];
  const StatusIcon = config.icon;
  const CategoryIcon = CATEGORY_ICONS[result.program.category] || Info;

  const monthlyEst = result.program.estimatedMonthlyBenefit;
  const annualEst = result.program.estimatedAnnualBenefit;

  return (
    <Card
      className={`border transition-all ${config.borderColor} ${expanded ? config.bgColor : ""}`}
      data-testid={`card-program-${result.program.id}`}
    >
      <button
        className="w-full text-left p-4 flex items-start gap-3 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
        data-testid={`button-expand-${result.program.id}`}
        aria-expanded={expanded}
      >
        <div className={`mt-0.5 flex-shrink-0 ${config.textColor}`}>
          <StatusIcon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="text-sm font-semibold leading-tight">{result.program.name}</h3>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <Badge variant="secondary" className="text-[11px] py-0 px-1.5 h-5 gap-1">
                  <CategoryIcon className="w-3 h-3" />
                  {result.program.category}
                </Badge>
                {result.program.level === "state" && result.program.stateCode && (
                  <Badge variant="outline" className="text-[11px] py-0 px-1.5 h-5">
                    {result.program.stateCode}
                  </Badge>
                )}
                {result.status !== "unlikely" && (monthlyEst || annualEst) && (
                  <Badge variant="outline" className="text-[11px] py-0 px-1.5 h-5 gap-0.5 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20">
                    <DollarSign className="w-2.5 h-2.5" />
                    {monthlyEst
                      ? `${formatEstimate(monthlyEst.min, monthlyEst.max)}/mo`
                      : annualEst
                        ? `${formatEstimate(annualEst.min, annualEst.max)}/yr`
                        : ""
                    }
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Badge className={`text-[11px] py-0 px-2 h-5 ${config.bgColor} ${config.color} border ${config.borderColor}`}>
                {config.label}
              </Badge>
              {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </div>
          </div>
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 pt-0 pl-12">
          <p className="text-sm text-foreground/80 mb-2">
            {result.program.description}
          </p>
          {(monthlyEst || annualEst) && result.status !== "unlikely" && (
            <div className="p-2.5 rounded-md bg-emerald-50/80 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-800/30 mb-2">
              <div className="flex items-center gap-1.5 mb-1">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">Estimated Value</span>
              </div>
              {monthlyEst && (
                <p className="text-xs text-foreground/70">
                  <span className="font-semibold">{formatEstimate(monthlyEst.min, monthlyEst.max)}/month</span>
                  {monthlyEst.description && ` — ${monthlyEst.description}`}
                </p>
              )}
              {annualEst && (
                <p className="text-xs text-foreground/70">
                  <span className="font-semibold">{formatEstimate(annualEst.min, annualEst.max)}/year</span>
                  {annualEst.description && ` — ${annualEst.description}`}
                </p>
              )}
            </div>
          )}
          <p className="text-xs text-muted-foreground mb-3 italic">
            {result.explanation}
          </p>
          {result.program.notes && (
            <p className="text-xs text-muted-foreground mb-3">
              <span className="font-medium">Note:</span> {result.program.notes}
            </p>
          )}
          <div className="flex items-center gap-3 flex-wrap">
            <a
              href={result.program.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
              data-testid={`link-program-${result.program.id}`}
            >
              Learn more & apply
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            {showApplyGuide && result.status !== "unlikely" && (
              <Link
                href={`/apply-guide?program=${result.program.id}`}
                data-testid={`link-apply-guide-${result.program.id}`}
              >
                <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5 px-2.5">
                  <ShoppingCart className="w-3 h-3" />
                  Get Application Guide — $5
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}

// ─── Blurred placeholder card (for free users) ─────────────────────────────

function LockedProgramCard({ index }: { index: number }) {
  return (
    <Card className="border border-card-border relative overflow-hidden">
      <div className="p-4 flex items-start gap-3 select-none" aria-hidden="true">
        <div className="mt-0.5 flex-shrink-0 text-muted-foreground/30">
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0 blur-[6px] pointer-events-none">
          <h3 className="text-sm font-semibold leading-tight text-muted-foreground/50">
            {["Federal Assistance Program", "State Healthcare Program", "Housing Assistance Benefit", "Food & Nutrition Program", "Tax Credit Opportunity", "Employment Assistance", "Energy Assistance Program", "Children's Health Program"][index % 8]}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="secondary" className="text-[11px] py-0 px-1.5 h-5">Category</Badge>
            <Badge variant="outline" className="text-[11px] py-0 px-1.5 h-5 gap-0.5 border-emerald-300/40 text-emerald-700/40">
              <DollarSign className="w-2.5 h-2.5" />$XX – $XXX/mo
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground/40 mt-2">
            This program provides financial assistance to eligible households based on income and household size...
          </p>
        </div>
      </div>
      {/* Lock overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-background/30 dark:bg-background/40 backdrop-blur-[1px]">
        <Lock className="w-4 h-4 text-muted-foreground/40" />
      </div>
    </Card>
  );
}

// ─── Category breakdown for free users ───────────────────────────────────────

function CategoryBreakdown({ results }: { results: ProgramResult[] }) {
  const relevant = results.filter(r => r.status === "likely" || r.status === "maybe");
  const categoryCounts: Record<string, number> = {};
  for (const r of relevant) {
    const cat = r.program.category;
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  }

  const sorted = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]);

  if (sorted.length === 0) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2" data-testid="category-breakdown">
      {sorted.map(([category, count]) => {
        const Icon = CATEGORY_ICONS[category] || Info;
        return (
          <div
            key={category}
            className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/50 border border-border/50"
          >
            <Icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-semibold truncate">{count} program{count !== 1 ? "s" : ""}</p>
              <p className="text-[10px] text-muted-foreground truncate">{category}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Enhanced paywall CTA with ROI ───────────────────────────────────────────

function PaywallCTA({ programCount, monthlyMin, monthlyMax }: { programCount: number; monthlyMin: number; monthlyMax: number }) {
  const { state, dispatch } = useAppState();
  const { toast } = useToast();
  const subscriptionCost = 7; // $7/mo
  const roiRatio = monthlyMax > 0 ? Math.round(monthlyMax / subscriptionCost) : 0;

  return (
    <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/[0.04] to-primary/[0.08] p-6 text-center" data-testid="paywall-cta">
      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
        <Lock className="w-5 h-5 text-primary" />
      </div>
      <h3 className="text-base font-bold mb-1">
        Unlock Your {programCount} Matching Programs
      </h3>
      <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
        See exactly which benefits you qualify for, with program names,
        descriptions, estimated dollar amounts, and direct links to apply.
      </p>

      {monthlyMax > 0 && (
        <div className="p-3 rounded-lg bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/40 mb-4 max-w-sm mx-auto">
          <p className="text-xs text-muted-foreground mb-0.5">Your estimated total benefit value</p>
          <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
            {formatEstimate(monthlyMin, monthlyMax)}<span className="text-sm font-medium">/month</span>
          </p>
          <p className="text-xs text-muted-foreground">
            {formatEstimate(monthlyMin * 12, monthlyMax * 12)}/year
          </p>
        </div>
      )}

      {roiRatio > 0 && (
        <div className="flex items-center justify-center gap-2 mb-4 text-sm">
          <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span className="font-semibold">
            That's up to <span className="text-emerald-600 dark:text-emerald-400">${roiRatio}</span> for every $1 you spend on YoureOwed.
          </span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-2 justify-center items-center max-w-sm mx-auto">
        <Button
          className="gap-1.5 w-full sm:w-auto"
          data-testid="button-paywall-subscribe"
          onClick={() => {
            if (isStripeConfigured()) {
              openCheckout(PLANS.basic.stripeLinkMonthly, { email: state.user?.email });
            } else {
              simulatePurchase("basic").then(() => {
                dispatch({ type: "UPDATE_PROFILE", payload: { subscriptionTier: "basic" } });
                toast({ title: "You're in.", description: "All 335 programs are now unlocked. Go get what's yours." });
              });
            }
          }}
        >
          <Sparkles className="w-4 h-4" />
          Unlock now — $7/mo
          <ArrowRight className="w-4 h-4" />
        </Button>
        <Link href="/pricing">
          <Button variant="ghost" className="text-xs gap-1" data-testid="button-paywall-compare">
            Compare plans
          </Button>
        </Link>
      </div>
      <p className="text-[10px] text-muted-foreground mt-3">
        $29 one-time setup. Cancel anytime. 7-day money-back guarantee.
      </p>
    </Card>
  );
}

// ─── Share button ────────────────────────────────────────────────────────────

function ShareButton({ isPaid, totalMonthlyMax }: { isPaid: boolean; totalMonthlyMax: number }) {
  const { toast } = useToast();
  const shareUrl = typeof window !== "undefined" ? window.location.origin : "https://benefitshub.com";

  const shareText = isPaid
    ? `I just found out I may qualify for up to $${totalMonthlyMax.toLocaleString()}/month in government benefits through YoureOwed! Check what you're missing.`
    : `I just found out I may qualify for $${totalMonthlyMax.toLocaleString()}/month in government benefits! Check what you're missing \u2192 ${shareUrl}`;

  const handleShare = useCallback(async () => {
    // Try native share first (mobile)
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "My Benefits Results — YoureOwed",
          text: shareText,
          url: shareUrl,
        });
        return;
      } catch {
        // User cancelled or share failed — fall through to clipboard
      }
    }

    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(shareText);
      toast({
        title: "Copied to clipboard",
        description: "Share text copied! Paste it anywhere to share your results.",
      });
    } catch {
      toast({
        title: "Could not copy",
        description: "Please manually copy and share your results.",
        variant: "destructive",
      });
    }
  }, [shareText, shareUrl, toast]);

  return (
    <Button
      variant="outline"
      size="sm"
      className="gap-1.5"
      onClick={handleShare}
      data-testid="button-share"
    >
      <Share2 className="w-3.5 h-3.5" />
      Share My Results
    </Button>
  );
}

// ─── Main results page ───────────────────────────────────────────────────────

export default function ResultsPage({ results, onStartOver, userState }: ResultsPageProps) {
  const [showUnlikely, setShowUnlikely] = useState(false);
  const { state, dispatch } = useAppState();
  const { toast } = useToast();
  const isPaid = state.user?.subscriptionTier === "basic" || state.user?.subscriptionTier === "premium";

  const likelyResults = results.filter(r => r.status === "likely");
  const maybeResults = results.filter(r => r.status === "maybe");
  const unlikelyResults = results.filter(r => r.status === "unlikely");

  const totalRelevant = likelyResults.length + maybeResults.length;

  // Calculate total estimated monthly value
  const totalMonthlyMin = [...likelyResults, ...maybeResults].reduce((sum, r) => {
    if (r.program.estimatedMonthlyBenefit) return sum + r.program.estimatedMonthlyBenefit.min;
    if (r.program.estimatedAnnualBenefit) return sum + Math.round(r.program.estimatedAnnualBenefit.min / 12);
    return sum;
  }, 0);
  const totalMonthlyMax = [...likelyResults, ...maybeResults].reduce((sum, r) => {
    if (r.program.estimatedMonthlyBenefit) return sum + r.program.estimatedMonthlyBenefit.max;
    if (r.program.estimatedAnnualBenefit) return sum + Math.round(r.program.estimatedAnnualBenefit.max / 12);
    return sum;
  }, 0);

  // Free sample: first "likely" result
  const freeSampleResult = likelyResults[0] || maybeResults[0] || null;
  const remainingLockedCount = totalRelevant - (freeSampleResult ? 1 : 0);

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold">Your Results</h1>
          <p className="text-sm text-muted-foreground">Benefits you may qualify for</p>
        </div>
        <div className="flex items-center gap-2">
          {totalRelevant > 0 && totalMonthlyMax > 0 && (
            <ShareButton isPaid={isPaid} totalMonthlyMax={totalMonthlyMax} />
          )}
          <Button variant="ghost" size="sm" onClick={onStartOver} className="gap-1.5" data-testid="button-start-over">
            <RotateCcw className="w-3.5 h-3.5" />
            Start Over
          </Button>
        </div>
      </div>

      {/* Summary — always visible */}
      <div className="mb-6 p-4 rounded-lg bg-primary/5 border border-primary/10">
        <p className="text-sm font-medium">
          We found <span className="text-primary font-bold">{totalRelevant} program{totalRelevant !== 1 ? "s" : ""}</span> you
          may be eligible for.
        </p>
        {totalMonthlyMax > 0 && isPaid && (
          <p className="text-sm mt-1">
            Estimated total value: <span className="font-bold text-emerald-600 dark:text-emerald-400">
              ${totalMonthlyMin.toLocaleString()} – ${totalMonthlyMax.toLocaleString()}/month
            </span>
          </p>
        )}
        {totalMonthlyMax > 0 && isPaid && (
          <p className="text-xs text-muted-foreground mt-0.5">
            That's up to <span className="font-semibold">{formatEstimate(totalMonthlyMin * 12, totalMonthlyMax * 12)}/year</span> in potential benefits.
          </p>
        )}
        {isPaid && (
          <p className="text-[10px] text-muted-foreground mt-1">
            Estimates are approximate. Verify eligibility on each program's official website.
          </p>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/*  PAID VIEW — show full program details                                */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {isPaid && (
        <>
          {/* Likely Results */}
          {likelyResults.length > 0 && (
            <section className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h2 className="text-sm font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
                  Likely Eligible ({likelyResults.length})
                </h2>
              </div>
              <div className="space-y-2">
                {likelyResults.map(r => (
                  <ProgramCard key={r.program.id} result={r} showApplyGuide />
                ))}
              </div>
            </section>
          )}

          {/* Maybe Results */}
          {maybeResults.length > 0 && (
            <section className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <HelpCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <h2 className="text-sm font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400">
                  Worth Exploring ({maybeResults.length})
                </h2>
              </div>
              <div className="space-y-2">
                {maybeResults.map(r => (
                  <ProgramCard key={r.program.id} result={r} showApplyGuide />
                ))}
              </div>
            </section>
          )}

          {/* Unlikely Results */}
          {unlikelyResults.length > 0 && (
            <section className="mb-6">
              <button
                className="flex items-center gap-2 mb-3 cursor-pointer group"
                onClick={() => setShowUnlikely(!showUnlikely)}
                data-testid="button-toggle-unlikely"
              >
                <XCircle className="w-4 h-4 text-slate-400" />
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Unlikely ({unlikelyResults.length})
                </h2>
                {showUnlikely ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </button>
              {showUnlikely && (
                <div className="space-y-2">
                  {unlikelyResults.map(r => (
                    <ProgramCard key={r.program.id} result={r} />
                  ))}
                </div>
              )}
            </section>
          )}
        </>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/*  FREE VIEW — animated counter, category breakdown, sample, paywall    */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {!isPaid && totalRelevant > 0 && (
        <>
          {/* Animated value counter */}
          {totalMonthlyMax > 0 && (
            <div className="text-center mb-6 py-6 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/40 dark:to-emerald-900/20 border border-emerald-200/60 dark:border-emerald-800/40" data-testid="value-counter">
              <p className="text-sm text-muted-foreground mb-2">Your estimated monthly benefit value</p>
              <p className="text-5xl font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums tracking-tight">
                <AnimatedCounter target={totalMonthlyMax} />
                <span className="text-lg font-semibold text-emerald-600/70 dark:text-emerald-400/70">/mo</span>
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Up to <span className="font-semibold">${(totalMonthlyMax * 12).toLocaleString()}/year</span> in potential benefits
              </p>
            </div>
          )}

          {/* Category breakdown */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Info className="w-4 h-4 text-muted-foreground" />
              Programs by Category
            </h3>
            <CategoryBreakdown results={results} />
          </div>

          {/* Free sample: one fully expanded program */}
          {freeSampleResult && (
            <section className="mb-4">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-primary" />
                <h2 className="text-sm font-semibold uppercase tracking-wide text-primary">
                  Free Preview
                </h2>
              </div>
              <ProgramCard result={freeSampleResult} />
            </section>
          )}

          {/* Divider with lock message */}
          {remainingLockedCount > 0 && (
            <div className="relative my-6" data-testid="lock-divider">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-background px-4 py-1.5 text-sm font-medium text-muted-foreground flex items-center gap-2 rounded-full border border-border">
                  <Lock className="w-3.5 h-3.5" />
                  Subscribe to see your remaining {remainingLockedCount} program{remainingLockedCount !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
          )}

          {/* Blurred locked cards */}
          <section className="mb-4">
            <div className="space-y-2">
              {Array.from({ length: Math.min(remainingLockedCount, 4) }, (_, i) => (
                <LockedProgramCard key={`locked-${i}`} index={i} />
              ))}
              {remainingLockedCount > 4 && (
                <p className="text-xs text-muted-foreground text-center py-1">
                  + {remainingLockedCount - 4} more program{remainingLockedCount - 4 !== 1 ? "s" : ""}
                </p>
              )}
            </div>
          </section>

          {/* Free Trial + Paywall CTA */}
          <div className="my-6 space-y-3">
            <FreeTrialCard onStartTrial={() => {
              if (isStripeConfigured()) {
                openCheckout(PLANS.basic.stripeLinkMonthly, { email: state.user?.email });
              } else {
                simulatePurchase("basic").then(() => {
                  dispatch({ type: "UPDATE_PROFILE", payload: { subscriptionTier: "basic" } });
                  toast({ title: "Trial started", description: "You have 7 days free. All programs are unlocked." });
                });
              }
            }} />
            <PaywallCTA
              programCount={totalRelevant}
              monthlyMin={totalMonthlyMin}
              monthlyMax={totalMonthlyMax}
            />
          </div>
        </>
      )}

      {/* No results */}
      {totalRelevant === 0 && (
        <div className="text-center py-12">
          <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No strong matches found</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Based on your answers, we didn't find programs with a high likelihood of eligibility.
            Try adjusting your answers or explore different criteria.
          </p>
        </div>
      )}

      {/* Monetization — shows attorney leads, tax affiliates, insurance referrals, discounts */}
      <div className="mt-8">
        <MonetizationSection results={results} />
      </div>

      {/* Disclaimer */}
      <Card className="mt-6 p-4 border-amber-200 dark:border-amber-800/40 bg-amber-50/50 dark:bg-amber-950/20">
        <div className="flex gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-foreground/80 space-y-2">
            <p className="font-semibold text-sm">Important Disclaimer</p>
            <p>
              This tool is for <span className="font-semibold">informational purposes only</span>.
              It is <span className="font-semibold">not legal advice</span> and does not guarantee eligibility.
              Dollar estimates are approximate ranges and actual benefits may differ.
            </p>
            <p>
              Program rules change frequently. Always confirm on official government websites.
              Your information was <span className="font-semibold">not stored or transmitted</span>.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
