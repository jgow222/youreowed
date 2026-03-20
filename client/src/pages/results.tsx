import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
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
} from "lucide-react";
import { type ProgramResult, type EligibilityStatus } from "@/lib/eligibility";
import { PerplexityAttribution } from "@/components/PerplexityAttribution";

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
};

function ProgramCard({ result }: { result: ProgramResult }) {
  const [expanded, setExpanded] = useState(result.status !== "unlikely");
  const config = STATUS_CONFIG[result.status];
  const StatusIcon = config.icon;
  const CategoryIcon = CATEGORY_ICONS[result.program.category] || Info;

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
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-[11px] py-0 px-1.5 h-5 gap-1">
                  <CategoryIcon className="w-3 h-3" />
                  {result.program.category}
                </Badge>
                {result.program.level === "state" && result.program.stateCode && (
                  <Badge variant="outline" className="text-[11px] py-0 px-1.5 h-5">
                    {result.program.stateCode}
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

export default function ResultsPage({ results, onStartOver, userState }: ResultsPageProps) {
  const [showUnlikely, setShowUnlikely] = useState(false);

  const likelyResults = results.filter(r => r.status === "likely");
  const maybeResults = results.filter(r => r.status === "maybe");
  const unlikelyResults = results.filter(r => r.status === "unlikely");

  const totalRelevant = likelyResults.length + maybeResults.length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
              <Shield className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-base font-semibold leading-tight">Your Results</h1>
              <p className="text-xs text-muted-foreground">Benefits you may qualify for</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onStartOver} className="gap-1.5" data-testid="button-start-over">
            <RotateCcw className="w-3.5 h-3.5" />
            Start Over
          </Button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* Summary */}
        <div className="mb-6 p-4 rounded-lg bg-primary/5 border border-primary/10">
          <p className="text-sm font-medium">
            We found <span className="text-primary font-bold">{totalRelevant} program{totalRelevant !== 1 ? "s" : ""}</span> you
            may be eligible for based on your answers.
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Remember to verify eligibility on each program's official website.
          </p>
        </div>

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

        {/* Unlikely Results (collapsed by default) */}
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
              {showUnlikely ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
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

        {/* No results */}
        {totalRelevant === 0 && (
          <div className="text-center py-12">
            <Info className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No strong matches found</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Based on your answers, we didn't find programs with a high likelihood of eligibility.
              You can try adjusting your answers or explore the unlikely programs below for more options.
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
                It is <span className="font-semibold">not legal advice</span> and does not guarantee eligibility
                for any program.
              </p>
              <p>
                Program rules change frequently. Actual eligibility depends on many factors not captured here,
                including assets, specific household circumstances, and detailed income calculations. Always
                confirm details on official government websites before relying on these estimates.
              </p>
              <p>
                Your information was <span className="font-semibold">not stored or transmitted</span>.
                All screening was performed locally in your browser.
              </p>
            </div>
          </div>
        </Card>

        {/* Footer */}
        <footer className="mt-8 pt-4 border-t border-border text-center pb-8">
          <p className="text-xs text-muted-foreground mb-2">
            Benefits Screener v1.0 &middot; Data reflects simplified 2025 guidelines
          </p>
          <PerplexityAttribution />
        </footer>
      </main>
    </div>
  );
}
