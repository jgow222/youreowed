import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { User, Moon, Sun, Bell, Shield, Trash2, Monitor } from "lucide-react";
import { useAppState } from "@/lib/store";
import { US_STATES } from "@/lib/states";
import { useToast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const { state, dispatch } = useAppState();
  const { toast } = useToast();
  const user = state.user;

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [selectedState, setSelectedState] = useState(user?.state || "");
  const [zipCode, setZipCode] = useState(user?.zipCode || "");
  const [notifications, setNotifications] = useState(true);
  const [policyAlerts, setPolicyAlerts] = useState(true);

  const saveProfile = () => {
    dispatch({
      type: "UPDATE_PROFILE",
      payload: { name, email, state: selectedState, zipCode },
    });
    toast({ title: "Profile updated", description: "Your changes have been saved." });
  };

  const setTheme = (theme: "light" | "dark" | "system") => {
    dispatch({ type: "SET_THEME", payload: theme });
    if (theme === "system") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      document.documentElement.classList.toggle("dark", prefersDark);
    } else {
      document.documentElement.classList.toggle("dark", theme === "dark");
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage your account and preferences.</p>
      </div>

      {/* Profile */}
      <Card className="p-5 border border-card-border">
        <div className="flex items-center gap-2 mb-4">
          <User className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold">Profile</h2>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs font-medium mb-1 block">Full Name</Label>
              <Input value={name} onChange={e => setName(e.target.value)} className="h-9 text-sm" data-testid="input-settings-name" />
            </div>
            <div>
              <Label className="text-xs font-medium mb-1 block">Email</Label>
              <Input value={email} onChange={e => setEmail(e.target.value)} type="email" className="h-9 text-sm" data-testid="input-settings-email" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs font-medium mb-1 block">State</Label>
              <Select value={selectedState} onValueChange={setSelectedState}>
                <SelectTrigger className="h-9 text-sm" data-testid="select-settings-state">
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {US_STATES.map(s => (
                    <SelectItem key={s.code} value={s.code}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-medium mb-1 block">ZIP Code</Label>
              <Input value={zipCode} onChange={e => setZipCode(e.target.value.replace(/\D/g, "").slice(0, 5))} className="h-9 text-sm max-w-[160px]" data-testid="input-settings-zip" />
            </div>
          </div>
          <Button size="sm" onClick={saveProfile} className="h-8 text-xs" data-testid="button-save-profile">Save Changes</Button>
        </div>
      </Card>

      {/* Appearance */}
      <Card className="p-5 border border-card-border">
        <div className="flex items-center gap-2 mb-4">
          <Moon className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold">Appearance</h2>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { value: "light" as const, label: "Light", icon: Sun },
            { value: "dark" as const, label: "Dark", icon: Moon },
            { value: "system" as const, label: "System", icon: Monitor },
          ].map(opt => {
            const Icon = opt.icon;
            const isActive = state.theme === opt.value;
            return (
              <Button
                key={opt.value}
                variant={isActive ? "default" : "outline"}
                className="h-auto py-3 flex-col gap-1.5"
                onClick={() => setTheme(opt.value)}
                data-testid={`button-theme-${opt.value}`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-xs">{opt.label}</span>
              </Button>
            );
          })}
        </div>
      </Card>

      {/* Notifications */}
      <Card className="p-5 border border-card-border">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold">Notifications</h2>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Email Notifications</p>
              <p className="text-xs text-muted-foreground">Receive updates about your benefits screening</p>
            </div>
            <Switch checked={notifications} onCheckedChange={setNotifications} data-testid="switch-notifications" />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Policy Change Alerts</p>
              <p className="text-xs text-muted-foreground">Get notified when benefit rules change in your state</p>
            </div>
            <Switch checked={policyAlerts} onCheckedChange={setPolicyAlerts} data-testid="switch-policy-alerts" />
          </div>
        </div>
      </Card>

      {/* Subscription */}
      <Card className="p-5 border border-card-border">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold">Subscription</h2>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium">Current Plan</p>
              <Badge variant="secondary" className="h-4 text-[10px]">
                {user?.subscriptionTier === "free" ? "Free" : user?.subscriptionTier === "basic" ? "Basic" : "Pro"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {user?.subscriptionTier === "free"
                ? "Upgrade to access all features including AI assistant and state programs."
                : "Full access to all features."}
            </p>
          </div>
          <Button variant="outline" size="sm" className="h-8 text-xs">
            {user?.subscriptionTier === "free" ? "Upgrade" : "Manage"}
          </Button>
        </div>
      </Card>

      {/* Danger Zone */}
      <Card className="p-5 border border-destructive/20">
        <div className="flex items-center gap-2 mb-4">
          <Trash2 className="w-4 h-4 text-destructive" />
          <h2 className="text-sm font-semibold text-destructive">Danger Zone</h2>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Delete Account</p>
            <p className="text-xs text-muted-foreground">Permanently delete your account and all data.</p>
          </div>
          <Button variant="destructive" size="sm" className="h-8 text-xs" data-testid="button-delete-account">
            Delete Account
          </Button>
        </div>
      </Card>
    </div>
  );
}
