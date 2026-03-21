import { useState, useCallback } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Gift,
  Copy,
  Check,
  Twitter,
  Facebook,
  MessageCircle,
  Smartphone,
  Users,
  DollarSign,
  Trophy,
  ArrowRight,
  Share2,
  Zap,
} from "lucide-react";
import { useAppState } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";

// ─── Share text templates ─────────────────────────────────────────────────────

const SHARE_TEXT =
  "I just found $1,400+ in benefits I wasn't claiming. YoureOwed scans 335 federal & state programs in minutes. Check what you're owed \u2192";

const SHARE_URL_BASE = "https://youreowed.org";

function buildReferralUrl(code: string) {
  return `${SHARE_URL_BASE}?ref=${code}`;
}

function buildShareText(code: string) {
  return `${SHARE_TEXT} ${buildReferralUrl(code)}`;
}

// ─── Social share helpers ─────────────────────────────────────────────────────

function openShareWindow(url: string) {
  window.open(url, "_blank", "width=600,height=500,noopener,noreferrer");
}

function shareOnTwitter(text: string) {
  openShareWindow(
    `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`
  );
}

function shareOnFacebook(url: string) {
  openShareWindow(
    `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(SHARE_TEXT)}`
  );
}

function shareOnWhatsApp(text: string) {
  openShareWindow(`https://wa.me/?text=${encodeURIComponent(text)}`);
}

function shareViaSMS(text: string) {
  window.location.href = `sms:?body=${encodeURIComponent(text)}`;
}

// ─── How it works steps ───────────────────────────────────────────────────────

const HOW_IT_WORKS = [
  {
    step: "1",
    title: "Share Your Link",
    description:
      "Send your unique referral link to friends, family, or on social media.",
    icon: Share2,
    color: "text-[#00E676]",
    bg: "bg-[#00E676]/10",
    border: "border-[#00E676]/20",
  },
  {
    step: "2",
    title: "Friend Signs Up",
    description:
      "When they subscribe to any YoureOwed plan using your link, you both get credit.",
    icon: Users,
    color: "text-blue-400",
    bg: "bg-blue-400/10",
    border: "border-blue-400/20",
  },
  {
    step: "3",
    title: "Both Get Rewarded",
    description:
      "You earn 1 month free. Your friend gets 1 month free. Everyone wins.",
    icon: Gift,
    color: "text-purple-400",
    bg: "bg-purple-400/10",
    border: "border-purple-400/20",
  },
];

// ─── Mock leaderboard data ────────────────────────────────────────────────────

const MOCK_LEADERBOARD = [
  { rank: 1, name: "Sarah M.", referrals: 14, earned: "$98" },
  { rank: 2, name: "James T.", referrals: 11, earned: "$77" },
  { rank: 3, name: "Priya K.", referrals: 9, earned: "$63" },
  { rank: 4, name: "Marcus L.", referrals: 7, earned: "$49" },
  { rank: 5, name: "Aisha B.", referrals: 5, earned: "$35" },
];

// ─── Copy button with feedback ────────────────────────────────────────────────

