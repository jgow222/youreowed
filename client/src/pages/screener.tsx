import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, ArrowRight, AlertTriangle } from "lucide-react";
import { US_STATES } from "@/lib/states";
import { type UserAnswers, DEFAULT_ANSWERS, evaluateEligibility, type ProgramResult } from "@/lib/eligibility";
import ResultsPage from "./results";
import { useAppState } from "@/lib/store";
import { trackActivity } from "@/lib/activity";
import { useElderlyMode } from "@/lib/elderly-mode";
import { CheckCircle, Clock } from "lucide-react";

// ─── Form state uses strings for number inputs; converted on submit ──────────

interface FormData {
  // Step 1: Location
  state: string;
  zipCode: string;

  // Step 2: About You
  age: string;
  maritalStatus: string;
  isPregnant: boolean;
  isStudent: boolean;
  educationLevel: string;

  // Step 3: Your Household
  householdSize: string;
  numChildrenUnder18: string;
  numChildrenUnder5: string;
  hasElderlyInHousehold: boolean;

  // Step 4: Income & Finances
  monthlyIncome: string;
  incomeFromWork: string;
  hasOtherIncome: boolean;
  totalAssets: string;
  hasFiledTaxes: boolean;

  // Step 5: Employment
  employmentStatus: string;
  recentlyLostJob: boolean;
  currentlyReceivingUI: boolean;
  monthsUnemployed: string;

  // Step 6: Health & Disability
  hasDisability: boolean;
  disabilityPreventsWork: boolean;
  hasHealthInsurance: boolean;
  healthInsuranceType: string;
  hasChronicCondition: boolean;

  // Step 7: Additional Details
  citizenshipStatus: string;
  isVeteran: boolean;
  veteranServiceConnectedDisability: boolean;
  housingSituation: string;
  monthlyRent: string;
  paysUtilities: boolean;
  hasChildcareCosts: boolean;
  monthlyChildcareCost: string;
}

const INITIAL_FORM: FormData = {
  state: "",
  zipCode: "",
  age: "",
  maritalStatus: "",
  isPregnant: false,
  isStudent: false,
  educationLevel: "",
  householdSize: "1",
  numChildrenUnder18: "0",
  numChildrenUnder5: "0",
  hasElderlyInHousehold: false,
  monthlyIncome: "",
  incomeFromWork: "",
  hasOtherIncome: false,
  totalAssets: "",
  hasFiledTaxes: false,
  employmentStatus: "",
  recentlyLostJob: false,
  currentlyReceivingUI: false,
  monthsUnemployed: "0",
  hasDisability: false,
  disabilityPreventsWork: false,
  hasHealthInsurance: false,
  healthInsuranceType: "none",
  hasChronicCondition: false,
  citizenshipStatus: "",
  isVeteran: false,
  veteranServiceConnectedDisability: false,
  housingSituation: "",
  monthlyRent: "",
  paysUtilities: false,
  hasChildcareCosts: false,
  monthlyChildcareCost: "",
};

const STEPS = [
  { id: "location", title: "Location", subtitle: "Where do you live?" },
  { id: "about-you", title: "About You", subtitle: "Tell us about yourself" },
  { id: "household", title: "Household", subtitle: "Your household composition" },
  { id: "income", title: "Income", subtitle: "Your household finances" },
  { id: "employment", title: "Employment", subtitle: "Your work situation" },
  { id: "health", title: "Health", subtitle: "Health and disability" },
  { id: "additional", title: "Additional", subtitle: "A few more details" },
];

const STEP_DESCRIPTIONS = [
  "Your state determines which programs are available to you.",
  "This helps us match you with age-specific and education-related programs.",
  "Household size and composition affect most eligibility calculations.",
  "Income is a key factor for most benefit programs.",
  "Employment status helps determine programs like unemployment insurance and EITC.",
  "Some programs are specifically for people with disabilities or health needs.",
  "These final details help refine your results.",
];

function parseNum(val: string, fallback = 0): number {
  const n = parseFloat(val);
  return isNaN(n) ? fallback : n;
}

function parseInt10(val: string, fallback = 0): number {
  const n = parseInt(val, 10);
  return isNaN(n) ? fallback : n;
}

// ─── Dollar input helper ─────────────────────────────────────────────────────

