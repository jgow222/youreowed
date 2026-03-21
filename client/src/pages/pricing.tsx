import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { PLANS, openCheckout, isStripeConfigured, redirectToPricing } from "@/lib/payments";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Check,
  X,
  Copy,
  Gift,
  Users,
  Sparkles,
  Shield,
  ChevronDown,
  ChevronUp,
  Crown,
  Building2,
  Mail,
  MessageSquare,
  HelpCircle,
  Zap,
  FileText,
  Bell,
  Headphones,
  LayoutDashboard,
  Share2,
} from "lucide-react";
import { useAppState } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";

const SETUP_FEE = 29;
const DISCOUNT_PER_USER = 0.25;
const REFERRAL_DISCOUNT = 0.15;

interface Tier {
  id: "free" | "basic" | "pro" | "family";
  name: string;
  tagline: string;
  monthlyPrice: number;
  annualPrice: number;
  setupFee: number;
  maxUsers: number | null;
  badge?: string;
  highlighted?: boolean;
  features: { text: string; included: boolean }[];
  cta: string;
  ctaVariant: "outline" | "default" | "secondary";
  disabled?: boolean;
}

const TIERS: Tier[] = [
  {
    id: "free",
    name: "Free",
    tagline: "Basic screening",
    monthlyPrice: 0,
    annualPrice: 0,
    setupFee: 0,
    maxUsers: 1,
    features: [
      { text: "Basic eligibility screening", included: true },
      { text: "Federal programs only", included: true },
      { text: "1 user", included: true },
      { text: "State-specific programs", included: false },
      { text: "Estimated dollar amounts", included: false },
      { text: "AI assistant", included: false },
      { text: "Policy news alerts", included: false },
      { text: "Application guides", included: false },
      { text: "AI-guided walkthroughs", included: false },
    ],
    cta: "Current Plan",
    ctaVariant: "outline",
    disabled: true,
  },
  {
    id: "basic",
    name: "Basic",
    tagline: "Full screening access",
    monthlyPrice: 7,
    annualPrice: 70,
    setupFee: SETUP_FEE,
    maxUsers: 1,
    features: [
      { text: "Full screening (335+ programs)", included: true },
      { text: "All state-specific programs", included: true },
      { text: "Estimated dollar amounts", included: true },
      { text: "AI assistant (5 questions/day)", included: true },
      { text: "Real-time policy news alerts", included: true },
      { text: "1 user", included: true },
      { text: "Application guides ($5 each)", included: true },
      { text: "AI-guided walkthroughs", included: false },
    ],
    cta: "Get Basic",
    ctaVariant: "default",
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "Everything + guidance",
    monthlyPrice: 19,
    annualPrice: 190,
    setupFee: SETUP_FEE,
    maxUsers: 3,
    badge: "Most Popular",
    highlighted: true,
    features: [
      { text: "Everything in Basic", included: true },
      { text: "Unlimited AI assistant", included: true },
      { text: "AI-guided walkthroughs (free)", included: true },
      { text: "Document checklists", included: true },
      { text: "Deadline reminders", included: true },
      { text: "Priority support", included: true },
      { text: "Up to 3 household members", included: true },
      { text: "-25% per additional user", included: true },
    ],
    cta: "Get Pro",
    ctaVariant: "default",
  },
  {
    id: "family",
    name: "Family",
    tagline: "Whole household covered",
    monthlyPrice: 29,
    annualPrice: 290,
    setupFee: SETUP_FEE,
    maxUsers: null,
    features: [
      { text: "Everything in Pro", included: true },
      { text: "Unlimited household members", included: true },
      { text: "Family-wide screening dashboard", included: true },
      { text: "Shared results across members", included: true },
      { text: "Dedicated support", included: true },
      { text: "AI-guided walkthroughs (free)", included: true },
      { text: "Document checklists", included: true },
      { text: "Deadline reminders", included: true },
    ],
    cta: "Get Family",
    ctaVariant: "default",
  },
];

