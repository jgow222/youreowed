import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, ArrowRight, Shield, AlertTriangle } from "lucide-react";
import { US_STATES } from "@/lib/states";
import { type UserAnswers, evaluateEligibility, type ProgramResult } from "@/lib/eligibility";
import ResultsPage from "./results";

interface FormData {
  state: string;
  zipCode: string;
  age: string;
  householdSize: string;
  numChildren: string;
  monthlyIncome: string;
  employmentStatus: string;
  hasDisability: boolean;
  citizenshipStatus: string;
  isVeteran: boolean;
  housingSituation: string;
}

const INITIAL_FORM: FormData = {
  state: "",
  zipCode: "",
  age: "",
  householdSize: "1",
  numChildren: "0",
  monthlyIncome: "",
  employmentStatus: "",
  hasDisability: false,
  citizenshipStatus: "",
  isVeteran: false,
  housingSituation: "",
};

const STEPS = [
  { id: "location", title: "Location", subtitle: "Where do you live?" },
  { id: "household", title: "Household", subtitle: "Tell us about your household" },
  { id: "income", title: "Income", subtitle: "Your household finances" },
  { id: "status", title: "Status", subtitle: "Employment and other details" },
];

export default function ScreenerPage() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [results, setResults] = useState<ProgramResult[] | null>(null);

  const updateField = useCallback((field: keyof FormData, value: string | boolean) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const validateStep = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 0: // Location
        if (!form.state) newErrors.state = "Please select your state.";
        break;
      case 1: // Household
        if (!form.age || parseInt(form.age) < 0 || parseInt(form.age) > 120)
          newErrors.age = "Please enter a valid age.";
        if (!form.householdSize || parseInt(form.householdSize) < 1)
          newErrors.householdSize = "Household size must be at least 1.";
        if (form.numChildren && parseInt(form.numChildren) >= parseInt(form.householdSize || "1"))
          newErrors.numChildren = "Number of children must be less than household size.";
        break;
      case 2: // Income
        if (form.monthlyIncome === "" || parseFloat(form.monthlyIncome) < 0)
          newErrors.monthlyIncome = "Please enter your monthly household income.";
        if (!form.employmentStatus)
          newErrors.employmentStatus = "Please select your employment status.";
        break;
      case 3: // Status
        if (!form.citizenshipStatus)
          newErrors.citizenshipStatus = "Please select an option.";
        if (!form.housingSituation)
          newErrors.housingSituation = "Please select your housing situation.";
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [step, form]);

  const goNext = useCallback(() => {
    if (!validateStep()) return;
    if (step < STEPS.length - 1) {
      setStep(s => s + 1);
    } else {
      // Submit
      const answers: UserAnswers = {
        state: form.state,
        zipCode: form.zipCode,
        age: parseInt(form.age),
        householdSize: parseInt(form.householdSize),
        numChildren: parseInt(form.numChildren || "0"),
        monthlyIncome: parseFloat(form.monthlyIncome || "0"),
        employmentStatus: form.employmentStatus as UserAnswers["employmentStatus"],
        hasDisability: form.hasDisability,
        citizenshipStatus: form.citizenshipStatus as UserAnswers["citizenshipStatus"],
        isVeteran: form.isVeteran,
        housingSituation: form.housingSituation as UserAnswers["housingSituation"],
      };
      const evaluated = evaluateEligibility(answers);
      setResults(evaluated);
    }
  }, [step, form, validateStep]);

  const goBack = useCallback(() => {
    if (step > 0) setStep(s => s - 1);
  }, [step]);

  const startOver = useCallback(() => {
    setForm(INITIAL_FORM);
    setStep(0);
    setResults(null);
    setErrors({});
  }, []);

  if (results) {
    return <ResultsPage results={results} onStartOver={startOver} userState={form.state} />;
  }

  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-muted-foreground">
              Step {step + 1} of {STEPS.length}
            </span>
            <span className="text-sm text-muted-foreground">
              {STEPS[step].title}
            </span>
          </div>
          <Progress value={progress} className="h-1.5" data-testid="progress-bar" />
        </div>

        {/* Step Card */}
        <Card className="p-6 border border-card-border" data-testid={`step-${STEPS[step].id}`}>
          <h2 className="text-lg font-semibold mb-1">{STEPS[step].subtitle}</h2>
          <p className="text-sm text-muted-foreground mb-6">
            {step === 0 && "Your state determines which programs are available to you."}
            {step === 1 && "This helps us estimate eligibility based on household composition."}
            {step === 2 && "Income is a key factor for most benefit programs."}
            {step === 3 && "A few more details to complete your screening."}
          </p>

          {/* Step 0: Location */}
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
                <p className="text-xs text-muted-foreground mt-1">May be used for local program information in future versions.</p>
              </div>
            </div>
          )}

          {/* Step 1: Household */}
          {step === 1 && (
            <div className="space-y-5">
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
              <div>
                <Label htmlFor="householdSize" className="text-sm font-medium mb-1.5 block">
                  How many people live in your household?
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
              <div>
                <Label htmlFor="numChildren" className="text-sm font-medium mb-1.5 block">
                  How many children under 18 are in your household?
                </Label>
                <Select value={form.numChildren} onValueChange={(v) => updateField("numChildren", v)}>
                  <SelectTrigger id="numChildren" data-testid="select-num-children" className="max-w-[200px]">
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
                {errors.numChildren && <p className="text-xs text-destructive mt-1">{errors.numChildren}</p>}
              </div>
            </div>
          )}

          {/* Step 2: Income & Employment */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <Label htmlFor="monthlyIncome" className="text-sm font-medium mb-1.5 block">
                  Total monthly household income (before taxes)
                </Label>
                <p className="text-xs text-muted-foreground mb-1.5">
                  Include all sources: wages, Social Security, pensions, child support, etc.
                </p>
                <div className="relative max-w-[200px]">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                  <Input
                    id="monthlyIncome"
                    data-testid="input-income"
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step={100}
                    placeholder="0"
                    value={form.monthlyIncome}
                    onChange={(e) => updateField("monthlyIncome", e.target.value)}
                    className={`pl-7 ${errors.monthlyIncome ? "border-destructive" : ""}`}
                  />
                </div>
                {errors.monthlyIncome && <p className="text-xs text-destructive mt-1">{errors.monthlyIncome}</p>}
              </div>
              <div>
                <Label className="text-sm font-medium mb-2 block">Employment Status</Label>
                <RadioGroup
                  value={form.employmentStatus}
                  onValueChange={(v) => updateField("employmentStatus", v)}
                  className="space-y-2"
                  data-testid="radio-employment"
                >
                  {[
                    { value: "employed", label: "Employed (full-time or part-time)" },
                    { value: "self-employed", label: "Self-employed" },
                    { value: "unemployed", label: "Unemployed (looking for work)" },
                    { value: "retired", label: "Retired" },
                    { value: "unable-to-work", label: "Unable to work" },
                  ].map(opt => (
                    <div key={opt.value} className="flex items-center gap-2.5">
                      <RadioGroupItem value={opt.value} id={`emp-${opt.value}`} />
                      <Label htmlFor={`emp-${opt.value}`} className="text-sm font-normal cursor-pointer">{opt.label}</Label>
                    </div>
                  ))}
                </RadioGroup>
                {errors.employmentStatus && <p className="text-xs text-destructive mt-1">{errors.employmentStatus}</p>}
              </div>
            </div>
          )}

          {/* Step 3: Status */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <Label className="text-sm font-medium mb-2 block">Do you have a disability?</Label>
                <div className="flex items-center gap-3">
                  <Switch
                    checked={form.hasDisability}
                    onCheckedChange={(v) => updateField("hasDisability", v)}
                    data-testid="switch-disability"
                  />
                  <span className="text-sm">{form.hasDisability ? "Yes" : "No"}</span>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">Citizenship or Immigration Status</Label>
                <p className="text-xs text-muted-foreground mb-2">
                  Some programs require U.S. citizenship or qualified immigrant status. This is only used for screening purposes.
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

              <div>
                <Label className="text-sm font-medium mb-2 block">Are you a U.S. military veteran?</Label>
                <div className="flex items-center gap-3">
                  <Switch
                    checked={form.isVeteran}
                    onCheckedChange={(v) => updateField("isVeteran", v)}
                    data-testid="switch-veteran"
                  />
                  <span className="text-sm">{form.isVeteran ? "Yes" : "No"}</span>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">Housing Situation</Label>
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
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-4 border-t border-border">
            <Button
              variant="ghost"
              onClick={goBack}
              disabled={step === 0}
              data-testid="button-back"
              className="gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <Button
              onClick={goNext}
              data-testid="button-next"
              className="gap-1.5"
            >
              {step === STEPS.length - 1 ? "See My Results" : "Continue"}
              {step < STEPS.length - 1 && <ArrowRight className="w-4 h-4" />}
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
