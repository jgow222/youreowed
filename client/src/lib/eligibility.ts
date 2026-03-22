// ─── Eligibility Logic Engine ───────────────────────────────────────────────
// Evaluates each program's rules against user answers.
// Returns "likely", "maybe", or "unlikely" with a brief explanation.

import { type Program, type EligibilityStatus, getMonthlyFPL, programs } from "./programs";

export type { EligibilityStatus };

export interface UserAnswers {
  // Step 1: Location
  state: string;
  zipCode: string;

  // Step 2: Personal
  age: number;
  maritalStatus: "single" | "married" | "separated" | "widowed" | "domestic-partner";
  isPregnant: boolean;
  isStudent: boolean;
  educationLevel: "none" | "high-school" | "some-college" | "bachelors" | "graduate";

  // Step 3: Household
  householdSize: number;
  numChildren: number;
  numChildrenUnder5: number;
  numChildrenUnder18: number;
  hasElderlyInHousehold: boolean; // 60+ in household

  // Step 4: Income & Assets
  monthlyIncome: number;
  incomeFromWork: number;       // earned income specifically (for EITC)
  hasOtherIncome: boolean;      // SS, pension, child support, etc.
  totalAssets: number;           // savings, checking, investments (not home/car)
  hasFiledTaxes: boolean;        // filed taxes last year

  // Step 5: Employment
  employmentStatus: "employed-full" | "employed-part" | "self-employed" | "unemployed-looking" | "unemployed-not-looking" | "retired" | "unable-to-work" | "student-only";
  recentlyLostJob: boolean;      // lost job in the last 12 months
  currentlyReceivingUI: boolean; // currently on unemployment insurance
  monthsUnemployed: number;

  // Step 6: Health & Disability
  hasDisability: boolean;
  disabilityPreventsWork: boolean;
  hasHealthInsurance: boolean;
  healthInsuranceType: "employer" | "marketplace" | "medicaid" | "medicare" | "va" | "none" | "other";
  hasChronicCondition: boolean;

  // Step 7: Additional
  citizenshipStatus: "citizen" | "permanent-resident" | "other-qualified" | "not-qualified" | "prefer-not-to-say";
  isVeteran: boolean;
  veteranServiceConnectedDisability: boolean;
  housingSituation: "rent" | "own" | "homeless" | "with-family" | "subsidized" | "other";
  monthlyRent: number;
  paysUtilities: boolean;
  hasChildcareCosts: boolean;
  monthlyChildcareCost: number;

  // New fields for expanded program matching
  hasSchoolAgeChildren: boolean;       // children ages 5-18 in school
  numSchoolAgeChildren: number;        // how many school-age children
  receivesFreeLunch: boolean;          // already getting free/reduced lunch
  needsChildcare: boolean;             // needs help paying for childcare
  numChildrenUnder13: number;          // children under 13 (for childcare)
  isHomeowner: boolean;                // owns their home
  paysMortgage: boolean;               // paying a mortgage
  monthlyMortgage: number;             // mortgage amount
  hasHighPrescriptionCosts: boolean;   // spends a lot on prescriptions
  monthlyPrescriptionCost: number;     // monthly prescription spending
  isNativeAmerican: boolean;           // Native American / Alaska Native
  workedForRailroad: boolean;          // worked for a railroad
  hasEBTCard: boolean;                 // currently has EBT/SNAP card
  receivesSSI: boolean;               // currently receives SSI
  receivesMedicaid: boolean;           // currently receives Medicaid
  needsNursingCare: boolean;          // needs nursing-level care (for PACE)
  propertyTaxAmount: number;           // annual property tax paid
}

