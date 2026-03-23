import { useReducer, useEffect } from "react";
import { Switch, Route, Router } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppContext, appReducer, type AppState, type UserProfile } from "@/lib/store";
import { supabase, getUserProfile } from "@/lib/supabase";
import { TrackerProvider } from "@/lib/tracker-state";
import { I18nProvider } from "@/lib/i18n";
import AppShell from "@/components/AppShell";
import NotFound from "@/pages/not-found";
import DashboardPage from "@/pages/dashboard";
import ScreenerPage from "@/pages/screener";
import HouseholdPage from "@/pages/household";
import PricingPage from "@/pages/pricing";
import AssistantPage from "@/pages/assistant";
import NewsPage from "@/pages/news";
import SettingsPage from "@/pages/settings";
import ApplyGuidePage from "@/pages/apply-guide";
import BlogPage from "@/pages/blog";
import EnterprisePage from "@/pages/enterprise";
import ReferralPage from "@/pages/referral";
import TrackerPage from "@/pages/tracker";
import DocumentsPage from "@/pages/documents";
import RemindersPage from "@/pages/reminders";
import PartnersPage from "@/pages/partners";
import AffiliateDashboardPage from "@/pages/affiliate-dashboard";
import AuthGate from "@/components/AuthGate";

// Start logged out — user sees everything but must sign up to use features
const initialState: AppState = {
  user: null,
  isLoggedIn: false,
  theme: "dark",
  savedScreenerAnswers: null,
  elderlyMode: false,
};

function AppRouter() {
  return (
    <Switch>
      {/* Public pages — no account needed */}
      <Route path="/" component={DashboardPage} />
      <Route path="/pricing" component={PricingPage} />
      <Route path="/news" component={NewsPage} />
      <Route path="/blog" component={BlogPage} />
      <Route path="/enterprise" component={EnterprisePage} />
      <Route path="/partners" component={PartnersPage} />

      {/* Protected pages — require sign in */}
      <Route path="/screener">{() => <AuthGate><ScreenerPage /></AuthGate>}</Route>
      <Route path="/household">{() => <AuthGate><HouseholdPage /></AuthGate>}</Route>
      <Route path="/assistant">{() => <AuthGate><AssistantPage /></AuthGate>}</Route>
      <Route path="/settings">{() => <AuthGate><SettingsPage /></AuthGate>}</Route>
      <Route path="/apply-guide">{() => <AuthGate><ApplyGuidePage /></AuthGate>}</Route>
      <Route path="/referral">{() => <AuthGate><ReferralPage /></AuthGate>}</Route>
      <Route path="/tracker">{() => <AuthGate><TrackerPage /></AuthGate>}</Route>
      <Route path="/documents">{() => <AuthGate><DocumentsPage /></AuthGate>}</Route>
      <Route path="/reminders">{() => <AuthGate><RemindersPage /></AuthGate>}</Route>
      <Route path="/affiliate-dashboard">{() => <AuthGate><AffiliateDashboardPage /></AuthGate>}</Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Restore session from Supabase on page load/refresh
  useEffect(() => {
    if (!supabase) return;

    // Check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const profile = await getUserProfile(session.user.id);
        let tier: "free" | "basic" | "premium" = "free";
        if (profile?.subscription_tier === "basic") tier = "basic";
        if (profile?.subscription_tier === "premium" || profile?.subscription_tier === "pro") tier = "premium";

        const user: UserProfile = {
          id: session.user.id,
          email: session.user.email || "",
          name: (profile?.name as string) || session.user.user_metadata?.full_name || session.user.email?.split("@")[0] || "User",
          state: (profile?.state as string) || "",
          zipCode: (profile?.zip_code as string) || "",
          citizenshipStatus: "",
          housingSituation: "",
          householdMembers: [{
            id: "self-1",
            name: "You",
            relationship: "self",
            age: 0,
            hasDisability: false,
            isVeteran: false,
            employmentStatus: "",
            monthlyIncome: 0,
          }],
          subscriptionTier: tier,
          referralCode: (profile?.referral_code as string) || "YO-" + Math.random().toString(36).substring(2, 8).toUpperCase(),
          ageRange: (profile?.age_range as UserProfile["ageRange"]) || undefined,
          theme: "dark",
        };
        dispatch({ type: "LOGIN", payload: user });

        // Auto-enable elderly mode for 60+ users
        const age = user.ageRange;
        if (age === "60-74" || age === "75+") {
          dispatch({ type: "SET_ELDERLY_MODE", payload: true });
        }
      }
    });

    // Listen for auth state changes (login/logout from other tabs)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT") {
        dispatch({ type: "LOGOUT" });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (state.theme === "system") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      document.documentElement.classList.toggle("dark", prefersDark);
    } else {
      document.documentElement.classList.toggle("dark", state.theme === "dark");
    }
  }, [state.theme]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      <I18nProvider>
        <TrackerProvider>
          <QueryClientProvider client={queryClient}>
            <TooltipProvider>
              <Toaster />
              <Router hook={useHashLocation}>
                <AppShell>
                  <AppRouter />
                </AppShell>
              </Router>
            </TooltipProvider>
          </QueryClientProvider>
        </TrackerProvider>
      </I18nProvider>
    </AppContext.Provider>
  );
}

export default App;
