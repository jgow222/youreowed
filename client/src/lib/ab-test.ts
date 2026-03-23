// Assigns users to test variants and tracks which variant they see
// Uses a hash of a session-generated ID to deterministically assign variants

export type Variant = "A" | "B";

export interface ABTest {
  id: string;
  variants: { A: string; B: string }; // descriptions
}

// Generate a session ID (persists for the browser tab only via a module-level variable)
let sessionId = Math.random().toString(36).substring(2, 10);

export function getVariant(testId: string): Variant {
  // Simple hash: combine testId + sessionId, use char codes to pick A or B
  const combined = testId + sessionId;
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    hash = ((hash << 5) - hash + combined.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) % 2 === 0 ? "A" : "B";
}

export function trackConversion(testId: string, variant: Variant) {
  // In production, send to analytics. For now, log to console.
  console.log(`[AB Test] ${testId}: Variant ${variant} converted`);
}
