import { useReducer, useEffect } from "react";
import { Switch, Route, Router } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppContext, appReducer, type AppState } from "@/lib/store";
import AppShell from "@/components/AppShell";
import AuthPage from "@/pages/auth";
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

// Start logged out — user must create an account
const initialState: AppState = {
  user: null,
  isLoggedIn: false,
  theme: "dark",
};

function AppRouter() {
  return (
    <Switch>
      <Route path="/" component={DashboardPage} />
      <Route path="/screener" component={ScreenerPage} />
      <Route path="/household" component={HouseholdPage} />
      <Route path="/pricing" component={PricingPage} />
      <Route path="/assistant" component={AssistantPage} />
      <Route path="/news" component={NewsPage} />
      <Route path="/settings" component={SettingsPage} />
      <Route path="/apply-guide" component={ApplyGuidePage} />
      <Route path="/blog" component={BlogPage} />
      <Route path="/enterprise" component={EnterprisePage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Apply theme on mount and changes
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
            {state.isLoggedIn ? (
              <AppShell>
                <AppRouter />
              </AppShell>
            ) : (
              <AuthPage />
            )}
          </Router>
        </TooltipProvider>
      </QueryClientProvider>
    </AppContext.Provider>
  );
}

export default App;
