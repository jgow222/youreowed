// ─── Program Data Schema & Seed Data ───────────────────────────────────────
// Each program has: name, level, description, target population,
// simplified eligibility rules, estimated benefit amounts, and official website link.
// Rules are intentionally simplified for directional screening only.

export type ProgramLevel = "federal" | "state";
export type EligibilityStatus = "likely" | "maybe" | "unlikely";

export interface BenefitEstimate {
  min: number;
  max: number;
  description: string;
}

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
  requiresStudent?: boolean;          // true = must be enrolled in school
  requiresPregnant?: boolean;         // true = must be pregnant
  hasChildrenUnder5?: boolean;        // true = must have children under age 5
  requiresRecentlyUnemployed?: boolean; // true = must have recently lost employment
  applicableStates?: string[];        // If set, only these state codes apply
  excludedStates?: string[];          // States where program doesn't apply
  minHouseholdSize?: number;
}

export interface Program {
  id: string;
  name: string;
  displayName?: string;                // Plain-language name shown to users
  level: ProgramLevel;
  stateCode?: string;                  // For state-level programs
  category: string;
  description: string;
  targetPopulation: string;
  rules: EligibilityRule;
  url: string;
  notes?: string;
  estimatedMonthlyBenefit?: BenefitEstimate;
  estimatedAnnualBenefit?: BenefitEstimate;
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


import { statePrograms1 } from './programs-states-1';
import { statePrograms2 } from './programs-states-2';

const federalPrograms: Program[] = [
  // ─── FEDERAL PROGRAMS ─────────────────────────────────────────────────────

  // Food Assistance
  {
    id: "snap",
    name: "SNAP (Food Stamps)",
    displayName: "Food Assistance (SNAP)",
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
    estimatedMonthlyBenefit: {
      min: 23,
      max: 291,
      description: "$23–$291/month for an individual; up to $1,751/month for a household of 8. Average benefit is about $194/person/month.",
    },
    estimatedAnnualBenefit: {
      min: 276,
      max: 3492,
      description: "$276–$3,492/year for an individual; up to $21,012/year for a large household.",
    },
  },

  // Healthcare
  {
    id: "medicaid-adult",
    name: "Medicaid (Adults)",
    displayName: "Health Coverage (Medicaid)",
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
    estimatedMonthlyBenefit: {
      min: 500,
      max: 800,
      description: "$0 premium. The value of coverage is approximately $500–$800/month based on average per-enrollee spending.",
    },
    estimatedAnnualBenefit: {
      min: 6000,
      max: 9600,
      description: "Coverage valued at $6,000–$9,600/year based on average Medicaid spending per adult enrollee.",
    },
  },
  {
    id: "chip",
    name: "CHIP (Children's Health Insurance)",
    displayName: "Children's Health Insurance (CHIP)",
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
    estimatedMonthlyBenefit: {
      min: 200,
      max: 400,
      description: "$0–$50/month premium. Coverage value is approximately $200–$400/month per child.",
    },
    estimatedAnnualBenefit: {
      min: 2400,
      max: 4800,
      description: "Coverage valued at $2,400–$4,800/year per child.",
    },
  },
  {
    id: "medicare",
    name: "Medicare",
    displayName: "Health Coverage for Seniors (Medicare)",
    level: "federal",
    category: "Healthcare",
    description: "Federal health insurance for people 65 and older, and some younger people with disabilities. Part A (hospital) is generally premium-free if you paid Medicare taxes for 10+ years.",
    targetPopulation: "Seniors 65+ and people with disabilities",
    rules: {
      minAge: 65,
    },
    url: "https://www.medicare.gov/basics/get-started-with-medicare",
    notes: "People under 65 with certain disabilities or ESRD may also qualify. No income limit for basic eligibility.",
    estimatedMonthlyBenefit: {
      min: 1000,
      max: 1500,
      description: "Part A is premium-free for most; Part B costs ~$175/month. Total coverage value is approximately $1,000–$1,500/month.",
    },
    estimatedAnnualBenefit: {
      min: 12000,
      max: 18000,
      description: "Total coverage valued at $12,000–$18,000/year including hospital, outpatient, and optional drug coverage.",
    },
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
    estimatedMonthlyBenefit: {
      min: 800,
      max: 3800,
      description: "$800–$3,800/month depending on lifetime earnings and claiming age. Average retirement benefit is ~$1,907/month in 2025.",
    },
    estimatedAnnualBenefit: {
      min: 9600,
      max: 45600,
      description: "$9,600–$45,600/year. The maximum benefit at full retirement age is ~$3,822/month ($45,864/year) in 2025.",
    },
  },
  {
    id: "ssdi",
    name: "SSDI (Social Security Disability)",
    displayName: "Disability Benefits (SSDI)",
    level: "federal",
    category: "Retirement & Disability",
    description: "Monthly benefits for people who can no longer work due to a significant disability expected to last at least 12 months. Based on your prior work history.",
    targetPopulation: "Workers with disabilities",
    rules: {
      requiresDisability: true,
    },
    url: "https://www.ssa.gov/disability",
    notes: "Requires sufficient work credits. The disability must prevent you from doing substantial gainful activity ($1,550/month in 2025).",
    estimatedMonthlyBenefit: {
      min: 800,
      max: 3800,
      description: "$800–$3,800/month based on prior earnings. Average SSDI benefit is ~$1,537/month in 2025.",
    },
    estimatedAnnualBenefit: {
      min: 9600,
      max: 45600,
      description: "$9,600–$45,600/year depending on work history and prior earnings.",
    },
  },
  {
    id: "ssi",
    name: "SSI (Supplemental Security Income)",
    displayName: "Supplemental Income (SSI)",
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
    estimatedMonthlyBenefit: {
      min: 100,
      max: 967,
      description: "Up to $967/month for an individual or $1,450/month for a couple in 2025. Many states add a supplement.",
    },
    estimatedAnnualBenefit: {
      min: 1200,
      max: 11604,
      description: "Up to $11,604/year for an individual. Actual amount depends on other income and living arrangement.",
    },
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
      requiresRecentlyUnemployed: true,
    },
    url: "https://www.careeronestop.org/LocalHelp/UnemploymentBenefits/find-unemployment-benefits.aspx",
    notes: "Administered by states; benefit amounts and duration vary significantly. You must have earned enough wages in a prior 'base period' and be actively seeking work.",
    estimatedMonthlyBenefit: {
      min: 200,
      max: 823,
      description: "$200–$823/month depending on state and prior wages. Most states replace about 50% of prior weekly earnings.",
    },
    estimatedAnnualBenefit: {
      min: 1200,
      max: 4938,
      description: "$1,200–$4,938 for a typical 26-week benefit period (not a full year).",
    },
  },

