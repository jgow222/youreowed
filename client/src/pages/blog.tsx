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
  MapPin,
  ArrowRight,
  BookOpen,
  Sparkles,
  Heart,
  Utensils,
  Home,
  DollarSign,
  Shield,
  Briefcase,
  Baby,
  Zap,
  GraduationCap,
} from "lucide-react";
import { US_STATES } from "@/lib/states";
import { programs } from "@/lib/programs";
import type { Program } from "@/lib/programs";

// ─── Category icon mapping ───────────────────────────────────────────────────

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  "Food Assistance": <Utensils className="w-3 h-3" />,
  Healthcare: <Heart className="w-3 h-3" />,
  "Retirement & Disability": <Shield className="w-3 h-3" />,
  Employment: <Briefcase className="w-3 h-3" />,
  Housing: <Home className="w-3 h-3" />,
  "Tax Credits": <DollarSign className="w-3 h-3" />,
  Veterans: <Shield className="w-3 h-3" />,
  "Cash Assistance": <DollarSign className="w-3 h-3" />,
  Utilities: <Zap className="w-3 h-3" />,
  Education: <GraduationCap className="w-3 h-3" />,
  Telecommunications: <Zap className="w-3 h-3" />,
  Childcare: <Baby className="w-3 h-3" />,
  "Prescription Drugs": <Heart className="w-3 h-3" />,
};

function formatEstimate(min: number, max: number): string {
  if (min === max) return `$${min.toLocaleString()}`;
  return `$${min.toLocaleString()} – $${max.toLocaleString()}`;
}

function getEstimateLabel(program: Program): string | null {
  const m = program.estimatedMonthlyBenefit;
  const a = program.estimatedAnnualBenefit;
  if (m) return `${formatEstimate(m.min, m.max)}/mo`;
  if (a) return `${formatEstimate(a.min, a.max)}/yr`;
  return null;
}

// ─── Article data ────────────────────────────────────────────────────────────

const ARTICLES = [
  {
    title: "How to Apply for SNAP Benefits: Complete Guide",
    description:
      "Learn the step-by-step process for applying for food assistance, including required documents, income limits, and how to get expedited benefits.",
    category: "Food Assistance",
  },
  {
    title: "Medicaid vs Medicare: What's the Difference?",
    description:
      "Understand the key differences between Medicaid and Medicare — who qualifies, what's covered, and how to apply for each program.",
    category: "Healthcare",
  },
  {
    title: "Earned Income Tax Credit: Are You Missing Free Money?",
    description:
      "The EITC puts thousands of dollars back in working families' pockets. Find out if you qualify and how to claim it on your tax return.",
    category: "Tax Credits",
  },
  {
    title: "Section 8 Housing Voucher: How to Apply and What to Expect",
    description:
      "Navigate the Housing Choice Voucher waitlist, application process, and what to know about inspections and landlord requirements.",
    category: "Housing",
  },
  {
    title: "Social Security Disability (SSDI): Application Timeline and Tips",
    description:
      "The SSDI process can take months. Learn how to strengthen your application, gather medical evidence, and navigate the appeals process.",
    category: "Retirement & Disability",
  },
  {
    title: "WIC Benefits: Who Qualifies and How to Apply",
    description:
      "WIC provides nutrition assistance for pregnant women, new mothers, and young children. Here's how income limits work and what benefits you receive.",
    category: "Food Assistance",
  },
  {
    title: "State EITC: Does Your State Offer Extra Tax Credits?",
    description:
      "31 states offer their own Earned Income Tax Credit on top of the federal credit. Find out if your state is one of them and how much extra you could get.",
    category: "Tax Credits",
  },
  {
    title: "CHIP: Free Health Insurance for Your Children",
    description:
      "The Children's Health Insurance Program covers millions of kids. Learn income limits by state, what's covered, and how to enroll your children.",
    category: "Healthcare",
  },
];

// ─── State benefits section ──────────────────────────────────────────────────

