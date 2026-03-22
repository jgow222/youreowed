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
  ChevronDown,
  BookOpen,
  Building2,
  FileText,
  Gift,
  ClipboardCheck,
  FolderOpen,
  Bell,
  Handshake,
  Star,
  GraduationCap,
  Wrench,
  UserCog,
} from "lucide-react";
import { useAppState } from "@/lib/store";
import { useElderlyMode } from "@/lib/elderly-mode";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

// ─── Nav item type ──────────────────────────────────────────────────────────
interface NavItem {
  path: string;
  label: string;
  icon: typeof Home;
  badge?: string;
  badgeVariant?: "destructive" | "secondary";
}

interface NavSection {
  id: string;
  label: string;
  icon: typeof Home;
  items: NavItem[];
  defaultOpen?: boolean;
}

// ─── Grouped navigation ─────────────────────────────────────────────────────
const NAV_SECTIONS: NavSection[] = [
  {
    id: "main",
    label: "Main",
    icon: Home,
    defaultOpen: true,
    items: [
      { path: "/", label: "Dashboard", icon: Home },
      { path: "/screener", label: "Benefit Finder", icon: Search },
    ],
  },
  {
    id: "benefits",
    label: "My Benefits",
    icon: Star,
    items: [
      { path: "/tracker", label: "My Tracker", icon: ClipboardCheck },
      { path: "/documents", label: "Documents", icon: FolderOpen },
      { path: "/reminders", label: "Reminders", icon: Bell },
    ],
  },
  {
    id: "learn",
    label: "Learn",
    icon: GraduationCap,
    items: [
      { path: "/news", label: "News & Updates", icon: Newspaper, badge: "3", badgeVariant: "destructive" },
      { path: "/blog", label: "Benefits Guide", icon: BookOpen },
      { path: "/apply-guide", label: "Apply Guides", icon: FileText },
    ],
  },
  {
    id: "tools",
    label: "Tools",
    icon: Wrench,
    items: [
      { path: "/assistant", label: "AI Assistant", icon: MessageCircle, badge: "AI", badgeVariant: "secondary" },
      { path: "/household", label: "Household", icon: Users },
    ],
  },
  {
    id: "account",
    label: "Account",
    icon: UserCog,
    items: [
      { path: "/pricing", label: "Subscription", icon: CreditCard },
      { path: "/referral", label: "Refer & Earn", icon: Gift },
      { path: "/settings", label: "Settings", icon: Settings },
    ],
  },
];

// Standalone item at bottom
const BOTTOM_NAV: NavItem = { path: "/partners", label: "For Organizations", icon: Handshake };

// Elderly mode shows only these paths in a flat list
const ELDERLY_NAV_PATHS = new Set(["/", "/screener", "/tracker", "/news", "/settings"]);
const ELDERLY_NAV_ITEMS: NavItem[] = [
  { path: "/", label: "Dashboard", icon: Home },
  { path: "/screener", label: "Benefit Finder", icon: Search },
  { path: "/tracker", label: "My Tracker", icon: ClipboardCheck },
  { path: "/news", label: "News & Updates", icon: Newspaper },
  { path: "/settings", label: "Settings", icon: Settings },
];

