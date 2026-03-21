import { useMemo } from "react";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  FileText,
  CheckCircle2,
  Sparkles,
  ArrowLeft,
  ShoppingCart,
  Bot,
  ClipboardList,
  Footprints,
  AlertTriangle,
  Clock,
  Scale,
  FileCheck,
  ExternalLink,
} from "lucide-react";
import { programs } from "@/lib/programs";
import type { Program } from "@/lib/programs";

// Parse query params from hash-based URL: /#/apply-guide?program=snap
function useHashQueryParam(key: string): string | null {
  return useMemo(() => {
    const hash = window.location.hash; // e.g. "#/apply-guide?program=snap"
    const qIdx = hash.indexOf("?");
    if (qIdx === -1) return null;
    const params = new URLSearchParams(hash.slice(qIdx));
    return params.get(key);
  }, [key]);
}

function formatEstimate(min: number, max: number): string {
  if (min === max) return `$${min.toLocaleString()}`;
  return `$${min.toLocaleString()} – $${max.toLocaleString()}`;
}

// ─── Guide contents list ─────────────────────────────────────────────────────

const GUIDE_INCLUDES = [
  {
    icon: ClipboardList,
    title: "Document Checklist",
    desc: "Every document you need, organized by priority — so you don't waste a trip to the office.",
  },
  {
    icon: Footprints,
    title: "Step-by-Step Walkthrough",
    desc: "Plain-English instructions for each section of the application form.",
  },
  {
    icon: FileCheck,
    title: "Pre-Filled Form Tips",
    desc: "How to answer tricky questions, with examples of responses that get approved.",
  },
  {
    icon: AlertTriangle,
    title: "Common Mistakes to Avoid",
    desc: "The top reasons applications get denied — and how to avoid every one.",
  },
  {
    icon: Clock,
    title: "Processing Timeline",
    desc: "Expected wait times, what to do if you don't hear back, and how to check status.",
  },
  {
    icon: Scale,
    title: "Appeal Instructions",
    desc: "If you're denied, step-by-step instructions to file an appeal and win.",
  },
];

// ─── Popular guides (shown when no program param) ────────────────────────────

const POPULAR_GUIDES = [
  {
    id: "snap",
    name: "SNAP Application Guide",
    description:
      "Complete walkthrough for applying for food assistance (SNAP/food stamps) including required documents, interview prep, and expedited benefits.",
  },
  {
    id: "medicaid",
    name: "Medicaid Application Guide",
    description:
      "Step-by-step guide to applying for Medicaid, including income verification, citizenship documentation, and what to do if you're denied.",
  },
  {
    id: "ssdi",
    name: "SSDI Application Guide",
    description:
      "Navigate the Social Security Disability application process — medical evidence, work history forms, and the appeals process.",
  },
  {
    id: "section-8",
    name: "Section 8 Application Guide",
    description:
      "How to apply for Housing Choice Vouchers, waitlist tips, required documents, and what to expect during the process.",
  },
  {
    id: "eitc",
    name: "EITC Tax Credit Guide",
    description:
      "Claim the Earned Income Tax Credit — eligibility rules, filing requirements, how to amend past returns, and state EITC bonuses.",
  },
];

// ─── Program-specific guide page ─────────────────────────────────────────────

