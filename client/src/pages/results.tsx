import { useState } from "react";
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
} from "lucide-react";
import { type ProgramResult, type EligibilityStatus } from "@/lib/eligibility";
import { useAppState } from "@/lib/store";

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

// ─── Full program card (for paid users) ─────────────────────────────────────
function ProgramCard({ result }: { result: ProgramResult }) {
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

// ─── Paywall upgrade CTA ─────────────────────────────────────────────────────
function PaywallCTA({ programCount, monthlyMin, monthlyMax }: { programCount: number; monthlyMin: number; monthlyMax: number }) {
  return (
    <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/[0.04] to-primary/[0.08] p-6 text-center" data-testid="paywall-cta">
      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
        <Lock className="w-5 h-5 text-primary" />
      </div>
      <h3 className="text-base font-bold mb-1">
        Unlock Your {programCount} Matching Programs
      </h3>
      <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
        Subscribe to see exactly which benefits you qualify for, with program names,
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

      <div className="flex flex-col sm:flex-row gap-2 justify-center items-center max-w-sm mx-auto">
        <Link href="/pricing">
          <Button className="gap-1.5 w-full sm:w-auto" data-testid="button-paywall-subscribe">
            <Sparkles className="w-4 h-4" />
            Subscribe — $7/mo
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
      <p className="text-[10px] text-muted-foreground mt-3">
        $29 one-time setup fee. Cancel anytime. 7-day money-back guarantee.
      </p>
    </Card>
  );
}

// ─── Main results page ───────────────────────────────────────────────────────
export default function ResultsPage({ results, onStartOver, userState }: ResultsPageProps) {
  const [showUnlikely, setShowUnlikely] = useState(false);
  const { state } = useAppState();

  const isPaid = state.user?.subscriptionTier === "basic" || state.user?.subscriptionTier === "premium";

  const likelyResults = results.filter(r => r.status === "likely");
  const maybeResults = results.filter(r => r.status === "maybe");
  const unlikelyResults = results.filter(r => r.status === "unlikely");

  const totalRelevant = likelyResults.length + maybeResults.length;

  // Calculate total estimated value
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

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold">Your Results</h1>
          <p className="text-sm text-muted-foreground">Benefits you may qualify for</p>
        </div>
        <Button variant="ghost" size="sm" onClick={onStartOver} className="gap-1.5" data-testid="button-start-over">
          <RotateCcw className="w-3.5 h-3.5" />
          Start Over
        </Button>
      </div>

      {/* Summary — always visible (free teaser) */}
      <div className="mb-6 p-4 rounded-lg bg-primary/5 border border-primary/10">
        <p className="text-sm font-medium">
          We found <span className="text-primary font-bold">{totalRelevant} program{totalRelevant !== 1 ? "s" : ""}</span> you
          may be eligible for.
        </p>
        {totalMonthlyMax > 0 && (
          <p className="text-sm mt-1">
            Estimated total value: <span className="font-bold text-emerald-600 dark:text-emerald-400">
              ${totalMonthlyMin.toLocaleString()} – ${totalMonthlyMax.toLocaleString()}/month
            </span>
          </p>
        )}
        {totalMonthlyMax > 0 && (
          <p className="text-xs text-muted-foreground mt-0.5">
            That's up to <span className="font-semibold">{formatEstimate(totalMonthlyMin * 12, totalMonthlyMax * 12)}/year</span> in potential benefits.
          </p>
        )}
        {!isPaid && totalRelevant > 0 && (
          <p className="text-xs text-primary font-medium mt-2 flex items-center gap-1">
            <Lock className="w-3 h-3" />
            Subscribe to see which programs you qualify for.
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
                  <ProgramCard key={r.program.id} result={r} />
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
                  <ProgramCard key={r.program.id} result={r} />
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
      {/*  FREE VIEW — blurred cards + paywall CTA                              */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {!isPaid && totalRelevant > 0 && (
        <>
          {/* Show a few blurred placeholder cards as a teaser */}
          <section className="mb-4">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-sm font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
                Likely Eligible ({likelyResults.length})
              </h2>
              <Badge variant="outline" className="text-[10px] h-4 gap-0.5 ml-auto">
                <Lock className="w-2.5 h-2.5" /> Locked
              </Badge>
            </div>
            <div className="space-y-2">
              {likelyResults.slice(0, 3).map((_, i) => (
                <LockedProgramCard key={`locked-likely-${i}`} index={i} />
              ))}
              {likelyResults.length > 3 && (
                <p className="text-xs text-muted-foreground text-center py-1">
                  + {likelyResults.length - 3} more likely programs
                </p>
              )}
            </div>
          </section>

          {maybeResults.length > 0 && (
            <section className="mb-4">
              <div className="flex items-center gap-2 mb-3">
                <HelpCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <h2 className="text-sm font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400">
                  Worth Exploring ({maybeResults.length})
                </h2>
                <Badge variant="outline" className="text-[10px] h-4 gap-0.5 ml-auto">
                  <Lock className="w-2.5 h-2.5" /> Locked
                </Badge>
              </div>
              <div className="space-y-2">
                {maybeResults.slice(0, 2).map((_, i) => (
                  <LockedProgramCard key={`locked-maybe-${i}`} index={i + 3} />
                ))}
                {maybeResults.length > 2 && (
                  <p className="text-xs text-muted-foreground text-center py-1">
                    + {maybeResults.length - 2} more possible programs
                  </p>
                )}
              </div>
            </section>
          )}

          {/* Paywall CTA */}
          <div className="my-6">
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

      {/* Disclaimer */}
      <Card className="mt-8 p-4 border-amber-200 dark:border-amber-800/40 bg-amber-50/50 dark:bg-amber-950/20">
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
