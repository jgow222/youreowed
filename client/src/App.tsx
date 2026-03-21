import { useReducer, useEffect } from "react";
import { Switch, Route, Router } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppContext, appReducer, type AppState } from "@/lib/store";
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
import AuthGate from "@/components/AuthGate";

// Start logged out — user sees everything but must sign up to use features
const initialState: AppState = {
  user: null,
  isLoggedIn: false,
  theme: "dark",
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

      {/* Protected pages — require sign in */}
      <Route path="/screener">{() => <AuthGate><ScreenerPage /></AuthGate>}</Route>
      <Route path="/household">{() => <AuthGate><HouseholdPage /></AuthGate>}</Route>
      <Route path="/assistant">{() => <AuthGate><AssistantPage /></AuthGate>}</Route>
      <Route path="/settings">{() => <AuthGate><SettingsPage /></AuthGate>}</Route>
      <Route path="/apply-guide">{() => <AuthGate><ApplyGuidePage /></AuthGate>}</Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [state, dispatch] = useReducer(appReducer, initialState);

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
    </AppContext.Provider>
  );
}

export default App;
