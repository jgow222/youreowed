import { useState, useMemo } from "react";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  CheckCircle2,
  Circle,
  MinusCircle,
  Lock,
  FileText,
  CreditCard,
  Stethoscope,
  Home,
  Receipt,
  GraduationCap,
  MoreHorizontal,
  Shield,
  ArrowRight,
  Sparkles,
  Info,
  CheckSquare,
  SquareSlash,
  CheckCheck,
} from "lucide-react";
import {
  useTracker,
  MASTER_DOCUMENTS,
  type DocumentItem,
  type DocumentStatus,
  type DocumentCategory,
} from "@/lib/tracker-state";
import { useAppState } from "@/lib/store";

// ── Category config ────────────────────────────────────────────────────────

const CATEGORY_CONFIG: Record<DocumentCategory, {
  icon: React.ElementType;
  color: string;
  bg: string;
  description: string;
}> = {
  Identity: {
    icon: CreditCard,
    color: "text-blue-400",
    bg: "bg-blue-400/10",
    description: "Who you are — IDs, SSN, citizenship status",
  },
  Income: {
    icon: Receipt,
    color: "text-green-400",
    bg: "bg-green-400/10",
    description: "Proof of earnings, benefits, and assets",
  },
  Medical: {
    icon: Stethoscope,
    color: "text-red-400",
    bg: "bg-red-400/10",
    description: "Health records, disability documentation",
  },
  Housing: {
    icon: Home,
    color: "text-sky-400",
    bg: "bg-sky-400/10",
    description: "Lease, utility bills, address proof",
  },
  Tax: {
    icon: FileText,
    color: "text-amber-400",
    bg: "bg-amber-400/10",
    description: "Tax returns, W-2s, dependent SSNs",
  },
  Education: {
    icon: GraduationCap,
    color: "text-violet-400",
    bg: "bg-violet-400/10",
    description: "FAFSA, enrollment verification",
  },
  Other: {
    icon: MoreHorizontal,
    color: "text-muted-foreground",
    bg: "bg-muted/30",
    description: "Work history, military records, family docs",
  },
};

const DOC_STATUS_CONFIG: Record<DocumentStatus, {
  label: string;
  icon: React.ElementType;
  color: string;
  bg: string;
}> = {
  have: {
    label: "Have it",
    icon: CheckCircle2,
    color: "text-primary",
    bg: "bg-primary/10 border-primary/30",
  },
  need: {
    label: "Need it",
    icon: Circle,
    color: "text-amber-400",
    bg: "bg-amber-400/10 border-amber-400/30",
  },
  na: {
    label: "N/A",
    icon: MinusCircle,
    color: "text-muted-foreground",
    bg: "bg-muted/30 border-card-border",
  },
};

// ── Status Cycle Button ────────────────────────────────────────────────────

function DocStatusButton({
  docId,
  currentStatus,
  onToggle,
}: {
  docId: string;
  currentStatus: DocumentStatus | undefined;
  onToggle: (docId: string, status: DocumentStatus) => void;
}) {
  const status: DocumentStatus = currentStatus ?? "need";
  const cfg = DOC_STATUS_CONFIG[status];
  const Icon = cfg.icon;

  const cycle = (): DocumentStatus => {
    if (status === "need") return "have";
    if (status === "have") return "na";
    return "need";
  };

  return (
    <button
      onClick={() => onToggle(docId, cycle())}
      className={`
        flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold transition-all
        ${cfg.bg} ${cfg.color}
        hover:opacity-80 active:scale-95
      `}
      title="Click to cycle: Need it → Have it → N/A"
    >
      <Icon className="w-3 h-3 flex-shrink-0" />
      {cfg.label}
    </button>
  );
}

// ── Document Row ───────────────────────────────────────────────────────────