export const DEFAULT_ANSWERS: UserAnswers = {
  state: "",
  zipCode: "",
  age: 0,
  maritalStatus: "single",
  isPregnant: false,
  isStudent: false,
  educationLevel: "none",
  householdSize: 1,
  numChildren: 0,
  numChildrenUnder5: 0,
  numChildrenUnder18: 0,
  hasElderlyInHousehold: false,
  monthlyIncome: 0,
  incomeFromWork: 0,
  hasOtherIncome: false,
  totalAssets: 0,
  hasFiledTaxes: false,
  employmentStatus: "employed-full",
  recentlyLostJob: false,
  currentlyReceivingUI: false,
  monthsUnemployed: 0,
  hasDisability: false,
  disabilityPreventsWork: false,
  hasHealthInsurance: false,
  healthInsuranceType: "none",
  hasChronicCondition: false,
  citizenshipStatus: "citizen",
  isVeteran: false,
  veteranServiceConnectedDisability: false,
  housingSituation: "rent",
  monthlyRent: 0,
  paysUtilities: false,
  hasChildcareCosts: false,
  monthlyChildcareCost: 0,

  // New fields for expanded program matching
  hasSchoolAgeChildren: false,
  numSchoolAgeChildren: 0,
  receivesFreeLunch: false,
  needsChildcare: false,
  numChildrenUnder13: 0,
  isHomeowner: false,
  paysMortgage: false,
  monthlyMortgage: 0,
  hasHighPrescriptionCosts: false,
  monthlyPrescriptionCost: 0,
  isNativeAmerican: false,
  workedForRailroad: false,
  hasEBTCard: false,
  receivesSSI: false,
  receivesMedicaid: false,
  needsNursingCare: false,
  propertyTaxAmount: 0,
};

export interface ProgramResult {
  program: Program;
  status: EligibilityStatus;
  explanation: string;
}

function getIncomePctFPL(monthlyIncome: number, householdSize: number): number {
  const monthlyFPL = getMonthlyFPL(householdSize);
  if (monthlyFPL === 0) return 0;
  return (monthlyIncome / monthlyFPL) * 100;
}

function isCitizenOrQualified(status: string): boolean {
  return status === "citizen" || status === "permanent-resident" || status === "other-qualified";
}

function isEmployed(status: string): boolean {
  return status === "employed-full" || status === "employed-part" || status === "self-employed";
}

function isUnemployed(status: string): boolean {
  return status === "unemployed-looking" || status === "unemployed-not-looking";
}