// ─── Collapsible section component ──────────────────────────────────────────
function NavSectionGroup({
  section,
  location,
  onNavigate,
}: {
  section: NavSection;
  location: string;
  onNavigate?: () => void;
}) {
  // Auto-open if any child is active, or if defaultOpen
  const hasActiveChild = section.items.some(
    (item) => location === item.path || (item.path !== "/" && location.startsWith(item.path))
  );
  const [open, setOpen] = useState(section.defaultOpen || hasActiveChild);

  const SectionIcon = section.icon;

  // Main section is always expanded and has no header
  if (section.id === "main") {
    return (
      <div className="space-y-0.5">
        {section.items.map((item) => (
          <NavLink key={item.path} item={item} location={location} onNavigate={onNavigate} />
        ))}
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60 hover:text-muted-foreground transition-colors cursor-pointer"
        aria-expanded={open}
      >
        <SectionIcon className="w-3.5 h-3.5" />
        <span className="flex-1 text-left">{section.label}</span>
        <ChevronDown
          className={`w-3 h-3 transition-transform duration-200 ${open ? "rotate-0" : "-rotate-90"}`}
        />
      </button>
      {open && (
        <div className="space-y-0.5 pb-1">
          {section.items.map((item) => (
            <NavLink key={item.path} item={item} location={location} onNavigate={onNavigate} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Individual nav link ────────────────────────────────────────────────────
function NavLink({
  item,
  location,
  onNavigate,
  isElderlyMode = false,
}: {
  item: NavItem;
  location: string;
  onNavigate?: () => void;
  isElderlyMode?: boolean;
}) {
  const isActive = location === item.path || (item.path !== "/" && location.startsWith(item.path));
  const Icon = item.icon;

  return (
    <Link href={item.path} onClick={onNavigate}>
      <div
        className={`flex items-center gap-2.5 rounded-md cursor-pointer transition-colors ${
          isElderlyMode ? "px-4 py-3 text-base" : "px-3 py-1.5 text-sm"
        } ${
          isActive
            ? "bg-primary/10 text-primary font-medium"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
        }`}
        data-testid={`nav-${item.path.replace("/", "") || "dashboard"}`}
      >
        <Icon className={isElderlyMode ? "w-5 h-5 flex-shrink-0" : "w-4 h-4 flex-shrink-0"} />
        <span>{item.label}</span>
        {item.badge && (
          <Badge
            variant={item.badgeVariant || "secondary"}
            className="ml-auto h-4 px-1.5 text-[10px]"
          >
            {item.badge}
          </Badge>
        )}
      </div>
    </Link>
  );
}

// ─── Full nav content ───────────────────────────────────────────────────────
function NavContent({ onNavigate }: { onNavigate?: () => void }) {
  const [location] = useLocation();
  const { state } = useAppState();
  const { isElderlyMode } = useElderlyMode();

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-4 pb-2">
        <Link href="/" onClick={onNavigate}>
          <div className="flex items-center gap-2.5 cursor-pointer">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-black text-primary-foreground">YO</span>
            </div>
            <div>
              <span className="text-sm font-black tracking-tight leading-tight block">YoureOwed</span>
              <span className="text-[10px] text-muted-foreground leading-tight block">Get what's yours.</span>
            </div>
          </div>
        </Link>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {isElderlyMode ? (
          // Elderly mode: flat simple list
          <div className="space-y-0.5">
            {ELDERLY_NAV_ITEMS.map((item) => (
              <NavLink
                key={item.path}
                item={item}
                location={location}
                onNavigate={onNavigate}
                isElderlyMode
              />
            ))}
          </div>
        ) : (
          // Normal mode: collapsible sections
          <>
            {NAV_SECTIONS.map((section) => (
              <NavSectionGroup
                key={section.id}
                section={section}
                location={location}
                onNavigate={onNavigate}
              />
            ))}

            {/* Standalone bottom link */}
            <div className="pt-1 mt-1 border-t border-border/50">
              <NavLink item={BOTTOM_NAV} location={location} onNavigate={onNavigate} />
            </div>
          </>
        )}
      </nav>

      {/* Subscription upsell — hide in elderly mode */}
      {!isElderlyMode && state.user?.subscriptionTier === "free" && (
        <div className="mx-3 mb-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
          <p className="text-xs font-bold mb-1">See what you're owed</p>
          <p className="text-[10px] text-muted-foreground mb-2">Unlock all 335 programs + dollar estimates.</p>
          <Link href="/pricing" onClick={onNavigate}>
            <Button size="sm" className="w-full h-7 text-xs gap-1">
              View Plans <ChevronRight className="w-3 h-3" />
            </Button>
          </Link>
        </div>
      )}

      {/* Footer */}
      <div className="p-3 border-t border-border">

      </div>
    </div>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { state, dispatch } = useAppState();
  const { isElderlyMode } = useElderlyMode();

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
            <span className="text-sm font-black tracking-tight lg:hidden">YoureOwed</span>
            {/* Easy Mode badge */}
            {isElderlyMode && (
              <Badge className="bg-green-600 hover:bg-green-600 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
                Easy Mode
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Language switcher */}
            <LanguageSwitcher />

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
            {state.isLoggedIn ? (
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
                    {state.user?.subscriptionTier === "free" ? "Free Plan" : state.user?.subscriptionTier === "basic" ? "Basic Plan" : "Pro Plan"}
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
            ) : (
              <Link href="/screener">
                <Button size="sm" className="h-8 text-xs gap-1.5 font-semibold" data-testid="button-signin">
                  <User className="w-3.5 h-3.5" /> Sign in
                </Button>
              </Link>
            )}
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
