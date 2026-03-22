/**
 * YoureOwed — Partner Program Page
 * A full partner portal landing page for social workers, nonprofits,
 * and community organizations.
 */

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Users,
  Building2,
  LayoutDashboard,
  FileText,
  Download,
  Code2,
  Heart,
  Scale,
  Stethoscope,
  HandHeart,
  CheckCircle2,
  ArrowRight,
  Quote,
  Star,
  Mail,
  Phone,
  Zap,
  Shield,
  BarChart3,
  Globe,
} from "lucide-react";

// ─── Pricing tiers ───────────────────────────────────────────────────────────

interface PartnerTier {
  name: string;
  price: string;
  priceSuffix: string;
  description: string;
  features: string[];
  cta: string;
  highlighted?: boolean;
  badge?: string;
}

const PARTNER_TIERS: PartnerTier[] = [
  {
    name: "Community",
    price: "$99",
    priceSuffix: "/mo",
    description:
      "Perfect for small nonprofits and single-office organizations just getting started.",
    features: [
      "Up to 50 screenings/month",
      "3 team seats",
      "Email support (48-hour response)",
      "Client results dashboard",
      "CSV export",
      "415+ programs covered",
    ],
    cta: "Get Started",
  },
  {
    name: "Professional",
    price: "$199",
    priceSuffix: "/mo",
    description:
      "For growing organizations that need team tools and deeper client management.",
    features: [
      "Up to 200 screenings/month",
      "10 team seats",
      "Priority support (24-hour response)",
      "Client management dashboard",
      "CSV & PDF export",
      "Branded client reports",
      "Bulk screening import",
    ],
    cta: "Get Professional",
    highlighted: true,
    badge: "Most Popular",
  },
  {
    name: "Enterprise",
    price: "$499",
    priceSuffix: "/mo",
    description:
      "Unlimited scale with white-label, API access, and a dedicated account manager.",
    features: [
      "Unlimited screenings",
      "Unlimited team seats",
      "White-label reports",
      "Dedicated account manager",
      "API access + webhooks",
      "Custom intake questions",
      "HIPAA BAA available",
      "SSO / SAML support",
    ],
    cta: "Contact Sales",
  },
];

// ─── Features grid ────────────────────────────────────────────────────────────