  // Housing
  {
    id: "section8",
    name: "Section 8 / Housing Choice Voucher",
    displayName: "Housing Assistance (Section 8)",
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
    estimatedMonthlyBenefit: {
      min: 500,
      max: 2000,
      description: "$500–$2,000/month voucher value depending on local fair market rents and household income.",
    },
    estimatedAnnualBenefit: {
      min: 6000,
      max: 24000,
      description: "$6,000–$24,000/year in rental assistance.",
    },
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
    estimatedMonthlyBenefit: {
      min: 300,
      max: 1500,
      description: "$300–$1,500/month in savings compared to market-rate rent, depending on location and household income.",
    },
    estimatedAnnualBenefit: {
      min: 3600,
      max: 18000,
      description: "$3,600–$18,000/year in rental savings.",
    },
  },
  {
    id: "liheap",
    name: "LIHEAP (Energy Assistance)",
    displayName: "Energy Bill Help (LIHEAP)",
    level: "federal",
    category: "Utilities",
    description: "Helps low-income households pay heating and cooling bills. May also help with energy-related home repairs and weatherization.",
    targetPopulation: "Low-income households",
    rules: {
      maxIncomePctFPL: 150,
    },
    url: "https://www.acf.hhs.gov/ocs/low-income-home-energy-assistance-program-liheap",
    notes: "Typically available seasonally. Administered by states; income limits and benefit amounts vary.",
    estimatedMonthlyBenefit: {
      min: 17,
      max: 83,
      description: "Typically a one-time payment, not monthly. If annualized: ~$17–$83/month equivalent.",
    },
    estimatedAnnualBenefit: {
      min: 200,
      max: 1000,
      description: "$200–$1,000/year as a one-time or seasonal payment to help cover energy bills.",
    },
  },

