// ─── Eligibility Logic Engine ───────────────────────────────────────────────
// Evaluates each program's rules against user answers.
// Returns "likely", "maybe", or "unlikely" with a brief explanation.

import { type Program, type EligibilityStatus, getMonthlyFPL, programs } from "./programs";

export interface UserAnswers {
  state: string;
  zipCode: string;
  age: number;
  householdSize: number;
  numChildren: number;
  monthlyIncome: number;
  employmentStatus: "employed" | "unemployed" | "self-employed" | "retired" | "unable-to-work";
  hasDisability: boolean;
  citizenshipStatus: "citizen" | "permanent-resident" | "other-qualified" | "not-qualified" | "prefer-not-to-say";
  isVeteran: boolean;
  housingSituation: "rent" | "own" | "homeless" | "other";
}

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

export function evaluateEligibility(answers: UserAnswers): ProgramResult[] {
  const results: ProgramResult[] = [];
  const incomePctFPL = getIncomePctFPL(answers.monthlyIncome, answers.householdSize);
  const monthlyFPL = getMonthlyFPL(answers.householdSize);

  for (const program of programs) {
    const reasons: string[] = [];
    let score = 0; // positive = more likely, negative = less likely
    let hardFail = false;

    const { rules } = program;

    // ── State Filter ──
    if (rules.applicableStates && !rules.applicableStates.includes(answers.state)) {
      // Skip state-specific programs that don't apply to user's state
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
        reasons.push(`Your household income is well within the income guideline (under ${Math.round(threshold)}% of poverty level).`);
      } else if (incomePctFPL <= threshold) {
        score += 1;
        reasons.push(`Your household income is near the income limit (${Math.round(threshold)}% of poverty level).`);
      } else if (incomePctFPL <= threshold * 1.15) {
        score -= 1;
        reasons.push(`Your income is slightly above the typical limit, but deductions or other factors may help.`);
      } else {
        score -= 3;
        reasons.push(`Your household income appears to exceed the income limit for this program.`);
      }
    }

    if (rules.maxIncomeMonthly !== undefined) {
      if (answers.monthlyIncome <= rules.maxIncomeMonthly) {
        score += 2;
        reasons.push(`Your income is within the monthly limit of $${rules.maxIncomeMonthly.toLocaleString()}.`);
      } else {
        score -= 3;
        reasons.push(`Your income exceeds the monthly limit of $${rules.maxIncomeMonthly.toLocaleString()}.`);
      }
    }

    // ── Age Check ──
    if (rules.minAge !== undefined) {
      if (answers.age >= rules.minAge) {
        score += 1;
        reasons.push(`You meet the minimum age requirement (${rules.minAge}+).`);
      } else {
        // For programs like SS retirement, this is a hard requirement
        if (program.id === "ss-retirement" || program.id === "medicare") {
          hardFail = true;
          reasons.push(`This program requires you to be at least ${rules.minAge}. You indicated you are ${answers.age}.`);
        } else {
          score -= 2;
          reasons.push(`This program is primarily for people age ${rules.minAge}+.`);
        }
      }
    }

    if (rules.maxAge !== undefined) {
      if (answers.age <= rules.maxAge) {
        // Age is within range, no penalty
      } else {
        score -= 1;
        reasons.push(`This program is primarily for people under ${rules.maxAge + 1}.`);
      }
    }

    // ── Children Check ──
    if (rules.requiresChildren) {
      if (answers.numChildren > 0) {
        score += 1;
        reasons.push(`You have children in your household, which is a requirement.`);
      } else {
        score -= 3;
        reasons.push(`This program requires children in the household.`);
        hardFail = true;
      }
    }

    // ── Disability Check ──
    if (rules.requiresDisability) {
      if (answers.hasDisability) {
        score += 2;
        reasons.push(`You indicated a disability, which is relevant to this program.`);
      } else if (answers.employmentStatus === "unable-to-work") {
        score += 1;
        reasons.push(`Your work status suggests a possible qualifying condition.`);
      } else {
        if (program.id === "ssdi" || program.id === "va-disability") {
          hardFail = true;
        }
        score -= 3;
        reasons.push(`This program requires a qualifying disability.`);
      }
    }

    // ── Citizenship Check ──
    if (rules.requiresUSCitizen) {
      if (isCitizenOrQualified(answers.citizenshipStatus)) {
        // Fine
      } else if (answers.citizenshipStatus === "prefer-not-to-say") {
        score -= 1;
        reasons.push(`Citizenship or qualified immigrant status may be required. Check the official site for details.`);
      } else {
        score -= 2;
        reasons.push(`This program typically requires U.S. citizenship or qualified immigrant status.`);
      }
    }

    // ── Employment Check ──
    if (rules.requiresEmployed) {
      if (answers.employmentStatus === "employed" || answers.employmentStatus === "self-employed") {
        score += 1;
        reasons.push(`You have earned income, which is required.`);
      } else {
        score -= 3;
        reasons.push(`This program requires earned income from work.`);
        hardFail = true;
      }
    }

    if (rules.requiresUnemployed) {
      if (answers.employmentStatus === "unemployed") {
        score += 2;
        reasons.push(`You indicated you are currently unemployed.`);
      } else {
        score -= 3;
        reasons.push(`This program is for people who have recently lost their job.`);
        hardFail = true;
      }
    }

    // ── Veteran Check ──
    if (rules.requiresVeteran) {
      if (answers.isVeteran) {
        score += 2;
        reasons.push(`You indicated veteran status, which qualifies you to apply.`);
      } else {
        hardFail = true;
        reasons.push(`This program is exclusively for military veterans.`);
      }
    }

    // ── Senior Check (for programs that target 65+) ──
    if (rules.requiresSenior) {
      if (answers.age >= 65) {
        score += 1;
      } else {
        score -= 2;
        reasons.push(`This program is primarily for people 65 and older.`);
      }
    }

    // ── Renter Check ──
    if (rules.requiresRenter) {
      if (answers.housingSituation === "rent") {
        score += 1;
      } else {
        score -= 1;
      }
    }

    // ── Homeless Check ──
    if (rules.requiresHomeless) {
      if (answers.housingSituation === "homeless") {
        score += 2;
      } else {
        score -= 2;
      }
    }

    // ── Special program-specific logic ──
    // SSI: must be 65+, blind, or disabled
    if (program.id === "ssi") {
      if (answers.age < 65 && !answers.hasDisability && answers.employmentStatus !== "unable-to-work") {
        score -= 2;
        reasons.push(`SSI requires you to be 65+, blind, or have a qualifying disability.`);
      }
    }

    // Medicare: also covers disabled people under 65 who've received SSDI for 24 months
    if (program.id === "medicare" && answers.age < 65) {
      if (answers.hasDisability) {
        hardFail = false;
        score = 0;
        reasons.length = 0;
        reasons.push(`While under 65, people with disabilities who have received SSDI for 24 months may qualify for Medicare.`);
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

    // Build explanation
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
