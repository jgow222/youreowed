/**
 * LanguageSwitcher
 * A compact EN | ES toggle that lives in the top navigation bar,
 * next to the theme toggle. Uses the i18n context from @/lib/i18n.
 */

import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLocale, type Locale } from "@/lib/i18n";

// ─── Types ────────────────────────────────────────────────────────────────────

interface LanguageOption {
  code: Locale;
  label: string;
  shortLabel: string;
}

const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: "en", label: "English", shortLabel: "EN" },
  { code: "es", label: "Español", shortLabel: "ES" },
];

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Compact language switcher with a globe icon and EN | ES labels.
 * Renders as a dropdown menu for extensibility (additional locales later).
 */
export function LanguageSwitcher() {
  const [locale, setLocale] = useLocale();

  const current = LANGUAGE_OPTIONS.find((opt) => opt.code === locale) ?? LANGUAGE_OPTIONS[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5 px-2 text-xs font-medium text-muted-foreground hover:text-foreground"
          aria-label="Switch language"
          data-testid="button-language-switcher"
        >
          <Globe className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{current.shortLabel}</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="min-w-[120px]">
        {LANGUAGE_OPTIONS.map((option) => (
          <DropdownMenuItem
            key={option.code}
            className={`flex items-center gap-2 text-sm cursor-pointer ${
              option.code === locale
                ? "font-semibold text-foreground"
                : "text-muted-foreground"
            }`}
            onClick={() => setLocale(option.code)}
            data-testid={`language-option-${option.code}`}
          >
            <span className="w-6 text-xs font-mono text-muted-foreground">
              {option.shortLabel}
            </span>
            <span>{option.label}</span>
            {option.code === locale && (
              <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ─── Inline toggle variant (alternative compact style) ────────────────────────

/**
 * Ultra-compact inline toggle showing "EN | ES" as a button pair.
 * Alternative to the dropdown — use whichever fits the top bar better.
 */
export function LanguageToggle() {
  const [locale, setLocale] = useLocale();

  return (
    <div
      className="flex items-center gap-0.5 h-8"
      role="group"
      aria-label="Language selection"
    >
      <Globe className="w-3.5 h-3.5 text-muted-foreground mr-1" />
      {LANGUAGE_OPTIONS.map((option, index) => (
        <span key={option.code} className="flex items-center">
          <button
            onClick={() => setLocale(option.code)}
            data-testid={`language-toggle-${option.code}`}
            aria-pressed={option.code === locale}
            className={`text-xs font-medium px-1 py-0.5 rounded transition-colors ${
              option.code === locale
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {option.shortLabel}
          </button>
          {index < LANGUAGE_OPTIONS.length - 1 && (
            <span className="text-muted-foreground/40 text-xs px-0.5">|</span>
          )}
        </span>
      ))}
    </div>
  );
}

export default LanguageSwitcher;
