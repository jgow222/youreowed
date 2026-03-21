// ─── Auth Gate ──────────────────────────────────────────────────────────────
// Wraps protected pages. If the user isn't logged in, shows an inline
// sign-up/login form instead of the page content. No redirect, no separate
// page — they stay right where they are and sign up in context.

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, Mail, Lock, User, Eye, EyeOff, Shield } from "lucide-react";
import { useAppState, type UserProfile } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { isSupabaseConfigured, signUp as supaSignUp, signIn as supaSignIn } from "@/lib/supabase";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { state, dispatch } = useAppState();

  // If logged in, show the actual page
  if (state.isLoggedIn && state.user) {
    return <>{children}</>;
  }

  // Otherwise show inline sign-up
  return <InlineAuth />;
}

function InlineAuth() {
  const { dispatch } = useAppState();
  const { toast } = useToast();
  const [mode, setMode] = useState<"login" | "signup">("signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (mode === "signup" && !name.trim()) e.name = "Name is required";
    if (!email.trim() || !email.includes("@")) e.email = "Valid email is required";
    if (password.length < 6) e.password = "At least 6 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);

    const trimmedEmail = email.trim();
    const trimmedName = mode === "signup" ? name.trim() : trimmedEmail.split("@")[0];

    if (isSupabaseConfigured()) {
      if (mode === "signup") {
        const { error } = await supaSignUp(trimmedEmail, password, trimmedName);
        if (error) { setLoading(false); setErrors({ email: error }); return; }
      } else {
        const { error } = await supaSignIn(trimmedEmail, password);
        if (error) { setLoading(false); setErrors({ email: error }); return; }
      }
    } else {
      await new Promise(r => setTimeout(r, 500));
    }

    const user: UserProfile = {
      id: `user-${Date.now()}`,
      email: trimmedEmail,
      name: trimmedName,
      state: "",
      zipCode: "",
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
      subscriptionTier: "free",
      referralCode: "YO-" + Math.random().toString(36).substring(2, 8).toUpperCase(),
      theme: "dark",
    };

    dispatch({ type: "LOGIN", payload: user });
    setLoading(false);
    toast({
      title: mode === "signup" ? "You're in." : "Welcome back.",
      description: "Let's find what you're owed.",
    });
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] p-4">
      <div className="w-full max-w-sm space-y-5">
        {/* Header */}
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mx-auto mb-3">
            <span className="text-lg font-black text-primary-foreground">YO</span>
          </div>
          <h2 className="text-lg font-bold">
            {mode === "signup" ? "Create a free account to continue" : "Sign in to continue"}
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Takes 10 seconds. No credit card required.
          </p>
        </div>

        {/* Form */}
        <Card className="p-5 border border-card-border">
          <div className="space-y-3">
            {mode === "signup" && (
              <div>
                <Label className="text-xs font-medium mb-1 block">Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Your name"
                    value={name}
                    onChange={e => { setName(e.target.value); setErrors(p => ({ ...p, name: "" })); }}
                    className={`h-9 text-sm pl-9 ${errors.name ? "border-destructive" : ""}`}
                    data-testid="input-gate-name"
                  />
                </div>
                {errors.name && <p className="text-[10px] text-destructive mt-0.5">{errors.name}</p>}
              </div>
            )}

            <div>
              <Label className="text-xs font-medium mb-1 block">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="you@email.com"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: "" })); }}
                  className={`h-9 text-sm pl-9 ${errors.email ? "border-destructive" : ""}`}
                  data-testid="input-gate-email"
                />
              </div>
              {errors.email && <p className="text-[10px] text-destructive mt-0.5">{errors.email}</p>}
            </div>

            <div>
              <Label className="text-xs font-medium mb-1 block">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder={mode === "signup" ? "Create a password" : "Your password"}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: "" })); }}
                  className={`h-9 text-sm pl-9 pr-9 ${errors.password ? "border-destructive" : ""}`}
                  data-testid="input-gate-password"
                  onKeyDown={e => e.key === "Enter" && handleSubmit()}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
              {errors.password && <p className="text-[10px] text-destructive mt-0.5">{errors.password}</p>}
            </div>

            <Button
              className="w-full h-9 gap-1.5 font-bold text-sm"
              onClick={handleSubmit}
              disabled={loading}
              data-testid="button-gate-submit"
            >
              {loading ? (
                <span className="animate-pulse">
                  {mode === "signup" ? "Creating..." : "Signing in..."}
                </span>
              ) : (
                <>
                  {mode === "signup" ? "Create account & continue" : "Sign in & continue"}
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </Button>
          </div>

          <Separator className="my-4" />

          <p className="text-[11px] text-center text-muted-foreground">
            {mode === "signup" ? (
              <>Have an account? <button onClick={() => { setMode("login"); setErrors({}); }} className="text-primary hover:underline font-medium cursor-pointer">Sign in</button></>
            ) : (
              <>No account? <button onClick={() => { setMode("signup"); setErrors({}); }} className="text-primary hover:underline font-medium cursor-pointer">Create one free</button></>
            )}
          </p>
        </Card>

        <p className="text-[10px] text-muted-foreground text-center">
          Free to screen. Your data stays private.
        </p>
      </div>
    </div>
  );
}
