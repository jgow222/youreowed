import { useEffect, useRef, useState, useCallback } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

// ─────────────────────────────────────────────────────────────────────────────
// 1. ExitIntentPopup
// Tracks mouse toward top of browser tab (exit intent) or 30s inactivity on
// mobile. Shows once per session for non-logged-in users only.
// ─────────────────────────────────────────────────────────────────────────────

interface ExitIntentPopupProps {
  isLoggedIn: boolean;
}

export function ExitIntentPopup({ isLoggedIn }: ExitIntentPopupProps) {
  const [visible, setVisible] = useState(false);
  const hasShownRef = useRef(false);
  const inactivityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback(() => {
    if (hasShownRef.current || isLoggedIn) return;
    hasShownRef.current = true;
    setVisible(true);
  }, [isLoggedIn]);

  const dismiss = useCallback(() => {
    setVisible(false);
  }, []);

  useEffect(() => {
    if (isLoggedIn) return;

    const isMobile =
      typeof window !== "undefined" &&
      /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);

    if (isMobile) {
      // Mobile: show after 30 seconds of inactivity
      const resetTimer = () => {
        if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
        if (hasShownRef.current) return;
        inactivityTimerRef.current = setTimeout(show, 30_000);
      };

      const events = ["touchstart", "touchmove", "scroll", "keydown"];
      events.forEach((e) => window.addEventListener(e, resetTimer, { passive: true }));
      resetTimer();

      return () => {
        events.forEach((e) => window.removeEventListener(e, resetTimer));
        if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
      };
    } else {
      // Desktop: exit-intent via mouse moving above y=5
      const handleMouseMove = (e: MouseEvent) => {
        if (e.clientY < 5) {
          show();
        }
      };

      document.addEventListener("mousemove", handleMouseMove);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
      };
    }
  }, [isLoggedIn, show]);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center p-4"
      style={{
        backgroundColor: "rgba(0,0,0,0.75)",
        backdropFilter: "blur(4px)",
        animation: "fade-in 0.2s ease",
      }}
      onClick={dismiss}
    >
      <div
        className="relative w-full max-w-sm rounded-2xl border border-border bg-card shadow-2xl p-6 text-center"
        style={{ animation: "slide-in-bottom 0.3s ease" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Dismiss */}
        <button
          className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors text-lg"
          onClick={dismiss}
          aria-label="Dismiss"
        >
          ×
        </button>

        {/* Icon */}
        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">💰</span>
        </div>

        {/* Headline */}
        <h2 className="text-lg font-black tracking-tight mb-2 leading-tight">
          Wait — you might be leaving{" "}
          <span className="text-primary">thousands on the table</span>
        </h2>
        <p className="text-sm text-muted-foreground mb-5">
          The average household qualifies for $5,000–$50,000+ per year in
          government benefits they never claim. Takes 2 minutes to find yours.
        </p>

        {/* CTA */}
        <Link href="/screener" onClick={dismiss}>
          <Button
            size="lg"
            className="w-full gap-2 font-bold text-base h-12"
            style={{ background: "#00E676", color: "#000" }}
          >
            Check What You're Owed →
          </Button>
        </Link>

        {/* No thanks */}
        <button
          className="mt-3 text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
          onClick={dismiss}
        >
          No thanks, I don't want to find free money
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. SocialProofToast
// Shows rotating "proof" messages every 15-20 seconds in bottom-left corner.
// Slides in, stays 4s, slides out.
// ─────────────────────────────────────────────────────────────────────────────

const SOCIAL_PROOF_MESSAGES = [
  "Maria from Florida just found $8,200 in benefits",
  "James from Texas qualified for 12 programs",
  "A family in Ohio just saved $14,400/year",
  "Someone from California just started screening",
  "David from New York unlocked $6,800 in benefits",
  "Sarah from Michigan found 9 new programs",
  "Robert from Georgia qualified for $11,500/year",
  "Linda from Arizona unlocked $7,300 in benefits",
  "A family in Illinois saved $19,200/year",
  "Carlos from Nevada found $5,600 in benefits",
  "Patricia from Washington qualified for 14 programs",
  "A household in Pennsylvania found $22,800/year",
  "Michael from Colorado unlocked $9,100 in benefits",
  "Jennifer from Missouri found 11 programs",
  "A senior in Tennessee qualified for $6,400/year",
];

interface SocialProofToastProps {
  show: boolean;
}

export function SocialProofToast({ show }: SocialProofToastProps) {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const msgIndexRef = useRef(0);

  const scheduleNext = useCallback(() => {
    if (dismissed) return;
    const delay = 15_000 + Math.random() * 5_000; // 15-20s
    timeoutRef.current = setTimeout(() => {
      // Cycle to next message
      msgIndexRef.current = (msgIndexRef.current + 1) % SOCIAL_PROOF_MESSAGES.length;
      setMessageIndex(msgIndexRef.current);
      setExiting(false);
      setVisible(true);

      // Auto-hide after 4s
      timeoutRef.current = setTimeout(() => {
        setExiting(true);
        timeoutRef.current = setTimeout(() => {
          setVisible(false);
          scheduleNext();
        }, 400);
      }, 4_000);
    }, delay);
  }, [dismissed]);

  useEffect(() => {
    if (!show || dismissed) return;

    // Show first toast after initial delay of 5s
    timeoutRef.current = setTimeout(() => {
      setExiting(false);
      setVisible(true);

      timeoutRef.current = setTimeout(() => {
        setExiting(true);
        timeoutRef.current = setTimeout(() => {
          setVisible(false);
          scheduleNext();
        }, 400);
      }, 4_000);
    }, 5_000);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [show, dismissed, scheduleNext]);

  const handleDismiss = () => {
    setDismissed(true);
    setExiting(true);
    setTimeout(() => setVisible(false), 400);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  if (!show || !visible) return null;

  return (
    <div
      className="fixed bottom-4 left-4 z-50 max-w-72 rounded-xl border border-border bg-card shadow-lg px-3 py-2.5 flex items-start gap-2"
      style={{
        animation: exiting
          ? "slide-out-bottom 0.4s ease forwards"
          : "slide-in-bottom 0.4s ease",
      }}
    >
      {/* Green dot */}
      <div
        className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1"
        style={{ boxShadow: "0 0 6px #00E676" }}
      />
      <p className="text-xs text-foreground/90 leading-snug flex-1">
        {SOCIAL_PROOF_MESSAGES[messageIndex]}
      </p>
      <button
        className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0 text-sm leading-none"
        onClick={handleDismiss}
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. StickyUpgradeCTA
// Slides up from bottom when scrolled past threshold / show=true.
// Slim bar, dismissable for session.
// ─────────────────────────────────────────────────────────────────────────────

interface StickyUpgradeCTAProps {
  show: boolean;
  programCount?: number;
  onSubscribe?: () => void;
}

export function StickyUpgradeCTA({
  show,
  programCount = 0,
  onSubscribe,
}: StickyUpgradeCTAProps) {
  const [dismissed, setDismissed] = useState(false);
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (show && !dismissed) {
      setExiting(false);
      setVisible(true);
    } else if (!show && visible) {
      setExiting(true);
      const t = setTimeout(() => setVisible(false), 400);
      return () => clearTimeout(t);
    }
  }, [show, dismissed]);

  const handleDismiss = () => {
    setDismissed(true);
    setExiting(true);
    setTimeout(() => setVisible(false), 400);
  };

  if (!visible || dismissed) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40 h-14 bg-card border-t border-border flex items-center justify-between px-4 gap-3"
      style={{
        animation: exiting
          ? "slide-out-bottom 0.4s ease forwards"
          : "slide-in-bottom 0.35s ease",
      }}
    >
      <p className="text-sm font-medium truncate">
        Unlock all{" "}
        <span className="text-primary font-bold">
          {programCount > 0 ? programCount : "your"} programs
        </span>{" "}
        for{" "}
        <span className="text-primary font-bold">$4.99/mo</span>
      </p>
      <div className="flex items-center gap-2 flex-shrink-0">
        <Button
          size="sm"
          className="h-8 text-xs px-3 font-bold gap-1"
          onClick={onSubscribe}
        >
          Subscribe
        </Button>
        <button
          className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          onClick={handleDismiss}
          aria-label="Dismiss"
        >
          ×
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. ConfettiExplosion
// Pure CSS/JS confetti — 50-80 particles burst upward then fall.
// Renders as fixed overlay with pointer-events: none.
// ─────────────────────────────────────────────────────────────────────────────

const CONFETTI_COLORS = ["#00E676", "#FFD700", "#4FC3F7", "#FF8A65"];

interface ConfettiParticle {
  id: number;
  x: number; // vw %
  color: string;
  size: number;
  shape: "circle" | "rect";
  delay: number;
  duration: number;
  driftX: number; // px horizontal drift
  startY: number; // vh % from top
}

interface ConfettiExplosionProps {
  trigger: boolean;
}

export function ConfettiExplosion({ trigger }: ConfettiExplosionProps) {
  const [particles, setParticles] = useState<ConfettiParticle[]>([]);
  const prevTrigger = useRef(false);

  useEffect(() => {
    if (trigger && !prevTrigger.current) {
      // Generate 60 particles
      const count = 50 + Math.floor(Math.random() * 30);
      const newParticles: ConfettiParticle[] = Array.from({ length: count }, (_, i) => ({
        id: Date.now() + i,
        x: 10 + Math.random() * 80, // spread across width
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        size: 4 + Math.random() * 6,
        shape: Math.random() > 0.5 ? "circle" : "rect",
        delay: Math.random() * 0.5,
        duration: 2 + Math.random() * 1,
        driftX: (Math.random() - 0.5) * 120,
        startY: 20 + Math.random() * 40, // start in upper-mid screen
      }));
      setParticles(newParticles);

      // Clean up after animations finish
      const t = setTimeout(() => setParticles([]), 4_000);
      return () => clearTimeout(t);
    }
    prevTrigger.current = trigger;
  }, [trigger]);

  if (particles.length === 0) return null;

  return (
    <div
      className="fixed inset-0 z-[998]"
      style={{ pointerEvents: "none" }}
      aria-hidden="true"
    >
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: "absolute",
            left: `${p.x}vw`,
            top: `${p.startY}vh`,
            width: p.shape === "circle" ? `${p.size}px` : `${p.size * 0.7}px`,
            height: p.shape === "circle" ? `${p.size}px` : `${p.size * 1.5}px`,
            borderRadius: p.shape === "circle" ? "50%" : "2px",
            backgroundColor: p.color,
            animationName: "confetti-fall",
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            animationTimingFunction: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
            animationFillMode: "both",
            transform: `translateX(${p.driftX}px)`,
            opacity: 1,
          }}
        />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. PulseCTA
// Adds a green glow ring pulse to children. Runs 3 times then stops.
// ─────────────────────────────────────────────────────────────────────────────

interface PulseCTAProps {
  active: boolean;
  children: React.ReactNode;
  className?: string;
}

export function PulseCTA({ active, children, className }: PulseCTAProps) {
  return (
    <span
      className={className}
      style={{
        display: "inline-block",
        position: "relative",
        borderRadius: "inherit",
        animationName: active ? "pulse-glow" : undefined,
        animationDuration: "2s",
        animationTimingFunction: "ease-out",
        animationIterationCount: "3",
        animationFillMode: "both",
      }}
    >
      {children}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. CardHoverEffect
// Wrapper that adds hover lift + subtle green glow on hover.
// ─────────────────────────────────────────────────────────────────────────────

interface CardHoverEffectProps {
  children: React.ReactNode;
  className?: string;
}

export function CardHoverEffect({ children, className }: CardHoverEffectProps) {
  return (
    <div className={`card-hover-lift ${className ?? ""}`}>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. AnimatedCheckmark
// SVG checkmark that draws itself in. Circle first (0.3s), then check (0.3s).
// Triggers on mount.
// ─────────────────────────────────────────────────────────────────────────────

interface AnimatedCheckmarkProps {
  size?: number;
}

export function AnimatedCheckmark({ size = 48 }: AnimatedCheckmarkProps) {
  // Circle circumference for r=23: 2π×23 ≈ 144.51 → use 145
  // Check path length is approximately 50
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 52 52"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Circle */}
      <circle
        cx="26"
        cy="26"
        r="23"
        stroke="#00E676"
        strokeWidth="2.5"
        fill="none"
        strokeDasharray="145"
        strokeDashoffset="145"
        strokeLinecap="round"
        style={{
          animationName: "draw-circle",
          animationDuration: "0.4s",
          animationTimingFunction: "ease-out",
          animationFillMode: "forwards",
          animationDelay: "0s",
        }}
      />
      {/* Checkmark */}
      <polyline
        points="14,27 22,35 38,19"
        stroke="#00E676"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="50"
        strokeDashoffset="50"
        style={{
          animationName: "draw-check",
          animationDuration: "0.3s",
          animationTimingFunction: "ease-out",
          animationFillMode: "forwards",
          animationDelay: "0.4s",
        }}
      />
    </svg>
  );
}