  // Tax Credits
  {
    id: "eitc",
    name: "Earned Income Tax Credit (EITC)",
    displayName: "Earned Income Tax Credit (EITC)",
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
    estimatedAnnualBenefit: {
      min: 600,
      max: 7830,
      description: "$600–$7,830/year depending on number of children and income. Workers without children may receive up to ~$600.",
    },
    estimatedMonthlyBenefit: {
      min: 50,
      max: 653,
      description: "Paid as annual tax refund, not monthly. Equivalent to ~$50–$653/month.",
    },
  },
  {
    id: "ctc",
    name: "Child Tax Credit",
    displayName: "Child Tax Credit",
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
    estimatedAnnualBenefit: {
      min: 2000,
      max: 2000,
      description: "Up to $2,000 per qualifying child per year. Up to $1,700 is refundable.",
    },
    estimatedMonthlyBenefit: {
      min: 167,
      max: 167,
      description: "Paid as annual tax credit, not monthly. Equivalent to ~$167/month per child.",
    },
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
    estimatedAnnualBenefit: {
      min: 600,
      max: 2100,
      description: "$600–$2,100/year. 20–35% of up to $3,000 (one dependent) or $6,000 (two+).",
    },
    estimatedMonthlyBenefit: {
      min: 50,
      max: 175,
      description: "Paid as annual tax credit, not monthly. Equivalent to ~$50–$175/month.",
    },
  },

  // Nutrition
  {
    id: "wic",
    name: "WIC (Women, Infants, and Children)",
    displayName: "Women & Children Nutrition (WIC)",
    level: "federal",
    category: "Food Assistance",
    description: "Provides nutritious foods, nutrition education, and healthcare referrals for pregnant women, new mothers, infants, and children under 5.",
    targetPopulation: "Pregnant/postpartum women and children under 5",
    rules: {
      maxIncomePctFPL: 185,
      requiresChildren: true,
      hasChildrenUnder5: true,
    },
    url: "https://www.fns.usda.gov/wic",
    notes: "Must be pregnant, breastfeeding, or have children under 5. Must be found at nutritional risk by a health professional.",
    estimatedMonthlyBenefit: {
      min: 35,
      max: 75,
      description: "$35–$75/month in food benefits per participant. Pregnant and breastfeeding women receive higher packages.",
    },
    estimatedAnnualBenefit: {
      min: 420,
      max: 900,
      description: "$420–$900/year per participant in food benefits.",
    },
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
    estimatedMonthlyBenefit: {
      min: 50,
      max: 100,
      description: "$50–$100/month per child during the school year in meal savings.",
    },
    estimatedAnnualBenefit: {
      min: 500,
      max: 1000,
      description: "$500–$1,000/year per child (approximately 10 months of school meals).",
    },
  },

