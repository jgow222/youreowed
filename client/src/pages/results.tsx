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
  Twitter,
  Facebook,
  MessageSquare,
  Check,
} from "lucide-react";
import { type ProgramResult, type EligibilityStatus } from "@/lib/eligibility";
import { useAppState } from "@/lib/store";
import { useElderlyMode } from "@/lib/elderly-mode";
import { useToast } from "@/hooks/use-toast";
import { PLANS, openCheckout, isStripeConfigured, redirectToPricing } from "@/lib/payments";
import { FreeTrialCard, SidebarMonetization, MobileOffersStrip } from "@/components/MonetizationCards";
import { ConfettiExplosion, AnimatedCheckmark } from "@/components/Animations";

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

function ProgramCard({ result, showApplyGuide = false, isElderlyMode = false }: { result: ProgramResult; showApplyGuide?: boolean; isElderlyMode?: boolean }) {
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
        className={`w-full text-left flex items-start gap-3 cursor-pointer ${isElderlyMode ? "p-6" : "p-4"}`}
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
              <h3 className={`font-semibold leading-tight ${isElderlyMode ? "text-base" : "text-sm"}`}>{result.program.displayName || result.program.name}</h3>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <Badge variant="secondary" className={`py-0 px-1.5 gap-1 ${isElderlyMode ? "text-sm h-6" : "text-[11px] h-5"}`}>
                  <CategoryIcon className="w-3 h-3" />
                  {result.program.category}
                </Badge>
                {result.program.level === "state" && result.program.stateCode && (
                  <Badge variant="outline" className={`py-0 px-1.5 ${isElderlyMode ? "text-sm h-6" : "text-[11px] h-5"}`}>
                    {result.program.stateCode}
                  </Badge>
                )}
                {result.status !== "unlikely" && (monthlyEst || annualEst) && (
                  <Badge variant="outline" className={`py-0 px-1.5 gap-0.5 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20 ${isElderlyMode ? "text-sm h-6" : "text-[11px] h-5"}`}>
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
              <Badge className={`py-0 px-2 ${config.bgColor} ${config.color} border ${config.borderColor} ${isElderlyMode ? "text-sm h-6" : "text-[11px] h-5"}`}>
                {config.label}
              </Badge>
              {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </div>
          </div>
        </div>
      </button>

      {expanded && (
        <div className={`pt-0 pl-12 ${isElderlyMode ? "px-6 pb-6" : "px-4 pb-4"}`}>
          <p className={`text-foreground/80 mb-2 ${isElderlyMode ? "text-sm" : "text-sm"}`}>
            {result.program.description}
          </p>
          {(monthlyEst || annualEst) && result.status !== "unlikely" && (
            <div className="p-2.5 rounded-md bg-emerald-50/80 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-800/30 mb-2">
              <div className="flex items-center gap-1.5 mb-1">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className={`font-semibold text-emerald-700 dark:text-emerald-400 ${isElderlyMode ? "text-sm" : "text-xs"}`}>Estimated Value</span>
              </div>
              {monthlyEst && (
                <p className={`text-foreground/70 ${isElderlyMode ? "text-sm" : "text-xs"}`}>
                  <span className="font-semibold">{formatEstimate(monthlyEst.min, monthlyEst.max)}/month</span>
                  {monthlyEst.description && ` — ${monthlyEst.description}`}
                </p>
              )}
              {annualEst && (
                <p className={`text-foreground/70 ${isElderlyMode ? "text-sm" : "text-xs"}`}>
                  <span className="font-semibold">{formatEstimate(annualEst.min, annualEst.max)}/year</span>
                  {annualEst.description && ` — ${annualEst.description}`}
                </p>
              )}
            </div>
          )}
          <p className={`text-muted-foreground mb-3 italic ${isElderlyMode ? "text-sm" : "text-xs"}`}>
            {result.explanation}
          </p>
          {result.program.notes && (
            <p className={`text-muted-foreground mb-3 ${isElderlyMode ? "text-sm" : "text-xs"}`}>
              <span className="font-medium">Note:</span> {result.program.notes}
            </p>
          )}
          <div className="flex items-center gap-3 flex-wrap">
            <a
              href={result.program.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-1.5 font-medium text-primary hover:underline ${isElderlyMode ? "text-base" : "text-sm"}`}
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
                <Button variant="outline" size="sm" className={isElderlyMode ? "h-9 text-sm gap-1.5 px-3" : "h-7 text-xs gap-1.5 px-2.5"}>
                  <ShoppingCart className="w-3 h-3" />
                  Get Application Guide — $2.99
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

function PaywallCTA({ programCount, monthlyMin, monthlyMax, isElderlyMode = false }: { programCount: number; monthlyMin: number; monthlyMax: number; isElderlyMode?: boolean }) {
  const { state, dispatch } = useAppState();
  const { toast } = useToast();
  const subscriptionCost = 4.99; // $4.99/mo
  const roiRatio = monthlyMax > 0 ? Math.round(monthlyMax / subscriptionCost) : 0;

  return (
    <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/[0.04] to-primary/[0.08] p-6 text-center" data-testid="paywall-cta">
      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
        <Lock className="w-5 h-5 text-primary" />
      </div>
      <h3 className={`font-bold mb-1 ${isElderlyMode ? "text-lg" : "text-base"}`}>
        Unlock Your {programCount} Matching Programs
      </h3>
      <p className={`text-muted-foreground mb-4 max-w-md mx-auto ${isElderlyMode ? "text-base" : "text-sm"}`}>
        See exactly which benefits you qualify for, with program names,
        descriptions, estimated dollar amounts, and direct links to apply.
      </p>

      {monthlyMax > 0 && (
        <div className="p-3 rounded-lg bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/40 mb-4 max-w-sm mx-auto">
          <p className={`text-muted-foreground mb-0.5 ${isElderlyMode ? "text-sm" : "text-xs"}`}>Your estimated total benefit value</p>
          <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
            {formatEstimate(monthlyMin, monthlyMax)}<span className="text-sm font-medium">/month</span>
          </p>
          <p className={`text-muted-foreground ${isElderlyMode ? "text-sm" : "text-xs"}`}>
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
          className={`gap-1.5 w-full sm:w-auto ${isElderlyMode ? "h-14 text-lg" : ""}`}
          data-testid="button-paywall-subscribe"
          onClick={() => {
            if (isStripeConfigured()) {
              openCheckout(PLANS.basic.stripeLinkMonthly, { email: state.user?.email });
            } else {
              redirectToPricing();
            }
          }}
        >
          <Sparkles className="w-4 h-4" />
          Unlock now — $4.99/mo
          <ArrowRight className="w-4 h-4" />
        </Button>
        <Link href="/pricing">
          <Button variant="ghost" className="text-xs gap-1" data-testid="button-paywall-compare">
            Compare plans
          </Button>
        </Link>
      </div>
      <p className="text-[10px] text-muted-foreground mt-3">
        Cancel anytime. 7-day money-back guarantee.
      </p>
    </Card>
  );
}

// ─── Social share helpers ────────────────────────────────────────────────────

function openShareWindow(url: string) {
  window.open(url, "_blank", "width=600,height=500,noopener,noreferrer");
}

// ─── Visual share card that looks great on social media ──────────────────────

function ShareCard({ totalMonthlyMax, programCount }: { totalMonthlyMax: number; programCount: number }) {
  return (
    <div
      className="rounded-xl border border-[#00E676]/30 bg-gradient-to-br from-[#0a1a0f] to-[#0d1f13] p-5 relative overflow-hidden"
      data-testid="share-card-preview"
    >
      {/* Decorative glow */}
      <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-[#00E676]/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-32 h-32 rounded-full bg-[#00E676]/5 blur-2xl pointer-events-none" />

      {/* Logo row */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg bg-[#00E676] flex items-center justify-center flex-shrink-0">
          <span className="text-[10px] font-black text-black">YO</span>
        </div>
        <div>
          <span className="text-xs font-black tracking-tight leading-tight text-white block">YoureOwed</span>
          <span className="text-[9px] text-[#00E676]/70 leading-tight block">youreowed.org</span>
        </div>
      </div>

      {/* Value */}
      <div className="mb-3">
        <p className="text-xs text-[#00E676]/70 mb-0.5 font-medium tracking-wide uppercase">I found</p>
        <p className="text-4xl font-extrabold text-[#00E676] tabular-nums tracking-tight leading-none">
          ${totalMonthlyMax.toLocaleString()}
          <span className="text-lg font-semibold text-[#00E676]/60">/mo</span>
        </p>
        <p className="text-xs text-white/50 mt-1">
          in benefits I wasn&apos;t claiming &mdash; across{" "}
          <span className="text-white/80 font-semibold">{programCount} programs</span>
        </p>
      </div>

      {/* Divider */}
      <div className="h-px bg-[#00E676]/15 my-3" />

      {/* CTA */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-white/60">
          Check what <span className="text-white font-semibold">you&apos;re owed</span>
        </p>
        <div className="flex items-center gap-1 text-[#00E676] text-xs font-bold">
          youreowed.org
          <ArrowRight className="w-3 h-3" />
        </div>
      </div>
    </div>
  );
}

// ─── Share button (enhanced with share card modal) ────────────────────────────

function ShareButton({ isPaid, totalMonthlyMax, totalRelevant, isElderlyMode = false }: { isPaid: boolean; totalMonthlyMax: number; totalRelevant: number; isElderlyMode?: boolean }) {
  const { toast } = useToast();
  const [showCard, setShowCard] = useState(false);
  const [copied, setCopied] = useState(false);
  const shareUrl = "https://youreowed.org";

  const formattedAmount = `$${totalMonthlyMax.toLocaleString()}`;
  const shareText = `I just found ${formattedAmount}/month in benefits I wasn't claiming. YoureOwed scanned 415 programs in minutes. Check what you're owed → ${shareUrl}`;
  const twitterText = `I just found ${formattedAmount}/mo in government benefits I wasn't claiming 💵 YoureOwed found me ${totalRelevant} programs in minutes. Check what you're owed →`;

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      toast({ title: "Copied!", description: "Share text copied to clipboard." });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "Could not copy", description: "Please copy manually.", variant: "destructive" });
    }
  }, [shareText, toast]);

  const handleNativeShare = useCallback(async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "My Benefits Results — YoureOwed",
          text: shareText,
          url: shareUrl,
        });
        return;
      } catch {
        // cancelled
      }
    }
    handleCopy();
  }, [shareText, shareUrl, handleCopy]);

  if (!showCard) {
    return (
      <Button
        variant="outline"
        size="sm"
        className={`gap-1.5 ${isElderlyMode ? "h-10 text-sm px-4" : ""}`}
        onClick={() => setShowCard(true)}
        data-testid="button-share"
      >
        <Share2 className="w-3.5 h-3.5" />
        Share My Results
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" data-testid="share-modal">
      <div className="w-full max-w-sm rounded-2xl bg-card border border-border shadow-2xl p-5 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold">Share Your Results</h3>
            <p className="text-xs text-muted-foreground">Show friends what they might be missing</p>
          </div>
          <Button variant="ghost" size="sm" className="w-7 h-7 p-0 text-lg" onClick={() => setShowCard(false)}>
            ×
          </Button>
        </div>

        {/* Visual share card preview */}
        <ShareCard totalMonthlyMax={totalMonthlyMax} programCount={totalRelevant} />

        {/* Social share buttons */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs border-sky-500/30 text-sky-400 hover:bg-sky-500/10"
            onClick={() =>
              openShareWindow(
                `https://twitter.com/intent/tweet?text=${encodeURIComponent(twitterText)}&url=${encodeURIComponent(shareUrl)}`
              )
            }
            data-testid="button-share-twitter"
          >
            <Twitter className="w-3.5 h-3.5" />
            X / Twitter
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs border-blue-600/30 text-blue-400 hover:bg-blue-600/10"
            onClick={() =>
              openShareWindow(
                `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`
              )
            }
            data-testid="button-share-facebook"
          >
            <Facebook className="w-3.5 h-3.5" />
            Facebook
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs border-green-600/30 text-green-400 hover:bg-green-600/10"
            onClick={() =>
              openShareWindow(`https://wa.me/?text=${encodeURIComponent(shareText)}`)
            }
            data-testid="button-share-whatsapp"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            WhatsApp
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs"
            onClick={handleNativeShare}
            data-testid="button-share-more"
          >
            <Share2 className="w-3.5 h-3.5" />
            More...
          </Button>
        </div>

        {/* Copy text */}
        <Button
          variant="secondary"
          size="sm"
          className="w-full gap-1.5 text-xs"
          onClick={handleCopy}
          data-testid="button-share-copy"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-[#00E676]" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? "Copied!" : "Copy Share Text"}
        </Button>
      </div>
    </div>
  );
}

// ─── Main results page ───────────────────────────────────────────────────────

export default function ResultsPage({ results, onStartOver, userState }: ResultsPageProps) {
  const [showUnlikely, setShowUnlikely] = useState(false);
  const [confettiFired, setConfettiFired] = useState(false);
  const { state, dispatch } = useAppState();
  const { isElderlyMode } = useElderlyMode();
  const { toast } = useToast();
  const isPaid = state.user?.subscriptionTier === "basic" || state.user?.subscriptionTier === "premium";

  // Fire confetti once when results first render
  useEffect(() => {
    const totalRelevantCount = results.filter(r => r.status === "likely" || r.status === "maybe").length;
    if (totalRelevantCount > 0) {
      const t = setTimeout(() => setConfettiFired(true), 400);
      return () => clearTimeout(t);
    }
  }, []);

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
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className={`font-bold ${isElderlyMode ? "text-2xl" : "text-xl"}`}>Your Results</h1>
          <p className={`text-muted-foreground ${isElderlyMode ? "text-base" : "text-sm"}`}>Benefits you may qualify for</p>
        </div>
        <div className="flex items-center gap-2">
          {totalRelevant > 0 && totalMonthlyMax > 0 && (
            <ShareButton isPaid={isPaid} totalMonthlyMax={totalMonthlyMax} totalRelevant={totalRelevant} isElderlyMode={isElderlyMode} />
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onStartOver}
            className={`gap-1.5 ${isElderlyMode ? "h-10 text-sm px-4" : ""}`}
            data-testid="button-start-over"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Start Over
          </Button>
        </div>
      </div>

      {/* Confetti — fires when results render */}
      <ConfettiExplosion trigger={confettiFired} />

      {/* Mobile: offers strip at top (hidden on lg+) */}
      <div className="lg:hidden mb-4">
        <MobileOffersStrip results={results} />
      </div>

      {/* Two-column layout: main results + desktop sidebar */}
      <div className="flex gap-6">
        {/* Main results column */}
        <div className="flex-1 min-w-0 max-w-3xl">

          {/* Summary — always visible */}
          <div className={`mb-6 rounded-lg bg-primary/5 border border-primary/10 ${isElderlyMode ? "p-6" : "p-4"}`}>
            <p className={`font-medium flex items-center gap-2 ${isElderlyMode ? "text-base" : "text-sm"}`}>
              {totalRelevant > 0 && <AnimatedCheckmark size={isElderlyMode ? 32 : 24} />}
              We found <span className="text-primary font-bold">{totalRelevant} program{totalRelevant !== 1 ? "s" : ""}</span> you
              may be eligible for.
            </p>
            {totalMonthlyMax > 0 && isPaid && (
              <p className={`mt-1 ${isElderlyMode ? "text-base" : "text-sm"}`}>
                Estimated total value: <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  ${totalMonthlyMin.toLocaleString()} – ${totalMonthlyMax.toLocaleString()}/month
                </span>
              </p>
            )}
            {totalMonthlyMax > 0 && isPaid && (
              <p className={`text-muted-foreground mt-0.5 ${isElderlyMode ? "text-sm" : "text-xs"}`}>
                That's up to <span className="font-semibold">{formatEstimate(totalMonthlyMin * 12, totalMonthlyMax * 12)}/year</span> in potential benefits.
              </p>
            )}
            {isPaid && (
              <p className={`text-muted-foreground mt-1 ${isElderlyMode ? "text-xs" : "text-[10px]"}`}>
                Estimates are approximate. Verify eligibility on each program's official website.
              </p>
            )}
          </div>

          {/* ═════════════════════════════════════════════════════════════════ */}
          {/*  PAID VIEW — show full program details                          */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          {isPaid && (
            <>
              {/* Likely Results */}
              {likelyResults.length > 0 && (
                <section className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <h2 className={`font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400 ${isElderlyMode ? "text-base" : "text-sm"}`}>
                      Likely Eligible ({likelyResults.length})
                    </h2>
                  </div>
                  <div className="space-y-2">
                    {likelyResults.map(r => (
                      <ProgramCard key={r.program.id} result={r} showApplyGuide isElderlyMode={isElderlyMode} />
                    ))}
                  </div>
                </section>
              )}

              {/* Maybe Results */}
              {maybeResults.length > 0 && (
                <section className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <HelpCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <h2 className={`font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400 ${isElderlyMode ? "text-base" : "text-sm"}`}>
                      Worth Exploring ({maybeResults.length})
                    </h2>
                  </div>
                  <div className="space-y-2">
                    {maybeResults.map(r => (
                      <ProgramCard key={r.program.id} result={r} showApplyGuide isElderlyMode={isElderlyMode} />
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
                    <h2 className={`font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 ${isElderlyMode ? "text-base" : "text-sm"}`}>
                      Unlikely ({unlikelyResults.length})
                    </h2>
                    {showUnlikely ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </button>
                  {showUnlikely && (
                    <div className="space-y-2">
                      {unlikelyResults.map(r => (
                        <ProgramCard key={r.program.id} result={r} isElderlyMode={isElderlyMode} />
                      ))}
                    </div>
                  )}
                </section>
              )}
            </>
          )}

          {/* ═════════════════════════════════════════════════════════════════ */}
          {/*  FREE VIEW — animated counter, category breakdown, sample, paywall */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          {!isPaid && totalRelevant > 0 && (
            <>
              {/* Animated value counter */}
              {totalMonthlyMax > 0 && (
                <div className="text-center mb-6 py-6 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/40 dark:to-emerald-900/20 border border-emerald-200/60 dark:border-emerald-800/40" data-testid="value-counter">
                  <p className={`text-muted-foreground mb-2 ${isElderlyMode ? "text-base" : "text-sm"}`}>Your estimated monthly benefit value</p>
                  <p className="text-5xl font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums tracking-tight">
                    <AnimatedCounter target={totalMonthlyMax} />
                    <span className="text-lg font-semibold text-emerald-600/70 dark:text-emerald-400/70">/mo</span>
                  </p>
                  <p className={`text-muted-foreground mt-2 ${isElderlyMode ? "text-base" : "text-sm"}`}>
                    Up to <span className="font-semibold">${(totalMonthlyMax * 12).toLocaleString()}/year</span> in potential benefits
                  </p>
                </div>
              )}

              {/* Category breakdown */}
              <div className="mb-6">
                <h3 className={`font-semibold mb-3 flex items-center gap-2 ${isElderlyMode ? "text-base" : "text-sm"}`}>
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
                    <h2 className={`font-semibold uppercase tracking-wide text-primary ${isElderlyMode ? "text-base" : "text-sm"}`}>
                      Free Preview
                    </h2>
                  </div>
                  <ProgramCard result={freeSampleResult} isElderlyMode={isElderlyMode} />
                </section>
              )}

              {/* Divider with lock message */}
              {remainingLockedCount > 0 && (
                <div className="relative my-6" data-testid="lock-divider">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className={`bg-background px-4 py-1.5 font-medium text-muted-foreground flex items-center gap-2 rounded-full border border-border ${isElderlyMode ? "text-base" : "text-sm"}`}>
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
                    redirectToPricing();
                  }
                }} />
                <PaywallCTA
                  programCount={totalRelevant}
                  monthlyMin={totalMonthlyMin}
                  monthlyMax={totalMonthlyMax}
                  isElderlyMode={isElderlyMode}
                />
              </div>
            </>
          )}

          {/* No results */}
          {totalRelevant === 0 && (
            <div className="text-center py-12">
              <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className={`font-semibold mb-2 ${isElderlyMode ? "text-xl" : "text-lg"}`}>No strong matches found</h3>
              <p className={`text-muted-foreground max-w-md mx-auto ${isElderlyMode ? "text-base" : "text-sm"}`}>
                Based on your answers, we didn't find programs with a high likelihood of eligibility.
                Try adjusting your answers or explore different criteria.
              </p>
            </div>
          )}

          {/* Disclaimer */}
          <Card className={`mt-6 border-amber-200 dark:border-amber-800/40 bg-amber-50/50 dark:bg-amber-950/20 ${isElderlyMode ? "p-6" : "p-4"}`}>
            <div className="flex gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div className={`text-foreground/80 space-y-2 ${isElderlyMode ? "text-sm" : "text-xs"}`}>
                <p className={`font-semibold ${isElderlyMode ? "text-base" : "text-sm"}`}>Important Disclaimer</p>
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

        {/* Desktop sidebar — sticky, only visible on lg+ screens */}
        <aside className="hidden lg:block w-80 flex-shrink-0">
          <div className="sticky top-4">
            <SidebarMonetization results={results} />
          </div>
        </aside>
      </div>
    </div>
  );
}
