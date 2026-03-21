import { useState } from "react";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Building2,
  Code2,
  Palette,
  Shield,
  Users,
  GraduationCap,
  Heart,
  Landmark,
  ArrowRight,
  Phone,
  Mail,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Globe,
  Server,
  Headphones,
  FileCheck,
  Settings,
  Lock,
  Cpu,
} from "lucide-react";

// ─── Stats ───────────────────────────────────────────────────────────────────

const STATS = [
  { label: "Programs", value: "335" },
  { label: "States + DC", value: "50" },
  { label: "Accuracy", value: "85-90%" },
  { label: "Individuals Served", value: "8,000+" },
];

// ─── B2B Offerings ───────────────────────────────────────────────────────────

interface Offering {
  name: string;
  price: string;
  priceSuffix?: string;
  icon: React.ReactNode;
  description: string;
  features: string[];
  bestFor: string;
  cta: string;
  ctaAction: "demo" | "trial" | "contact";
  highlighted?: boolean;
}

const OFFERINGS: Offering[] = [
  {
    name: "API Access",
    price: "$199",
    priceSuffix: "/mo",
    icon: <Code2 className="w-5 h-5" />,
    description:
      "Integrate our screening engine into your existing systems. Query eligibility programmatically and build custom workflows.",
    features: [
      "REST API with JSON responses",
      "Real-time eligibility checks",
      "335 programs across all 50 states",
      "Webhook notifications",
      "Rate-limited to 10,000 requests/mo",
      "Standard API documentation",
      "Email support (48-hour response)",
    ],
    bestFor:
      "Tech-savvy organizations with existing CRM, EHR, or case management systems",
    cta: "Start Free Trial",
    ctaAction: "trial",
  },
  {
    name: "White-Label Platform",
    price: "$399",
    priceSuffix: "/mo",
    icon: <Palette className="w-5 h-5" />,
    description:
      "Your brand, our technology. Deploy a fully branded screening tool on your website with zero development effort.",
    features: [
      "Custom branding (logo, colors, fonts)",
      "Embed on your website or subdomain",
      "Admin dashboard with analytics",
      "Client results management",
      "Unlimited screenings",
      "Custom intake questions",
      "Priority support (24-hour response)",
    ],
    bestFor:
      "Nonprofits, community organizations, and government agencies",
    cta: "Schedule a Demo",
    ctaAction: "demo",
    highlighted: true,
  },
  {
    name: "Enterprise Custom",
    price: "Custom",
    icon: <Building2 className="w-5 h-5" />,
    description:
      "Tailored integrations, compliance guarantees, and dedicated infrastructure for large-scale deployments.",
    features: [
      "Custom API integrations",
      "HIPAA compliance with BAA",
      "Dedicated account manager",
      "99.9% uptime SLA",
      "Bulk screening (CSV/batch)",
      "Custom rules engine",
      "On-premise deployment option",
    ],
    bestFor:
      "Hospitals, health systems, and large government agencies",
    cta: "Contact Sales",
    ctaAction: "contact",
  },
];

// ─── Use Cases ───────────────────────────────────────────────────────────────

const USE_CASES = [
  {
    icon: <Users className="w-5 h-5" />,
    title: "Nonprofits & Food Banks",
    description:
      "Screen clients during intake to connect them with benefits they're missing. Average client finds $13,400/year in unclaimed benefits.",
    stat: "$13,400/yr avg. per client",
  },
  {
    icon: <Heart className="w-5 h-5" />,
    title: "Hospitals & Health Systems",
    description:
      "Screen patients for Medicaid eligibility and financial assistance programs during registration. Reduce uncompensated care and improve patient outcomes.",
    stat: "Reduce uncompensated care",
  },
  {
    icon: <GraduationCap className="w-5 h-5" />,
    title: "Community Colleges",
    description:
      "Help students access Pell Grants, SNAP, Medicaid, and childcare subsidies. Improve retention by reducing the financial barriers that cause students to drop out.",
    stat: "Improve student retention",
  },
  {
    icon: <Landmark className="w-5 h-5" />,
    title: "Government Agencies",
    description:
      "Modernize your benefits outreach. Proactively connect residents with programs they qualify for instead of waiting for them to apply.",
    stat: "Proactive outreach at scale",
  },
];