  // Veteran benefits
  {
    id: "va-healthcare",
    name: "VA Healthcare",
    displayName: "Veterans Health Care",
    level: "federal",
    category: "Veterans",
    description: "Comprehensive healthcare services for eligible military veterans through the VA system, including preventive care, mental health, and specialty care.",
    targetPopulation: "Military veterans",
    rules: {
      requiresVeteran: true,
    },
    url: "https://www.va.gov/health-care/",
    notes: "Eligibility priority based on service-connected disabilities, income, and other factors. Most veterans who served in active duty are eligible.",
    estimatedMonthlyBenefit: {
      min: 500,
      max: 1000,
      description: "Coverage valued at $500–$1,000/month. Copays may apply depending on priority group and income.",
    },
    estimatedAnnualBenefit: {
      min: 6000,
      max: 12000,
      description: "Coverage valued at $6,000–$12,000/year in healthcare services.",
    },
  },
  {
    id: "va-disability",
    name: "VA Disability Compensation",
    displayName: "Veterans Disability Benefits",
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
    estimatedMonthlyBenefit: {
      min: 171,
      max: 3737,
      description: "$171/month at 10% rating up to $3,737/month at 100% rating (2025 rates). Additional amounts for dependents at 30%+ rating.",
    },
    estimatedAnnualBenefit: {
      min: 2052,
      max: 44844,
      description: "$2,052–$44,844/year depending on disability rating.",
    },
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
    estimatedMonthlyBenefit: {
      min: 100,
      max: 1191,
      description: "Up to $1,191/month for a single veteran. Higher rates with dependents or Aid & Attendance.",
    },
    estimatedAnnualBenefit: {
      min: 1200,
      max: 14292,
      description: "Up to $14,292/year for a single veteran without dependents.",
    },
  },

  // ─── NEW FEDERAL PROGRAMS ─────────────────────────────────────────────────

