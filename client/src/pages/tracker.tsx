import { useState, useMemo } from "react";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  CheckCircle2,
  Clock,
  FileText,
  Send,
  Loader2,
  Star,
  TrendingUp,
  DollarSign,
  Filter,
  SortAsc,
  Plus,
  ChevronRight,
  Utensils,
  Heart,
  Home,
  Briefcase,
  Medal,
  Wallet,
  Zap,
  GraduationCap,
  Shield,
  ArrowRight,
  RefreshCcw,
  NotebookPen,
  BarChart3,
} from "lucide-react";
import { useTracker, getTrackerStats, APPLICATION_STATUS_LABELS, APPLICATION_STATUS_ORDER, getStatusStep, type ApplicationStatus, type TrackedProgram } from "@/lib/tracker-state";

// ── Category icon map ──────────────────────────────────────────────────────

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  "Food Assistance": Utensils,
  "Healthcare": Heart,
  "Retirement & Disability": Shield,
  "Employment": Briefcase,
  "Housing": Home,
  "Tax Credits": DollarSign,
  "Veterans": Medal,
  "Cash Assistance": Wallet,
  "Utilities": Zap,
  "Education": GraduationCap,
  "Telecommunications": Zap,
  "Childcare": Heart,
};

const CATEGORY_COLORS: Record<string, string> = {
  "Food Assistance": "text-amber-400 bg-amber-400/10",
  "Healthcare": "text-red-400 bg-red-400/10",
  "Retirement & Disability": "text-blue-400 bg-blue-400/10",
  "Employment": "text-indigo-400 bg-indigo-400/10",
  "Housing": "text-sky-400 bg-sky-400/10",
  "Tax Credits": "text-green-400 bg-green-400/10",
  "Veterans": "text-orange-400 bg-orange-400/10",
  "Cash Assistance": "text-emerald-400 bg-emerald-400/10",
  "Utilities": "text-yellow-400 bg-yellow-400/10",
  "Education": "text-violet-400 bg-violet-400/10",
};

// ── Status config ──────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<ApplicationStatus, {
  label: string;
  color: string;
  bg: string;
  icon: React.ElementType;
}> = {
  not_started: { label: "Not Started", color: "text-muted-foreground", bg: "bg-muted/40", icon: Clock },
  gathering_docs: { label: "Gathering Docs", color: "text-amber-400", bg: "bg-amber-400/10", icon: FileText },
  applied: { label: "Applied", color: "text-blue-400", bg: "bg-blue-400/10", icon: Send },
  pending: { label: "Pending Review", color: "text-violet-400", bg: "bg-violet-400/10", icon: Loader2 },
  approved: { label: "Approved", color: "text-primary", bg: "bg-primary/10", icon: CheckCircle2 },
  receiving: { label: "Receiving Benefits", color: "text-primary", bg: "bg-primary/10", icon: Star },
};

// ── Demo programs for empty state ─────────────────────────────────────────

const DEMO_ELIGIBLE = [
  { id: "snap", name: "SNAP (Food Stamps)", category: "Food Assistance", monthlyValue: 157 },
  { id: "medicaid-adult", name: "Medicaid (Adults)", category: "Healthcare", monthlyValue: 650 },
  { id: "eitc", name: "Earned Income Tax Credit", category: "Tax Credits", monthlyValue: 351 },
  { id: "liheap", name: "LIHEAP (Energy Assistance)", category: "Utilities", monthlyValue: 50 },
];

// ── Progress Steps component ───────────────────────────────────────────────