function ProgramGuide({ program }: { program: Program }) {
  const monthlyEst = program.estimatedMonthlyBenefit;
  const annualEst = program.estimatedAnnualBenefit;

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-6">
      {/* Back link */}
      <Link href="/screener">
        <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground cursor-pointer">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to results
        </button>
      </Link>

      {/* Program header */}
      <div>
        <div className="flex items-start gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <FileText className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <h1 className="text-lg font-bold">{program.name}</h1>
            <p className="text-sm text-muted-foreground">
              {program.description}
            </p>
          </div>
          <Badge variant="secondary" className="text-xs flex-shrink-0">
            {program.category}
          </Badge>
        </div>

        {(monthlyEst || annualEst) && (
          <Card className="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800 mt-3">
            <p className="text-sm">
              <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                Estimated value:{" "}
                {monthlyEst
                  ? `${formatEstimate(monthlyEst.min, monthlyEst.max)}/month`
                  : annualEst
                    ? `${formatEstimate(annualEst.min, annualEst.max)}/year`
                    : ""}
              </span>
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Your screening results suggest you may be eligible. This guide
              walks you through the actual application process.
            </p>
          </Card>
        )}
      </div>

      {/* Application Guide title */}
      <div>
        <h2 className="text-base font-bold mb-1">Application Guide</h2>
        <p className="text-sm text-muted-foreground">
          Everything you need to successfully apply for {program.name} — from
          documents to deadlines.
        </p>
      </div>

      {/* What's included */}
      <Card className="p-5 border border-card-border">
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          What's Included
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {GUIDE_INCLUDES.map((item, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <item.icon className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Pricing options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Self-Service */}
        <Card className="p-5 border border-card-border flex flex-col">
          <div className="flex items-center gap-2 mb-1">
            <FileText className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-bold">Self-Service Guide</h3>
          </div>
          <p className="text-2xl font-bold mb-3">
            $29<span className="text-sm font-normal text-muted-foreground"> one-time</span>
          </p>
          <ul className="space-y-1.5 text-sm mb-5 flex-1">
            {[
              "PDF application guide",
              "Document checklist",
              "Pre-filled form tips",
              "Common mistakes to avoid",
              "Processing timeline",
              "Appeal instructions",
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <Button className="w-full gap-2" data-testid="button-purchase-guide">
            <ShoppingCart className="w-4 h-4" />
            Purchase Guide — $29
          </Button>
        </Card>

        {/* AI-Assisted */}
        <Card className="p-5 border-2 border-primary relative overflow-hidden flex flex-col">
          <Badge className="absolute top-3 right-3 bg-primary text-primary-foreground text-[10px]">
            Best Value
          </Badge>
          <div className="flex items-center gap-2 mb-1">
            <Bot className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-bold">AI-Assisted Application</h3>
          </div>
          <p className="text-2xl font-bold mb-3">
            $49<span className="text-sm font-normal text-muted-foreground"> one-time</span>
          </p>
          <ul className="space-y-1.5 text-sm mb-5 flex-1">
            {[
              "Everything in Self-Service",
              "Unlimited AI assistant questions",
              "Program-specific guidance",
              "Help interpreting requirements",
              "Personalized document advice",
              "Appeal strategy assistance",
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <Button className="w-full gap-2" data-testid="button-purchase-ai-guide">
            <Sparkles className="w-4 h-4" />
            Purchase AI-Assisted — $49
          </Button>
        </Card>
      </div>

      {/* Official link */}
      {program.url && (
        <div className="text-center">
          <a
            href={program.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            Visit official program website <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}

      {/* Disclaimer */}
      <p className="text-[10px] text-muted-foreground text-center leading-relaxed">
        Application guides provide general guidance based on current program
        rules. They do not guarantee approval. Always verify requirements on the
        official program website before applying.
      </p>
    </div>
  );
}

// ─── Generic page (no program param / program not found) ─────────────────────

function PopularGuides() {
  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-6">
      <Link href="/screener">
        <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground cursor-pointer">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to screener
        </button>
      </Link>

      <div>
        <h1 className="text-xl font-bold">Application Guides</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Step-by-step guides to help you successfully apply for benefits. Each
          guide includes document checklists, form tips, and appeal
          instructions.
        </p>
      </div>

      {/* What's included overview */}
      <Card className="p-4 border border-card-border bg-primary/[0.02]">
        <h3 className="text-sm font-semibold mb-2">
          Every guide includes:
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {GUIDE_INCLUDES.map((item, i) => (
            <div key={i} className="flex items-center gap-1.5 text-xs">
              <item.icon className="w-3 h-3 text-primary flex-shrink-0" />
              <span>{item.title}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Popular guide cards */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Popular Guides
        </h2>
        {POPULAR_GUIDES.map((guide) => (
          <Card key={guide.id} className="p-4 border border-card-border">
            <div className="flex flex-col sm:flex-row sm:items-start gap-3">
              <div className="flex-1">
                <h3 className="text-sm font-bold mb-1">{guide.name}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {guide.description}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Link href={`/apply-guide?program=${guide.id}`}>
                  <Button
                    size="sm"
                    className="gap-1.5 h-8 text-xs"
                    data-testid={`button-guide-${guide.id}`}
                  >
                    <ShoppingCart className="w-3 h-3" />
                    Get Guide — $29
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Separator />

      {/* CTA to screener */}
      <Card className="p-5 text-center border-2 border-primary/20 bg-primary/[0.02]">
        <Sparkles className="w-5 h-5 text-primary mx-auto mb-2" />
        <h3 className="text-sm font-bold mb-1">
          Not sure which programs you qualify for?
        </h3>
        <p className="text-xs text-muted-foreground mb-3">
          Run a free screening to discover every federal and state benefit you
          may be eligible for — then get guides for the ones that matter.
        </p>
        <Link href="/screener">
          <Button className="gap-2">
            Start Free Screening
          </Button>
        </Link>
      </Card>

      <p className="text-[10px] text-muted-foreground text-center leading-relaxed">
        Application guides provide general guidance based on current program
        rules. They do not guarantee approval.
      </p>
    </div>
  );
}

// ─── Main export ─────────────────────────────────────────────────────────────

export default function ApplyGuidePage() {
  const programId = useHashQueryParam("program");

  const program = useMemo(() => {
    if (!programId) return null;
    return programs.find((p) => p.id === programId) || null;
  }, [programId]);

  if (!program) {
    return <PopularGuides />;
  }

  return <ProgramGuide program={program} />;
}
