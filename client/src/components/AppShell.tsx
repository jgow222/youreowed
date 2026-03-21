import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Shield,
  Menu,
  Home,
  Search,
  Users,
  CreditCard,
  MessageCircle,
  Newspaper,
  Settings,
  Sun,
  Moon,
  LogOut,
  User,
  ChevronRight,
  BookOpen,
  Building2,
  FileText,
} from "lucide-react";
import { useAppState } from "@/lib/store";
import { PerplexityAttribution } from "@/components/PerplexityAttribution";

const NAV_ITEMS = [
  { path: "/", label: "Dashboard", icon: Home },
  { path: "/screener", label: "Benefits Screener", icon: Search },
  { path: "/household", label: "Household", icon: Users },
  { path: "/news", label: "News & Updates", icon: Newspaper },
  { path: "/assistant", label: "AI Assistant", icon: MessageCircle },
  { path: "/blog", label: "Benefits Guide", icon: BookOpen },
  { path: "/apply-guide", label: "Apply Guides", icon: FileText },
  { path: "/pricing", label: "Subscription", icon: CreditCard },
  { path: "/enterprise", label: "For Organizations", icon: Building2 },
  { path: "/settings", label: "Settings", icon: Settings },
];

function NavContent({ onNavigate }: { onNavigate?: () => void }) {
  const [location] = useLocation();
  const { state } = useAppState();

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-4 pb-2">
        <Link href="/" onClick={onNavigate}>
          <div className="flex items-center gap-2.5 cursor-pointer">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
              <Shield className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <span className="text-sm font-bold leading-tight block">BenefitsHub</span>
              <span className="text-[10px] text-muted-foreground leading-tight block">Government Benefits Platform</span>
            </div>
          </div>
        </Link>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = location === item.path || (item.path !== "/" && location.startsWith(item.path));
          const Icon = item.icon;
          return (
            <Link key={item.path} href={item.path} onClick={onNavigate}>
              <div
                className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-sm cursor-pointer transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
                data-testid={`nav-${item.path.replace("/", "") || "dashboard"}`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{item.label}</span>
                {item.path === "/news" && (
                  <Badge variant="destructive" className="ml-auto h-4 px-1.5 text-[10px]">3</Badge>
                )}
                {item.path === "/assistant" && (
                  <Badge variant="secondary" className="ml-auto h-4 px-1.5 text-[10px]">AI</Badge>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Subscription upsell */}
      {state.user?.subscriptionTier === "free" && (
        <div className="mx-3 mb-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
          <p className="text-xs font-medium mb-1">Upgrade to Premium</p>
          <p className="text-[10px] text-muted-foreground mb-2">Get AI assistance, detailed estimates, and more.</p>
          <Link href="/pricing" onClick={onNavigate}>
            <Button size="sm" className="w-full h-7 text-xs gap-1">
              View Plans <ChevronRight className="w-3 h-3" />
            </Button>
          </Link>
        </div>
      )}

      {/* Footer */}
      <div className="p-3 border-t border-border">
        <PerplexityAttribution />
      </div>
    </div>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { state, dispatch } = useAppState();

  const toggleTheme = () => {
    const next = state.theme === "dark" ? "light" : "dark";
    dispatch({ type: "SET_THEME", payload: next });
    document.documentElement.classList.toggle("dark", next === "dark");
  };

  const userInitials = state.user?.name
    ? state.user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-56 xl:w-60 flex-col border-r border-border bg-sidebar">
        <NavContent />
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar */}
        <header className="h-13 border-b border-border bg-card/80 backdrop-blur-sm flex items-center justify-between px-4 flex-shrink-0">
          <div className="flex items-center gap-2">
            {/* Mobile menu */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="lg:hidden -ml-2 w-8 h-8 p-0">
                  <Menu className="w-4 h-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <NavContent onNavigate={() => setMobileOpen(false)} />
              </SheetContent>
            </Sheet>
            <span className="text-sm font-medium lg:hidden">BenefitsHub</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="w-8 h-8 p-0"
              data-testid="button-theme-toggle"
              aria-label="Toggle theme"
            >
              {state.theme === "dark" ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </Button>

            {/* Account menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2 h-8 pl-1 pr-2" data-testid="button-account-menu">
                  <Avatar className="w-6 h-6">
                    <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-semibold">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs hidden sm:inline">{state.user?.name || "Account"}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-2 py-1.5">
                  <p className="text-xs font-medium">{state.user?.name}</p>
                  <p className="text-[10px] text-muted-foreground">{state.user?.email}</p>
                  <Badge variant="secondary" className="mt-1 h-4 text-[10px]">
                    {state.user?.subscriptionTier === "free" ? "Free Plan" : "Premium"}
                  </Badge>
                </div>
                <DropdownMenuSeparator />
                <Link href="/settings">
                  <DropdownMenuItem className="cursor-pointer text-xs gap-2">
                    <User className="w-3.5 h-3.5" /> Profile & Settings
                  </DropdownMenuItem>
                </Link>
                <Link href="/household">
                  <DropdownMenuItem className="cursor-pointer text-xs gap-2">
                    <Users className="w-3.5 h-3.5" /> Household Members
                  </DropdownMenuItem>
                </Link>
                <Link href="/pricing">
                  <DropdownMenuItem className="cursor-pointer text-xs gap-2">
                    <CreditCard className="w-3.5 h-3.5" /> Subscription
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer text-xs gap-2 text-destructive"
                  onClick={() => dispatch({ type: "LOGOUT" })}
                >
                  <LogOut className="w-3.5 h-3.5" /> Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