function TierCard({ tier, isAnnual }: { tier: Tier; isAnnual: boolean }) {
  const { state, dispatch } = useAppState();
  const { toast } = useToast();
  const price = isAnnual ? tier.annualPrice : tier.monthlyPrice;
  const isFree = tier.id === "free";

  return (
    <Card
      className={`p-5 relative overflow-hidden flex flex-col ${
        tier.highlighted
          ? "border-2 border-primary shadow-lg"
          : "border border-card-border"
      }`}
    >
      {tier.badge && (
        <Badge className="absolute top-3 right-3 bg-primary text-primary-foreground">
          {tier.badge}
        </Badge>
      )}
      <div className="mb-4">
        <h3 className="text-base font-bold">{tier.name}</h3>
        <p className="text-xs text-muted-foreground">{tier.tagline}</p>
      </div>
      <div className="mb-4">
        {isFree ? (
          <p className="text-3xl font-bold">$0</p>
        ) : isAnnual ? (
          <div>
            <p className="text-3xl font-bold">
              ${tier.annualPrice}
              <span className="text-sm font-normal text-muted-foreground">
                /yr
              </span>
            </p>
            <p className="text-xs text-muted-foreground">
              ${(tier.annualPrice / 12).toFixed(2)}/mo &middot; Save $
              {tier.monthlyPrice * 12 - tier.annualPrice}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              +${tier.setupFee} one-time setup
            </p>
          </div>
        ) : (
          <div>
            <p className="text-3xl font-bold">
              ${tier.monthlyPrice}
              <span className="text-sm font-normal text-muted-foreground">
                /mo
              </span>
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              +${tier.setupFee} one-time setup
            </p>
          </div>
        )}
      </div>
      <ul className="space-y-2 text-sm mb-6 flex-1">
        {tier.features.map((f, i) => (
          <li key={i} className="flex items-start gap-2">
            {f.included ? (
              <Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
            ) : (
              <X className="w-3.5 h-3.5 text-muted-foreground/40 mt-0.5 flex-shrink-0" />
            )}
            <span className={f.included ? "" : "text-muted-foreground/60"}>
              {f.text}
            </span>
          </li>
        ))}
      </ul>
      <Button
        variant={tier.ctaVariant}
        className={`w-full ${tier.highlighted ? "bg-primary hover:bg-primary/90" : ""}`}
        disabled={tier.disabled}
        data-testid={`button-select-${tier.id}`}
        onClick={() => {
          if (tier.disabled) return;
          const plan = PLANS[tier.id];
          if (!plan) return;
          const link = isAnnual ? plan.stripeLinkAnnual : plan.stripeLinkMonthly;
          if (isStripeConfigured()) {
            openCheckout(link, { email: state.user?.email });
          } else {
            toast({ title: "Coming soon", description: "Payment processing is being set up. Check back shortly." });
          }
        }}
      >
        {tier.cta}
      </Button>
    </Card>
  );
}