interface FeatureCard {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FEATURES: FeatureCard[] = [
  {
    icon: <Users className="w-5 h-5" />,
    title: "Bulk Screening",
    description:
      "Screen multiple clients at once with our CSV batch import. Upload a client list and get results in minutes.",
  },
  {
    icon: <LayoutDashboard className="w-5 h-5" />,
    title: "Client Management",
    description:
      "Track applications, notes, and follow-ups across your entire caseload from a single dashboard.",
  },
  {
    icon: <FileText className="w-5 h-5" />,
    title: "Custom Reports",
    description:
      "Generate branded PDF reports for clients to take to their appointments with benefits offices.",
  },
  {
    icon: <BarChart3 className="w-5 h-5" />,
    title: "Team Dashboard",
    description:
      "See your team's screening activity, case loads, and outcomes in one unified view.",
  },
  {
    icon: <Download className="w-5 h-5" />,
    title: "Data Export",
    description:
      "Export all client screenings as CSV or PDF for reporting, grants, and compliance purposes.",
  },
  {
    icon: <Code2 className="w-5 h-5" />,
    title: "API Access",
    description:
      "Integrate eligibility screening directly into your existing case management system via REST API.",
  },
];

// ─── Use cases ────────────────────────────────────────────────────────────────

interface UseCase {
  icon: React.ReactNode;
  title: string;
  description: string;
  stat: string;
  statLabel: string;
}

const USE_CASES: UseCase[] = [
  {
    icon: <HandHeart className="w-6 h-6" />,
    title: "Social Workers",
    description:
      "Screen clients during intake to maximize benefits access. Our tool checks 415+ programs in under 2 minutes, giving you more time to focus on the people you serve.",
    stat: "$13,400",
    statLabel: "avg. unclaimed benefits per client",
  },
  {
    icon: <Building2 className="w-6 h-6" />,
    title: "Nonprofits",
    description:
      "Connect your community to every dollar they're owed. Track outcomes and demonstrate impact to funders with detailed reporting on benefits accessed.",
    stat: "415+",
    statLabel: "programs screened per client",
  },
  {
    icon: <Stethoscope className="w-6 h-6" />,
    title: "Community Health Centers",
    description:
      "Screen patients for Medicaid, CHIP, and financial assistance programs at the point of care. Reduce uncompensated care and improve patient outcomes.",
    stat: "85–90%",
    statLabel: "screening accuracy",
  },
  {
    icon: <Scale className="w-6 h-6" />,
    title: "Legal Aid Organizations",
    description:
      "Help clients access benefits they're entitled to as part of comprehensive legal services. Quickly identify economic supports for vulnerable clients.",
    stat: "50+",
    statLabel: "states + DC covered",
  },
];

// ─── Testimonials ─────────────────────────────────────────────────────────────

interface Testimonial {
  quote: string;
  author: string;
  title: string;
  org: string;
  stars: number;
}

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "We've screened over 1,200 clients in the past six months. On average, each client qualifies for programs worth $8,000 a year that they had no idea existed. YoureOwed has transformed how we do intake.",
    author: "Maria Gonzalez",
    title: "Director of Client Services",
    org: "Bay Area Community Action Network",
    stars: 5,
  },
  {
    quote:
      "The team dashboard lets our five social workers coordinate caseloads seamlessly. The branded PDF reports are professional and our clients actually bring them to their appointments — it's been a game changer.",
    author: "James Okafor",
    title: "Benefits Navigator",
    org: "Riverside Legal Aid Society",
    stars: 5,
  },
  {
    quote:
      "We integrated the API with our EHR system in a day. Now every patient gets an automatic benefits screen at registration. We've seen a measurable reduction in uncompensated care since we rolled it out.",
    author: "Dr. Sandra Liu",
    title: "Chief of Community Health",
    org: "Eastside Health & Wellness Center",
    stars: 5,
  },
];

// ─── Org types ────────────────────────────────────────────────────────────────