function StateBenefitsSection({ stateCode }: { stateCode: string }) {
  const stateInfo = US_STATES.find((s) => s.code === stateCode);
  const stateName = stateInfo?.name || stateCode;

  const statePrograms = useMemo(() => {
    return programs.filter((p) => {
      if (p.level === "federal") return true;
      if (p.stateCode === stateCode) return true;
      if (
        p.rules.applicableStates &&
        p.rules.applicableStates.includes(stateCode)
      )
        return true;
      return false;
    });
  }, [stateCode]);

  const categories = useMemo(() => {
    const cats = new Map<string, Program[]>();
    for (const p of statePrograms) {
      const list = cats.get(p.category) || [];
      list.push(p);
      cats.set(p.category, list);
    }
    return Array.from(cats.entries()).sort((a, b) => b[1].length - a[1].length);
  }, [statePrograms]);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold">{stateName} Benefits Guide</h2>
        <p className="text-sm text-muted-foreground">
          {statePrograms.length} programs available in {stateName} — including
          federal programs and state-specific benefits.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {statePrograms.slice(0, 12).map((program) => {
          const estimate = getEstimateLabel(program);
          return (
            <Card
              key={program.id}
              className="p-3 border border-card-border flex flex-col"
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <h3 className="text-sm font-semibold leading-tight line-clamp-2">
                  {program.name}
                </h3>
                <Badge
                  variant="secondary"
                  className="text-[10px] flex-shrink-0 gap-1 h-5"
                >
                  {CATEGORY_ICONS[program.category] || null}
                  {program.category}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2 mb-2 flex-1">
                {program.description}
              </p>
              <div className="flex items-center justify-between">
                {estimate && (
                  <Badge
                    variant="outline"
                    className="text-[10px] text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
                  >
                    {estimate}
                  </Badge>
                )}
                <Link href="/screener">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs gap-1 ml-auto"
                  >
                    Learn More <ArrowRight className="w-3 h-3" />
                  </Button>
                </Link>
              </div>
            </Card>
          );
        })}
      </div>

      {statePrograms.length > 12 && (
        <p className="text-xs text-muted-foreground text-center">
          Showing 12 of {statePrograms.length} programs.{" "}
          <Link href="/screener" className="text-primary hover:underline">
            Run a full screening
          </Link>{" "}
          to see all programs and your eligibility.
        </p>
      )}

      {/* Category summary */}
      <div className="flex flex-wrap gap-2">
        {categories.map(([cat, progs]) => (
          <Badge key={cat} variant="secondary" className="text-xs gap-1">
            {CATEGORY_ICONS[cat] || null}
            {cat}: {progs.length}
          </Badge>
        ))}
      </div>

      {/* State CTA */}
      <Card className="p-4 text-center border-2 border-primary/20 bg-primary/[0.02]">
        <Link href="/screener">
          <Button className="gap-2">
            Check your eligibility for {stateName} benefits in 2 minutes
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </Card>
    </div>
  );
}

// ─── Article cards section ───────────────────────────────────────────────────

function ArticleGrid() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-bold flex items-center gap-2">
          <BookOpen className="w-4 h-4" />
          Benefit Guides & Resources
        </h2>
        <p className="text-sm text-muted-foreground">
          In-depth guides to help you understand and apply for government
          benefits.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {ARTICLES.map((article, i) => (
          <Card key={i} className="p-4 border border-card-border flex flex-col">
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <h3 className="text-sm font-semibold leading-tight line-clamp-2">
                {article.title}
              </h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-3 flex-1">
              {article.description}
            </p>
            <div className="flex items-center justify-between">
              <Badge
                variant="secondary"
                className="text-[10px] gap-1 h-5"
              >
                {CATEGORY_ICONS[article.category] || null}
                {article.category}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs gap-1"
              >
                Read Guide <ArrowRight className="w-3 h-3" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─── Main export ─────────────────────────────────────────────────────────────

export default function BlogPage() {
  const [selectedState, setSelectedState] = useState<string>("");

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-8">
      {/* Page header */}
      <div className="text-center max-w-lg mx-auto">
        <h1 className="text-xl font-bold">Benefits Resources</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Guides, state-by-state breakdowns, and everything you need to
          understand and claim the benefits you deserve.
        </p>
      </div>

      {/* State selector */}
      <Card className="p-5 border-2 border-primary/20 bg-primary/[0.02]">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-2 flex-shrink-0">
            <MapPin className="w-4 h-4 text-primary" />
            <Label className="text-sm font-semibold">
              Find benefits in your state
            </Label>
          </div>
          <Select
            value={selectedState}
            onValueChange={setSelectedState}
          >
            <SelectTrigger
              className="w-full sm:w-64"
              data-testid="select-blog-state"
            >
              <SelectValue placeholder="Select a state..." />
            </SelectTrigger>
            <SelectContent>
              {US_STATES.map((s) => (
                <SelectItem key={s.code} value={s.code}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* State-specific section */}
      {selectedState && <StateBenefitsSection stateCode={selectedState} />}

      {/* Article grid */}
      <ArticleGrid />

      {/* Bottom CTA */}
      <Card className="p-6 text-center border-2 border-primary bg-primary/[0.03]">
        <Sparkles className="w-6 h-6 text-primary mx-auto mb-2" />
        <h2 className="text-base font-bold mb-1">
          Stop leaving money on the table.
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          Run your free benefits screening now and discover programs you didn't
          know existed.
        </p>
        <Link href="/screener">
          <Button size="lg" className="gap-2">
            Start Free Screening
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </Card>
    </div>
  );
}

// Label is used inline but imported from the select pattern — define locally
function Label({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <label className={className}>{children}</label>;
}
