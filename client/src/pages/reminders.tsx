import { useState, useMemo } from "react";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Bell,
  BellOff,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Info,
  ChevronRight,
  ArrowRight,
  Utensils,
  Heart,
  Home,
  DollarSign,
  Zap,
  GraduationCap,
  Shield,
  RefreshCcw,
  ExternalLink,
  Sparkles,
  Timer,
} from "lucide-react";
import {
  computeDeadlines,
  RENEWAL_INFO_CARDS,
  type ComputedDeadline,
  type DeadlineUrgency,
} from "@/lib/deadlines";
import { useTracker } from "@/lib/tracker-state";
import { useToast } from "@/hooks/use-toast";

// ── Category icons ─────────────────────────────────────────────────────────

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  "Food Assistance": Utensils,
  "Healthcare": Heart,
  "Retirement & Disability": Shield,
  "Housing": Home,
  "Tax Credits": DollarSign,
  "Utilities": Zap,
  "Education": GraduationCap,
  "Cash Assistance": DollarSign,
};

// ── Urgency config ─────────────────────────────────────────────────────────

const URGENCY_CONFIG: Record<DeadlineUrgency, {
  label: string;
  color: string;
  bg: string;
  border: string;
  icon: React.ElementType;
}> = {
  critical: {
    label: "< 7 days",
    color: "text-red-400",
    bg: "bg-red-400/10",
    border: "border-red-400/30",
    icon: AlertTriangle,
  },
  urgent: {
    label: "< 30 days",
    color: "text-amber-400",
    bg: "bg-amber-400/10",
    border: "border-amber-400/30",
    icon: Clock,
  },
  upcoming: {
    label: "< 90 days",
    color: "text-blue-400",
    bg: "bg-blue-400/10",
    border: "border-blue-400/30",
    icon: Calendar,
  },
  future: {
    label: "Later",
    color: "text-muted-foreground",
    bg: "bg-muted/30",
    border: "border-card-border",
    icon: Timer,
  },
};

// ── Deadline card ──────────────────────────────────────────────────────────