function PriceCalculator() {
  const { state, dispatch } = useAppState();
  const { toast } = useToast();
  const [selectedTier, setSelectedTier] = useState<"basic" | "pro" | "family">(
    "pro"
  );
  const [userCount, setUserCount] = useState(1);
  const [hasReferral, setHasReferral] = useState(false);
  const [isAnnual, setIsAnnual] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);

  const tier = TIERS.find((t) => t.id === selectedTier)!;
  const baseMonthly = tier.monthlyPrice;
  const baseAnnualMonthly = tier.annualPrice / 12;

  const includedUsers =
    selectedTier === "family" ? Infinity : selectedTier === "pro" ? 3 : 1;
  const additionalUsers = Math.max(0, userCount - includedUsers);
  const additionalUserRate = baseMonthly * (1 - DISCOUNT_PER_USER);

  const monthlyBase = baseMonthly + additionalUsers * additionalUserRate;
  const annualMonthlyBase =
    baseAnnualMonthly + additionalUsers * (baseAnnualMonthly * (1 - DISCOUNT_PER_USER));

  const effectiveMonthly = isAnnual ? annualMonthlyBase : monthlyBase;
  const referralSavings = hasReferral
    ? effectiveMonthly * REFERRAL_DISCOUNT
    : 0;
  const monthlyTotal = effectiveMonthly - referralSavings;

  const annualTotal = isAnnual
    ? monthlyTotal * 12 + tier.setupFee
    : monthlyTotal * 12 + tier.setupFee;
  const firstPayment = isAnnual
    ? monthlyTotal * 12 + tier.setupFee
    : monthlyTotal + tier.setupFee;

  const maxUsers =
    selectedTier === "family" ? 10 : selectedTier === "pro" ? 6 : 3;

  return (
    <Card className="p-5 border-2 border-primary/20 bg-primary/[0.02]">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold">Price Calculator</h3>
      </div>

      <div className="space-y-4">
        <div>
          <Label className="text-xs font-medium mb-1.5 block">
            Select plan
          </Label>
          <Select
            value={selectedTier}
            onValueChange={(v) => {
              setSelectedTier(v as "basic" | "pro" | "family");
              setUserCount(1);
            }}
          >
            <SelectTrigger data-testid="select-calc-tier">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="basic">Basic — $7/mo</SelectItem>
              <SelectItem value="pro">Pro — $19/mo</SelectItem>
              <SelectItem value="family">Family — $29/mo</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs font-medium mb-1.5 block">
            Household members
          </Label>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="w-8 h-8 p-0"
              onClick={() => setUserCount(Math.max(1, userCount - 1))}
              data-testid="button-user-minus"
            >
              -
            </Button>
            <span className="text-lg font-bold w-6 text-center">
              {userCount}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="w-8 h-8 p-0"
              onClick={() => setUserCount(Math.min(maxUsers, userCount + 1))}
              data-testid="button-user-plus"
            >
              +
            </Button>
            <span className="text-xs text-muted-foreground">
              {userCount === 1
                ? "Just me"
                : `${userCount} people`}
              {selectedTier === "family" && " (unlimited)"}
            </span>
          </div>
          {additionalUsers > 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              {includedUsers} included + {additionalUsers} additional at -25%
              each
            </p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <Label className="text-xs font-medium">Annual billing (2 months free)</Label>
          <Switch
            checked={isAnnual}
            onCheckedChange={setIsAnnual}
            data-testid="switch-annual"
          />
        </div>

        <div className="flex items-center justify-between">
          <Label className="text-xs font-medium">Have a referral code?</Label>
          <Button
            variant={hasReferral ? "default" : "outline"}
            size="sm"
            className="h-7 text-xs gap-1"
            onClick={() => setHasReferral(!hasReferral)}
            data-testid="button-toggle-referral"
          >
            <Gift className="w-3 h-3" />
            {hasReferral ? "Applied" : "Add Referral"}
          </Button>
        </div>

        <Separator />

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>
              {tier.name} plan
              {isAnnual ? " (annual)" : " (monthly)"}
            </span>
            <span className="font-medium">
              {isAnnual
                ? `$${tier.annualPrice.toFixed(2)}/yr`
                : `$${baseMonthly.toFixed(2)}/mo`}
            </span>
          </div>
          {additionalUsers > 0 && (
            <div className="flex justify-between text-sm">
              <span className="flex items-center gap-1">
                +{additionalUsers} additional user
                {additionalUsers > 1 ? "s" : ""}
                <Badge variant="secondary" className="h-4 text-[10px]">
                  -25% each
                </Badge>
              </span>
              <span className="font-medium">
                {isAnnual
                  ? `$${(additionalUsers * baseAnnualMonthly * (1 - DISCOUNT_PER_USER) * 12).toFixed(2)}/yr`
                  : `$${(additionalUsers * additionalUserRate).toFixed(2)}/mo`}
              </span>
            </div>
          )}
          {hasReferral && (
            <div className="flex justify-between text-sm text-emerald-600 dark:text-emerald-400">
              <span className="flex items-center gap-1">
                <Gift className="w-3 h-3" /> Referral discount (15%)
              </span>
              <span className="font-medium">
                -${referralSavings.toFixed(2)}/mo
              </span>
            </div>
          )}
          <Separator />
          <div className="flex justify-between text-base font-bold">
            <span>Monthly total</span>
            <span className="text-primary">${monthlyTotal.toFixed(2)}/mo</span>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>One-time setup fee</span>
            <span>${tier.setupFee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>
              {isAnnual ? "First payment (annual + setup)" : "First month total"}
            </span>
            <span className="font-medium">${firstPayment.toFixed(2)}</span>
          </div>
          {isAnnual && (
            <div className="flex justify-between text-xs text-emerald-600 dark:text-emerald-400">
              <span>You save vs monthly</span>
              <span className="font-medium">
                ${(baseMonthly * 12 - tier.annualPrice).toFixed(2)}/yr
              </span>
            </div>
          )}
        </div>

        <button
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
          onClick={() => setShowBreakdown(!showBreakdown)}
        >
          {showBreakdown ? (
            <ChevronUp className="w-3 h-3" />
          ) : (
            <ChevronDown className="w-3 h-3" />
          )}
          {showBreakdown ? "Hide" : "Show"} annual breakdown
        </button>

        {showBreakdown && (
          <div className="p-3 bg-muted/30 rounded-lg text-xs space-y-1">
            <div className="flex justify-between">
              <span>
                12 months x ${monthlyTotal.toFixed(2)}
              </span>
              <span>${(monthlyTotal * 12).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Setup fee</span>
              <span>${tier.setupFee.toFixed(2)}</span>
            </div>
            <Separator className="my-1" />
            <div className="flex justify-between font-semibold">
              <span>Annual total</span>
              <span>${annualTotal.toFixed(2)}</span>
            </div>
            {hasReferral && (
              <p className="text-emerald-600 dark:text-emerald-400">
                Referral discount applies to first 3 months (saves $
                {(referralSavings * 3).toFixed(2)})
              </p>
            )}
          </div>
        )}

        <Button
          className="w-full"
          size="lg"
          data-testid="button-subscribe"
          onClick={() => {
            const plan = PLANS[selectedTier];
            if (!plan) return;
            const link = isAnnual ? plan.stripeLinkAnnual : plan.stripeLinkMonthly;
            if (isStripeConfigured()) {
              openCheckout(link, { email: state.user?.email });
            } else {
              toast({ title: "Coming soon", description: "Payment processing is being set up. Check back shortly." });
            }
          }}
        >
          Subscribe — ${firstPayment.toFixed(2)} today
        </Button>
        <p className="text-[10px] text-muted-foreground text-center">
          Cancel anytime. 7-day money-back guarantee.
        </p>
      </div>
    </Card>
  );
}

const FAQ_ITEMS = [
  {
    q: "Can I cancel anytime?",
    a: "Yes, cancel with one click from your account settings. No cancellation fees, no hoops to jump through. Your access continues until the end of your billing period.",
  },
  {
    q: "Is my information secure?",
    a: "Yes, all screening happens in your browser. We never store your income, health, or household data on our servers. Your answers are processed locally and never shared with third parties.",
  },
  {
    q: "How accurate are the results?",
    a: "Our screening is 85-90% accurate for directional guidance. We use real federal and state eligibility rules updated regularly. Results are not a guarantee of benefits — official applications determine final eligibility.",
  },
  {
    q: "What happens after I subscribe?",
    a: "You get instant access to all 335+ programs, estimated dollar amounts for every benefit, and the AI assistant to help you understand your options and next steps.",
  },
  {
    q: "Do you offer refunds?",
    a: "Yes — we offer a 7-day money-back guarantee. If you're not satisfied within your first week, contact support for a full refund of your subscription. The setup fee is non-refundable.",
  },
];

function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <HelpCircle className="w-4 h-4 text-muted-foreground" />
        <h2 className="text-base font-bold">Frequently Asked Questions</h2>
      </div>
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
              <p className="text-sm text-muted-foreground">{item.a}</p>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}

export default function PricingPage() {
  const { state } = useAppState();
  const { toast } = useToast();
  const [isAnnual, setIsAnnual] = useState(false);
  const referralCode = state.user?.referralCode || "BEN-XXXX";
  const referralLink = `youreowed.org?ref=${referralCode}`;

  const copyReferralCode = () => {
    navigator.clipboard?.writeText(referralLink).catch(() => {});
    toast({ title: "Referral link copied!", description: referralLink });
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent(
      "Check out YoureOwed — find benefits you're missing"
    );
    const body = encodeURIComponent(
      `I've been using YoureOwed to find government benefits I qualify for. Use my referral link and we both get 15% off:\n\nhttps://${referralLink}`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`, "_blank");
  };

  const shareViaText = () => {
    const body = encodeURIComponent(
      `Check out YoureOwed — I found benefits I didn't know about! Use my link and we both save 15%: https://${referralLink}`
    );
    window.open(`sms:?body=${body}`, "_blank");
  };

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center max-w-lg mx-auto">
        <h1 className="text-xl font-bold">Simple, Transparent Pricing</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Screen for 335+ federal and state programs. Find benefits you're
          missing and get dollar estimates on what you could receive.
        </p>
      </div>

      {/* Billing toggle */}
      <div className="flex items-center justify-center gap-3">
        <span
          className={`text-sm ${!isAnnual ? "font-semibold" : "text-muted-foreground"}`}
        >
          Monthly
        </span>
        <Switch
          checked={isAnnual}
          onCheckedChange={setIsAnnual}
          data-testid="switch-billing-toggle"
        />
        <span
          className={`text-sm ${isAnnual ? "font-semibold" : "text-muted-foreground"}`}
        >
          Annual
        </span>
        {isAnnual && (
          <Badge
            variant="secondary"
            className="text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950"
          >
            2 months free
          </Badge>
        )}
      </div>

      {/* Tier cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {TIERS.map((tier) => (
          <TierCard key={tier.id} tier={tier} isAnnual={isAnnual} />
        ))}
      </div>

      {/* Multi-user discount note */}
      <div className="text-center">
        <p className="text-xs text-muted-foreground flex items-center justify-center gap-1.5">
          <Users className="w-3.5 h-3.5" />
          Pro &amp; Family plans support multiple household members. Additional
          users get 25% off.
        </p>
      </div>

      {/* Price Calculator */}
      <PriceCalculator />

      {/* Referral Section */}
      <Card className="p-5 border-2 border-violet-200 dark:border-violet-800 bg-violet-50/50 dark:bg-violet-950/20">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center flex-shrink-0">
            <Gift className="w-5 h-5 text-violet-600 dark:text-violet-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold mb-0.5">
              Earn $5 Credit for Every Friend Who Subscribes
            </h3>
            <p className="text-xs text-muted-foreground mb-3">
              Share your referral link and both you and your friend get 15% off
              for the first 3 months. There's no limit on how many people you
              can refer.
            </p>

            <div className="space-y-3">
              <div>
                <Label className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1 block">
                  Your referral link
                </Label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-background rounded-md px-3 py-2 text-sm font-mono border">
                    {referralLink}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 h-9"
                    onClick={copyReferralCode}
                    data-testid="button-copy-referral"
                  >
                    <Copy className="w-3.5 h-3.5" /> Copy
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 h-8 text-xs"
                  onClick={shareViaText}
                  data-testid="button-share-text"
                >
                  <MessageSquare className="w-3 h-3" /> Share via text
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 h-8 text-xs"
                  onClick={shareViaEmail}
                  data-testid="button-share-email"
                >
                  <Mail className="w-3 h-3" /> Share via email
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Enterprise / B2B Section */}
      <Card className="p-6 border-2 border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex flex-col md:flex-row md:items-start gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              <h2 className="text-base font-bold">For Organizations</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              White-label our screening tool for your nonprofit, hospital, or
              agency. Help your clients discover every benefit they qualify for.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
              {[
                { icon: Zap, text: "API access" },
                { icon: Crown, text: "Custom branding" },
                { icon: Users, text: "Bulk screening" },
                { icon: LayoutDashboard, text: "Analytics dashboard" },
                { icon: Shield, text: "HIPAA-compliant" },
                { icon: Headphones, text: "Dedicated support" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <item.icon className="w-3.5 h-3.5 text-slate-500" />
                  <span>{item.text}</span>
                </div>
              ))}
            </div>

            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-xl font-bold">Starting at $199</span>
              <span className="text-sm text-muted-foreground">/month</span>
            </div>

            <Button
              size="lg"
              variant="outline"
              className="gap-2"
              onClick={() =>
                window.open("mailto:sales@youreowed.org", "_blank")
              }
              data-testid="button-contact-sales"
            >
              <Mail className="w-4 h-4" />
              Contact Sales
            </Button>
          </div>

          <div className="md:w-64 p-4 rounded-lg bg-background border border-card-border text-center">
            <Shield className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              Trusted by nonprofits, hospitals, and community organizations
              nationwide
            </p>
          </div>
        </div>
      </Card>

      {/* FAQ */}
      <FAQSection />

      {/* Bottom CTA */}
      <div className="text-center pb-4">
        <p className="text-xs text-muted-foreground">
          Questions? Reach us at{" "}
          <a
            href="mailto:support@youreowed.org"
            className="text-primary hover:underline"
          >
            support@youreowed.org
          </a>
        </p>
      </div>
    </div>
  );
}