const ORG_TYPES = [
  "Nonprofit / 501(c)(3)",
  "Social Services Agency",
  "Community Health Center / FQHC",
  "Legal Aid Organization",
  "Food Bank / Pantry",
  "Community College",
  "Government Agency",
  "Hospital / Health System",
  "Faith-Based Organization",
  "Other",
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function PricingCard({ tier }: { tier: PartnerTier }) {
  const { toast } = useToast();

  const handleCta = () => {
    if (tier.name === "Enterprise") {
      document.getElementById("partner-contact-form")?.scrollIntoView({ behavior: "smooth" });
    } else {
      toast({
        title: "Great choice!",
        description: `You selected the ${tier.name} plan. Complete the form below and our team will set you up.`,
      });
      document.getElementById("partner-contact-form")?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <Card
      className={`p-6 flex flex-col relative ${
        tier.highlighted
          ? "border-2 border-primary shadow-lg shadow-primary/10"
          : "border border-card-border"
      }`}
    >
      {tier.badge && (
        <Badge className="absolute top-4 right-4 bg-primary text-primary-foreground text-[10px]">
          {tier.badge}
        </Badge>
      )}

      <div className="mb-1">
        <h3 className="text-lg font-bold">{tier.name}</h3>
      </div>

      <div className="mb-3">
        <span className="text-3xl font-black">{tier.price}</span>
        <span className="text-sm text-muted-foreground">{tier.priceSuffix}</span>
      </div>

      <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
        {tier.description}
      </p>

      <ul className="space-y-2.5 text-sm mb-6 flex-1">
        {tier.features.map((feature, i) => (
          <li key={i} className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <Button
        onClick={handleCta}
        variant={tier.highlighted ? "default" : "outline"}
        className={`w-full gap-2 ${
          tier.highlighted ? "bg-primary hover:bg-primary/90" : ""
        }`}
        data-testid={`button-partner-${tier.name.toLowerCase()}`}
      >
        {tier.cta}
        <ArrowRight className="w-4 h-4" />
      </Button>
    </Card>
  );
}

function FeatureCardItem({ feature }: { feature: FeatureCard }) {
  return (
    <Card className="p-5 border border-card-border hover:border-primary/30 transition-colors">
      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
        <span className="text-primary">{feature.icon}</span>
      </div>
      <h3 className="text-sm font-bold mb-1.5">{feature.title}</h3>
      <p className="text-xs text-muted-foreground leading-relaxed">
        {feature.description}
      </p>
    </Card>
  );
}

function UseCaseCard({ useCase }: { useCase: UseCase }) {
  return (
    <Card className="p-6 border border-card-border">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
          <span className="text-primary">{useCase.icon}</span>
        </div>
        <div className="flex-1">
          <h3 className="text-base font-bold mb-2">{useCase.title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            {useCase.description}
          </p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-black text-primary">{useCase.stat}</span>
            <span className="text-xs text-muted-foreground">{useCase.statLabel}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <Card className="p-6 border border-card-border flex flex-col">
      {/* Stars */}
      <div className="flex items-center gap-0.5 mb-4">
        {Array.from({ length: testimonial.stars }).map((_, i) => (
          <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
        ))}
      </div>

      {/* Quote */}
      <Quote className="w-6 h-6 text-primary/30 mb-3 flex-shrink-0" />
      <p className="text-sm text-muted-foreground leading-relaxed mb-5 flex-1 italic">
        "{testimonial.quote}"
      </p>

      {/* Attribution */}
      <div>
        <p className="text-sm font-semibold">{testimonial.author}</p>
        <p className="text-xs text-muted-foreground">{testimonial.title}</p>
        <p className="text-xs text-primary mt-0.5">{testimonial.org}</p>
      </div>
    </Card>
  );
}

// ─── Contact Form ─────────────────────────────────────────────────────────────

interface ContactFormData {
  orgName: string;
  contactName: string;
  email: string;
  phone: string;
  orgType: string;
  message: string;
}

const INITIAL_FORM: ContactFormData = {
  orgName: "",
  contactName: "",
  email: "",
  phone: "",
  orgType: "",
  message: "",
};

function ContactForm() {
  const { toast } = useToast();
  const [form, setForm] = useState<ContactFormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<Partial<ContactFormData>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const validate = (): boolean => {
    const newErrors: Partial<ContactFormData> = {};

    if (!form.orgName.trim()) newErrors.orgName = "Organization name is required.";
    if (!form.contactName.trim()) newErrors.contactName = "Contact name is required.";
    if (!form.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Please enter a valid email address.";
    }
    if (!form.orgType) newErrors.orgType = "Please select an organization type.";
    if (!form.message.trim()) newErrors.message = "Message is required.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setSubmitting(false);
    setSubmitted(true);
    setForm(INITIAL_FORM);

    toast({
      title: "Message Sent!",
      description: "We'll be in touch within one business day.",
    });
  };

  const updateField = (field: keyof ContactFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  if (submitted) {
    return (
      <Card className="p-8 border border-primary/20 bg-primary/[0.02] text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-xl font-bold mb-2">Message Sent!</h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Thank you for reaching out. Our team will contact you within one
          business day to discuss how YoureOwed can support your organization.
        </p>
        <Button
          variant="outline"
          className="mt-6 gap-2"
          onClick={() => setSubmitted(false)}
        >
          Send Another Message
        </Button>
      </Card>
    );
  }

  return (
    <Card
      id="partner-contact-form"
      className="p-6 md:p-8 border border-card-border"
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {/* Row 1: Org name + contact name */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="orgName" className="text-sm font-medium">
              Organization Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="orgName"
              placeholder="e.g. Community Action Agency"
              value={form.orgName}
              onChange={(e) => updateField("orgName", e.target.value)}
              className={errors.orgName ? "border-destructive" : ""}
              data-testid="input-org-name"
            />
            {errors.orgName && (
              <p className="text-xs text-destructive">{errors.orgName}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="contactName" className="text-sm font-medium">
              Contact Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="contactName"
              placeholder="Your full name"
              value={form.contactName}
              onChange={(e) => updateField("contactName", e.target.value)}
              className={errors.contactName ? "border-destructive" : ""}
              data-testid="input-contact-name"
            />
            {errors.contactName && (
              <p className="text-xs text-destructive">{errors.contactName}</p>
            )}
          </div>
        </div>

        {/* Row 2: Email + Phone */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-sm font-medium">
              Work Email <span className="text-destructive">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="you@organization.org"
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
              className={errors.email ? "border-destructive" : ""}
              data-testid="input-partner-email"
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="phone" className="text-sm font-medium">
              Phone Number
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="(555) 000-0000"
              value={form.phone}
              onChange={(e) => updateField("phone", e.target.value)}
              data-testid="input-partner-phone"
            />
          </div>
        </div>

        {/* Row 3: Org type */}
        <div className="space-y-1.5">
          <Label htmlFor="orgType" className="text-sm font-medium">
            Organization Type <span className="text-destructive">*</span>
          </Label>
          <Select
            value={form.orgType}
            onValueChange={(v) => updateField("orgType", v)}
          >
            <SelectTrigger
              id="orgType"
              className={errors.orgType ? "border-destructive" : ""}
              data-testid="select-org-type"
            >
              <SelectValue placeholder="Select your organization type" />
            </SelectTrigger>
            <SelectContent>
              {ORG_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.orgType && (
            <p className="text-xs text-destructive">{errors.orgType}</p>
          )}
        </div>

        {/* Row 4: Message */}
        <div className="space-y-1.5">
          <Label htmlFor="message" className="text-sm font-medium">
            Message <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="message"
            placeholder="Tell us about your organization and how we can help..."
            rows={4}
            value={form.message}
            onChange={(e) => updateField("message", e.target.value)}
            className={`resize-none ${errors.message ? "border-destructive" : ""}`}
            data-testid="textarea-partner-message"
          />
          {errors.message && (
            <p className="text-xs text-destructive">{errors.message}</p>
          )}
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full gap-2"
          disabled={submitting}
          data-testid="button-partner-submit"
        >
          {submitting ? (
            <>
              <span className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
              Sending...
            </>
          ) : (
            <>
              <Mail className="w-4 h-4" />
              Send Message
            </>
          )}
        </Button>

        <p className="text-[10px] text-muted-foreground text-center">
          By submitting this form you agree to our{" "}
          <a href="#" className="hover:text-foreground underline underline-offset-2">
            privacy policy
          </a>
          . We never share your information with third parties.
        </p>
      </form>
    </Card>
  );
}

// ─── Main Export ─────────────────────────────────────────────────────────────

export default function PartnersPage() {
  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-14">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="text-center max-w-3xl mx-auto py-4">
        <Badge variant="secondary" className="mb-4 text-xs gap-1.5">
          <Heart className="w-3 h-3 text-primary" />
          Partner Program
        </Badge>

        <h1 className="text-3xl md:text-4xl font-black tracking-tight leading-tight mb-4">
          Help Your Clients Get{" "}
          <span className="text-primary">Every Dollar They're Owed</span>
        </h1>

        <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-8">
          YoureOwed for Organizations gives your team powerful tools to screen
          clients for 415+ government benefit programs — in under 2 minutes per
          client.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            size="lg"
            className="gap-2 px-8"
            onClick={() =>
              document
                .getElementById("partner-contact-form")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            data-testid="button-partner-hero-cta"
          >
            Get Started
            <ArrowRight className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="gap-2"
            onClick={() =>
              window.open(
                "mailto:partners@youreowed.com?subject=Demo%20Request%20-%20Partner%20Program",
                "_blank"
              )
            }
            data-testid="button-partner-demo"
          >
            <Mail className="w-4 h-4" />
            Schedule a Demo
          </Button>
        </div>

        {/* Trust indicators */}
        <div className="flex flex-wrap items-center justify-center gap-6 mt-10 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-primary" />
            HIPAA BAA available
          </div>
          <div className="flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-primary" />
            50 states + DC
          </div>
          <div className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-primary" />
            415+ programs
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-primary" />
            8,000+ clients served
          </div>
        </div>
      </section>

      <Separator />

      {/* ── Pricing Tiers ─────────────────────────────────────────────────── */}
      <section>
        <div className="text-center max-w-xl mx-auto mb-8">
          <h2 className="text-2xl font-bold mb-2">Plans & Pricing</h2>
          <p className="text-sm text-muted-foreground">
            Choose the plan that fits your organization's size and needs. All
            plans include access to 415+ programs and our client results
            dashboard.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {PARTNER_TIERS.map((tier) => (
            <PricingCard key={tier.name} tier={tier} />
          ))}
        </div>

        {/* All plans include */}
        <Card className="mt-6 p-5 border border-card-border bg-muted/10">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            All plans include
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
            {[
              "415+ programs covered",
              "All 50 states + DC",
              "Real-time eligibility data",
              "Regular rule updates",
              "Encrypted data in transit",
              "Client results portal",
              "Team management",
              "Onboarding support",
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <Separator />

      {/* ── Features Grid ─────────────────────────────────────────────────── */}
      <section>
        <div className="text-center max-w-xl mx-auto mb-8">
          <h2 className="text-2xl font-bold mb-2">Everything Your Team Needs</h2>
          <p className="text-sm text-muted-foreground">
            Purpose-built tools for social workers, case managers, and benefits
            counselors.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {FEATURES.map((feature, i) => (
            <FeatureCardItem key={i} feature={feature} />
          ))}
        </div>
      </section>

      <Separator />

      {/* ── Use Cases ─────────────────────────────────────────────────────── */}
      <section>
        <div className="text-center max-w-xl mx-auto mb-8">
          <h2 className="text-2xl font-bold mb-2">
            Who Uses YoureOwed for Organizations
          </h2>
          <p className="text-sm text-muted-foreground">
            Trusted by teams across the social services sector.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {USE_CASES.map((useCase, i) => (
            <UseCaseCard key={i} useCase={useCase} />
          ))}
        </div>
      </section>

      <Separator />

      {/* ── Testimonials ──────────────────────────────────────────────────── */}
      <section>
        <div className="text-center max-w-xl mx-auto mb-8">
          <h2 className="text-2xl font-bold mb-2">
            What Organizations Are Saying
          </h2>
          <p className="text-sm text-muted-foreground">
            Join hundreds of organizations helping their clients access more
            benefits.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {TESTIMONIALS.map((testimonial, i) => (
            <TestimonialCard key={i} testimonial={testimonial} />
          ))}
        </div>

        {/* Social proof stat */}
        <Card className="mt-6 p-6 text-center border border-card-border bg-muted/10">
          <p className="text-2xl font-black text-primary mb-1">$170M+</p>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            in benefits connected to individuals by organizations using
            benefits screening tools nationwide.
          </p>
          <p className="text-[10px] text-muted-foreground mt-2">
            Based on aggregated data from Single Stop and similar benefits
            screening platforms.
          </p>
        </Card>
      </section>

      <Separator />

      {/* ── Contact Form ──────────────────────────────────────────────────── */}
      <section>
        <div className="text-center max-w-xl mx-auto mb-8">
          <Badge variant="secondary" className="mb-3 text-xs gap-1.5">
            <Mail className="w-3 h-3" />
            Get in Touch
          </Badge>
          <h2 className="text-2xl font-bold mb-2">Get Started Today</h2>
          <p className="text-sm text-muted-foreground">
            Fill out the form below and our team will be in touch within one
            business day to discuss how YoureOwed can support your organization.
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <ContactForm />
        </div>

        {/* Alternative contact methods */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-6">
          <a
            href="tel:+18002363348"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Phone className="w-4 h-4" />
            (800) BENEFITS
          </a>
          <a
            href="mailto:partners@youreowed.com"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Mail className="w-4 h-4" />
            partners@youreowed.com
          </a>
        </div>
      </section>

      {/* ── Disclaimer ────────────────────────────────────────────────────── */}
      <p className="text-[10px] text-muted-foreground text-center pb-4">
        YoureOwed is a screening tool for directional guidance only. Results do
        not constitute a guarantee of eligibility or benefits. Organizations
        should verify all eligibility determinations through official channels.
      </p>
    </div>
  );
}