export function evaluateEligibility(answers: UserAnswers): ProgramResult[] {
  const results: ProgramResult[] = [];
  const incomePctFPL = getIncomePctFPL(answers.monthlyIncome, answers.householdSize);

  for (const program of programs) {
    const reasons: string[] = [];
    let score = 0;
    let hardFail = false;

    const { rules } = program;

    // ── State Filter ──
    if (rules.applicableStates && !rules.applicableStates.includes(answers.state)) {
      continue;
    }
    if (rules.excludedStates && rules.excludedStates.includes(answers.state)) {
      continue;
    }

    // ── Income Check ──
    if (rules.maxIncomePctFPL !== undefined) {
      const threshold = rules.maxIncomePctFPL;
      if (incomePctFPL <= threshold * 0.8) {
        score += 2;
        reasons.push(`Your household income is well within the income guideline (under ${Math.round(threshold)}% FPL).`);
      } else if (incomePctFPL <= threshold) {
        score += 1;
        reasons.push(`Your income is near the limit (${Math.round(threshold)}% FPL). Deductions may help.`);
      } else if (incomePctFPL <= threshold * 1.15) {
        score -= 1;
        reasons.push(`Your income is slightly above the typical limit, but deductions may help.`);
      } else {
        score -= 3;
        reasons.push(`Your household income exceeds the income limit for this program.`);
      }
    }

    if (rules.maxIncomeMonthly !== undefined) {
      if (answers.monthlyIncome <= rules.maxIncomeMonthly) {
        score += 2;
      } else {
        score -= 3;
        reasons.push(`Your income exceeds the $${rules.maxIncomeMonthly.toLocaleString()}/mo limit.`);
      }
    }

    // ── Age Check ──
    if (rules.minAge !== undefined) {
      if (answers.age >= rules.minAge) {
        score += 1;
        reasons.push(`You meet the age requirement (${rules.minAge}+).`);
      } else {
        if (program.id === "ss-retirement" || program.id === "medicare") {
          hardFail = true;
          reasons.push(`Requires age ${rules.minAge}+. You are ${answers.age}.`);
        } else {
          score -= 2;
          reasons.push(`Primarily for age ${rules.minAge}+.`);
        }
      }
    }

    if (rules.maxAge !== undefined && answers.age > rules.maxAge) {
      score -= 1;
      reasons.push(`Primarily for people under ${rules.maxAge + 1}.`);
    }

    // ── Children Check ──
    if (rules.requiresChildren) {
      if (answers.numChildren > 0 || answers.numChildrenUnder18 > 0) {
        score += 1;
        reasons.push(`You have children in your household.`);
      } else {
        score -= 3;
        hardFail = true;
        reasons.push(`Requires children in the household.`);
      }
    }

    // ── Children Under 5 ──
    if (rules.hasChildrenUnder5) {
      if (answers.numChildrenUnder5 > 0) {
        score += 2;
        reasons.push(`You have young children (under 5), which is a key requirement.`);
      } else if (answers.numChildren > 0) {
        score -= 1;
        reasons.push(`This program is for families with children under 5.`);
      } else {
        hardFail = true;
        reasons.push(`Requires children under age 5.`);
      }
    }

    // ── Pregnancy Check ──
    if (rules.requiresPregnant) {
      if (answers.isPregnant) {
        score += 2;
        reasons.push(`You indicated you are pregnant.`);
      } else {
        hardFail = true;
        reasons.push(`This program requires pregnancy.`);
      }
    }

    // ── Student Check ──
    if (rules.requiresStudent) {
      if (answers.isStudent) {
        score += 2;
        reasons.push(`You are currently a student.`);
      } else {
        hardFail = true;
        reasons.push(`Requires current student enrollment.`);
      }
    }

    // ── Disability Check ──
    if (rules.requiresDisability) {
      if (answers.hasDisability) {
        score += 2;
        if (answers.disabilityPreventsWork) {
          score += 1;
          reasons.push(`Your disability prevents work, which strengthens eligibility.`);
        } else {
          reasons.push(`You indicated a disability.`);
        }
      } else if (answers.employmentStatus === "unable-to-work") {
        score += 1;
        reasons.push(`Your work status suggests a possible qualifying condition.`);
      } else {
        if (program.id === "ssdi" || program.id === "va-disability") {
          hardFail = true;
        }
        score -= 3;
        reasons.push(`Requires a qualifying disability.`);
      }
    }

    // ── Citizenship Check ──
    if (rules.requiresUSCitizen) {
      if (isCitizenOrQualified(answers.citizenshipStatus)) {
        // Fine
      } else if (answers.citizenshipStatus === "prefer-not-to-say") {
        score -= 1;
        reasons.push(`Citizenship may be required — check the official site.`);
      } else {
        score -= 2;
        reasons.push(`Typically requires U.S. citizenship or qualified immigrant status.`);
      }
    }

    // ── Employment Check ──
    if (rules.requiresEmployed) {
      if (isEmployed(answers.employmentStatus)) {
        score += 1;
        if (answers.incomeFromWork > 0) {
          score += 1;
          reasons.push(`You have earned income of $${answers.incomeFromWork.toLocaleString()}/mo from work.`);
        } else {
          reasons.push(`You are employed.`);
        }
      } else {
        score -= 3;
        hardFail = true;
        reasons.push(`Requires earned income from work.`);
      }
    }

    if (rules.requiresUnemployed || rules.requiresRecentlyUnemployed) {
      if (isUnemployed(answers.employmentStatus) || answers.recentlyLostJob) {
        score += 2;
        if (answers.recentlyLostJob) {
          reasons.push(`You recently lost your job.`);
        } else {
          reasons.push(`You are currently unemployed.`);
        }
      } else {
        score -= 3;
        hardFail = true;
        reasons.push(`For people who recently lost their job.`);
      }
    }

    // ── Veteran Check ──
    if (rules.requiresVeteran) {
      if (answers.isVeteran) {
        score += 2;
        if (answers.veteranServiceConnectedDisability && (program.id.includes("va-disability") || program.id.includes("va-"))) {
          score += 1;
          reasons.push(`Veteran with service-connected disability.`);
        } else {
          reasons.push(`You are a veteran.`);
        }
      } else {
        hardFail = true;
        reasons.push(`Exclusively for military veterans.`);
      }
    }

    // ── Senior Check ──
    if (rules.requiresSenior) {
      if (answers.age >= 65) {
        score += 1;
      } else {
        score -= 2;
        reasons.push(`Primarily for people 65+.`);
      }
    }

    // ── Housing Checks ──
    if (rules.requiresRenter) {
      if (answers.housingSituation === "rent") {
        score += 1;
        if (answers.monthlyRent > 0 && answers.monthlyRent > answers.monthlyIncome * 0.3) {
          score += 1;
          reasons.push(`You spend over 30% of income on rent — a sign of housing cost burden.`);
        }
      } else {
        score -= 1;
      }
    }

    if (rules.requiresHomeless) {
      if (answers.housingSituation === "homeless") {
        score += 2;
      } else {
        score -= 2;
      }
    }

    // ── Health Insurance Check (for programs that require being uninsured) ──
    if (program.category === "Healthcare" && program.level === "state") {
      if (answers.healthInsuranceType === "none") {
        score += 1;
        reasons.push(`You don't currently have health insurance.`);
      } else if (answers.healthInsuranceType === "medicaid" || answers.healthInsuranceType === "medicare") {
        // Already on government health insurance — may still qualify for other programs
      }
    }

    // ── Utility programs: check if they pay utilities ──
    if (program.category === "Utilities") {
      if (answers.paysUtilities) {
        score += 1;
      } else if (answers.housingSituation === "rent" || answers.housingSituation === "own") {
        // Likely pays utilities even if not explicitly said
      } else {
        score -= 1;
      }
    }

    // ── Childcare programs ──
    if (program.category === "Childcare" || program.id.includes("childcare") || program.id.includes("head-start")) {
      if (answers.hasChildcareCosts && answers.monthlyChildcareCost > 0) {
        score += 2;
        reasons.push(`You have childcare costs of $${answers.monthlyChildcareCost.toLocaleString()}/mo.`);
      } else if (answers.numChildrenUnder5 > 0) {
        score += 1;
      }
    }

    // ── Tax credit specific: need to have filed taxes ──
    if (program.category === "Tax Credits") {
      if (answers.hasFiledTaxes) {
        score += 1;
      } else {
        reasons.push(`You may need to file a tax return to claim this credit.`);
      }
    }

    // ── Asset check for programs with strict resource limits ──
    if (program.id === "ssi" && answers.totalAssets > 2000) {
      score -= 2;
      reasons.push(`SSI has a $2,000 resource limit ($3,000 for couples). You reported $${answers.totalAssets.toLocaleString()} in assets.`);
    }

    // ── Special program-specific logic ──
    if (program.id === "ssi") {
      if (answers.age < 65 && !answers.hasDisability && answers.employmentStatus !== "unable-to-work") {
        score -= 2;
        reasons.push(`SSI requires age 65+, blindness, or a qualifying disability.`);
      }
    }

    if (program.id === "medicare" && answers.age < 65) {
      if (answers.hasDisability) {
        hardFail = false;
        score = 0;
        reasons.length = 0;
        reasons.push(`Under 65 with a disability — may qualify via SSDI after 24 months.`);
      }
    }

    // ── EITC: boost score for families with children + earned income ──
    if (program.id === "eitc") {
      if (answers.numChildren > 0 && answers.incomeFromWork > 0) {
        score += 1;
        reasons.push(`Working families with children get the largest EITC amounts.`);
      }
    }

    // ── Derived: isHomeowner ──
    const isHomeowner = answers.isHomeowner || answers.housingSituation === "own";

    // ── School-age children programs (NSLP, SBP, Summer EBT) ──
    if ((program.rules.requiresChildren && (program.id.includes('school') || program.id.includes('nslp') || program.id.includes('sbp') || program.id.includes('summer-ebt')))) {
      if (answers.hasSchoolAgeChildren && answers.numSchoolAgeChildren > 0) {
        score += 2;
        reasons.push("Has school-age children");
      } else if (answers.numChildrenUnder18 > 0) {
        score += 1;
        reasons.push("Has children who may be school-age");
      } else {
        hardFail = true;
      }
    }

    // ── Childcare programs ──
    if (program.id.includes('childcare') || program.id.includes('ccdf')) {
      if (answers.needsChildcare && answers.numChildrenUnder13 > 0) {
        score += 2;
      } else if (answers.numChildrenUnder18 > 0) {
        score += 1;
      }
    }

    // ── EBT discount programs (Amazon, Walmart) ──
    if (program.id.includes('amazon') || program.id.includes('walmart')) {
      if (answers.hasEBTCard || answers.receivesSSI || answers.receivesMedicaid) {
        score += 3;
        reasons.push("Has qualifying assistance");
      } else if (incomePctFPL <= 200) {
        score += 1;
        reasons.push("May qualify for SNAP/Medicaid first");
      } else {
        hardFail = true;
      }
    }

    // ── Prescription drug programs ──
    if (program.id.includes('prescription') || program.id.includes('spap') || program.id.includes('epic') || program.id.includes('paad') || program.id.includes('pace-rx') || program.id.includes('pacenet')) {
      if (answers.hasHighPrescriptionCosts && answers.age >= 65) {
        score += 2;
      } else if (answers.age >= 65) {
        score += 1;
      }
    }

    // ── Property tax relief ──
    if (program.id.includes('property-tax') || program.id.includes('circuit-breaker')) {
      if (isHomeowner && answers.propertyTaxAmount > 0) {
        score += 2;
      } else if (answers.housingSituation === "own") {
        score += 1;
      }
    }

    // ── Railroad retirement ──
    if (program.id.includes('railroad')) {
      if (answers.workedForRailroad) {
        score += 3;
      } else {
        hardFail = true;
      }
    }

    // ── Tribal programs ──
    if (program.id.includes('tribal')) {
      if (answers.isNativeAmerican) {
        score += 3;
      } else {
        hardFail = true;
      }
    }

    // ── PACE (nursing care) ──
    if (program.id.includes('pace') && !program.id.includes('pacenet')) {
      if (answers.needsNursingCare && answers.age >= 55) {
        score += 2;
      } else if (answers.age >= 55 && answers.hasDisability) {
        score += 1;
      } else {
        hardFail = true;
      }
    }

    // ── State EITC programs ──
    if (program.id.includes('state-eitc')) {
      if (answers.hasFiledTaxes && answers.incomeFromWork > 0) {
        score += 2;
      } else if (answers.incomeFromWork > 0) {
        score += 1;
      }
    }

    // ── Determine Status ──
    let status: EligibilityStatus;
    if (hardFail) {
      status = "unlikely";
    } else if (score >= 2) {
      status = "likely";
    } else if (score >= 0) {
      status = "maybe";
    } else {
      status = "unlikely";
    }

    const explanation = reasons.length > 0
      ? reasons.join(" ")
      : getDefaultExplanation(status, program);

    results.push({ program, status, explanation });
  }

  // Sort: likely first, then maybe, then unlikely
  const statusOrder: Record<EligibilityStatus, number> = { likely: 0, maybe: 1, unlikely: 2 };
  results.sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);

  return results;
}

function getDefaultExplanation(status: EligibilityStatus, program: Program): string {
  switch (status) {
    case "likely":
      return `Based on your answers, you appear to meet the basic criteria for ${program.name}.`;
    case "maybe":
      return `You may qualify for ${program.name}, but additional factors could affect eligibility.`;
    case "unlikely":
      return `Based on your answers, you may not meet the criteria for ${program.name} at this time.`;
  }
}