function DollarInput({
  id,
  testId,
  value,
  onChange,
  placeholder = "0",
  error,
}: {
  id: string;
  testId: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  error?: boolean;
}) {
  return (
    <div className="relative max-w-[200px]">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
      <Input
        id={id}
        data-testid={testId}
        type="number"
        inputMode="decimal"
        min={0}
        step={100}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`pl-7 ${error ? "border-destructive" : ""}`}
      />
    </div>
  );
}

// ─── Switch row helper ───────────────────────────────────────────────────────

function SwitchRow({
  label,
  testId,
  checked,
  onChange,
  description,
}: {
  label: string;
  testId: string;
  checked: boolean;
  onChange: (val: boolean) => void;
  description?: string;
}) {
  return (
    <div>
      <Label className="text-sm font-medium mb-1 block">{label}</Label>
      {description && <p className="text-xs text-muted-foreground mb-2">{description}</p>}
      <div className="flex items-center gap-3">
        <Switch checked={checked} onCheckedChange={onChange} data-testid={testId} />
        <span className="text-sm">{checked ? "Yes" : "No"}</span>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function ScreenerPage() {
  const { state, dispatch } = useAppState();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [results, setResults] = useState<ProgramResult[] | null>(null);
  const [showResume, setShowResume] = useState(false);
  const [progressSaved, setProgressSaved] = useState(false);
  const { isElderlyMode } = useElderlyMode();

  // Check for saved progress on mount
  useEffect(() => {
    if (state.savedScreenerAnswers && state.savedScreenerAnswers.step > 0) {
      setShowResume(true);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Save progress to context after each step change
  useEffect(() => {
    if (step > 0 && !results) {
      dispatch({
        type: "SAVE_SCREENER_PROGRESS",
        payload: {
          step,
          form: form as unknown as Record<string, string | boolean>,
          savedAt: Date.now(),
        },
      });
      // Show "Progress saved" indicator briefly
      setProgressSaved(true);
      const t = setTimeout(() => setProgressSaved(false), 2500);
      return () => clearTimeout(t);
    }
  }, [step]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleResume = useCallback(() => {
    if (state.savedScreenerAnswers) {
      setForm(state.savedScreenerAnswers.form as unknown as FormData);
      setStep(state.savedScreenerAnswers.step);
    }
    setShowResume(false);
  }, [state.savedScreenerAnswers]);

  const handleStartFresh = useCallback(() => {
    dispatch({ type: "CLEAR_SCREENER_PROGRESS" });
    setShowResume(false);
  }, [dispatch]);

  const updateField = useCallback((field: keyof FormData, value: string | boolean) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  // ── Validation per step ────────────────────────────────────────────────────

  const validateStep = useCallback((): boolean => {
    const errs: Record<string, string> = {};
    const age = parseInt10(form.age);

    switch (step) {
      case 0: // Location
        if (!form.state) errs.state = "Please select your state.";
        break;

      case 1: // About You
        if (!form.age || age < 0 || age > 120) errs.age = "Please enter a valid age (0-120).";
        if (!form.maritalStatus) errs.maritalStatus = "Please select your marital status.";
        if (!form.educationLevel) errs.educationLevel = "Please select your education level.";
        break;

      case 2: // Household
        if (!form.householdSize || parseInt10(form.householdSize) < 1)
          errs.householdSize = "Household size must be at least 1.";
        {
          const kids = parseInt10(form.numChildrenUnder18);
          const hhSize = parseInt10(form.householdSize);
          if (kids >= hhSize)
            errs.numChildrenUnder18 = "Number of children must be less than household size.";
          if (parseInt10(form.numChildrenUnder5) > kids)
            errs.numChildrenUnder5 = "Cannot exceed total children under 18.";
        }
        break;

      case 3: // Income
        if (form.monthlyIncome === "" || parseNum(form.monthlyIncome) < 0)
          errs.monthlyIncome = "Please enter your monthly household income.";
        break;

      case 4: // Employment
        if (!form.employmentStatus) errs.employmentStatus = "Please select your employment status.";
        break;

      case 5: // Health
        // No hard required fields — all are switches
        break;

      case 6: // Additional
        if (!form.citizenshipStatus) errs.citizenshipStatus = "Please select an option.";
        if (!form.housingSituation) errs.housingSituation = "Please select your housing situation.";
        break;
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }, [step, form]);

  // ── Navigation ─────────────────────────────────────────────────────────────

  const goNext = useCallback(() => {
    if (!validateStep()) return;

    if (step < STEPS.length - 1) {
      // Track first step as "started_screener"
      if (step === 0) {
        trackActivity("started_screener", state.user?.id, state.user?.email);
      }
      setStep(s => s + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      // Submit: convert form to UserAnswers
      const numChildrenUnder18 = parseInt10(form.numChildrenUnder18);
      const answers: UserAnswers = {
        ...DEFAULT_ANSWERS,

        // Step 1
        state: form.state,
        zipCode: form.zipCode,

        // Step 2
        age: parseInt10(form.age),
        maritalStatus: (form.maritalStatus || "single") as UserAnswers["maritalStatus"],
        isPregnant: form.isPregnant,
        isStudent: form.isStudent,
        educationLevel: (form.educationLevel || "none") as UserAnswers["educationLevel"],

        // Step 3
        householdSize: parseInt10(form.householdSize, 1),
        numChildren: numChildrenUnder18,
        numChildrenUnder18,
        numChildrenUnder5: parseInt10(form.numChildrenUnder5),
        hasElderlyInHousehold: form.hasElderlyInHousehold,

        // Step 4
        monthlyIncome: parseNum(form.monthlyIncome),
        incomeFromWork: parseNum(form.incomeFromWork),
        hasOtherIncome: form.hasOtherIncome,
        totalAssets: parseNum(form.totalAssets),
        hasFiledTaxes: form.hasFiledTaxes,

        // Step 5
        employmentStatus: (form.employmentStatus || "employed-full") as UserAnswers["employmentStatus"],
        recentlyLostJob: form.recentlyLostJob,
        currentlyReceivingUI: form.currentlyReceivingUI,
        monthsUnemployed: parseInt10(form.monthsUnemployed),

        // Step 6
        hasDisability: form.hasDisability,
        disabilityPreventsWork: form.disabilityPreventsWork,
        hasHealthInsurance: form.hasHealthInsurance,
        healthInsuranceType: (form.healthInsuranceType || "none") as UserAnswers["healthInsuranceType"],
        hasChronicCondition: form.hasChronicCondition,

        // Step 7
        citizenshipStatus: (form.citizenshipStatus || "citizen") as UserAnswers["citizenshipStatus"],
        isVeteran: form.isVeteran,
        veteranServiceConnectedDisability: form.veteranServiceConnectedDisability,
        housingSituation: (form.housingSituation || "rent") as UserAnswers["housingSituation"],
        monthlyRent: parseNum(form.monthlyRent),
        paysUtilities: form.paysUtilities,
        hasChildcareCosts: form.hasChildcareCosts,
        monthlyChildcareCost: parseNum(form.monthlyChildcareCost),
      };

      const evaluated = evaluateEligibility(answers);
      setResults(evaluated);
      dispatch({ type: "CLEAR_SCREENER_PROGRESS" });

      // Track screener completion for reminder emails
      trackActivity("completed_screener", state.user?.id, state.user?.email);
    }
  }, [step, form, validateStep, dispatch]);

  const goBack = useCallback(() => {
    if (step > 0) {
      setStep(s => s - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [step]);

  const startOver = useCallback(() => {
    setForm(INITIAL_FORM);
    setStep(0);
    setResults(null);
    setErrors({});
    dispatch({ type: "CLEAR_SCREENER_PROGRESS" });
  }, [dispatch]);

  // ── Results page ───────────────────────────────────────────────────────────

  if (results) {
    return <ResultsPage results={results} onStartOver={startOver} userState={form.state} />;
  }

  // ── Derived form values ────────────────────────────────────────────────────

  const age = parseInt10(form.age);
  const numChildrenUnder18 = parseInt10(form.numChildrenUnder18);
  const hasChildren = numChildrenUnder18 > 0;
  const isUnemployed = form.employmentStatus === "unemployed-looking" || form.employmentStatus === "unemployed-not-looking";
  const showRentMortgage = form.housingSituation === "rent" || form.housingSituation === "own";
  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div className={isElderlyMode ? "p-6 md:p-8 max-w-2xl mx-auto" : "p-4 md:p-6 max-w-2xl mx-auto"}>
      {/* Resume prompt */}
      {showResume && state.savedScreenerAnswers && (
        <div className="mb-4 p-4 rounded-xl border border-[#00E676]/30 bg-[#00E676]/[0.04] flex items-start gap-3" data-testid="resume-prompt">
          <Clock className="w-4 h-4 text-[#00E676] flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold">Resume where you left off?</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              You were on step {state.savedScreenerAnswers.step + 1} of {STEPS.length}. Your answers are saved.
            </p>
            <div className="flex gap-2 mt-2">
              <button
                className="text-xs font-semibold text-[#00E676] hover:underline"
                onClick={handleResume}
                data-testid="button-resume"
              >
                Resume
              </button>
              <span className="text-muted-foreground text-xs">·</span>
              <button
                className="text-xs text-muted-foreground hover:text-foreground hover:underline"
                onClick={handleStartFresh}
                data-testid="button-start-fresh"
              >
                Start fresh
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Progress saved indicator */}
      {progressSaved && (
        <div className="mb-3 flex items-center gap-1.5 text-xs text-[#00E676] animate-in fade-in duration-300" data-testid="progress-saved-indicator">
          <CheckCircle className="w-3.5 h-3.5" />
          Progress saved
        </div>
      )}

      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className={isElderlyMode ? "text-base font-semibold" : "text-sm font-medium text-muted-foreground"}>
            Step {step + 1} of {STEPS.length}
          </span>
          <span className={isElderlyMode ? "text-base" : "text-sm text-muted-foreground"}>
            {STEPS[step].title}
          </span>
        </div>
        <Progress value={progress} className={isElderlyMode ? "h-3" : "h-1.5"} data-testid="progress-bar" />
      </div>

      {/* Step Card */}
      <Card className={isElderlyMode ? "p-8 border border-card-border" : "p-6 border border-card-border"} data-testid={`step-${STEPS[step].id}`}>
        <h2 className={isElderlyMode ? "text-2xl font-bold mb-2" : "text-lg font-semibold mb-1"}>{STEPS[step].subtitle}</h2>
        <p className={isElderlyMode ? "text-base text-muted-foreground mb-8" : "text-sm text-muted-foreground mb-6"}>{STEP_DESCRIPTIONS[step]}</p>

        {/* ── Step 0: Location ──────────────────────────────────────────── */}
        {step === 0 && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="state" className="text-sm font-medium mb-1.5 block">State</Label>
              <Select value={form.state} onValueChange={(v) => updateField("state", v)}>
                <SelectTrigger id="state" data-testid="select-state" className={errors.state ? "border-destructive" : ""}>
                  <SelectValue placeholder="Select your state" />
                </SelectTrigger>
                <SelectContent>
                  {US_STATES.map(s => (
                    <SelectItem key={s.code} value={s.code}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.state && <p className="text-xs text-destructive mt-1">{errors.state}</p>}
            </div>
            <div>
              <Label htmlFor="zipCode" className="text-sm font-medium mb-1.5 block">
                ZIP Code <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <Input
                id="zipCode"
                data-testid="input-zip"
                type="text"
                inputMode="numeric"
                maxLength={5}
                placeholder="e.g. 90210"
                value={form.zipCode}
                onChange={(e) => updateField("zipCode", e.target.value.replace(/\D/g, ""))}
                className="max-w-[200px]"
              />
              <p className="text-xs text-muted-foreground mt-1">
                May help identify local programs in future versions.
              </p>
            </div>
          </div>
        )}

        {/* ── Step 1: About You ─────────────────────────────────────────── */}
        {step === 1 && (
          <div className="space-y-5">
            {/* Age */}
            <div>
              <Label htmlFor="age" className="text-sm font-medium mb-1.5 block">Your Age</Label>
              <Input
                id="age"
                data-testid="input-age"
                type="number"
                inputMode="numeric"
                min={0}
                max={120}
                placeholder="e.g. 35"
                value={form.age}
                onChange={(e) => updateField("age", e.target.value)}
                className={`max-w-[140px] ${errors.age ? "border-destructive" : ""}`}
              />
              {errors.age && <p className="text-xs text-destructive mt-1">{errors.age}</p>}
            </div>

            {/* Marital Status */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Marital Status</Label>
              <RadioGroup
                value={form.maritalStatus}
                onValueChange={(v) => updateField("maritalStatus", v)}
                className="space-y-2"
                data-testid="radio-marital-status"
              >
                {[
                  { value: "single", label: "Single" },
                  { value: "married", label: "Married" },
                  { value: "separated", label: "Separated / Divorced" },
                  { value: "widowed", label: "Widowed" },
                  { value: "domestic-partner", label: "Domestic Partner" },
                ].map(opt => (
                  <div key={opt.value} className="flex items-center gap-2.5">
                    <RadioGroupItem value={opt.value} id={`marital-${opt.value}`} />
                    <Label htmlFor={`marital-${opt.value}`} className="text-sm font-normal cursor-pointer">{opt.label}</Label>
                  </div>
                ))}
              </RadioGroup>
              {errors.maritalStatus && <p className="text-xs text-destructive mt-1">{errors.maritalStatus}</p>}
            </div>

            {/* Pregnant — only show if age 14-50 */}
            {age >= 14 && age <= 50 && (
              <SwitchRow
                label="Are you currently pregnant?"
                testId="switch-pregnant"
                checked={form.isPregnant}
                onChange={(v) => updateField("isPregnant", v)}
              />
            )}

            {/* Student */}
            <SwitchRow
              label="Are you currently enrolled in school?"
              testId="switch-student"
              checked={form.isStudent}
              onChange={(v) => updateField("isStudent", v)}
            />

            {/* Education Level */}
            <div>
              <Label className="text-sm font-medium mb-1.5 block">Highest Education Level</Label>
              <Select value={form.educationLevel} onValueChange={(v) => updateField("educationLevel", v)}>
                <SelectTrigger data-testid="select-education" className={`max-w-[280px] ${errors.educationLevel ? "border-destructive" : ""}`}>
                  <SelectValue placeholder="Select education level" />
                </SelectTrigger>
                <SelectContent>
                  {[
                    { value: "none", label: "No degree" },
                    { value: "high-school", label: "High school diploma / GED" },
                    { value: "some-college", label: "Some college / Associate's" },
                    { value: "bachelors", label: "Bachelor's degree" },
                    { value: "graduate", label: "Graduate / Professional degree" },
                  ].map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.educationLevel && <p className="text-xs text-destructive mt-1">{errors.educationLevel}</p>}
            </div>
          </div>
        )}

        {/* ── Step 2: Your Household ────────────────────────────────────── */}
        {step === 2 && (
          <div className="space-y-5">
            {/* Household Size */}
            <div>
              <Label htmlFor="householdSize" className="text-sm font-medium mb-1.5 block">
                Total people in your household
              </Label>
              <p className="text-xs text-muted-foreground mb-1.5">Include yourself, your spouse/partner, and any dependents.</p>
              <Select value={form.householdSize} onValueChange={(v) => updateField("householdSize", v)}>
                <SelectTrigger id="householdSize" data-testid="select-household-size" className={`max-w-[200px] ${errors.householdSize ? "border-destructive" : ""}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                    <SelectItem key={n} value={n.toString()}>
                      {n} {n === 1 ? "person" : "people"}{n === 10 ? "+" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.householdSize && <p className="text-xs text-destructive mt-1">{errors.householdSize}</p>}
            </div>

            {/* Children Under 18 */}
            <div>
              <Label htmlFor="numChildrenUnder18" className="text-sm font-medium mb-1.5 block">
                Children under 18 in your household
              </Label>
              <Select value={form.numChildrenUnder18} onValueChange={(v) => updateField("numChildrenUnder18", v)}>
                <SelectTrigger id="numChildrenUnder18" data-testid="select-children-under-18" className={`max-w-[200px] ${errors.numChildrenUnder18 ? "border-destructive" : ""}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                    <SelectItem key={n} value={n.toString()}>
                      {n === 0 ? "None" : n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.numChildrenUnder18 && <p className="text-xs text-destructive mt-1">{errors.numChildrenUnder18}</p>}
            </div>

            {/* Children Under 5 — only show if children > 0 */}
            {hasChildren && (
              <div>
                <Label htmlFor="numChildrenUnder5" className="text-sm font-medium mb-1.5 block">
                  Children under 5
                </Label>
                <p className="text-xs text-muted-foreground mb-1.5">
                  Some programs specifically serve families with young children.
                </p>
                <Select value={form.numChildrenUnder5} onValueChange={(v) => updateField("numChildrenUnder5", v)}>
                  <SelectTrigger id="numChildrenUnder5" data-testid="select-children-under-5" className={`max-w-[200px] ${errors.numChildrenUnder5 ? "border-destructive" : ""}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: numChildrenUnder18 + 1 }, (_, i) => i).map(n => (
                      <SelectItem key={n} value={n.toString()}>
                        {n === 0 ? "None" : n}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.numChildrenUnder5 && <p className="text-xs text-destructive mt-1">{errors.numChildrenUnder5}</p>}
              </div>
            )}

            {/* Elderly in household */}
            <SwitchRow
              label="Is anyone 60 or older in your household (besides you)?"
              testId="switch-elderly"
              checked={form.hasElderlyInHousehold}
              onChange={(v) => updateField("hasElderlyInHousehold", v)}
            />
          </div>
        )}

        {/* ── Step 3: Income & Finances ─────────────────────────────────── */}
        {step === 3 && (
          <div className="space-y-5">
            {/* Total Monthly Income */}
            <div>
              <Label htmlFor="monthlyIncome" className="text-sm font-medium mb-1.5 block">
                Total monthly household income (before taxes)
              </Label>
              <p className="text-xs text-muted-foreground mb-1.5">
                Include all sources: wages, Social Security, pensions, child support, rental income, etc.
              </p>
              <DollarInput
                id="monthlyIncome"
                testId="input-income"
                value={form.monthlyIncome}
                onChange={(v) => updateField("monthlyIncome", v)}
                error={!!errors.monthlyIncome}
              />
              {errors.monthlyIncome && <p className="text-xs text-destructive mt-1">{errors.monthlyIncome}</p>}
            </div>

            {/* Income From Work */}
            <div>
              <Label htmlFor="incomeFromWork" className="text-sm font-medium mb-1.5 block">
                Monthly income from work/wages
              </Label>
              <p className="text-xs text-muted-foreground mb-1.5">
                Just your earned income from jobs or self-employment.
              </p>
              <DollarInput
                id="incomeFromWork"
                testId="input-income-work"
                value={form.incomeFromWork}
                onChange={(v) => updateField("incomeFromWork", v)}
              />
            </div>

            {/* Other Income */}
            <SwitchRow
              label="Do you have income from other sources?"
              testId="switch-other-income"
              checked={form.hasOtherIncome}
              onChange={(v) => updateField("hasOtherIncome", v)}
              description="Social Security, pension, child support, rental income, etc."
            />

            {/* Total Assets */}
            <div>
              <Label htmlFor="totalAssets" className="text-sm font-medium mb-1.5 block">
                Total savings and assets
              </Label>
              <p className="text-xs text-muted-foreground mb-1.5">
                Checking, savings, investments — not your home or primary vehicle.
              </p>
              <DollarInput
                id="totalAssets"
                testId="input-assets"
                value={form.totalAssets}
                onChange={(v) => updateField("totalAssets", v)}
              />
            </div>

            {/* Filed Taxes */}
            <SwitchRow
              label="Did you or will you file a federal tax return this year?"
              testId="switch-filed-taxes"
              checked={form.hasFiledTaxes}
              onChange={(v) => updateField("hasFiledTaxes", v)}
              description="Required for tax credits like EITC and Child Tax Credit."
            />
          </div>
        )}

        {/* ── Step 4: Employment ────────────────────────────────────────── */}
        {step === 4 && (
          <div className="space-y-5">
            {/* Employment Status */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Employment Status</Label>
              <RadioGroup
                value={form.employmentStatus}
                onValueChange={(v) => updateField("employmentStatus", v)}
                className="space-y-2"
                data-testid="radio-employment"
              >
                {[
                  { value: "employed-full", label: "Employed full-time" },
                  { value: "employed-part", label: "Employed part-time" },
                  { value: "self-employed", label: "Self-employed" },
                  { value: "unemployed-looking", label: "Unemployed, looking for work" },
                  { value: "unemployed-not-looking", label: "Not working, not currently looking" },
                  { value: "retired", label: "Retired" },
                  { value: "unable-to-work", label: "Unable to work due to disability" },
                  { value: "student-only", label: "Student only" },
                ].map(opt => (
                  <div key={opt.value} className="flex items-center gap-2.5">
                    <RadioGroupItem value={opt.value} id={`emp-${opt.value}`} />
                    <Label htmlFor={`emp-${opt.value}`} className="text-sm font-normal cursor-pointer">{opt.label}</Label>
                  </div>
                ))}
              </RadioGroup>
              {errors.employmentStatus && <p className="text-xs text-destructive mt-1">{errors.employmentStatus}</p>}
            </div>

            {/* Recently lost job — show if unemployed or recently changed */}
            {(isUnemployed || form.employmentStatus === "employed-part") && (
              <SwitchRow
                label="Have you lost a job in the past 12 months?"
                testId="switch-recently-lost-job"
                checked={form.recentlyLostJob}
                onChange={(v) => updateField("recentlyLostJob", v)}
              />
            )}

            {/* Currently receiving UI — show if unemployed */}
            {isUnemployed && (
              <SwitchRow
                label="Are you currently receiving unemployment benefits?"
                testId="switch-receiving-ui"
                checked={form.currentlyReceivingUI}
                onChange={(v) => updateField("currentlyReceivingUI", v)}
              />
            )}

            {/* Months unemployed — show if unemployed */}
            {isUnemployed && (
              <div>
                <Label htmlFor="monthsUnemployed" className="text-sm font-medium mb-1.5 block">
                  How many months have you been unemployed?
                </Label>
                <Select value={form.monthsUnemployed} onValueChange={(v) => updateField("monthsUnemployed", v)}>
                  <SelectTrigger id="monthsUnemployed" data-testid="select-months-unemployed" className="max-w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 25 }, (_, i) => i).map(n => (
                      <SelectItem key={n} value={n.toString()}>
                        {n === 0 ? "Less than 1 month" : n === 24 ? "24+ months" : `${n} month${n === 1 ? "" : "s"}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        )}

        {/* ── Step 5: Health & Disability ────────────────────────────────── */}
        {step === 5 && (
          <div className="space-y-5">
            {/* Disability */}
            <SwitchRow
              label="Do you have a disability?"
              testId="switch-disability"
              checked={form.hasDisability}
              onChange={(v) => updateField("hasDisability", v)}
            />

            {/* Disability prevents work — only show if hasDisability */}
            {form.hasDisability && (
              <SwitchRow
                label="Does your disability prevent you from working?"
                testId="switch-disability-prevents-work"
                checked={form.disabilityPreventsWork}
                onChange={(v) => updateField("disabilityPreventsWork", v)}
              />
            )}

            {/* Health Insurance */}
            <SwitchRow
              label="Do you currently have health insurance?"
              testId="switch-health-insurance"
              checked={form.hasHealthInsurance}
              onChange={(v) => updateField("hasHealthInsurance", v)}
            />

            {/* Insurance Type — only show if has insurance */}
            {form.hasHealthInsurance && (
              <div>
                <Label className="text-sm font-medium mb-2 block">What type of health insurance?</Label>
                <RadioGroup
                  value={form.healthInsuranceType}
                  onValueChange={(v) => updateField("healthInsuranceType", v)}
                  className="space-y-2"
                  data-testid="radio-insurance-type"
                >
                  {[
                    { value: "employer", label: "Employer-sponsored" },
                    { value: "marketplace", label: "Marketplace / ACA plan" },
                    { value: "medicaid", label: "Medicaid" },
                    { value: "medicare", label: "Medicare" },
                    { value: "va", label: "VA / Military" },
                    { value: "other", label: "Other" },
                  ].map(opt => (
                    <div key={opt.value} className="flex items-center gap-2.5">
                      <RadioGroupItem value={opt.value} id={`ins-${opt.value}`} />
                      <Label htmlFor={`ins-${opt.value}`} className="text-sm font-normal cursor-pointer">{opt.label}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )}

            {/* Chronic Condition */}
            <SwitchRow
              label="Do you have a chronic health condition?"
              testId="switch-chronic-condition"
              checked={form.hasChronicCondition}
              onChange={(v) => updateField("hasChronicCondition", v)}
              description="Such as diabetes, heart disease, asthma, or a mental health condition."
            />
          </div>
        )}

        {/* ── Step 6: Additional Details ─────────────────────────────────── */}
        {step === 6 && (
          <div className="space-y-6">
            {/* Citizenship */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Citizenship or Immigration Status</Label>
              <p className="text-xs text-muted-foreground mb-2">
                Some programs require U.S. citizenship or qualified immigrant status.
                This is only used for screening — your information stays in your browser.
              </p>
              <RadioGroup
                value={form.citizenshipStatus}
                onValueChange={(v) => updateField("citizenshipStatus", v)}
                className="space-y-2"
                data-testid="radio-citizenship"
              >
                {[
                  { value: "citizen", label: "U.S. Citizen" },
                  { value: "permanent-resident", label: "Lawful Permanent Resident (Green Card)" },
                  { value: "other-qualified", label: "Other qualified immigrant status" },
                  { value: "not-qualified", label: "None of the above" },
                  { value: "prefer-not-to-say", label: "Prefer not to say" },
                ].map(opt => (
                  <div key={opt.value} className="flex items-center gap-2.5">
                    <RadioGroupItem value={opt.value} id={`cit-${opt.value}`} />
                    <Label htmlFor={`cit-${opt.value}`} className="text-sm font-normal cursor-pointer">{opt.label}</Label>
                  </div>
                ))}
              </RadioGroup>
              {errors.citizenshipStatus && <p className="text-xs text-destructive mt-1">{errors.citizenshipStatus}</p>}
            </div>

            {/* Veteran */}
            <SwitchRow
              label="Are you a U.S. military veteran?"
              testId="switch-veteran"
              checked={form.isVeteran}
              onChange={(v) => updateField("isVeteran", v)}
            />

            {/* Service-connected disability — only show if veteran */}
            {form.isVeteran && (
              <SwitchRow
                label="Do you have a service-connected disability?"
                testId="switch-veteran-disability"
                checked={form.veteranServiceConnectedDisability}
                onChange={(v) => updateField("veteranServiceConnectedDisability", v)}
              />
            )}

            {/* Housing Situation */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Current Housing Situation</Label>
              <RadioGroup
                value={form.housingSituation}
                onValueChange={(v) => updateField("housingSituation", v)}
                className="space-y-2"
                data-testid="radio-housing"
              >
                {[
                  { value: "rent", label: "I rent my home" },
                  { value: "own", label: "I own my home" },
                  { value: "homeless", label: "I am experiencing homelessness" },
                  { value: "with-family", label: "Living with family or friends" },
                  { value: "subsidized", label: "Subsidized or public housing" },
                  { value: "other", label: "Other" },
                ].map(opt => (
                  <div key={opt.value} className="flex items-center gap-2.5">
                    <RadioGroupItem value={opt.value} id={`house-${opt.value}`} />
                    <Label htmlFor={`house-${opt.value}`} className="text-sm font-normal cursor-pointer">{opt.label}</Label>
                  </div>
                ))}
              </RadioGroup>
              {errors.housingSituation && <p className="text-xs text-destructive mt-1">{errors.housingSituation}</p>}
            </div>

            {/* Monthly Rent/Mortgage — show if rent or own */}
            {showRentMortgage && (
              <div>
                <Label htmlFor="monthlyRent" className="text-sm font-medium mb-1.5 block">
                  Monthly rent or mortgage payment
                </Label>
                <DollarInput
                  id="monthlyRent"
                  testId="input-rent"
                  value={form.monthlyRent}
                  onChange={(v) => updateField("monthlyRent", v)}
                />
              </div>
            )}

            {/* Utilities */}
            <SwitchRow
              label="Do you pay your own utilities?"
              testId="switch-utilities"
              checked={form.paysUtilities}
              onChange={(v) => updateField("paysUtilities", v)}
              description="Electric, gas, water, etc."
            />

            {/* Childcare expenses — show if has children */}
            {hasChildren && (
              <>
                <SwitchRow
                  label="Do you have childcare expenses?"
                  testId="switch-childcare"
                  checked={form.hasChildcareCosts}
                  onChange={(v) => updateField("hasChildcareCosts", v)}
                />

                {/* Monthly childcare cost — show if has childcare expenses */}
                {form.hasChildcareCosts && (
                  <div>
                    <Label htmlFor="monthlyChildcareCost" className="text-sm font-medium mb-1.5 block">
                      Monthly childcare cost
                    </Label>
                    <DollarInput
                      id="monthlyChildcareCost"
                      testId="input-childcare-cost"
                      value={form.monthlyChildcareCost}
                      onChange={(v) => updateField("monthlyChildcareCost", v)}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ── Navigation Buttons ─────────────────────────────────────────── */}
        <div className={isElderlyMode ? "flex justify-between mt-10 pt-6 border-t border-border" : "flex justify-between mt-8 pt-4 border-t border-border"}>
          <Button
            variant="ghost"
            onClick={goBack}
            disabled={step === 0}
            data-testid="button-back"
            className={isElderlyMode ? "gap-2 h-14 text-lg px-6" : "gap-1.5"}
          >
            <ArrowLeft className={isElderlyMode ? "w-5 h-5" : "w-4 h-4"} />
            Back
          </Button>
          <Button
            onClick={goNext}
            data-testid="button-next"
            className={isElderlyMode ? "gap-2 h-14 text-lg px-8 font-bold" : "gap-1.5"}
          >
            {step === STEPS.length - 1 ? "See My Results" : "Continue"}
            {step < STEPS.length - 1 && <ArrowRight className={isElderlyMode ? "w-5 h-5" : "w-4 h-4"} />}
          </Button>
        </div>
      </Card>

      {/* Disclaimer */}
      <div className="mt-6 flex gap-2 text-xs text-muted-foreground">
        <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
        <p>
          This tool provides estimates only and is not a guarantee of eligibility.
          Your information is not stored or shared — all screening happens in your browser.
        </p>
      </div>
    </div>
  );
}