function DeadlineCard({
  deadline,
  emailEnabled,
  onToggleEmail,
}: {
  deadline: ComputedDeadline;
  emailEnabled: boolean;
  onToggleEmail: (programId: string) => void;
}) {
  const urgCfg = URGENCY_CONFIG[deadline.urgency];
  const UrgIcon = urgCfg.icon;
  const CatIcon = CATEGORY_ICONS[deadline.category] || Calendar;
  const [expanded, setExpanded] = useState(false);

  const daysText =
    deadline.daysUntil === null
      ? null
      : deadline.daysUntil === 0
      ? "Today"
      : deadline.daysUntil === 1
      ? "Tomorrow"
      : deadline.daysUntil < 0
      ? "Passed"
      : `${deadline.daysUntil} days`;

  return (
    <Card
      className={`
        border transition-all
        ${deadline.urgency === "critical"
          ? "border-red-400/40 bg-red-400/[0.02] shadow-[0_0_12px_rgba(239,68,68,0.08)]"
          : deadline.urgency === "urgent"
          ? "border-amber-400/30 bg-amber-400/[0.02]"
          : "border-card-border bg-card"}
      `}
    >
      <div className="p-4">
        {/* Header row */}
        <div className="flex items-start gap-3">
          {/* Category icon */}
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${urgCfg.bg}`}>
            <CatIcon className={`w-4.5 h-4.5 ${urgCfg.color}`} />
          </div>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-bold leading-tight truncate">{deadline.title}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{deadline.programName}</p>
              </div>

              {/* Days remaining pill */}
              {daysText && deadline.daysUntil !== null && (
                <div
                  className={`
                    flex items-center gap-1 px-2.5 py-1 rounded-full border flex-shrink-0
                    ${urgCfg.bg} ${urgCfg.border}
                  `}
                >
                  <UrgIcon className={`w-3 h-3 ${urgCfg.color}`} />
                  <span className={`text-xs font-bold ${urgCfg.color}`}>{daysText}</span>
                </div>
              )}
            </div>

            {/* Date display */}
            <p className={`text-xs font-semibold mt-1.5 ${urgCfg.color}`}>
              {deadline.displayDate}
            </p>

            {/* Urgency badge */}
            <div className="flex items-center gap-2 mt-2">
              <Badge
                variant="secondary"
                className={`text-[9px] h-4 px-1.5 ${urgCfg.bg} ${urgCfg.color} border-0`}
              >
                {urgCfg.label}
              </Badge>
              <Badge variant="secondary" className="text-[9px] h-4 px-1.5">
                {deadline.category}
              </Badge>
              {deadline.type === "recurring" && (
                <Badge variant="secondary" className="text-[9px] h-4 px-1.5">
                  <RefreshCcw className="w-2 h-2 mr-0.5" />
                  Recurring
                </Badge>
              )}
              {deadline.isWindowOpen && (
                <Badge className="text-[9px] h-4 px-1.5 bg-primary/10 text-primary border-0">
                  Window Open Now
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-muted-foreground mt-3 leading-relaxed line-clamp-2">
          {deadline.description}
        </p>

        {/* Expanded details */}
        {expanded && (
          <div className="mt-3 space-y-2">
            <div className="p-2.5 rounded-md bg-muted/30 border border-card-border/50">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-1">
                Action Required
              </p>
              <p className="text-xs leading-relaxed">{deadline.actionRequired}</p>
            </div>
            <div className="p-2.5 rounded-md bg-muted/30 border border-card-border/50">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-1">
                Renewal Info
              </p>
              <p className="text-xs leading-relaxed">{deadline.renewalInfo}</p>
            </div>
            {deadline.notes && (
              <div className="p-2.5 rounded-md bg-muted/30 border border-card-border/50">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-1">
                  Notes
                </p>
                <p className="text-xs leading-relaxed">{deadline.notes}</p>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 mt-3">
          <Button
            size="sm"
            variant="ghost"
            className="h-7 text-xs text-muted-foreground px-2 gap-1"
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded ? "Show less" : "More details"}
            <ChevronRight className={`w-3 h-3 transition-transform ${expanded ? "rotate-90" : ""}`} />
          </Button>

          <a
            href={deadline.officialUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto"
          >
            <Button size="sm" variant="outline" className="h-7 text-xs border-card-border gap-1">
              Official site
              <ExternalLink className="w-2.5 h-2.5" />
            </Button>
          </a>
        </div>
      </div>

      {/* Email reminder toggle */}
      <div className="px-4 pb-3">
        <div className="flex items-center gap-2 pt-2 border-t border-card-border/50">
          <Bell className="w-3 h-3 text-muted-foreground" />
          <span className="text-xs text-muted-foreground flex-1">Email reminder</span>
          <Switch
            checked={emailEnabled}
            onCheckedChange={() => onToggleEmail(deadline.programId)}
            className="scale-75"
          />
        </div>
      </div>
    </Card>
  );
}

// ── Renewal Info Card ──────────────────────────────────────────────────────

function RenewalCard({ card }: { card: (typeof RENEWAL_INFO_CARDS)[number] }) {
  const CatIcon = CATEGORY_ICONS[card.programName] || RefreshCcw;

  return (
    <div className="p-4 rounded-xl border border-card-border bg-card space-y-3">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <CatIcon className="w-4 h-4 text-primary" />
        </div>
        <div>
          <p className="text-sm font-bold">{card.programName}</p>
          <p className="text-[10px] text-muted-foreground">{card.renewalFrequency}</p>
        </div>
      </div>

      <ul className="space-y-1.5">
        {card.keyFacts.map((fact, i) => (
          <li key={i} className="flex items-start gap-2">
            <CheckCircle2 className="w-3 h-3 text-primary flex-shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">{fact}</p>
          </li>
        ))}
      </ul>

      <div className="p-2.5 rounded-md bg-primary/5 border border-primary/15">
        <div className="flex items-start gap-2">
          <Sparkles className="w-3 h-3 text-primary flex-shrink-0 mt-0.5" />
          <p className="text-xs text-foreground leading-relaxed">{card.tipText}</p>
        </div>
      </div>
    </div>
  );
}

// ── Timeline month group ───────────────────────────────────────────────────

function TimelineGroup({
  label,
  deadlines,
  reminderPrefs,
  onToggleEmail,
}: {
  label: string;
  deadlines: ComputedDeadline[];
  reminderPrefs: Record<string, boolean>;
  onToggleEmail: (programId: string) => void;
}) {
  if (deadlines.length === 0) return null;

  return (
    <div>
      <div className="flex items-center gap-3 mb-3">
        <div className="h-px flex-1 bg-card-border" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-2">
          {label}
        </span>
        <div className="h-px flex-1 bg-card-border" />
      </div>
      <div className="space-y-3">
        {deadlines.map((d) => (
          <DeadlineCard
            key={d.id}
            deadline={d}
            emailEnabled={!!reminderPrefs[d.programId]}
            onToggleEmail={onToggleEmail}
          />
        ))}
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────

export default function RemindersPage() {
  const { state, dispatch } = useTracker();
  const { toast } = useToast();

  const allDeadlines = useMemo(() => computeDeadlines(), []);

  // Local email prefs (UI only)
  const [emailPrefs, setEmailPrefs] = useState<Record<string, boolean>>({});
  const [globalEmailEnabled, setGlobalEmailEnabled] = useState(false);

  const handleToggleEmail = (programId: string) => {
    if (!globalEmailEnabled) {
      // Show "coming soon" toast
      toast({
        title: "Email reminders coming soon",
        description: "We're building this feature. You'll be notified when it's ready.",
        duration: 3000,
      });
      return;
    }
    setEmailPrefs((prev) => ({ ...prev, [programId]: !prev[programId] }));
  };

  const handleGlobalEmailToggle = () => {
    if (!globalEmailEnabled) {
      toast({
        title: "Email reminders — coming soon!",
        description: "We're building email notifications. Stay tuned — we'll let you know when it launches.",
        duration: 4000,
      });
    }
    setGlobalEmailEnabled((v) => !v);
  };

  // Group deadlines by urgency tier
  const critical = allDeadlines.filter((d) => d.urgency === "critical");
  const urgent = allDeadlines.filter((d) => d.urgency === "urgent");
  const upcoming = allDeadlines.filter((d) => d.urgency === "upcoming");
  const future = allDeadlines.filter((d) => d.urgency === "future");

  const totalEnabled = Object.values(emailPrefs).filter(Boolean).length;

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Bell className="w-5 h-5 text-primary" />
          <p className="text-xs font-bold text-primary uppercase tracking-widest">Reminders</p>
        </div>
        <h1 className="text-2xl md:text-3xl font-black tracking-tight">
          Deadlines & Renewals
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Key dates for your benefit programs — never miss a deadline or renewal.
        </p>
      </div>

      {/* Global email toggle */}
      <Card className="p-4 border border-card-border bg-card">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${globalEmailEnabled ? "bg-primary/10" : "bg-muted/30"}`}>
            {globalEmailEnabled ? (
              <Bell className="w-5 h-5 text-primary" />
            ) : (
              <BellOff className="w-5 h-5 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold">Email Reminders</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {globalEmailEnabled
                ? `${totalEnabled} reminder${totalEnabled !== 1 ? "s" : ""} enabled`
                : "Get notified before deadlines — coming soon"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {globalEmailEnabled && (
              <Badge className="text-[9px] h-4 px-1.5 bg-amber-400/10 text-amber-400 border-0">
                Coming Soon
              </Badge>
            )}
            <Switch
              checked={globalEmailEnabled}
              onCheckedChange={handleGlobalEmailToggle}
            />
          </div>
        </div>
      </Card>

      {/* Summary stats */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: "Critical", count: critical.length, color: "text-red-400", bg: "bg-red-400/10" },
          { label: "Urgent", count: urgent.length, color: "text-amber-400", bg: "bg-amber-400/10" },
          { label: "Upcoming", count: upcoming.length, color: "text-blue-400", bg: "bg-blue-400/10" },
          { label: "Future", count: future.length, color: "text-muted-foreground", bg: "bg-muted/30" },
        ].map((tier) => (
          <Card key={tier.label} className="p-3 border border-card-border text-center">
            <div className={`w-8 h-8 rounded-lg mx-auto flex items-center justify-center mb-1.5 ${tier.bg}`}>
              <span className={`text-base font-black ${tier.color}`}>{tier.count}</span>
            </div>
            <p className="text-[10px] text-muted-foreground font-medium">{tier.label}</p>
          </Card>
        ))}
      </div>

      {/* Urgency legend */}
      <Card className="p-3 border border-card-border bg-card">
        <div className="flex flex-wrap gap-4 items-center">
          <span className="text-xs font-bold text-muted-foreground">Urgency key:</span>
          {(Object.entries(URGENCY_CONFIG) as [DeadlineUrgency, typeof URGENCY_CONFIG[DeadlineUrgency]][]).map(
            ([urgency, cfg]) => {
              const Icon = cfg.icon;
              return (
                <div key={urgency} className="flex items-center gap-1.5">
                  <Icon className={`w-3 h-3 ${cfg.color}`} />
                  <span className={`text-xs font-semibold ${cfg.color}`}>{cfg.label}</span>
                </div>
              );
            }
          )}
        </div>
      </Card>

      {/* Timeline */}
      <div className="space-y-6">
        <TimelineGroup
          label="Action needed now"
          deadlines={critical}
          reminderPrefs={emailPrefs}
          onToggleEmail={handleToggleEmail}
        />
        <TimelineGroup
          label="Coming up soon"
          deadlines={urgent}
          reminderPrefs={emailPrefs}
          onToggleEmail={handleToggleEmail}
        />
        <TimelineGroup
          label="Next 90 days"
          deadlines={upcoming}
          reminderPrefs={emailPrefs}
          onToggleEmail={handleToggleEmail}
        />
        <TimelineGroup
          label="Future"
          deadlines={future}
          reminderPrefs={emailPrefs}
          onToggleEmail={handleToggleEmail}
        />
      </div>

      {/* Renewal info cards */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <RefreshCcw className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-black uppercase tracking-wide">Program Renewal Guides</h2>
        </div>
        <Accordion type="multiple" className="space-y-2">
          {RENEWAL_INFO_CARDS.map((card) => (
            <AccordionItem
              key={card.programId}
              value={card.programId}
              className="border border-card-border rounded-xl bg-card overflow-hidden"
            >
              <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/20">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    {(() => {
                      const Icon = CATEGORY_ICONS[card.programName] || RefreshCcw;
                      return <Icon className="w-3.5 h-3.5 text-primary" />;
                    })()}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold">{card.programName} Renewal</p>
                    <p className="text-[10px] text-muted-foreground">{card.renewalFrequency}</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="pt-2">
                  <RenewalCard card={card} />
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      {/* CTA */}
      <Card className="p-4 border border-card-border flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1">
          <p className="text-xs font-bold">Track your benefit applications</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            See where you are in the process for each program — from gathering docs to receiving benefits.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/tracker">
            <Button size="sm" variant="outline" className="border-card-border text-xs gap-1.5 whitespace-nowrap">
              View Tracker <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
          <Link href="/documents">
            <Button size="sm" variant="outline" className="border-card-border text-xs gap-1.5 whitespace-nowrap">
              Documents <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
