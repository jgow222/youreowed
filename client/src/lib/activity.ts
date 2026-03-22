// ─── User Activity Tracking ──────────────────────────────────────────────────
// Records key milestones for reminder email targeting.
// Events: signed_up, started_screener, completed_screener, viewed_results, subscribed

import { supabase } from "./supabase";

export type ActivityEvent = 
  | "signed_up"
  | "started_screener" 
  | "completed_screener"
  | "viewed_results"
  | "subscribed";

export async function trackActivity(event: ActivityEvent, userId?: string, email?: string) {
  if (!supabase || !userId || !email) return;

  try {
    await supabase.from("user_activity").insert({
      user_id: userId,
      email,
      event_type: event,
    });
  } catch (e) {
    // Silent fail — activity tracking should never break the app
    console.warn("Activity tracking failed:", e);
  }
}
