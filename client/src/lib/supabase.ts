// ─── Supabase Client ──────────────────────────────────────────────────────
// Handles authentication and user data persistence.
//
// SETUP:
// 1. Go to https://supabase.com and create a free project
// 2. Go to Project Settings → API
// 3. Copy your Project URL and anon/public key
// 4. Create a .env.local file in the project root with:
//    VITE_SUPABASE_URL=https://your-project.supabase.co
//    VITE_SUPABASE_ANON_KEY=your-anon-key
// 5. In Supabase dashboard → Authentication → Providers → Email: enable, disable "Confirm email"
// 6. Run the SQL in supabase-schema.sql to create the user_profiles table

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

// Only create a real client if env vars are set
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export function isSupabaseConfigured(): boolean {
  return supabase !== null;
}

// ─── Auth Functions ─────────────────────────────────────────────────────────

export async function signUp(email: string, password: string, name: string) {
  if (!supabase) return { user: null, error: "Supabase not configured" };

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: name },
    },
  });

  if (error) return { user: null, error: error.message };

  // Create profile in our profiles table
  if (data.user) {
    await supabase.from("user_profiles").upsert({
      id: data.user.id,
      email: data.user.email,
      name: name,
      subscription_tier: "free",
      referral_code: "YO-" + Math.random().toString(36).substring(2, 8).toUpperCase(),
      created_at: new Date().toISOString(),
    });
  }

  return { user: data.user, error: null };
}

export async function signIn(email: string, password: string) {
  if (!supabase) return { user: null, error: "Supabase not configured" };

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) return { user: null, error: error.message };
  return { user: data.user, error: null };
}

export async function signOut() {
  if (!supabase) return;
  await supabase.auth.signOut();
}

export async function getCurrentUser() {
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getUserProfile(userId: string) {
  if (!supabase) return null;
  const { data } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", userId)
    .single();
  return data;
}

export async function updateUserProfile(userId: string, updates: Record<string, unknown>) {
  if (!supabase) return null;
  const { data } = await supabase
    .from("user_profiles")
    .update(updates)
    .eq("id", userId)
    .select()
    .single();
  return data;
}

// ─── Save/Load screening results ────────────────────────────────────────────

export async function saveScreeningResults(userId: string, results: unknown) {
  if (!supabase) return;
  await supabase.from("screening_results").upsert({
    user_id: userId,
    results: JSON.stringify(results),
    screened_at: new Date().toISOString(),
  });
}

export async function getScreeningResults(userId: string) {
  if (!supabase) return null;
  const { data } = await supabase
    .from("screening_results")
    .select("*")
    .eq("user_id", userId)
    .order("screened_at", { ascending: false })
    .limit(1)
    .single();
  return data;
}
