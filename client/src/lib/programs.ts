// ─── Program Data Schema & Seed Data ───────────────────────────────────────
// Each program has: name, level, description, target population,
// simplified eligibility rules, and official website link.
// Rules are intentionally simplified for directional screening only.

export type ProgramLevel = "federal" | "state";
export type EligibilityStatus = "likely" | "maybe" | "unlikely";

export interface EligibilityRule {
  // All thresholds are optional — if omitted, that factor isn't checked
  maxIncomePctFPL?: number;           // Max income as % of Federal Poverty Level
  maxIncomeMonthly?: number;          // Flat monthly income cap (for programs that don't use FPL)
  minAge?: number;
  maxAge?: number;
  requiresChildren?: boolean;
  requiresDisability?: boolean;
  requiresUSCitizen?: boolean;        // true = must be citizen/qualified immigrant
  requiresEmployed?: boolean;         // true = must be employed
  requiresUnemployed?: boolean;       // true = must be unemployed/lost job
  requiresVeteran?: boolean;
  requiresHomeless?: boolean;
  requiresRenter?: boolean;
  requiresSenior?: boolean;           // age 65+
  applicableStates?: string[];        // If set, only these state codes apply
  excludedStates?: string[];          // States where program doesn't apply
  minHouseholdSize?: number;
}

export interface Program {
  id: string;
  name: string;
  level: ProgramLevel;
  stateCode?: string;                  // For state-level programs
  category: string;
  description: string;
  targetPopulation: string;
  rules: EligibilityRule;
  url: string;
  notes?: string;
}

// 2025 Federal Poverty Level (48 contiguous states + DC)
// Source: HHS https://aspe.hhs.gov/poverty-guidelines
export const FPL_2025: Record<number, number> = {
  1: 15650,
  2: 21150,
  3: 26650,
  4: 32150,
  5: 37650,
  6: 43150,
  7: 48650,
  8: 54150,
};

// For households > 8, add $5,500 per additional person
export function getFPL(householdSize: number): number {
  if (householdSize <= 8) return FPL_2025[householdSize] || FPL_2025[1];
  return FPL_2025[8] + (householdSize - 8) * 5500;
}

export function getMonthlyFPL(householdSize: number): number {
  return Math.round(getFPL(householdSize) / 12);
}