function StatusSteps({ currentStatus }: { currentStatus: ApplicationStatus }) {
  const currentStep = getStatusStep(currentStatus);

  return (
    <div className="flex items-center gap-0.5 mt-3">
      {APPLICATION_STATUS_ORDER.map((status, idx) => {
        const isCompleted = idx < currentStep;
        const isCurrent = idx === currentStep;

        return (
          <div key={status} className="flex items-center flex-1">
            <div className="relative flex flex-col items-center w-full">
              {/* Step dot */}
              <div
                className={`
                  w-2.5 h-2.5 rounded-full border-2 transition-colors
                  ${isCompleted ? "bg-primary border-primary" : ""}
                  ${isCurrent ? "bg-primary/30 border-primary shadow-[0_0_6px_rgba(0,230,118,0.6)]" : ""}
                  ${!isCompleted && !isCurrent ? "bg-transparent border-muted-foreground/30" : ""}
                `}
              />
              {/* Step line (except last) */}
              {idx < APPLICATION_STATUS_ORDER.length - 1 && (
                <div className="absolute top-[4.5px] left-[10px] right-[-10px] h-0.5 -z-0">
                  <div className="h-full w-full bg-muted-foreground/20 rounded-full">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-500"
                      style={{ width: isCompleted ? "100%" : "0%" }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Update Status Dialog ───────────────────────────────────────────────────

interface UpdateDialogProps {
  program: TrackedProgram;
  open: boolean;
  onClose: () => void;
  onSave: (status: ApplicationStatus, notes: string) => void;
}

function UpdateStatusDialog({ program, open, onClose, onSave }: UpdateDialogProps) {
  const [selectedStatus, setSelectedStatus] = useState<ApplicationStatus>(program.status);
  const [notes, setNotes] = useState(program.notes);

  const handleSave = () => {
    onSave(selectedStatus, notes);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-card border-card-border">
        <DialogHeader>
          <DialogTitle className="text-base font-bold">{program.programName}</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Update your application status and add notes
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Status selector */}
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 block">
              Current Status
            </label>
            <div className="grid grid-cols-2 gap-2">
              {APPLICATION_STATUS_ORDER.map((status) => {
                const cfg = STATUS_CONFIG[status];
                const Icon = cfg.icon;
                const isSelected = selectedStatus === status;
                return (
                  <button
                    key={status}
                    onClick={() => setSelectedStatus(status)}
                    className={`
                      flex items-center gap-2 p-2.5 rounded-lg border text-left text-xs font-medium transition-colors
                      ${isSelected
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-card-border bg-card hover:border-primary/30 text-muted-foreground hover:text-foreground"}
                    `}
                  >
                    <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${isSelected ? "text-primary" : ""}`} />
                    {cfg.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 block">
              Notes (optional)
            </label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Applied online Jan 15, interview scheduled for Feb 3..."
              className="text-sm resize-none h-20 bg-background border-card-border"
            />
          </div>

          <div className="flex gap-2 pt-1">
            <Button variant="outline" onClick={onClose} className="flex-1 h-9 text-xs border-card-border">
              Cancel
            </Button>
            <Button onClick={handleSave} className="flex-1 h-9 text-xs font-bold">
              Save Status
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Program Card ───────────────────────────────────────────────────────────

interface ProgramCardProps {
  program: TrackedProgram;
  onUpdateStatus: (program: TrackedProgram) => void;
  onUntrack: (programId: string) => void;
}

function ProgramCard({ program, onUpdateStatus, onUntrack }: ProgramCardProps) {
  const cfg = STATUS_CONFIG[program.status];
  const StatusIcon = cfg.icon;
  const CatIcon = CATEGORY_ICONS[program.category] || Wallet;
  const catColors = CATEGORY_COLORS[program.category] || "text-muted-foreground bg-muted/30";

  const lastUpdated = new Date(program.updatedAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  return (
    <Card className="p-4 border border-card-border bg-card group hover:border-primary/20 transition-colors">
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${catColors}`}>
            <CatIcon className="w-4.5 h-4.5" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold leading-tight truncate pr-2">{program.programName}</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className="text-[10px] px-1.5 h-4">
                {program.category}
              </Badge>
              <span className="text-[10px] text-muted-foreground">Updated {lastUpdated}</span>
            </div>
          </div>
        </div>

        {/* Monthly value */}
        {program.estimatedMonthlyValue > 0 && (
          <div className="text-right flex-shrink-0">
            <p className="text-base font-black text-primary">
              ${program.estimatedMonthlyValue.toLocaleString()}
            </p>
            <p className="text-[10px] text-muted-foreground">/month est.</p>
          </div>
        )}
      </div>

      {/* Status badge */}
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full mt-3 ${cfg.bg}`}>
        <StatusIcon className={`w-3 h-3 ${cfg.color}`} />
        <span className={`text-xs font-semibold ${cfg.color}`}>{cfg.label}</span>
      </div>

      {/* Progress steps */}
      <StatusSteps currentStatus={program.status} />

      {/* Step labels (abbreviated) */}
      <div className="flex justify-between mt-1 px-0.5">
        {APPLICATION_STATUS_ORDER.map((s, idx) => (
          <span
            key={s}
            className={`text-[8px] font-medium text-center leading-tight ${
              s === program.status ? "text-primary" : "text-muted-foreground/50"
            }`}
            style={{ width: `${100 / APPLICATION_STATUS_ORDER.length}%` }}
          >
            {idx === 0 ? "Start" : idx === APPLICATION_STATUS_ORDER.length - 1 ? "Active" : ""}
          </span>
        ))}
      </div>

      {/* Notes */}
      {program.notes && (
        <div className="mt-3 p-2 rounded-md bg-muted/30 border border-card-border/50">
          <p className="text-[11px] text-muted-foreground leading-relaxed">{program.notes}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 mt-3">
        <Button
          size="sm"
          onClick={() => onUpdateStatus(program)}
          className="h-8 text-xs font-semibold flex-1 gap-1.5"
        >
          <NotebookPen className="w-3 h-3" />
          Update Status
        </Button>
        <Link href="/apply-guide">
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs border-card-border gap-1"
          >
            <FileText className="w-3 h-3" />
            Guide
          </Button>
        </Link>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onUntrack(program.programId)}
          className="h-8 text-xs text-muted-foreground hover:text-destructive px-2"
        >
          Remove
        </Button>
      </div>
    </Card>
  );
}

// ── Main Tracker Page ──────────────────────────────────────────────────────

export default function TrackerPage() {
  const { state, trackProgram, updateStatus, untrackProgram } = useTracker();
  const [filterStatus, setFilterStatus] = useState<ApplicationStatus | "all">("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"updated" | "value" | "status">("updated");
  const [updateTarget, setUpdateTarget] = useState<TrackedProgram | null>(null);

  const programs = Object.values(state.trackedPrograms);
  const stats = getTrackerStats(state.trackedPrograms);

  // All unique categories among tracked programs
  const categories = useMemo(() => {
    const cats = new Set(programs.map((p) => p.category));
    return Array.from(cats).sort();
  }, [programs]);

  // Filtered + sorted programs
  const displayed = useMemo(() => {
    let list = [...programs];

    if (filterStatus !== "all") {
      list = list.filter((p) => p.status === filterStatus);
    }
    if (filterCategory !== "all") {
      list = list.filter((p) => p.category === filterCategory);
    }

    list.sort((a, b) => {
      if (sortBy === "updated") return b.updatedAt - a.updatedAt;
      if (sortBy === "value") return b.estimatedMonthlyValue - a.estimatedMonthlyValue;
      if (sortBy === "status") {
        return APPLICATION_STATUS_ORDER.indexOf(b.status) - APPLICATION_STATUS_ORDER.indexOf(a.status);
      }
      return 0;
    });

    return list;
  }, [programs, filterStatus, filterCategory, sortBy]);

  // Add a demo program (for empty state)
  const addDemoProgram = (demo: (typeof DEMO_ELIGIBLE)[number]) => {
    if (state.trackedPrograms[demo.id]) return;
    trackProgram({
      program: {
        id: demo.id,
        name: demo.name,
        level: "federal",
        category: demo.category,
        description: "",
        targetPopulation: "",
        rules: {},
        url: "",
        estimatedMonthlyBenefit: { min: demo.monthlyValue - 50, max: demo.monthlyValue + 50, description: "" },
      },
      status: "likely",
      explanation: "",
    });
  };

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6">
      {/* Page header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <BarChart3 className="w-5 h-5 text-primary" />
          <p className="text-xs font-bold text-primary uppercase tracking-widest">Benefits Tracker</p>
        </div>
        <h1 className="text-2xl md:text-3xl font-black tracking-tight">
          Application Progress
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Track every benefit from start to approval. Never miss a step.
        </p>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-4 border border-card-border bg-card">
          <p className="text-2xl font-black">{stats.total}</p>
          <p className="text-xs text-muted-foreground mt-0.5">programs tracked</p>
        </Card>
        <Card className="p-4 border border-card-border bg-card">
          <p className="text-2xl font-black text-violet-400">{stats.pending}</p>
          <p className="text-xs text-muted-foreground mt-0.5">applications pending</p>
        </Card>
        <Card className="p-4 border border-card-border bg-card">
          <p className="text-2xl font-black text-primary">{stats.approved}</p>
          <p className="text-xs text-muted-foreground mt-0.5">approved</p>
        </Card>
        <Card className="p-4 border border-primary/20 bg-primary/[0.03]">
          <p className="text-2xl font-black text-primary">
            ${stats.estimatedMonthly.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">est. monthly value</p>
        </Card>
      </div>

      {/* Filter/Sort bar */}
      {programs.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Filter className="w-3.5 h-3.5" />
            <span className="font-medium">Filter:</span>
          </div>

          <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as ApplicationStatus | "all")}>
            <SelectTrigger className="h-8 text-xs w-40 border-card-border bg-card">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {APPLICATION_STATUS_ORDER.map((s) => (
                <SelectItem key={s} value={s}>{APPLICATION_STATUS_LABELS[s]}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {categories.length > 1 && (
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="h-8 text-xs w-40 border-card-border bg-card">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <div className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground">
            <SortAsc className="w-3.5 h-3.5" />
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
              <SelectTrigger className="h-8 text-xs w-36 border-card-border bg-card">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="updated">Recently updated</SelectItem>
                <SelectItem value="value">Highest value</SelectItem>
                <SelectItem value="status">By stage</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Program cards */}
      {displayed.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayed.map((program) => (
            <ProgramCard
              key={program.programId}
              program={program}
              onUpdateStatus={setUpdateTarget}
              onUntrack={untrackProgram}
            />
          ))}
        </div>
      ) : programs.length > 0 ? (
        // Has programs but filter hides them
        <Card className="p-8 border border-card-border text-center">
          <RefreshCcw className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm font-semibold">No programs match your filters</p>
          <Button
            variant="ghost"
            size="sm"
            className="mt-2 text-xs"
            onClick={() => { setFilterStatus("all"); setFilterCategory("all"); }}
          >
            Clear filters
          </Button>
        </Card>
      ) : (
        // Empty state
        <div className="space-y-4">
          <Card className="p-6 border border-primary/20 bg-primary/[0.03]">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex-1">
                <p className="text-sm font-bold mb-1">Run a screening to track your programs</p>
                <p className="text-xs text-muted-foreground">
                  Complete the benefits screener to discover which programs you're likely eligible for. We'll help you track your progress applying for each one.
                </p>
              </div>
              <Link href="/screener">
                <Button size="sm" className="gap-2 font-bold text-xs whitespace-nowrap">
                  Start Screener <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </Card>

          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-3">
              Or add common programs to try the tracker:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {DEMO_ELIGIBLE.map((demo) => {
                const CatIcon = CATEGORY_ICONS[demo.category] || Wallet;
                const catColors = CATEGORY_COLORS[demo.category] || "text-muted-foreground bg-muted/30";
                const isAdded = !!state.trackedPrograms[demo.id];
                return (
                  <Card
                    key={demo.id}
                    className={`p-4 border ${isAdded ? "border-primary/30 bg-primary/[0.03]" : "border-card-border"} flex items-center justify-between gap-3`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${catColors}`}>
                        <CatIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold leading-tight">{demo.name}</p>
                        <p className="text-[10px] text-primary font-bold">${demo.monthlyValue}/mo est.</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant={isAdded ? "secondary" : "outline"}
                      className="h-7 text-[11px] border-card-border"
                      onClick={() => addDemoProgram(demo)}
                      disabled={isAdded}
                    >
                      {isAdded ? (
                        <><CheckCircle2 className="w-3 h-3 text-primary mr-1" />Added</>
                      ) : (
                        <><Plus className="w-3 h-3 mr-1" />Track</>
                      )}
                    </Button>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* CTA to screener if they have some programs but haven't done screener */}
      {programs.length > 0 && (
        <Card className="p-4 border border-card-border flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold">Find more programs you qualify for</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Run or re-run the screener to discover additional benefits.
            </p>
          </div>
          <Link href="/screener">
            <Button size="sm" variant="outline" className="border-card-border text-xs gap-1.5 whitespace-nowrap">
              <TrendingUp className="w-3.5 h-3.5" />
              Run Screener
            </Button>
          </Link>
        </Card>
      )}

      {/* Update dialog */}
      {updateTarget && (
        <UpdateStatusDialog
          program={updateTarget}
          open={!!updateTarget}
          onClose={() => setUpdateTarget(null)}
          onSave={(status, notes) => {
            updateStatus(updateTarget.programId, status, notes);
            setUpdateTarget(null);
          }}
        />
      )}
    </div>
  );
}
