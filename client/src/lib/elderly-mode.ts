// ─── Elderly Mode (Easy Mode) utilities ─────────────────────────────────────
// Provides a hook and CSS class helpers to scale up UI elements when
// elderlyMode is active. Components consume these instead of hard-coding sizes.

import { useAppState } from "@/lib/store";

// ─── Size constants ──────────────────────────────────────────────────────────

/** Body text size in elderly mode (vs default text-sm) */
export const ELDERLY_TEXT_SIZE = "text-lg";

/** Heading size in elderly mode (vs default text-xl) */
export const ELDERLY_HEADING_SIZE = "text-2xl";

/** Button size in elderly mode (vs default shadcn h-9 px-4) */
export const ELDERLY_BUTTON_SIZE = "h-14 text-lg px-8";

/** Input height/size in elderly mode (vs default h-9 text-sm) */
export const ELDERLY_INPUT_SIZE = "h-14 text-lg";

/** Card padding in elderly mode (vs default p-4 or p-5) */
export const ELDERLY_CARD_PADDING = "p-8";

// ─── Hook ────────────────────────────────────────────────────────────────────

/**
 * Returns whether Easy Mode is currently active.
 *
 * @example
 * const { isElderlyMode } = useElderlyMode();
 * <p className={isElderlyMode ? ELDERLY_TEXT_SIZE : "text-sm"}>…</p>
 */
export function useElderlyMode() {
  const { state } = useAppState();
  return {
    isElderlyMode: state.elderlyMode,
  };
}

// ─── CSS class helpers ────────────────────────────────────────────────────────

/**
 * Returns text size classes scaled for elderly mode.
 * @param base - The normal (non-elderly) class string to fall back to
 *
 * @example
 * <p className={elderlyText("text-sm text-muted-foreground")}>…</p>
 * // → "text-lg text-muted-foreground"  (in elderly mode)
 * // → "text-sm text-muted-foreground"  (normal mode)
 */
export function elderlyText(base: string, isElderlyMode: boolean): string {
  if (!isElderlyMode) return base;
  // Swap common text-size tokens for larger equivalents
  return base
    .replace(/\btext-xs\b/g, "text-base")
    .replace(/\btext-sm\b/g, ELDERLY_TEXT_SIZE)
    .replace(/\btext-base\b/g, "text-xl")
    .replace(/\btext-xl\b/g, ELDERLY_HEADING_SIZE)
    .replace(/\btext-2xl\b/g, "text-3xl");
}

/**
 * Returns button size classes scaled for elderly mode.
 * @param base - The normal class string to augment
 *
 * @example
 * <Button className={elderlyButton("w-full")}>…</Button>
 * // → "w-full h-14 text-lg px-8"  (in elderly mode)
 * // → "w-full"                     (normal mode)
 */
export function elderlyButton(base: string, isElderlyMode: boolean): string {
  if (!isElderlyMode) return base;
  // Strip existing h-* and text-* size tokens then add elderly sizes
  const stripped = base
    .replace(/\bh-\d+\b/g, "")
    .replace(/\bpx-\d+\b/g, "")
    .replace(/\btext-xs\b|\btext-sm\b|\btext-base\b/g, "")
    .trim();
  return `${stripped} ${ELDERLY_BUTTON_SIZE}`.trim();
}

/**
 * Returns spacing classes scaled for elderly mode.
 * @param base - The normal class string to augment
 *
 * @example
 * <Card className={elderlySpacing("p-4")}>…</Card>
 * // → "p-8"  (in elderly mode)
 * // → "p-4"  (normal mode)
 */
export function elderlySpacing(base: string, isElderlyMode: boolean): string {
  if (!isElderlyMode) return base;
  return base
    .replace(/\bp-4\b/g, ELDERLY_CARD_PADDING)
    .replace(/\bp-5\b/g, ELDERLY_CARD_PADDING)
    .replace(/\bp-6\b/g, ELDERLY_CARD_PADDING)
    .replace(/\bspace-y-3\b/g, "space-y-5")
    .replace(/\bspace-y-4\b/g, "space-y-6")
    .replace(/\bgap-2\b/g, "gap-4")
    .replace(/\bgap-3\b/g, "gap-5");
}
