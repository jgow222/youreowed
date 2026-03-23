import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Trigger fade-in after mount
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center bg-background px-6"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(16px)",
        transition: "opacity 0.5s ease, transform 0.5s ease",
      }}
    >
      {/* YO Logo mark */}
      <div className="mb-6">
        <svg
          width="56"
          height="56"
          viewBox="0 0 56 56"
          fill="none"
          aria-label="YoureOwed logo"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer ring */}
          <circle cx="28" cy="28" r="26" stroke="#00E676" strokeWidth="2.5" />
          {/* Dollar sign stem */}
          <line x1="28" y1="12" x2="28" y2="44" stroke="#00E676" strokeWidth="2.5" strokeLinecap="round" />
          {/* Top arc */}
          <path
            d="M20 19 C20 19 20 14 28 14 C36 14 36 19 36 22 C36 25 34 27 28 28"
            stroke="#00E676"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
          {/* Bottom arc */}
          <path
            d="M36 37 C36 37 36 42 28 42 C20 42 20 37 20 34 C20 31 22 29 28 28"
            stroke="#00E676"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      </div>

      {/* Big 404 */}
      <div
        className="text-8xl md:text-9xl font-black tracking-tight mb-4 select-none"
        style={{ color: "hsl(var(--muted-foreground) / 0.18)" }}
        aria-hidden="true"
      >
        404
      </div>

      {/* Heading */}
      <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3 text-center">
        Page not found
      </h1>

      {/* Subtext */}
      <p className="text-sm md:text-base text-muted-foreground text-center max-w-md mb-8 leading-relaxed">
        Let's get you back on track. You might be here by accident — or maybe
        you're looking for the benefits you're owed.
      </p>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 mb-12 w-full max-w-xs sm:max-w-none sm:w-auto">
        <Button
          size="lg"
          className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-8 gap-2"
          onClick={() => (window.location.hash = "/screener")}
        >
          Check My Benefits
          <span aria-hidden="true">→</span>
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="px-8"
          onClick={() => (window.location.hash = "/")}
        >
          Go Home
        </Button>
      </div>

      {/* Fun stat */}
      <div
        className="rounded-xl border border-border bg-card px-5 py-4 max-w-md text-center"
        style={{ borderColor: "hsl(var(--border))" }}
      >
        <p className="text-xs text-muted-foreground leading-relaxed">
          <span className="font-semibold text-primary">While you're here</span> — did you
          know the average household misses{" "}
          <span className="font-semibold text-foreground">$5,000–$50,000</span> per year in
          government benefits?
        </p>
      </div>
    </div>
  );
}