  {
    id: "tanf",
    name: "TANF (Temporary Assistance for Needy Families)",
    displayName: "Cash Assistance (TANF)",
    level: "federal",
    category: "Cash Assistance",
    description: "Cash assistance for families with children who have very low income. Includes work requirements and time limits. States administer their own programs under federal guidelines.",
    targetPopulation: "Very low-income families with children",
    rules: {
      maxIncomePctFPL: 100,
      requiresChildren: true,
      requiresUSCitizen: true,
    },
    url: "https://www.acf.hhs.gov/ofa/programs/temporary-assistance-needy-families-tanf",
    notes: "Federal 60-month lifetime limit. States set their own benefit levels and eligibility criteria, which vary widely.",
    estimatedMonthlyBenefit: {
      min: 150,
      max: 800,
      description: "$150–$800/month depending on state and family size. National median benefit for a family of 3 is ~$492/month.",
    },
    estimatedAnnualBenefit: {
      min: 1800,
      max: 9600,
      description: "$1,800–$9,600/year depending on state benefit levels and family size.",
    },
  },
  {
    id: "pell-grant",
    name: "Pell Grant",
    displayName: "College Financial Aid (Pell Grant)",
    level: "federal",
    category: "Education",
    description: "Federal grant for undergraduate students with financial need. Does not have to be repaid. Maximum award is $7,395 for the 2024-2025 award year.",
    targetPopulation: "Low-income undergraduate students",
    rules: {
      requiresStudent: true,
      requiresUSCitizen: true,
      maxIncomePctFPL: 400,
    },
    url: "https://studentaid.gov/understand-aid/types/grants/pell",
    notes: "Amount depends on financial need, cost of attendance, enrollment status, and SAI (Student Aid Index). Must complete the FAFSA.",
    estimatedAnnualBenefit: {
      min: 750,
      max: 7395,
      description: "Up to $7,395/year for full-time enrollment (2024-2025). Part-time students receive proportionally less.",
    },
    estimatedMonthlyBenefit: {
      min: 63,
      max: 616,
      description: "Disbursed per semester, not monthly. Equivalent to ~$63–$616/month over a 12-month period.",
    },
  },
  {
    id: "lifeline",
    name: "Lifeline (Phone/Internet Discount)",
    displayName: "Phone/Internet Discount (Lifeline)",
    level: "federal",
    category: "Utilities",
    description: "Provides a $9.25/month discount on phone or internet service for qualifying low-income households. Enhanced support of up to $34.25/month for eligible residents of Tribal lands.",
    targetPopulation: "Low-income households",
    rules: {
      maxIncomePctFPL: 135,
      requiresUSCitizen: true,
    },
    url: "https://www.lifelinesupport.org/",
    notes: "Also eligible if participating in SNAP, Medicaid, SSI, Federal Public Housing Assistance, or Veterans Pension. One benefit per household.",
    estimatedMonthlyBenefit: {
      min: 9,
      max: 34,
      description: "$9.25/month standard discount; up to $34.25/month for Tribal lands residents.",
    },
    estimatedAnnualBenefit: {
      min: 111,
      max: 411,
      description: "$111–$411/year in phone or internet service discounts.",
    },
  },
  {
    id: "acp",
    name: "Affordable Connectivity Program (ACP)",
    displayName: "Internet Discount (ACP)",
    level: "federal",
    category: "Utilities",
    description: "Provided a $30/month discount on internet service for eligible households (up to $75/month on Tribal lands). Note: The ACP stopped accepting new applications and the final benefit was applied in June 2024.",
    targetPopulation: "Low-income households",
    rules: {
      maxIncomePctFPL: 200,
      requiresUSCitizen: true,
    },
    url: "https://www.fcc.gov/acp",
    notes: "The ACP program's funding expired in 2024. Congress has not reauthorized it as of 2025. Listed for reference in case the program is renewed.",
    estimatedMonthlyBenefit: {
      min: 30,
      max: 75,
      description: "Was $30/month ($75/month on Tribal lands) when active. Program is currently unfunded.",
    },
    estimatedAnnualBenefit: {
      min: 360,
      max: 900,
      description: "Was $360–$900/year when active.",
    },
  },
  {
    id: "head-start",
    name: "Head Start",
    level: "federal",
    category: "Education",
    description: "Free early childhood education, health, and nutrition services for children ages 3-5 in families below the poverty line. Early Head Start serves infants and toddlers.",
    targetPopulation: "Children ages 3-5 in families below poverty level",
    rules: {
      maxIncomePctFPL: 100,
      requiresChildren: true,
      hasChildrenUnder5: true,
    },
    url: "https://www.acf.hhs.gov/ohs",
    notes: "Children in foster care, families experiencing homelessness, and families receiving TANF or SSI are categorically eligible regardless of income.",
    estimatedMonthlyBenefit: {
      min: 800,
      max: 1200,
      description: "Free preschool valued at $800–$1,200/month based on average per-child spending. Includes meals and health services.",
    },
    estimatedAnnualBenefit: {
      min: 8000,
      max: 12000,
      description: "Valued at $8,000–$12,000/year per child based on program costs.",
    },
  },
  {
    id: "snap-et",
    name: "SNAP Employment & Training (SNAP E&T)",
    level: "federal",
    category: "Employment",
    description: "Provides job training, education, and support services to help SNAP recipients find and keep employment. May cover transportation and dependent care costs during training.",
    targetPopulation: "SNAP recipients seeking employment or training",
    rules: {
      maxIncomePctFPL: 130,
      requiresUSCitizen: true,
    },
    url: "https://www.fns.usda.gov/snap/et",
    notes: "Participation may be mandatory for some SNAP recipients (ABAWDs). Services vary by state and include job search training, education, work experience, and vocational training.",
    estimatedMonthlyBenefit: {
      min: 100,
      max: 500,
      description: "Value varies. May include reimbursement for transportation ($100–$200/month) and dependent care, plus free training valued at $200–$500/month.",
    },
    estimatedAnnualBenefit: {
      min: 1200,
      max: 6000,
      description: "$1,200–$6,000/year in training services and support cost reimbursements.",
    },
  },
];

// Combined list of all programs (federal + all 50 states + DC)
export const programs: Program[] = [
  ...federalPrograms,
  ...statePrograms1,
  ...statePrograms2,
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
  "Education": "GraduationCap",
  "Telecommunications": "Zap",
  "Childcare": "Baby",
  "Prescription Drugs": "Pill",
};
