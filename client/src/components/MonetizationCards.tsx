// ─── Monetization Cards ─────────────────────────────────────────────────────
// Revenue-generating cards that appear alongside benefit results.
// Each card targets specific program categories with relevant partner offers.

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Scale,
  FileText,
  Wifi,
  Phone,
  Smartphone,
  Heart,
  ShieldCheck,
  ExternalLink,
  CheckCircle2,
  ArrowRight,
  Gift,
  DollarSign,
  Sparkles,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { ProgramResult } from "@/lib/eligibility";

// ═══════════════════════════════════════════════════════════════════════════
//  1. DISABILITY ATTORNEY LEAD CAPTURE
//  Revenue: $250-350 per qualified lead
// ═══════════════════════════════════════════════════════════════════════════

export function DisabilityAttorneyCard() {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmit = () => {
    if (!name || !phone) return;
    // In production: POST to your backend → forward to attorney partner
    // For now: simulate submission
    setSubmitted(true);
    toast({ title: "Request submitted", description: "A disability attorney will contact you within 24 hours." });
  };

  if (submitted) {
    return (
      <Card className="p-5 border-2 border-emerald-500/30 bg-emerald-500/[0.03]">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-6 h-6 text-emerald-500" />
          <div>
            <p className="text-sm font-bold">You're connected.</p>
            <p className="text-xs text-muted-foreground">A disability attorney will reach out within 24 hours. They only get paid if you win — no upfront cost to you.</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-5 border-2 border-primary/20 bg-gradient-to-br from-primary/[0.03] to-transparent" data-testid="card-attorney-lead">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <Scale className="w-4 h-4 text-primary" />
        </div>
        <div>
          <p className="text-sm font-bold">Need help with your disability claim?</p>
          <Badge variant="secondary" className="text-[10px] h-4 mt-0.5">Free consultation</Badge>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mb-3">
        The SSDI approval process is complex — 65% of initial applications are denied. An experienced disability attorney can significantly increase your chances. They work on contingency, meaning <span className="font-semibold text-foreground">you pay nothing unless you win.</span>
      </p>
      <div className="space-y-2 mb-3">
        <Input
          placeholder="Your name"
          value={name}
          onChange={e => setName(e.target.value)}
          className="h-9 text-sm"
          data-testid="input-attorney-name"
        />
        <Input
          placeholder="Phone number"
          type="tel"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          className="h-9 text-sm"
          data-testid="input-attorney-phone"
        />
        <Input
          placeholder="Email (optional)"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="h-9 text-sm"
          data-testid="input-attorney-email"
        />
      </div>
      <Button className="w-full gap-1.5" onClick={handleSubmit} disabled={!name || !phone} data-testid="button-attorney-submit">
        <Scale className="w-4 h-4" />
        Connect me with a free attorney
      </Button>
      <p className="text-[10px] text-muted-foreground text-center mt-2">
        No cost, no obligation. Attorney pays only if you win your case.
      </p>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  2. TAX PREPARATION AFFILIATE LINKS
//  Revenue: $10-100 per referral (15-65% commission)
// ═══════════════════════════════════════════════════════════════════════════

const TAX_PARTNERS = [
  {
    name: "FreeTaxUSA",
    description: "Free federal filing. State returns just $14.99.",
    badge: "Free Federal",
    // Replace with your actual affiliate link after joining at:
    // https://www.freetaxusa.com/affiliates/
    url: "https://www.freetaxusa.com/?ref=youreowed",
    commission: "15-65%",
  },
  {
    name: "TaxSlayer",
    description: "Simple returns starting at $0. All forms supported.",
    badge: "Budget Pick",
    // Join at CJ Affiliate: https://www.taxslayer.com
    url: "https://www.taxslayer.com/?ref=youreowed",
    commission: "17%",
  },
  {
    name: "IRS Free File",
    description: "100% free if income under $84,000. Official IRS program.",
    badge: "Completely Free",
    url: "https://www.irs.gov/filing/free-file-do-your-federal-taxes-for-free",
    commission: "none — free service",
  },
];

export function TaxPrepCard() {
  return (
    <Card className="p-5 border border-card-border" data-testid="card-tax-prep">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
          <DollarSign className="w-4 h-4 text-emerald-500" />
        </div>
        <div>
          <p className="text-sm font-bold">Claim your tax credits</p>
          <p className="text-[10px] text-muted-foreground">You must file a tax return to get EITC & CTC</p>
        </div>
      </div>
      <div className="space-y-2">
        {TAX_PARTNERS.map((partner, i) => (
          <a
            key={i}
            href={partner.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-2.5 rounded-lg border border-card-border hover:border-primary/30 transition-colors group cursor-pointer"
            data-testid={`link-tax-${partner.name.toLowerCase().replace(/\s/g, "-")}`}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-bold">{partner.name}</p>
                <Badge variant="secondary" className="text-[9px] h-3.5 px-1">{partner.badge}</Badge>
              </div>
              <p className="text-[10px] text-muted-foreground">{partner.description}</p>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary flex-shrink-0" />
          </a>
        ))}
      </div>
      <p className="text-[10px] text-muted-foreground mt-2">
        Find free VITA tax help near you: <a href="https://irs.treasury.gov/freetaxprep/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">irs.gov/freetaxprep</a>
      </p>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  3. HEALTH INSURANCE REFERRAL
//  Revenue: $50-100 per enrollment
// ═══════════════════════════════════════════════════════════════════════════

export function HealthInsuranceCard() {
  return (
    <Card className="p-5 border border-card-border" data-testid="card-health-insurance">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center">
          <Heart className="w-4 h-4 text-rose-500" />
        </div>
        <div>
          <p className="text-sm font-bold">Need health coverage?</p>
          <p className="text-[10px] text-muted-foreground">Free help finding the right plan</p>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mb-3">
        If you don't qualify for Medicaid, you may be eligible for heavily subsidized marketplace insurance. Many people pay $0-$50/month after tax credits.
      </p>
      <div className="space-y-2">
        <a href="https://www.healthcare.gov/" target="_blank" rel="noopener noreferrer" className="block">
          <Button variant="outline" className="w-full gap-1.5 text-xs h-9">
            <ShieldCheck className="w-3.5 h-3.5" />
            Check plans on Healthcare.gov
            <ExternalLink className="w-3 h-3" />
          </Button>
        </a>
        {/* Replace with your GoHealth/SelectQuote/eHealth affiliate link */}
        <a href="https://www.healthcare.gov/find-assistance/" target="_blank" rel="noopener noreferrer" className="block">
          <Button variant="ghost" className="w-full gap-1.5 text-xs h-8">
            Find free local help with enrollment
            <ArrowRight className="w-3 h-3" />
          </Button>
        </a>
      </div>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  4. SPONSORED OFFERS — Internet, Phone, Discounts
//  Revenue: $5-50 per click / $1-5 CPM
// ═══════════════════════════════════════════════════════════════════════════

const DISCOUNT_OFFERS = [
  {
    icon: Wifi,
    title: "Discounted Internet — $30/month or less",
    description: "Low-income households may qualify for discounted broadband through the FCC's Lifeline program or carrier discount plans.",
    url: "https://www.fcc.gov/lifeline-consumers",
    badge: "Save $9-30/mo",
    color: "text-blue-500 bg-blue-500/10",
  },
  {
    icon: Smartphone,
    title: "Free Government Phone",
    description: "Lifeline program provides a free smartphone with talk, text, and data to qualifying households.",
    url: "https://www.lifelinesupport.org/",
    badge: "Free phone",
    color: "text-violet-500 bg-violet-500/10",
  },
  {
    icon: Gift,
    title: "Grocery & Retail Discounts",
    description: "Amazon Prime ($6.99/mo for EBT holders), Walmart+ ($6.47/mo for assistance recipients), free museum admission, and more.",
    links: [
      { name: "Amazon Prime discount", url: "https://www.amazon.com/58f8026f-0658-47d0-9752-f6fa2c69b2e2/qualify" },
      { name: "Walmart+ assist", url: "https://www.walmart.com/plus/assist" },
      { name: "Museums for All", url: "https://museums4all.org/" },
    ],
    badge: "50% off",
    color: "text-amber-500 bg-amber-500/10",
  },
];

export function DiscountOffersCard() {
  return (
    <Card className="p-5 border border-card-border" data-testid="card-discount-offers">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
          <Gift className="w-4 h-4 text-amber-500" />
        </div>
        <div>
          <p className="text-sm font-bold">Discounts you're eligible for</p>
          <p className="text-[10px] text-muted-foreground">Based on your benefit eligibility</p>
        </div>
      </div>
      <div className="space-y-3">
        {DISCOUNT_OFFERS.map((offer, i) => {
          const Icon = offer.icon;
          return (
            <div key={i} className="flex items-start gap-2.5">
              <div className={`w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 ${offer.color}`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <p className="text-xs font-bold">{offer.title}</p>
                  <Badge variant="secondary" className="text-[9px] h-3.5 px-1">{offer.badge}</Badge>
                </div>
                <p className="text-[10px] text-muted-foreground">{offer.description}</p>
                {'url' in offer && offer.url && (
                  <a href={offer.url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-primary hover:underline inline-flex items-center gap-0.5 mt-0.5">
                    Learn more <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                )}
                {'links' in offer && offer.links && (
                  <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
                    {offer.links.map((link, j) => (
                      <a key={j} href={link.url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-primary hover:underline inline-flex items-center gap-0.5">
                        {link.name} <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  5. FREE TRIAL CTA (replaces hard paywall)
//  Impact: 13x conversion improvement
// ═══════════════════════════════════════════════════════════════════════════

export function FreeTrialCard({ onStartTrial }: { onStartTrial: () => void }) {
  const [email, setEmail] = useState("");

  return (
    <Card className="p-5 border-2 border-primary/30 bg-gradient-to-br from-primary/[0.04] to-primary/[0.08] text-center" data-testid="card-free-trial">
      <Sparkles className="w-8 h-8 text-primary mx-auto mb-2" />
      <h3 className="text-base font-bold mb-1">Try it free for 7 days</h3>
      <p className="text-xs text-muted-foreground mb-4 max-w-sm mx-auto">
        See every program you qualify for, with dollar estimates and AI application guidance. Cancel anytime — no charge if you cancel within 7 days.
      </p>
      <div className="max-w-xs mx-auto space-y-2">
        <Input
          placeholder="Enter your email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="h-10 text-sm text-center"
          data-testid="input-trial-email"
        />
        <Button className="w-full gap-1.5 h-10" onClick={onStartTrial} data-testid="button-start-trial">
          Start free trial <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
      <p className="text-[10px] text-muted-foreground mt-2">
        Then $4.99/mo. Cancel anytime in settings.
      </p>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  SMART CARD RENDERER — shows the right cards based on results
// ═══════════════════════════════════════════════════════════════════════════

export function MonetizationSection({ results }: { results: ProgramResult[] }) {
  const likelyPrograms = results.filter(r => r.status === "likely");
  const programIds = likelyPrograms.map(r => r.program.id);
  const categories = [...new Set(likelyPrograms.map(r => r.program.category))];

  const showDisabilityCard = programIds.some(id =>
    id.includes("ssdi") || id.includes("ssi") || id.includes("disability")
  );
  const showTaxCard = categories.includes("Tax Credits") || programIds.some(id =>
    id.includes("eitc") || id.includes("ctc")
  );
  const showHealthCard = categories.includes("Healthcare") || programIds.some(id =>
    id.includes("medicaid") || id.includes("chip") || id.includes("medicare")
  );

  // Always show discount offers if they qualify for any income-based programs
  const showDiscounts = likelyPrograms.length > 0;

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
        Recommended next steps
      </h3>
      {showDisabilityCard && <DisabilityAttorneyCard />}
      {showTaxCard && <TaxPrepCard />}
      {showHealthCard && <HealthInsuranceCard />}
      {showDiscounts && <DiscountOffersCard />}
    </div>
  );
}
