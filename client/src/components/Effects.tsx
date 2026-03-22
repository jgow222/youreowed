import { useEffect, useRef, useState, useCallback } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// 1. ParticleBackground
// Subtle animated floating green dots behind hero sections.
// ─────────────────────────────────────────────────────────────────────────────

interface Particle {
  id: number;
  x: number;        // % from left
  y: number;        // % from top (start)
  size: number;     // px
  duration: number; // seconds
  delay: number;    // seconds
  driftX: number;   // px horizontal drift
}

interface ParticleBackgroundProps {
  className?: string;
}

export function ParticleBackground({ className }: ParticleBackgroundProps) {
  const [particles] = useState<Particle[]>(() =>
    Array.from({ length: 18 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: 20 + Math.random() * 80, // start in lower 80% so they float into view
      size: 2 + Math.random() * 2,
      duration: 8 + Math.random() * 12,
      delay: Math.random() * 8,
      driftX: (Math.random() - 0.5) * 30,
    }))
  );

  return (
    <div
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className ?? ""}`}
      aria-hidden="true"
    >
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: "absolute",
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            borderRadius: "50%",
            backgroundColor: "#00E676",
            animationName: "particle-float",
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            animationTimingFunction: "linear",
            animationIterationCount: "infinite",
            animationFillMode: "both",
            transform: `translateX(${p.driftX}px)`,
          }}
        />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. TypewriterText
// Types out text character by character like a terminal.
// ─────────────────────────────────────────────────────────────────────────────

interface TypewriterTextProps {
  text: string;
  speed?: number;
  className?: string;
  onDone?: () => void;
}

export function TypewriterText({ text, speed = 40, className, onDone }: TypewriterTextProps) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(true);
  const indexRef = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cursorFadeRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    indexRef.current = 0;
    setDisplayed("");
    setDone(false);
    setCursorVisible(true);

    function typeNext() {
      if (indexRef.current < text.length) {
        indexRef.current++;
        setDisplayed(text.slice(0, indexRef.current));
        timeoutRef.current = setTimeout(typeNext, speed);
      } else {
        setDone(true);
        onDone?.();
        // Fade cursor after 2s
        cursorFadeRef.current = setTimeout(() => setCursorVisible(false), 2000);
      }
    }

    timeoutRef.current = setTimeout(typeNext, speed);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (cursorFadeRef.current) clearTimeout(cursorFadeRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, speed]);

  return (
    <span className={className}>
      {displayed}
      {cursorVisible && (
        <span
          style={{
            display: "inline-block",
            width: "2px",
            height: "1em",
            backgroundColor: "#00E676",
            marginLeft: "1px",
            verticalAlign: "text-bottom",
            animationName: done ? undefined : "blink-cursor",
            animationDuration: "1s",
            animationTimingFunction: "step-start",
            animationIterationCount: "infinite",
            transition: "opacity 0.5s ease",
            opacity: done ? 0 : 1,
          }}
          aria-hidden="true"
        />
      )}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. CountUpOnScroll
// Number that counts up from 0 when it enters the viewport.
// ─────────────────────────────────────────────────────────────────────────────

interface CountUpOnScrollProps {
  target: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  duration?: number;
}

export function CountUpOnScroll({
  target,
  prefix = "",
  suffix = "",
  className,
  duration = 1500,
}: CountUpOnScrollProps) {
  const [current, setCurrent] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const elementRef = useRef<HTMLSpanElement>(null);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const startCounting = useCallback(() => {
    if (hasStarted) return;
    setHasStarted(true);
    startTimeRef.current = null;

    function animate(timestamp: number) {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.round(eased * target));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    }

    rafRef.current = requestAnimationFrame(animate);
  }, [hasStarted, target, duration]);

  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          startCounting();
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [startCounting]);

  return (
    <span ref={elementRef} className={className}>
      {prefix}{current.toLocaleString()}{suffix}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. GlowingBorder
// Card wrapper with a rotating conic-gradient border.
// Uses a pseudo-element via an extra wrapper div approach.
// ─────────────────────────────────────────────────────────────────────────────

interface GlowingBorderProps {
  children: React.ReactNode;
  className?: string;
}

export function GlowingBorder({ children, className }: GlowingBorderProps) {
  const [angle, setAngle] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    function animate(timestamp: number) {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      // Full rotation every 3s
      setAngle((elapsed / 3000) * 360);
      rafRef.current = requestAnimationFrame(animate);
    }
    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const gradient = `conic-gradient(from ${angle}deg, #00E676, transparent 60%, transparent 70%, #00E676 100%)`;

  return (
    <div
      className={`relative ${className ?? ""}`}
      style={{ padding: "2px", borderRadius: "var(--radius, 0.625rem)" }}
    >
      {/* Rotating gradient border layer */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "inherit",
          background: gradient,
          zIndex: 0,
        }}
      />
      {/* Solid bg card sits on top, inset 2px to show border */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          borderRadius: "calc(var(--radius, 0.625rem) - 2px)",
          background: "hsl(var(--card))",
          height: "100%",
        }}
      >
        {children}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. RippleButton