function CopyButton({ value, label = "Copy" }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast({ title: "Copied!", description: "Link copied to clipboard." });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "Couldn't copy", description: "Please copy manually.", variant: "destructive" });
    }
  }, [value, toast]);

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleCopy}
      className="gap-1.5 flex-shrink-0"
      data-testid="button-copy-referral-link"
    >
      {copied ? (
        <Check className="w-3.5 h-3.5 text-[#00E676]" />
      ) : (
        <Copy className="w-3.5 h-3.5" />
      )}
      {copied ? "Copied!" : label}
    </Button>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ReferralPage() {
  const { state } = useAppState();
  const referralCode = state.user?.referralCode ?? "BEN-SHARE";
  const referralUrl = buildReferralUrl(referralCode);
  const shareText = buildShareText(referralCode);

  const handleNativeShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Check what you're owed — YoureOwed",
          text: SHARE_TEXT,
          url: referralUrl,
        });
        return;
      } catch {
        // cancelled — fall through
      }
    }
    // Fallback: copy link
    try {
      await navigator.clipboard.writeText(shareText);
    } catch {
      // ignore
    }
  }, [referralUrl, shareText]);

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-6">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#00E676]/10 border border-[#00E676]/20 flex items-center justify-center flex-shrink-0">
          <Gift className="w-5 h-5 text-[#00E676]" />
        </div>
        <div>
          <h1 className="text-xl font-bold">Share &amp; Save</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Refer friends to YoureOwed. When they subscribe, you both get 1 month free.
          </p>
        </div>
      </div>

      {/* ── Referral Link ──────────────────────────────────────────────────── */}
      <Card className="p-5 border border-[#00E676]/20 bg-[#00E676]/[0.03]">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="w-4 h-4 text-[#00E676]" />
          <h2 className="text-sm font-semibold">Your Referral Link</h2>
          <Badge
            variant="outline"
            className="ml-auto text-[10px] px-1.5 h-4 border-[#00E676]/30 text-[#00E676]"
          >
            {referralCode}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Input
            readOnly
            value={referralUrl}
            className="text-sm font-mono bg-muted/40 border-border/60 focus:ring-[#00E676]/30 text-muted-foreground"
            data-testid="input-referral-url"
          />
          <CopyButton value={referralUrl} label="Copy Link" />
        </div>

        {/* Social share row */}
        <div className="flex items-center gap-2 mt-4 flex-wrap">
          <span className="text-xs text-muted-foreground mr-1">Share via:</span>

          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs h-8 border-sky-500/30 text-sky-400 hover:bg-sky-500/10 hover:text-sky-300"
            onClick={() => shareOnTwitter(shareText)}
            data-testid="button-share-twitter"
          >
            <Twitter className="w-3.5 h-3.5" />
            X / Twitter
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs h-8 border-blue-600/30 text-blue-400 hover:bg-blue-600/10 hover:text-blue-300"
            onClick={() => shareOnFacebook(referralUrl)}
            data-testid="button-share-facebook"
          >
            <Facebook className="w-3.5 h-3.5" />
            Facebook
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs h-8 border-green-600/30 text-green-400 hover:bg-green-600/10 hover:text-green-300"
            onClick={() => shareOnWhatsApp(shareText)}
            data-testid="button-share-whatsapp"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            WhatsApp
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs h-8"
            onClick={() => shareViaSMS(shareText)}
            data-testid="button-share-sms"
          >
            <Smartphone className="w-3.5 h-3.5" />
            SMS
          </Button>
        </div>

        {/* Native share on mobile */}
        <Button
          variant="ghost"
          size="sm"
          className="mt-3 w-full gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          onClick={handleNativeShare}
          data-testid="button-native-share"
        >
          <Share2 className="w-3.5 h-3.5" />
          Share more ways...
        </Button>
      </Card>

      {/* ── Stats ──────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="p-4 border border-border">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground font-medium">Referrals</span>
          </div>
          <p className="text-2xl font-bold">0</p>
          <p className="text-xs text-muted-foreground mt-0.5">friends joined</p>
        </Card>

        <Card className="p-4 border border-[#00E676]/20 bg-[#00E676]/[0.03]">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-4 h-4 text-[#00E676]" />
            <span className="text-xs text-[#00E676] font-medium">Credits Earned</span>
          </div>
          <p className="text-2xl font-bold text-[#00E676]">$0</p>
          <p className="text-xs text-muted-foreground mt-0.5">in free months</p>
        </Card>
      </div>

      {/* ── Rewards Explanation ────────────────────────────────────────────── */}
      <Card className="p-5 border border-border">
        <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
          <Gift className="w-4 h-4 text-[#00E676]" />
          How the Reward Works
        </h2>
        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-2.5">
            <div className="w-1.5 h-1.5 rounded-full bg-[#00E676] mt-1.5 flex-shrink-0" />
            <p className="text-foreground/80">
              Share your unique link with friends, family, or on social media.
            </p>
          </div>
          <div className="flex items-start gap-2.5">
            <div className="w-1.5 h-1.5 rounded-full bg-[#00E676] mt-1.5 flex-shrink-0" />
            <p className="text-foreground/80">
              When a friend signs up and subscribes to any plan using your link, you both receive{" "}
              <span className="font-semibold text-[#00E676]">1 month free</span>.
            </p>
          </div>
          <div className="flex items-start gap-2.5">
            <div className="w-1.5 h-1.5 rounded-full bg-[#00E676] mt-1.5 flex-shrink-0" />
            <p className="text-foreground/80">
              No limit — every successful referral earns you another free month.
            </p>
          </div>
        </div>
      </Card>

      {/* ── How It Works ──────────────────────────────────────────────────── */}
      <div>
        <h2 className="text-sm font-semibold mb-4 text-muted-foreground uppercase tracking-wide">
          How It Works
        </h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {HOW_IT_WORKS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <Card
                key={item.step}
                className={`p-4 border ${item.border} relative overflow-hidden`}
              >
                {/* Connector line for desktop */}
                {idx < HOW_IT_WORKS.length - 1 && (
                  <div className="hidden sm:block absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                    <ArrowRight className="w-4 h-4 text-muted-foreground/30" />
                  </div>
                )}
                <div className={`w-8 h-8 rounded-lg ${item.bg} border ${item.border} flex items-center justify-center mb-3`}>
                  <Icon className={`w-4 h-4 ${item.color}`} />
                </div>
                <div className={`text-xs font-bold mb-1 ${item.color}`}>
                  Step {item.step}
                </div>
                <h3 className="text-sm font-semibold mb-1">{item.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </Card>
            );
          })}
        </div>
      </div>

      {/* ── Top Referrers Leaderboard ──────────────────────────────────────── */}
      <Card className="p-5 border border-border">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-4 h-4 text-amber-400" />
          <h2 className="text-sm font-semibold">Top Referrers This Month</h2>
          <Badge variant="secondary" className="ml-auto text-[10px] h-4 px-1.5">
            Live
          </Badge>
        </div>

        <div className="space-y-2">
          {MOCK_LEADERBOARD.map((entry) => (
            <div
              key={entry.rank}
              className={`flex items-center gap-3 p-2.5 rounded-md ${
                entry.rank === 1
                  ? "bg-amber-500/10 border border-amber-500/20"
                  : "bg-muted/30 border border-border/40"
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  entry.rank === 1
                    ? "bg-amber-400 text-amber-950"
                    : entry.rank === 2
                    ? "bg-slate-400 text-slate-950"
                    : entry.rank === 3
                    ? "bg-amber-700 text-amber-100"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {entry.rank}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{entry.name}</p>
                <p className="text-xs text-muted-foreground">
                  {entry.referrals} referral{entry.referrals !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="text-sm font-semibold text-[#00E676]">
                {entry.earned}
              </div>
            </div>
          ))}
        </div>

        <p className="text-xs text-muted-foreground mt-3 text-center">
          Leaderboard resets the 1st of each month. Your position will appear once you make your first referral.
        </p>
      </Card>

      {/* ── CTA footer ─────────────────────────────────────────────────────── */}
      <div className="text-center pb-4">
        <p className="text-sm text-muted-foreground mb-3">
          Know someone who could be missing out on benefits?
        </p>
        <CopyButton value={referralUrl} label="Copy Your Link" />
      </div>
    </div>
  );
}