export const programs: Program[] = [
  // ─── FEDERAL PROGRAMS ─────────────────────────────────────────────────────

  // Food Assistance
  {
    id: "snap",
    name: "SNAP (Food Stamps)",
    level: "federal",
    category: "Food Assistance",
    description: "Provides monthly benefits on an EBT card to buy groceries. Most households must have gross income below 130% of the federal poverty level.",
    targetPopulation: "Low-income individuals and families",
    rules: {
      maxIncomePctFPL: 130,
      requiresUSCitizen: true,
    },
    url: "https://www.fns.usda.gov/snap/recipient/eligibility",
    notes: "Many states use broader income limits (up to 200% FPL) through categorical eligibility. Asset tests vary by state.",
  },

  // Healthcare
  {
    id: "medicaid-adult",
    name: "Medicaid (Adults)",
    level: "federal",
    category: "Healthcare",
    description: "Free or low-cost health coverage for adults with limited income. In expansion states, adults under 65 with income up to 138% FPL may qualify.",
    targetPopulation: "Low-income adults under 65",
    rules: {
      maxIncomePctFPL: 138,
      maxAge: 64,
      requiresUSCitizen: true,
    },
    url: "https://www.healthcare.gov/medicaid-chip/getting-medicaid-chip/",
    notes: "Not all states have expanded Medicaid. In non-expansion states, eligibility for childless adults is very limited.",
  },
  {
    id: "chip",
    name: "CHIP (Children's Health Insurance)",
    level: "federal",
    category: "Healthcare",
    description: "Provides health coverage for children in families that earn too much for Medicaid but cannot afford private insurance. Income limits vary by state, typically up to 200-300% FPL.",
    targetPopulation: "Children in low-to-moderate income families",
    rules: {
      maxIncomePctFPL: 250,
      requiresChildren: true,
      requiresUSCitizen: true,
    },
    url: "https://www.healthcare.gov/medicaid-chip/childrens-health-insurance-program/",
    notes: "Each state sets its own CHIP income limit. Some cover children up to 300% FPL or higher.",
  },
  {
    id: "medicare",
    name: "Medicare",
    level: "federal",
    category: "Healthcare",
    description: "Federal health insurance for people 65 and older, and some younger people with disabilities. Part A (hospital) is generally premium-free if you paid Medicare taxes for 10+ years.",
    targetPopulation: "Seniors 65+ and people with disabilities",
    rules: {
      minAge: 65,
    },
    url: "https://www.medicare.gov/basics/get-started-with-medicare",
    notes: "People under 65 with certain disabilities or ESRD may also qualify. No income limit for basic eligibility.",
  },

  // Social Security
  {
    id: "ss-retirement",
    name: "Social Security Retirement",
    level: "federal",
    category: "Retirement & Disability",
    description: "Monthly retirement benefits for workers who paid Social Security taxes. You can claim reduced benefits at 62 or full benefits between 66-67 depending on birth year.",
    targetPopulation: "Workers age 62+",
    rules: {
      minAge: 62,
    },
    url: "https://www.ssa.gov/retirement",
    notes: "Benefit amount depends on lifetime earnings and age at claiming. Must have earned at least 40 work credits (about 10 years of work).",
  },
  {
    id: "ssdi",
    name: "SSDI (Social Security Disability)",
    level: "federal",
    category: "Retirement & Disability",
    description: "Monthly benefits for people who can no longer work due to a significant disability expected to last at least 12 months. Based on your prior work history.",
    targetPopulation: "Workers with disabilities",
    rules: {
      requiresDisability: true,
    },
    url: "https://www.ssa.gov/disability",
    notes: "Requires sufficient work credits. The disability must prevent you from doing substantial gainful activity ($1,550/month in 2025).",
  },
  {
    id: "ssi",
    name: "SSI (Supplemental Security Income)",
    level: "federal",
    category: "Retirement & Disability",
    description: "Monthly cash assistance for people who are aged 65+, blind, or disabled and have very limited income and resources. Maximum federal benefit is $967/month for an individual in 2025.",
    targetPopulation: "Seniors, blind, or disabled individuals with very low income",
    rules: {
      maxIncomePctFPL: 75,
      requiresUSCitizen: true,
    },
    url: "https://www.ssa.gov/ssi",
    notes: "Resource limit: $2,000 individual / $3,000 couple. Must be age 65+, blind, or have a qualifying disability.",
  },

  // Employment
  {
    id: "unemployment",
    name: "Unemployment Insurance",
    level: "federal",
    category: "Employment",
    description: "Temporary financial assistance for workers who lost their job through no fault of their own. Typically provides a portion of previous wages for up to 26 weeks.",
    targetPopulation: "Recently unemployed workers",
    rules: {
      requiresUnemployed: true,
    },
    url: "https://www.careeronestop.org/LocalHelp/UnemploymentBenefits/find-unemployment-benefits.aspx",
    notes: "Administered by states; benefit amounts and duration vary significantly. You must have earned enough wages in a prior 'base period' and be actively seeking work.",
  },

  // Housing
  {
    id: "section8",
    name: "Section 8 / Housing Choice Voucher",
    level: "federal",
    category: "Housing",
    description: "Helps very low-income families, the elderly, and people with disabilities afford safe housing in the private market. You pay about 30% of your income toward rent; the voucher covers the rest.",
    targetPopulation: "Very low-income families, elderly, and disabled",
    rules: {
      maxIncomePctFPL: 150,
      requiresUSCitizen: true,
    },
    url: "https://www.hud.gov/topics/housing_choice_voucher_program_section_8",
    notes: "Extremely long waiting lists in most areas. Income limit is generally 50% of area median income. Administered by local Public Housing Authorities.",
  },
  {
    id: "public-housing",
    name: "Public Housing",
    level: "federal",
    category: "Housing",
    description: "Affordable rental housing for eligible low-income families, the elderly, and people with disabilities. Rent is typically set at 30% of your adjusted income.",
    targetPopulation: "Low-income families, elderly, and disabled",
    rules: {
      maxIncomePctFPL: 200,
      requiresUSCitizen: true,
    },
    url: "https://www.hud.gov/topics/rental_assistance/phprog",
    notes: "Managed by local housing authorities. Availability and waiting times vary greatly by location.",
  },
  {
    id: "liheap",
    name: "LIHEAP (Energy Assistance)",
    level: "federal",
    category: "Housing",
    description: "Helps low-income households pay heating and cooling bills. May also help with energy-related home repairs and weatherization.",
    targetPopulation: "Low-income households",
    rules: {
      maxIncomePctFPL: 150,
    },
    url: "https://www.acf.hhs.gov/ocs/low-income-home-energy-assistance-program-liheap",
    notes: "Typically available seasonally. Administered by states; income limits and benefit amounts vary.",
  },

  // Tax Credits
  {
    id: "eitc",
    name: "Earned Income Tax Credit (EITC)",
    level: "federal",
    category: "Tax Credits",
    description: "A refundable tax credit for working people with low to moderate income. Worth up to $7,830 for a family with 3+ children (2025 tax year). You must file a tax return to claim it.",
    targetPopulation: "Working individuals and families with low-moderate income",
    rules: {
      maxIncomePctFPL: 350,
      requiresEmployed: true,
      requiresUSCitizen: true,
    },
    url: "https://www.irs.gov/credits-deductions/individuals/earned-income-tax-credit-eitc",
    notes: "Income limits for 2025: ~$18,591 (no children) to ~$59,899 (3+ children). Must have earned income from work.",
  },
  {
    id: "ctc",
    name: "Child Tax Credit",
    level: "federal",
    category: "Tax Credits",
    description: "A tax credit of up to $2,000 per qualifying child under 17. A portion (up to $1,700) is refundable even if you owe no tax.",
    targetPopulation: "Families with children under 17",
    rules: {
      requiresChildren: true,
      maxIncomePctFPL: 700,
      requiresUSCitizen: true,
    },
    url: "https://www.irs.gov/credits-deductions/individuals/child-tax-credit",
    notes: "Phases out at $200,000 (single) / $400,000 (married filing jointly). Child must have SSN.",
  },
  {
    id: "cdctc",
    name: "Child and Dependent Care Credit",
    level: "federal",
    category: "Tax Credits",
    description: "A tax credit for child care or dependent care expenses that allow you to work. Covers 20-35% of up to $3,000 for one dependent or $6,000 for two or more.",
    targetPopulation: "Working parents and caregivers",
    rules: {
      requiresEmployed: true,
      requiresChildren: true,
    },
    url: "https://www.irs.gov/credits-deductions/individuals/child-and-dependent-care-credit-information",
    notes: "Both spouses must work (or one must be a student/disabled). The dependent must be under 13, or a spouse/dependent unable to care for themselves.",
  },

  // Nutrition
  {
    id: "wic",
    name: "WIC (Women, Infants, and Children)",
    level: "federal",
    category: "Food Assistance",
    description: "Provides nutritious foods, nutrition education, and healthcare referrals for pregnant women, new mothers, infants, and children under 5.",
    targetPopulation: "Pregnant/postpartum women and children under 5",
    rules: {
      maxIncomePctFPL: 185,
      requiresChildren: true,
    },
    url: "https://www.fns.usda.gov/wic",
    notes: "Must be pregnant, breastfeeding, or have children under 5. Must be found at nutritional risk by a health professional.",
  },
  {
    id: "school-lunch",
    name: "Free/Reduced School Lunch",
    level: "federal",
    category: "Food Assistance",
    description: "Free or reduced-price meals at school for children from low-income families. Free meals for families under 130% FPL; reduced-price for under 185% FPL.",
    targetPopulation: "School-age children in low-income families",
    rules: {
      maxIncomePctFPL: 185,
      requiresChildren: true,
    },
    url: "https://www.fns.usda.gov/nslp",
    notes: "Families receiving SNAP, TANF, or FDPIR are automatically eligible. Some schools provide free meals to all students.",
  },

  // Veteran benefits
  {
    id: "va-healthcare",
    name: "VA Healthcare",
    level: "federal",
    category: "Veterans",
    description: "Comprehensive healthcare services for eligible military veterans through the VA system, including preventive care, mental health, and specialty care.",
    targetPopulation: "Military veterans",
    rules: {
      requiresVeteran: true,
    },
    url: "https://www.va.gov/health-care/",
    notes: "Eligibility priority based on service-connected disabilities, income, and other factors. Most veterans who served in active duty are eligible.",
  },
  {
    id: "va-disability",
    name: "VA Disability Compensation",
    level: "federal",
    category: "Veterans",
    description: "Tax-free monthly payments for veterans with service-connected disabilities. Amount depends on disability rating (10-100%).",
    targetPopulation: "Veterans with service-connected disabilities",
    rules: {
      requiresVeteran: true,
      requiresDisability: true,
    },
    url: "https://www.va.gov/disability/",
    notes: "Must have a disability related to military service. Ratings range from 0% to 100%.",
  },
  {
    id: "va-pension",
    name: "VA Pension",
    level: "federal",
    category: "Veterans",
    description: "Monthly benefit for wartime veterans age 65+ or with disabilities, who have limited income. Provides a supplement to bring total income to a set level.",
    targetPopulation: "Low-income wartime veterans",
    rules: {
      requiresVeteran: true,
      maxIncomePctFPL: 150,
    },
    url: "https://www.va.gov/pension/",
    notes: "Must have served during a period of war. Net worth limit applies.",
  },

  // ─── STATE PROGRAMS: CALIFORNIA ───────────────────────────────────────────

  {
    id: "ca-calfresh",
    name: "CalFresh (California SNAP)",
    level: "state",
    stateCode: "CA",
    category: "Food Assistance",
    description: "California's SNAP program with broader income limits than the federal standard. Gross income limit is 200% FPL for most households through categorical eligibility.",
    targetPopulation: "Low-income California residents",
    rules: {
      maxIncomePctFPL: 200,
      requiresUSCitizen: true,
      applicableStates: ["CA"],
    },
    url: "https://www.cdss.ca.gov/calfresh",
    notes: "California uses broad-based categorical eligibility, allowing gross income up to 200% FPL.",
  },
  {
    id: "ca-medi-cal",
    name: "Medi-Cal",
    level: "state",
    stateCode: "CA",
    category: "Healthcare",
    description: "California's Medicaid program. Covers adults up to 138% FPL, children up to 266% FPL, and pregnant women up to 213% FPL. California has removed immigration status requirements for full-scope coverage.",
    targetPopulation: "Low-income California residents",
    rules: {
      maxIncomePctFPL: 138,
      applicableStates: ["CA"],
    },
    url: "https://www.dhcs.ca.gov/services/medi-cal",
    notes: "California provides full-scope Medi-Cal regardless of immigration status. Higher income limits for children and pregnant women.",
  },
  {
    id: "ca-calworks",
    name: "CalWORKs",
    level: "state",
    stateCode: "CA",
    category: "Cash Assistance",
    description: "California's welfare-to-work program providing temporary cash aid and services to eligible families with children. Includes job training and support services.",
    targetPopulation: "Low-income California families with children",
    rules: {
      maxIncomePctFPL: 100,
      requiresChildren: true,
      requiresUSCitizen: true,
      applicableStates: ["CA"],
    },
    url: "https://www.cdss.ca.gov/calworks",
    notes: "Time-limited (48-month lifetime limit). Must participate in welfare-to-work activities.",
  },
  {
    id: "ca-care",
    name: "CARE (Energy Discount)",
    level: "state",
    stateCode: "CA",
    category: "Utilities",
    description: "California's utility bill discount program providing a 20-35% discount on gas and electric bills for qualifying low-income households.",
    targetPopulation: "Low-income California households",
    rules: {
      maxIncomePctFPL: 200,
      applicableStates: ["CA"],
    },
    url: "https://www.cpuc.ca.gov/industries-and-topics/electrical-energy/electric-costs/care-fera-702",
    notes: "Also see FERA (Family Electric Rate Assistance) for households between 200-250% FPL.",
  },

  // ─── STATE PROGRAMS: TEXAS ────────────────────────────────────────────────

  {
    id: "tx-snap",
    name: "Texas SNAP",
    level: "state",
    stateCode: "TX",
    category: "Food Assistance",
    description: "Texas SNAP uses broad-based categorical eligibility with a gross income limit of 165% FPL for most households.",
    targetPopulation: "Low-income Texas residents",
    rules: {
      maxIncomePctFPL: 165,
      requiresUSCitizen: true,
      applicableStates: ["TX"],
    },
    url: "https://www.hhs.texas.gov/services/food/snap-food-benefits",
    notes: "Texas does not use an asset test for most SNAP applicants.",
  },
  {
    id: "tx-medicaid",
    name: "Texas Medicaid",
    level: "state",
    stateCode: "TX",
    category: "Healthcare",
    description: "Texas has not expanded Medicaid. Coverage is primarily for children, pregnant women, elderly, and people with disabilities. Adults without children generally do not qualify.",
    targetPopulation: "Low-income Texas children, pregnant women, elderly, and disabled",
    rules: {
      maxIncomePctFPL: 100,
      requiresUSCitizen: true,
      applicableStates: ["TX"],
    },
    url: "https://www.hhs.texas.gov/services/health/medicaid-chip",
    notes: "Texas is a non-expansion state. Childless adults under 65 without disabilities have very limited Medicaid options.",
  },
  {
    id: "tx-tanf",
    name: "TANF (Texas)",
    level: "state",
    stateCode: "TX",
    category: "Cash Assistance",
    description: "Temporary cash assistance for very low-income families with children in Texas. One of the most restrictive TANF programs in the country.",
    targetPopulation: "Very low-income Texas families with children",
    rules: {
      maxIncomePctFPL: 50,
      requiresChildren: true,
      requiresUSCitizen: true,
      applicableStates: ["TX"],
    },
    url: "https://www.hhs.texas.gov/services/financial/cash-help",
    notes: "Texas TANF has very low benefit levels and strict requirements.",
  },
  {
    id: "tx-chip",
    name: "Texas CHIP",
    level: "state",
    stateCode: "TX",
    category: "Healthcare",
    description: "Low-cost health coverage for uninsured Texas children in families with income up to 201% FPL. Covers doctor visits, prescriptions, dental, vision, and more.",
    targetPopulation: "Uninsured children in Texas families",
    rules: {
      maxIncomePctFPL: 201,
      requiresChildren: true,
      requiresUSCitizen: true,
      applicableStates: ["TX"],
    },
    url: "https://www.hhs.texas.gov/services/health/medicaid-chip",
    notes: "Small monthly premium and co-pays may apply. Children must be uninsured.",
  },

  // ─── STATE PROGRAMS: NEW YORK ─────────────────────────────────────────────

  {
    id: "ny-snap",
    name: "New York SNAP",
    level: "state",
    stateCode: "NY",
    category: "Food Assistance",
    description: "New York SNAP uses categorical eligibility with a gross income limit of 200% FPL. The state also provides additional benefits through the Heat and Eat program.",
    targetPopulation: "Low-income New York residents",
    rules: {
      maxIncomePctFPL: 200,
      requiresUSCitizen: true,
      applicableStates: ["NY"],
    },
    url: "https://otda.ny.gov/programs/snap/",
    notes: "New York has eliminated the asset test for most households.",
  },
  {
    id: "ny-medicaid",
    name: "New York Medicaid",
    level: "state",
    stateCode: "NY",
    category: "Healthcare",
    description: "New York's expanded Medicaid program covers adults up to 138% FPL. The state also offers the Essential Plan for those between 138-200% FPL at very low or no cost.",
    targetPopulation: "Low-income New York residents",
    rules: {
      maxIncomePctFPL: 138,
      applicableStates: ["NY"],
    },
    url: "https://www.health.ny.gov/health_care/medicaid/",
    notes: "New York is a Medicaid expansion state. The Essential Plan covers additional income levels.",
  },
  {
    id: "ny-essential-plan",
    name: "Essential Plan (New York)",
    level: "state",
    stateCode: "NY",
    category: "Healthcare",
    description: "Low-cost health insurance for New Yorkers who earn too much for Medicaid but up to 200% FPL. Premiums are $0-$20/month with low or no copays.",
    targetPopulation: "New York residents between 138-200% FPL",
    rules: {
      maxIncomePctFPL: 200,
      applicableStates: ["NY"],
    },
    url: "https://nystateofhealth.ny.gov/essential-plan",
    notes: "Available regardless of immigration status. One of the most affordable coverage options in the country.",
  },
  {
    id: "ny-heap",
    name: "HEAP (NY Energy Assistance)",
    level: "state",
    stateCode: "NY",
    category: "Utilities",
    description: "New York's Home Energy Assistance Program helps low-income homeowners and renters pay heating and cooling costs. Regular and emergency benefits available.",
    targetPopulation: "Low-income New York households",
    rules: {
      maxIncomePctFPL: 150,
      applicableStates: ["NY"],
    },
    url: "https://otda.ny.gov/programs/heap/",
    notes: "Typically opens in November and closes when funding runs out. Emergency benefits available year-round.",
  },
  {
    id: "ny-tanf",
    name: "Temporary Assistance (NY TANF)",
    level: "state",
    stateCode: "NY",
    category: "Cash Assistance",
    description: "Cash assistance for very low-income New York families with children. Includes Family Assistance (FA) for families and Safety Net Assistance (SNA) for singles/couples without children.",
    targetPopulation: "Very low-income New York residents",
    rules: {
      maxIncomePctFPL: 100,
      requiresUSCitizen: true,
      applicableStates: ["NY"],
    },
    url: "https://otda.ny.gov/programs/temporary-assistance/",
    notes: "New York uniquely provides Safety Net Assistance for individuals without children who don't qualify for federal TANF.",
  },
];

// Category icons (Lucide icon names) for UI
export const categoryIcons: Record<string, string> = {
  "Food Assistance": "Utensils",
  "Healthcare": "Heart",
  "Retirement & Disability": "Shield",
  "Employment": "Briefcase",
  "Housing": "Home",
  "Tax Credits": "DollarSign",
  "Veterans": "Medal",
  "Cash Assistance": "Wallet",
  "Utilities": "Zap",
};
