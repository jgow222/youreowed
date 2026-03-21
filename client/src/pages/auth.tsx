import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import { useAppState, type UserProfile } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { isSupabaseConfigured, signUp as supaSignUp, signIn as supaSignIn } from "@/lib/supabase";

export default function AuthPage() {
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
    if (password.length < 6) e.password = "Password must be at least 6 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);

    const trimmedEmail = email.trim();
    const trimmedName = mode === "signup" ? name.trim() : trimmedEmail.split("@")[0];

    // Try Supabase auth if configured, otherwise fall through to local account
    try {
      if (isSupabaseConfigured()) {
        if (mode === "signup") {
          const { error } = await supaSignUp(trimmedEmail, password, trimmedName);
          if (error) { setLoading(false); setErrors({ email: error }); return; }
        } else {
          const { error } = await supaSignIn(trimmedEmail, password);
          if (error) { setLoading(false); setErrors({ email: error }); return; }
        }
      } else {
        await new Promise(r => setTimeout(r, 400));
      }
    } catch (err) {
      console.warn("Auth service unavailable, using local account", err);
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
      title: mode === "signup" ? "Account created" : "Welcome back",
      description: mode === "signup" ? "Let's find out what you're owed." : "Good to see you again.",
    });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        {/* Logo */}
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4">
            <span className="text-xl font-black text-primary-foreground">YO</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight">YoureOwed</h1>
          <p className="text-sm text-muted-foreground mt-1">Find out what the government owes you.</p>
        </div>

        {/* Auth Card */}
        <Card className="p-6 border border-card-border">
          <h2 className="text-base font-bold mb-1">
            {mode === "signup" ? "Create your account" : "Welcome back"}
          </h2>
          <p className="text-xs text-muted-foreground mb-5">
            {mode === "signup"
              ? "Free to screen. Takes 2 minutes."
              : "Sign in to see your benefits."}
          </p>

          <div className="space-y-3">
            {mode === "signup" && (
              <div>
                <Label className="text-xs font-medium mb-1 block">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Your name"
                    value={name}
                    onChange={e => { setName(e.target.value); setErrors(p => ({ ...p, name: "" })); }}
                    className={`h-10 text-sm pl-9 ${errors.name ? "border-destructive" : ""}`}
                    data-testid="input-auth-name"
                  />
                </div>
                {errors.name && <p className="text-[10px] text-destructive mt-0.5">{errors.name}</p>}
              </div>
            )}

            <div>
              <Label className="text-xs font-medium mb-1 block">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="you@email.com"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: "" })); }}
                  className={`h-10 text-sm pl-9 ${errors.email ? "border-destructive" : ""}`}
                  data-testid="input-auth-email"
                />
              </div>
              {errors.email && <p className="text-[10px] text-destructive mt-0.5">{errors.email}</p>}
            </div>

            <div>
              <Label className="text-xs font-medium mb-1 block">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder={mode === "signup" ? "Create a password" : "Your password"}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: "" })); }}
                  className={`h-10 text-sm pl-9 pr-10 ${errors.password ? "border-destructive" : ""}`}
                  data-testid="input-auth-password"
                  onKeyDown={e => e.key === "Enter" && handleSubmit()}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-[10px] text-destructive mt-0.5">{errors.password}</p>}
            </div>

            <Button
              className="w-full h-10 gap-1.5 font-bold"
              onClick={handleSubmit}
              disabled={loading}
              data-testid="button-auth-submit"
            >
              {loading ? (
                <span className="animate-pulse">
                  {mode === "signup" ? "Creating account..." : "Signing in..."}
                </span>
              ) : (
                <>
                  {mode === "signup" ? "Create account" : "Sign in"}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>

          <Separator className="my-5" />

          <p className="text-xs text-center text-muted-foreground">
            {mode === "signup" ? (
              <>Already have an account? <button onClick={() => { setMode("login"); setErrors({}); }} className="text-primary hover:underline font-medium cursor-pointer">Sign in</button></>
            ) : (
              <>Don't have an account? <button onClick={() => { setMode("signup"); setErrors({}); }} className="text-primary hover:underline font-medium cursor-pointer">Create one free</button></>
            )}
          </p>
        </Card>

        {/* Trust signals */}
        <div className="text-center space-y-1">
          <p className="text-[10px] text-muted-foreground">335 programs across all 50 states + DC</p>
          <p className="text-[10px] text-muted-foreground">Your data stays in your browser. We don't sell your info.</p>
        </div>
      </div>
    </div>
  );
}