// Button wrapper with Material-style ripple effect on click.
// ─────────────────────────────────────────────────────────────────────────────

interface RippleItem {
  id: number;
  x: number;
  y: number;
}

interface RippleButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function RippleButton({ children, className, onClick }: RippleButtonProps) {
  const [ripples, setRipples] = useState<RippleItem[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const id = Date.now() + Math.random();
      setRipples((prev) => [...prev, { id, x, y }]);
      // Remove ripple after animation completes (600ms)
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== id));
      }, 700);
      onClick?.();
    },
    [onClick]
  );

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden cursor-pointer ${className ?? ""}`}
      onClick={handleClick}
      style={{ display: "inline-block" }}
    >
      {children}
      {ripples.map((r) => (
        <span
          key={r.id}
          aria-hidden="true"
          style={{
            position: "absolute",
            left: r.x,
            top: r.y,
            width: "10px",
            height: "10px",
            marginLeft: "-5px",
            marginTop: "-5px",
            borderRadius: "50%",
            backgroundColor: "rgba(0, 230, 118, 0.3)",
            animationName: "ripple-expand",
            animationDuration: "0.7s",
            animationTimingFunction: "ease-out",
            animationFillMode: "forwards",
            pointerEvents: "none",
          }}
        />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. ScrollProgress
// Thin green progress bar fixed at top of page, based on scroll position.
// Only renders when content > 2x viewport height.
// ─────────────────────────────────────────────────────────────────────────────

interface ScrollProgressProps {
  className?: string;
}

export function ScrollProgress({ className: _className }: ScrollProgressProps) {
  const [progress, setProgress] = useState(0);
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    function checkHeight() {
      const docHeight = document.documentElement.scrollHeight;
      const winHeight = window.innerHeight;
      setShouldShow(docHeight > winHeight * 2);
    }

    function handleScroll() {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight;
      const winHeight = window.innerHeight;
      const scrollable = docHeight - winHeight;
      if (scrollable <= 0) {
        setProgress(0);
        return;
      }
      setProgress(Math.min((scrollTop / scrollable) * 100, 100));
    }

    checkHeight();
    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", checkHeight, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", checkHeight);
    };
  }, []);

  if (!shouldShow) return null;

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        height: "3px",
        width: `${progress}%`,
        backgroundColor: "#00E676",
        zIndex: 9999,
        transition: "width 80ms linear",
        boxShadow: "0 0 8px rgba(0, 230, 118, 0.5)",
        pointerEvents: "none",
      }}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. AnimatedGradientText
// Text with animated shifting gradient (green → teal → green).
// ─────────────────────────────────────────────────────────────────────────────

interface AnimatedGradientTextProps {
  children: React.ReactNode;
  className?: string;
}

export function AnimatedGradientText({ children, className }: AnimatedGradientTextProps) {
  return (
    <span className={`animated-gradient-text ${className ?? ""}`}>
      {children}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. PulsingDot
// Small pulsing green dot — "live" indicator.
// ─────────────────────────────────────────────────────────────────────────────

interface PulsingDotProps {
  className?: string;
}

export function PulsingDot({ className }: PulsingDotProps) {
  return (
    <span
      className={`pulsing-dot inline-block flex-shrink-0 ${className ?? ""}`}
      aria-label="Live"
      style={{
        width: "8px",
        height: "8px",
        borderRadius: "50%",
        backgroundColor: "#00E676",
        display: "inline-block",
        boxShadow: "0 0 6px rgba(0, 230, 118, 0.6)",
      }}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. HoverTilt
// 3D tilt effect toward mouse position on hover.
// ─────────────────────────────────────────────────────────────────────────────

interface HoverTiltProps {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
}

export function HoverTilt({ children, className, maxTilt = 5 }: HoverTiltProps) {
  const elRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState("perspective(600px) rotateX(0deg) rotateY(0deg)");

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const el = elRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);
      const rotY = dx * maxTilt;
      const rotX = -dy * maxTilt;
      setTransform(`perspective(600px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.01)`);
    },
    [maxTilt]
  );

  const handleMouseLeave = useCallback(() => {
    setTransform("perspective(600px) rotateX(0deg) rotateY(0deg) scale(1)");
  }, []);

  return (
    <div
      ref={elRef}
      className={className}
      style={{
        transform,
        transition: "transform 200ms cubic-bezier(0.23, 1, 0.32, 1)",
        transformStyle: "preserve-3d",
        willChange: "transform",
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  );
}
