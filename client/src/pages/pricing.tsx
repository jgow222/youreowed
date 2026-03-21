import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Check, X, Copy, Gift, Users, Sparkles, Shield, ChevronDown, ChevronUp } from "lucide-react";
import { useAppState } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";

const BASE_PRICE = 7; // $/month
const SETUP_FEE = 29;
const DISCOUNT_PER_USER = 0.25; // 25% discount per additional user
const REFERRAL_DISCOUNT = 0.15; // 15% off first 3 months

function PriceCalculator() {
  const [userCount, setUserCount] = useState(1);
  const [hasReferral, setHasReferral] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);

  const additionalUsers = Math.max(0, userCount - 1);
  const additionalUserRate = BASE_PRICE * (1 - DISCOUNT_PER_USER); // $12.75 each
  const monthlyBase = BASE_PRICE + additionalUsers * additionalUserRate;
  const referralSavings = hasReferral ? monthlyBase * REFERRAL_DISCOUNT : 0;
  const monthlyTotal = monthlyBase - referralSavings;
  const annualTotal = monthlyTotal * 12 + SETUP_FEE;
  const firstMonthTotal = monthlyTotal + SETUP_FEE;

  return (
    <Card className="p-5 border-2 border-primary/20 bg-primary/[0.02]">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold">Price Calculator</h3>
      </div>

      <div className="space-y-4">
        <div>
          <Label className="text-xs font-medium mb-1.5 block">How many people in your household?</Label>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="w-8 h-8 p-0" onClick={() => setUserCount(Math.max(1, userCount - 1))} data-testid="button-user-minus">-</Button>
            <span className="text-lg font-bold w-6 text-center">{userCount}</span>
            <Button variant="outline" size="sm" className="w-8 h-8 p-0" onClick={() => setUserCount(Math.min(10, userCount + 1))} data-testid="button-user-plus">+</Button>
            <span className="text-xs text-muted-foreground">
              {userCount === 1 ? "Just me" : `${userCount} people`}
            </span>
          </div>
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

        {/* Price Summary */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Base plan (1 user)</span>
            <span className="font-medium">${BASE_PRICE.toFixed(2)}/mo</span>
          </div>
          {additionalUsers > 0 && (
            <div className="flex justify-between text-sm">
              <span className="flex items-center gap-1">
                +{additionalUsers} additional user{additionalUsers > 1 ? "s" : ""}
                <Badge variant="secondary" className="h-4 text-[10px]">-25% each</Badge>
              </span>
              <span className="font-medium">${(additionalUsers * additionalUserRate).toFixed(2)}/mo</span>
            </div>
          )}
          {hasReferral && (
            <div className="flex justify-between text-sm text-emerald-600 dark:text-emerald-400">
              <span className="flex items-center gap-1">
                <Gift className="w-3 h-3" /> Referral discount (15%)
              </span>
              <span className="font-medium">-${referralSavings.toFixed(2)}/mo</span>
            </div>
          )}
          <Separator />
          <div className="flex justify-between text-base font-bold">
            <span>Monthly total</span>
            <span className="text-primary">${monthlyTotal.toFixed(2)}/mo</span>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>One-time setup fee</span>
            <span>${SETUP_FEE.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>First month total</span>
            <span className="font-medium">${firstMonthTotal.toFixed(2)}</span>
          </div>
        </div>

        <button
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
          onClick={() => setShowBreakdown(!showBreakdown)}
        >
          {showBreakdown ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          {showBreakdown ? "Hide" : "Show"} annual breakdown
        </button>

        {showBreakdown && (
          <div className="p-3 bg-muted/30 rounded-lg text-xs space-y-1">
            <div className="flex justify-between"><span>12 months x ${monthlyTotal.toFixed(2)}</span><span>${(monthlyTotal * 12).toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Setup fee</span><span>${SETUP_FEE.toFixed(2)}</span></div>
            <Separator className="my-1" />
            <div className="flex justify-between font-semibold"><span>Annual total</span><span>${annualTotal.toFixed(2)}</span></div>
            {hasReferral && (
              <p className="text-emerald-600 dark:text-emerald-400">Referral discount applies to first 3 months (saves ${(referralSavings * 3).toFixed(2)})</p>
            )}
          </div>
        )}

        <Button className="w-full" size="lg" data-testid="button-subscribe">
          Subscribe — ${firstMonthTotal.toFixed(2)} today
        </Button>
        <p className="text-[10px] text-muted-foreground text-center">
          Cancel anytime. 7-day money-back guarantee.
        </p>
      </div>
    </Card>
  );
}

export default function PricingPage() {
  const { state } = useAppState();
  const { toast } = useToast();
  const referralCode = state.user?.referralCode || "BEN-XXXX";

  const copyReferralCode = () => {
    navigator.clipboard?.writeText(referralCode).catch(() => {});
    toast({ title: "Referral code copied", description: referralCode });
  };

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      <div className="text-center max-w-lg mx-auto">
        <h1 className="text-xl font-bold">Simple, Transparent Pricing</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Get full access to benefit screening, AI guidance, and estimated dollar amounts. Add your whole household at a discount.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Free Tier */}
        <Card className="p-5 border border-card-border">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold">Free</h3>
              <p className="text-xs text-muted-foreground">Basic screening</p>
            </div>
            <p className="text-2xl font-bold">$0</p>
          </div>
          <ul className="space-y-2 text-sm mb-6">
            {[
              { text: "Basic eligibility screening", included: true },
              { text: "Federal programs only", included: true },
              { text: "Limited to 1 user", included: true },
              { text: "State-specific programs", included: false },
              { text: "Estimated dollar amounts", included: false },
              { text: "AI assistant", included: false },
              { text: "Policy news alerts", included: false },
              { text: "Household management", included: false },
            ].map((f, i) => (
              <li key={i} className="flex items-center gap-2">
                {f.included ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <X className="w-3.5 h-3.5 text-muted-foreground/40" />
                )}
                <span className={f.included ? "" : "text-muted-foreground/60"}>{f.text}</span>
              </li>
            ))}
          </ul>
          <Button variant="outline" className="w-full" disabled>Current Plan</Button>
        </Card>

        {/* Premium Tier */}
        <Card className="p-5 border-2 border-primary relative overflow-hidden">
          <Badge className="absolute top-3 right-3 bg-primary text-primary-foreground">Recommended</Badge>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold">Premium</h3>
              <p className="text-xs text-muted-foreground">Full platform access</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">${BASE_PRICE}<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
              <p className="text-[10px] text-muted-foreground">+${SETUP_FEE} setup</p>
            </div>
          </div>
          <ul className="space-y-2 text-sm mb-6">
            {[
              "Full eligibility screening (50+ programs)",
              "All state-specific programs",
              "Estimated dollar amounts per benefit",
              "AI benefits assistant (unlimited)",
              "Real-time policy news & alerts",
              "Household management (unlimited members)",
              "Priority support",
              "-25% per additional household user",
            ].map((f, i) => (
              <li key={i} className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
          <Button className="w-full" data-testid="button-upgrade-premium">Upgrade to Premium</Button>
        </Card>
      </div>

      {/* Price Calculator */}
      <PriceCalculator />

      {/* Referral Section */}
      <Card className="p-5 border border-card-border">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center flex-shrink-0">
            <Gift className="w-5 h-5 text-violet-600 dark:text-violet-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold mb-1">Share & Save</h3>
            <p className="text-xs text-muted-foreground mb-3">
              Share your referral link and both you and your friend get 15% off for the first 3 months.
              There's no limit on how many people you can refer.
            </p>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-muted/50 rounded-md px-3 py-2 text-sm font-mono">
                {referralCode}
              </div>
              <Button variant="outline" size="sm" className="gap-1.5 h-9" onClick={copyReferralCode} data-testid="button-copy-referral">
                <Copy className="w-3.5 h-3.5" /> Copy
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