// ─── FAQ ─────────────────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    q: "Can we customize the screening questions?",
    a: "Yes. The White-Label and Enterprise tiers allow you to add custom intake questions, modify the screening flow, and tailor the experience to your organization's specific population. API customers can build fully custom frontends.",
  },
  {
    q: "Is the data HIPAA compliant?",
    a: "The Enterprise tier includes a HIPAA Business Associate Agreement (BAA) and meets all requirements for handling Protected Health Information. Screening data is encrypted at rest and in transit, and we support audit logging for compliance.",
  },
  {
    q: "How does the API work?",
    a: "Our REST API accepts household data as JSON via standard HTTP POST requests. Authentication uses API keys with optional OAuth 2.0. Responses include eligibility status, confidence scores, estimated benefit amounts, and links to official application portals for each program.",
  },
  {
    q: "Can we white-label the entire experience?",
    a: "Yes. White-Label customers get full control over branding — logo, color scheme, fonts, domain, and email templates. Your clients will interact with a seamless, branded experience with no mention of YoureOwed.",
  },
];

// ─── Offering Card ───────────────────────────────────────────────────────────

function OfferingCard({ offering }: { offering: Offering }) {
  return (
    <Card
      className={`p-5 flex flex-col ${
        offering.highlighted
          ? "border-2 border-primary shadow-lg"
          : "border border-card-border"
      }`}
    >
      {offering.highlighted && (
        <Badge className="self-start mb-3 bg-primary text-primary-foreground text-[10px]">
          Most Popular
        </Badge>
      )}
      <div className="flex items-center gap-2.5 mb-2">
        <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
          {offering.icon}
        </div>
        <div>
          <h3 className="text-base font-bold">{offering.name}</h3>
        </div>
      </div>

      <div className="mb-3">
        <span className="text-2xl font-bold">{offering.price}</span>
        {offering.priceSuffix && (
          <span className="text-sm text-muted-foreground">
            {offering.priceSuffix}
          </span>
        )}
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        {offering.description}
      </p>

      <ul className="space-y-2 text-sm mb-4 flex-1">
        {offering.features.map((feature, i) => (
          <li key={i} className="flex items-start gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <div className="mb-4 p-2.5 bg-muted/40 rounded-md">
        <p className="text-xs text-muted-foreground">
          <span className="font-medium text-foreground">Best for: </span>
          {offering.bestFor}
        </p>
      </div>

      {offering.ctaAction === "demo" && (
        <Button
          className="w-full gap-2"
          onClick={() =>
            window.open("mailto:enterprise@benefitshub.com?subject=Demo%20Request%20-%20White-Label%20Platform", "_blank")
          }
          data-testid="button-schedule-demo"
        >
          <Mail className="w-4 h-4" />
          {offering.cta}
        </Button>
      )}
      {offering.ctaAction === "trial" && (
        <Link href="/pricing">
          <Button variant="outline" className="w-full gap-2" data-testid="button-start-trial">
            <ArrowRight className="w-4 h-4" />
            {offering.cta}
          </Button>
        </Link>
      )}
      {offering.ctaAction === "contact" && (
        <Button
          variant="outline"
          className="w-full gap-2"
          onClick={() =>
            window.open("mailto:enterprise@benefitshub.com?subject=Enterprise%20Inquiry", "_blank")
          }
          data-testid="button-contact-sales"
        >
          <Mail className="w-4 h-4" />
          {offering.cta}
        </Button>
      )}
    </Card>
  );
}

// ─── FAQ Section ─────────────────────────────────────────────────────────────

function EnterpriseFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="space-y-3">
      <h2 className="text-base font-bold">Frequently Asked Questions</h2>
      {FAQ_ITEMS.map((item, i) => (
        <Card key={i} className="border border-card-border overflow-hidden">
          <button
            className="w-full flex items-center justify-between p-4 text-left cursor-pointer"
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
          >
            <span className="text-sm font-medium pr-4">{item.q}</span>
            {openIndex === i ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            )}
          </button>
          {openIndex === i && (
            <div className="px-4 pb-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {item.a}
              </p>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}

// ─── Main Export ─────────────────────────────────────────────────────────────

export default function EnterprisePage() {
  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-10">
      {/* Hero */}
      <div className="text-center max-w-2xl mx-auto">
        <Badge
          variant="secondary"
          className="mb-3 text-xs gap-1.5"
        >
          <Building2 className="w-3 h-3" />
          For Organizations
        </Badge>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          Benefits Screening for Your Organization
        </h1>
        <p className="text-sm md:text-base text-muted-foreground mt-3 leading-relaxed">
          Help your clients, patients, and community members find the benefits
          they deserve. White-label our platform or integrate via API.
        </p>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {STATS.map((stat, i) => (
          <Card
            key={i}
            className="p-4 text-center border border-card-border"
          >
            <p className="text-xl md:text-2xl font-bold">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </Card>
        ))}
      </div>

      {/* Offerings */}
      <div>
        <h2 className="text-base font-bold mb-1">Plans & Pricing</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Choose the integration model that fits your organization. All plans
          include access to 335 programs across all 50 states and DC.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {OFFERINGS.map((offering) => (
            <OfferingCard key={offering.name} offering={offering} />
          ))}
        </div>
      </div>

      {/* Comparison highlights */}
      <Card className="p-5 border border-card-border">
        <h3 className="text-sm font-bold mb-3">All Plans Include</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: <Globe className="w-4 h-4" />, text: "50 states + DC coverage" },
            { icon: <BarChart3 className="w-4 h-4" />, text: "Real-time eligibility data" },
            { icon: <FileCheck className="w-4 h-4" />, text: "Benefit dollar estimates" },
            { icon: <Settings className="w-4 h-4" />, text: "Regular rule updates" },
            { icon: <Lock className="w-4 h-4" />, text: "Encrypted data in transit" },
            { icon: <Cpu className="w-4 h-4" />, text: "99.5% uptime baseline" },
            { icon: <Server className="w-4 h-4" />, text: "API & webhook support" },
            { icon: <Headphones className="w-4 h-4" />, text: "Technical documentation" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">{item.icon}</span>
              <span>{item.text}</span>
            </div>
          ))}
        </div>
      </Card>

      <Separator />

      {/* Use Cases */}
      <div>
        <h2 className="text-base font-bold mb-1">Who Uses YoureOwed</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Organizations across sectors use benefits screening to improve outcomes
          for the people they serve.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {USE_CASES.map((useCase, i) => (
            <Card key={i} className="p-5 border border-card-border">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                  {useCase.icon}
                </div>
                <div>
                  <h3 className="text-sm font-bold mb-1">{useCase.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-2">
                    {useCase.description}
                  </p>
                  <Badge
                    variant="secondary"
                    className="text-[10px]"
                  >
                    {useCase.stat}
                  </Badge>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <Separator />

      {/* Social Proof */}
      <Card className="p-6 text-center border border-card-border bg-muted/20">
        <Shield className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
        <p className="text-base md:text-lg font-semibold max-w-xl mx-auto leading-relaxed">
          Organizations using benefits screening tools have connected their
          communities with over{" "}
          <span className="text-primary">$170 million</span> in benefits.
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          Based on aggregated data from Single Stop and similar benefits
          screening platforms nationwide.
        </p>
      </Card>

      <Separator />

      {/* CTA */}
      <div className="text-center max-w-lg mx-auto space-y-4">
        <h2 className="text-lg font-bold">Get Started</h2>
        <p className="text-sm text-muted-foreground">
          See how YoureOwed can help your organization connect people with the
          benefits they qualify for. Start with a demo or a 14-day free trial.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            size="lg"
            className="gap-2 w-full sm:w-auto"
            onClick={() =>
              window.open("mailto:enterprise@benefitshub.com?subject=Demo%20Request", "_blank")
            }
            data-testid="button-cta-demo"
          >
            <Mail className="w-4 h-4" />
            Schedule a Demo
          </Button>
          <Link href="/pricing">
            <Button
              variant="outline"
              size="lg"
              className="gap-2 w-full sm:w-auto"
              data-testid="button-cta-trial"
            >
              Start Free Trial
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        <div className="flex items-center justify-center gap-4 pt-2">
          <a
            href="tel:+18002363348"
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <Phone className="w-3 h-3" />
            (800) BENEFITS
          </a>
          <a
            href="mailto:enterprise@benefitshub.com"
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <Mail className="w-3 h-3" />
            enterprise@benefitshub.com
          </a>
        </div>

        <p className="text-[10px] text-muted-foreground">
          14-day free trial. No credit card required. Cancel anytime.
        </p>
      </div>

      <Separator />

      {/* FAQ */}
      <EnterpriseFAQ />

      {/* Footer note */}
      <p className="text-[10px] text-muted-foreground text-center pb-4">
        YoureOwed is a screening tool for directional guidance only. Results do
        not constitute a guarantee of eligibility or benefits. Organizations
        should verify all eligibility determinations through official channels.
      </p>
    </div>
  );
}