function DocumentRow({
  doc,
  status,
  isPro,
  onToggle,
}: {
  doc: DocumentItem;
  status: DocumentStatus | undefined;
  isPro: boolean;
  onToggle: (docId: string, status: DocumentStatus) => void;
}) {
  const currentStatus: DocumentStatus = status ?? "need";
  const isHave = currentStatus === "have";
  const isNA = currentStatus === "na";

  return (
    <div
      className={`
        flex items-start gap-3 p-3 rounded-lg border transition-colors
        ${isHave ? "border-primary/20 bg-primary/[0.02]" : "border-card-border/60 bg-card/50"}
        ${isNA ? "opacity-50" : ""}
      `}
    >
      {/* Status toggle */}
      <div className="pt-0.5">
        <DocStatusButton
          docId={doc.id}
          currentStatus={currentStatus}
          onToggle={onToggle}
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className={`text-sm font-semibold leading-tight ${isNA ? "line-through" : ""}`}>
              {doc.name}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
              {doc.description}
            </p>
          </div>
        </div>

        {/* Program badges */}
        <div className="flex flex-wrap gap-1 mt-2">
          {doc.programs.slice(0, 4).map((p) => (
            <Badge key={p} variant="secondary" className="text-[9px] h-4 px-1.5 font-normal">
              {p.toUpperCase().replace("-", " ")}
            </Badge>
          ))}
          {doc.programs.length > 4 && (
            <Badge variant="secondary" className="text-[9px] h-4 px-1.5 font-normal">
              +{doc.programs.length - 4} more
            </Badge>
          )}
        </div>

        {/* Pro details */}
        {isPro ? (
          <div className="mt-3 space-y-2">
            <div className="p-2 rounded-md bg-muted/30 border border-card-border/50">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-0.5">
                Where to get it
              </p>
              <p className="text-xs text-foreground leading-relaxed">{doc.where}</p>
            </div>
            <div className="p-2 rounded-md bg-muted/30 border border-card-border/50">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-0.5">
                Accepted forms
              </p>
              <p className="text-xs text-foreground leading-relaxed">{doc.acceptedForms}</p>
            </div>
          </div>
        ) : (
          // Blurred upgrade prompt for non-Pro
          <div className="mt-2 relative">
            <div className="p-2 rounded-md bg-muted/30 border border-card-border/50 blur-sm select-none pointer-events-none">
              <p className="text-xs">Where to get: Sample text showing where to obtain this document</p>
              <p className="text-xs mt-1">Accepted forms: List of acceptable document types</p>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex items-center gap-1.5 bg-card/90 border border-card-border px-3 py-1.5 rounded-full backdrop-blur-sm">
                <Lock className="w-3 h-3 text-primary" />
                <Link href="/pricing">
                  <span className="text-[10px] font-bold text-primary cursor-pointer hover:underline">
                    Upgrade for detailed guidance
                  </span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Category Section ───────────────────────────────────────────────────────

function CategorySection({
  category,
  docs,
  documentStatuses,
  isPro,
  onToggle,
}: {
  category: DocumentCategory;
  docs: DocumentItem[];
  documentStatuses: Record<string, DocumentStatus>;
  isPro: boolean;
  onToggle: (docId: string, status: DocumentStatus) => void;
}) {
  const cfg = CATEGORY_CONFIG[category];
  const Icon = cfg.icon;

  const haveCount = docs.filter((d) => documentStatuses[d.id] === "have").length;
  const naCount = docs.filter((d) => documentStatuses[d.id] === "na").length;
  const totalRelevant = docs.length - naCount;
  const pct = totalRelevant > 0 ? Math.round((haveCount / totalRelevant) * 100) : 0;

  return (
    <AccordionItem value={category} className="border border-card-border rounded-xl bg-card overflow-hidden">
      <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/20 [&[data-state=open]]:bg-muted/20">
        <div className="flex items-center gap-3 w-full">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
            <Icon className={`w-4 h-4 ${cfg.color}`} />
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-bold">{category}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{cfg.description}</p>
          </div>
          <div className="flex items-center gap-3 mr-2">
            <span className="text-xs font-semibold text-muted-foreground">
              {haveCount}/{totalRelevant || docs.length}
            </span>
            <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4">
        <div className="space-y-2 pt-1">
          {docs.map((doc) => (
            <DocumentRow
              key={doc.id}
              doc={doc}
              status={documentStatuses[doc.id]}
              isPro={isPro}
              onToggle={onToggle}
            />
          ))}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────

export default function DocumentsPage() {
  const { state, setDocumentStatus } = useTracker();
  const { state: appState } = useAppState();

  // For demo/testing: treat premium users as Pro
  const isPro = appState.user?.subscriptionTier === "premium" || appState.user?.subscriptionTier === "basic";

  // Determine which programs the user has tracked or is eligible for
  const trackedProgramIds = useMemo(
    () => new Set(Object.keys(state.trackedPrograms)),
    [state.trackedPrograms]
  );

  const eligibleProgramIds = useMemo(
    () => new Set(state.eligibleResults.filter((r) => r.status !== "unlikely").map((r) => r.program.id)),
    [state.eligibleResults]
  );

  // Relevant program IDs: tracked + eligible + their categories
  const relevantIds = useMemo(() => {
    if (trackedProgramIds.size > 0) return trackedProgramIds;
    if (eligibleProgramIds.size > 0) return eligibleProgramIds;
    // Fallback: show all docs
    return new Set(MASTER_DOCUMENTS.flatMap((d) => d.programs));
  }, [trackedProgramIds, eligibleProgramIds]);

  // Filter docs to relevant programs
  const relevantDocs = useMemo(() => {
    return MASTER_DOCUMENTS.filter((doc) =>
      doc.programs.some((p) => relevantIds.has(p))
    );
  }, [relevantIds]);

  // Group by category
  const byCategory = useMemo(() => {
    const groups: Partial<Record<DocumentCategory, DocumentItem[]>> = {};
    for (const doc of relevantDocs) {
      if (!groups[doc.category]) groups[doc.category] = [];
      groups[doc.category]!.push(doc);
    }
    return groups;
  }, [relevantDocs]);

  const categoryOrder: DocumentCategory[] = [
    "Identity",
    "Income",
    "Medical",
    "Housing",
    "Tax",
    "Education",
    "Other",
  ];

  // Completion stats
  const totalDocs = relevantDocs.length;
  const haveCount = relevantDocs.filter((d) => state.documentStatuses[d.id] === "have").length;
  const naCount = relevantDocs.filter((d) => state.documentStatuses[d.id] === "na").length;
  const relevantTotal = totalDocs - naCount;
  const completionPct = relevantTotal > 0 ? Math.round((haveCount / relevantTotal) * 100) : 0;

  const handleToggle = (docId: string, status: DocumentStatus) => {
    setDocumentStatus(docId, status);
  };

  const markAll = (status: DocumentStatus) => {
    for (const doc of relevantDocs) {
      setDocumentStatus(doc.id, status);
    }
  };

  // Collect open categories (default: open Identity and Income)
  const [openCategories, setOpenCategories] = useState<string[]>(["Identity", "Income"]);

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <FileText className="w-5 h-5 text-primary" />
          <p className="text-xs font-bold text-primary uppercase tracking-widest">Document Checklist</p>
        </div>
        <h1 className="text-2xl md:text-3xl font-black tracking-tight">
          Gather Your Documents
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Every document you'll need to apply for your eligible programs — all in one place.
        </p>
      </div>

      {/* Completion card */}
      <Card className="p-5 border border-card-border bg-card">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              <p className="text-base font-black">
                <span className="text-primary">{haveCount}</span>
                <span className="text-muted-foreground text-sm font-normal"> of {relevantTotal > 0 ? relevantTotal : totalDocs} documents ready</span>
              </p>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {completionPct === 100
                ? "All documents gathered! You're ready to apply."
                : completionPct >= 70
                ? "Almost there — just a few more documents needed."
                : completionPct >= 30
                ? "Good progress — keep gathering your documents."
                : "Start by checking off documents you already have."}
            </p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-3xl font-black text-primary">{completionPct}%</p>
            <p className="text-[10px] text-muted-foreground">complete</p>
          </div>
        </div>

        <Progress value={completionPct} className="h-2.5" />

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-3">
          {(Object.entries(DOC_STATUS_CONFIG) as [DocumentStatus, typeof DOC_STATUS_CONFIG[DocumentStatus]][]).map(
            ([status, cfg]) => {
              const count =
                status === "need"
                  ? relevantDocs.filter(
                      (d) => !state.documentStatuses[d.id] || state.documentStatuses[d.id] === "need"
                    ).length
                  : relevantDocs.filter((d) => state.documentStatuses[d.id] === status).length;
              const Icon = cfg.icon;
              return (
                <div key={status} className="flex items-center gap-1.5">
                  <Icon className={`w-3 h-3 ${cfg.color}`} />
                  <span className="text-xs text-muted-foreground">
                    <span className="font-bold text-foreground">{count}</span> {cfg.label}
                  </span>
                </div>
              );
            }
          )}
        </div>

        {/* Quick actions */}
        <div className="flex gap-2 mt-4">
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs border-card-border gap-1.5"
            onClick={() => markAll("have")}
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Mark all "Have"
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 text-xs gap-1.5 text-muted-foreground"
            onClick={() => markAll("need")}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            Reset all
          </Button>
        </div>
      </Card>

      {/* Pro upgrade banner for non-Pro users */}
      {!isPro && (
        <Card className="p-4 border border-primary/20 bg-primary/[0.03] flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex items-center gap-2 flex-shrink-0">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold">Unlock detailed document guidance</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Pro members see exactly where to get each document and what forms are acceptable. Saves hours of research.
            </p>
          </div>
          <Link href="/pricing">
            <Button size="sm" className="text-xs font-bold gap-1.5 whitespace-nowrap">
              Upgrade to Pro <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </Card>
      )}

      {/* Info card if no programs tracked */}
      {trackedProgramIds.size === 0 && eligibleProgramIds.size === 0 && (
        <Card className="p-4 border border-amber-400/20 bg-amber-400/[0.03] flex items-start gap-3">
          <Info className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs font-bold text-amber-400">Showing all documents</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Run the screener to see only the documents relevant to your eligible programs.{" "}
              <Link href="/screener">
                <span className="text-primary underline cursor-pointer">Run screener →</span>
              </Link>
            </p>
          </div>
        </Card>
      )}

      {/* Category sections */}
      <Accordion
        type="multiple"
        value={openCategories}
        onValueChange={setOpenCategories}
        className="space-y-3"
      >
        {categoryOrder.map((category) => {
          const docs = byCategory[category];
          if (!docs || docs.length === 0) return null;
          return (
            <CategorySection
              key={category}
              category={category}
              docs={docs}
              documentStatuses={state.documentStatuses}
              isPro={isPro}
              onToggle={handleToggle}
            />
          );
        })}
      </Accordion>

      {/* Tip section */}
      <Card className="p-4 border border-card-border">
        <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-2">Pro Tips</p>
        <ul className="space-y-2">
          {[
            "Make digital copies of all documents and store them in a secure cloud folder — you'll need them repeatedly.",
            "Many programs accept photos taken on your phone as long as they're clear and complete.",
            "If you're missing a birth certificate, contact your state's vital records office — many now offer same-day online ordering.",
            "SSA benefit verification letters can be generated instantly at ssa.gov/myaccount.",
          ].map((tip, i) => (
            <li key={i} className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground leading-relaxed">{tip}</p>
            </li>
          ))}
        </ul>
      </Card>

      {/* Next steps */}
      <Card className="p-4 border border-card-border flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold">Ready to apply?</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Track your applications and see step-by-step guides.
          </p>
        </div>
        <Link href="/tracker">
          <Button size="sm" variant="outline" className="border-card-border text-xs gap-1.5 whitespace-nowrap">
            View Tracker <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </Link>
      </Card>
    </div>
  );
}
