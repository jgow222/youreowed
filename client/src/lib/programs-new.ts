// ─── New Programs: Federal, State EITC, Property Tax Relief, Prescription Drug ──
// Added to supplement the existing programs in programs.ts / programs-states-*.ts
// Research sources: USDA, HHS, IRS, ITEP, state agency websites (2025-2026 data)

import { type Program } from './programs';

// ─────────────────────────────────────────────────────────────────────────────
// NEW FEDERAL PROGRAMS
// ─────────────────────────────────────────────────────────────────────────────

export const newFederalPrograms: Program[] = [
  // ── Food Assistance ──────────────────────────────────────────────────────

  {
    id: "nslp",
    name: "Free/Reduced School Lunch (NSLP)",
    displayName: "Free School Lunch (NSLP)",
    level: "federal",
    category: "Food Assistance",
    description:
      "Provides free or reduced-price lunches to children at school. Children in families under 130% FPL receive free meals; 130–185% FPL receive reduced-price meals (no more than $0.40/lunch).",
    targetPopulation: "School-age children in low-income families",
    rules: {
      maxIncomePctFPL: 185,
      requiresChildren: true,
      requiresUSCitizen: true,
    },
    url: "https://www.fns.usda.gov/nslp",
    notes:
      "Children automatically eligible if family receives SNAP, TANF, or FDPIR. Some districts serve all students free under Community Eligibility Provision (CEP).",
    estimatedMonthlyBenefit: {
      min: 60,
      max: 110,
      description:
        "$60–$110/month per child during the ~10-month school year in meal savings.",
    },
    estimatedAnnualBenefit: {
      min: 600,
      max: 1100,
      description:
        "$600–$1,100/year per child (based on ~180 school days × $3.35–$6/meal value).",
    },
  },

  {
    id: "sbp",
    name: "School Breakfast Program (SBP)",
    displayName: "Free School Breakfast (SBP)",
    level: "federal",
    category: "Food Assistance",
    description:
      "Provides free or reduced-price breakfasts to children at school. Same income thresholds as the National School Lunch Program: free under 130% FPL, reduced-price under 185% FPL.",
    targetPopulation: "School-age children in low-income families",
    rules: {
      maxIncomePctFPL: 185,
      requiresChildren: true,
      requiresUSCitizen: true,
    },
    url: "https://www.fns.usda.gov/sbp/school-breakfast-program",
    notes:
      "Often available at the same schools as NSLP. Can be combined with NSLP savings.",
    estimatedMonthlyBenefit: {
      min: 40,
      max: 75,
      description:
        "$40–$75/month per child during the school year in breakfast savings.",
    },
    estimatedAnnualBenefit: {
      min: 400,
      max: 750,
      description:
        "$400–$750/year per child (based on ~180 school days × $2.20–$4/meal value).",
    },
  },

  {
    id: "summer-ebt",
    name: "Summer EBT (Sun Bucks)",
    displayName: "Summer Food Benefits (Sun Bucks)",
    level: "federal",
    category: "Food Assistance",
    description:
      "Provides $120 per child per summer on an EBT card to buy groceries for school-age children who receive free or reduced-price school meals. Helps bridge the nutrition gap when school is not in session.",
    targetPopulation: "School-age children in families eligible for free/reduced school meals",
    rules: {
      maxIncomePctFPL: 185,
      requiresChildren: true,
      requiresUSCitizen: true,
    },
    url: "https://www.fns.usda.gov/summer-ebt",
    notes:
      "Launched nationally in summer 2024. Children automatically enrolled in states that have opted in if they already receive free/reduced school meals. $120 per child per summer.",
    estimatedAnnualBenefit: {
      min: 120,
      max: 480,
      description:
        "$120 per eligible child per summer. A family with 4 school-age children could receive $480.",
    },
    estimatedMonthlyBenefit: {
      min: 10,
      max: 40,
      description:
        "One-time summer payment of $120/child. Equivalent to ~$10/month per child annualized.",
    },
  },

  {
    id: "tefap",
    name: "TEFAP (Emergency Food Assistance)",
    displayName: "Emergency Food Box (TEFAP)",
    level: "federal",
    category: "Food Assistance",
    description:
      "Provides USDA commodity foods — such as canned goods, dairy, grains, and protein — distributed through food banks and pantries to low-income households. Income limit is generally 185% FPL.",
    targetPopulation: "Low-income individuals and families under 185% FPL",
    rules: {
      maxIncomePctFPL: 185,
    },
    url: "https://www.fns.usda.gov/tefap/emergency-food-assistance-program",
    notes:
      "Distributed through local food banks; availability depends on local supply and participation. No application required at most pantries.",
    estimatedMonthlyBenefit: {
      min: 50,
      max: 100,
      description:
        "$50–$100/month equivalent in commodity food value, depending on local distribution frequency and household size.",
    },
    estimatedAnnualBenefit: {
      min: 600,
      max: 1200,
      description:
        "$600–$1,200/year in food assistance through commodity distribution.",
    },
  },

  {
    id: "cacfp",
    name: "Child & Adult Care Food Program (CACFP)",
    displayName: "Childcare Meal Assistance (CACFP)",
    level: "federal",
    category: "Food Assistance",
    description:
      "Provides reimbursements to child care providers for nutritious meals and snacks served to children in daycare. Families with children in participating daycare centers at or below 185% FPL may receive free meals for their children.",
    targetPopulation: "Children in daycare in low-income families",
    rules: {
      maxIncomePctFPL: 185,
      requiresChildren: true,
      hasChildrenUnder5: true,
    },
    url: "https://www.fns.usda.gov/cacfp",
    notes:
      "Benefit goes directly to the child care provider; no direct payment to families. Value is reduced or eliminated childcare meal costs. Also covers adult day care centers.",
    estimatedMonthlyBenefit: {
      min: 50,
      max: 200,
      description:
        "$50–$200/month in reduced meal costs at participating child care centers.",
    },
    estimatedAnnualBenefit: {
      min: 600,
      max: 2400,
      description:
        "$600–$2,400/year in childcare meal savings at participating providers.",
    },
  },

  // ── Childcare ─────────────────────────────────────────────────────────────

  {
    id: "ccdf",
    name: "Child Care Assistance (CCDF/CCDBG)",
    displayName: "Child Care Assistance (CCDF)",
    level: "federal",
    category: "Education",
    description:
      "Subsidizes child care costs for working low-income families with children under 13. Income limit is typically up to 85% of state median income (roughly 200% FPL in most states). The subsidy covers part or all of child care costs at approved providers.",
    targetPopulation: "Working parents with children under 13 and income up to ~200% FPL",
    rules: {
      maxIncomePctFPL: 200,
      requiresChildren: true,
      requiresEmployed: true,
    },
    url: "https://childcare.gov/index.php/consumer-education/get-help-paying-for-child-care",
    notes:
      "Administered by states; income limits, copays, and provider networks vary widely. Parents typically pay a sliding-scale copay. Children in foster care or receiving protective services are categorically eligible.",
    estimatedMonthlyBenefit: {
      min: 400,
      max: 1250,
      description:
        "$400–$1,250/month in child care subsidy depending on state, provider type, and number of children.",
    },
    estimatedAnnualBenefit: {
      min: 5000,
      max: 15000,
      description:
        "$5,000–$15,000/year in child care cost savings for eligible working families.",
    },
  },

  {
    id: "early-head-start",
    name: "Early Head Start",
    displayName: "Early Head Start (Infants & Toddlers)",
    level: "federal",
    category: "Education",
    description:
      "Free comprehensive early childhood program for pregnant women and families with infants and toddlers (ages 0–3) below the federal poverty level. Provides child development, health, nutrition, and family support services.",
    targetPopulation: "Pregnant women and families with children under 3 at or below 100% FPL",
    rules: {
      maxIncomePctFPL: 100,
      requiresChildren: true,
      hasChildrenUnder5: true,
    },
    url: "https://www.acf.hhs.gov/ohs/about/early-head-start",
    notes:
      "Children in foster care and families receiving TANF/SSI are categorically eligible. Includes home-based and center-based program options. Slots are limited; waitlists are common.",
    estimatedMonthlyBenefit: {
      min: 833,
      max: 1250,
      description:
        "Free program valued at $833–$1,250/month based on average per-child spending (~$10,000–$15,000/year).",
    },
    estimatedAnnualBenefit: {
      min: 10000,
      max: 15000,
      description:
        "$10,000–$15,000/year per child in comprehensive early education and support services.",
    },
  },

  // ── Healthcare ────────────────────────────────────────────────────────────

  {
    id: "pace-elderly",
    name: "PACE (All-Inclusive Care for the Elderly)",
    displayName: "All-Inclusive Elder Care (PACE)",
    level: "federal",
    category: "Healthcare",
    description:
      "Provides all-inclusive medical and social services — including adult day care, medical care, hospital, home care, and nursing facility care — to older adults who need nursing-level care but prefer to live in the community. Must be Medicaid-eligible.",
    targetPopulation: "Adults 55+ who need nursing-level care and qualify for Medicaid",
    rules: {
      minAge: 55,
      requiresUSCitizen: true,
      maxIncomePctFPL: 138,
    },
    url: "https://www.medicare.gov/health-drug-plans/health-plans/your-coverage-options/all-inclusive-care-for-people-with-medicare-and-medicaid-pace",
    notes:
      "Available only in states with PACE organizations; not all areas have a PACE program. Must live in the PACE service area. Typically must be dually eligible for Medicare and Medicaid.",
    estimatedMonthlyBenefit: {
      min: 3000,
      max: 6000,
      description:
        "$3,000–$6,000/month in comprehensive medical and personal care services (replaces nursing home costs).",
    },
    estimatedAnnualBenefit: {
      min: 36000,
      max: 72000,
      description:
        "$36,000–$72,000/year in all-inclusive healthcare, comparable to the cost of nursing home care.",
    },
  },

  // ── Retirement & Disability ───────────────────────────────────────────────

  {
    id: "railroad-retirement",
    name: "Railroad Retirement Benefits",
    displayName: "Railroad Retirement (RRB)",
    level: "federal",
    category: "Retirement & Disability",
    description:
      "Provides monthly retirement, disability, and survivor benefits for railroad workers and their families, administered by the Railroad Retirement Board. Tier I benefits are equivalent to Social Security; Tier II provides additional retirement annuity.",
    targetPopulation: "Retired railroad workers with 10+ years of railroad service",
    rules: {
      minAge: 60,
    },
    url: "https://www.rrb.gov/Retirement",
    notes:
      "Retirement age varies: 60 with 30+ years of service, 62 with fewer years. Railroad workers do not pay Social Security taxes — railroad retirement replaces Social Security. Survivors also may qualify.",
    estimatedMonthlyBenefit: {
      min: 1000,
      max: 4500,
      description:
        "$1,000–$4,500/month depending on years of railroad service and earnings history. Average Tier I + Tier II combined benefit is approximately $3,000/month.",
    },
    estimatedAnnualBenefit: {
      min: 12000,
      max: 54000,
      description:
        "$12,000–$54,000/year. The average combined benefit significantly exceeds the average Social Security retirement benefit.",
    },
  },

  // ── Discounts & Savings ───────────────────────────────────────────────────

  {
    id: "amazon-prime-ebt",
    name: "Amazon Prime EBT Discount",
    displayName: "Amazon Prime Discount (EBT)",
    level: "federal",
    category: "Utilities",
    description:
      "Amazon offers a 50% discount on Prime membership — $6.99/month instead of $14.99/month — for households that have an active EBT card (SNAP, Medicaid, or SSI). Includes all standard Prime benefits.",
    targetPopulation: "SNAP, Medicaid, or SSI recipients with an EBT card",
    rules: {
      maxIncomePctFPL: 200,
    },
    url: "https://www.amazon.com/snap-ebt/b?node=19097785011",
    notes:
      "Requires verification of EBT status through Amazon's online portal. Discount applies to Prime monthly membership. Must renew eligibility annually.",
    estimatedMonthlyBenefit: {
      min: 8,
      max: 8,
      description:
        "$8/month savings ($14.99 standard price minus $6.99 EBT price).",
    },
    estimatedAnnualBenefit: {
      min: 96,
      max: 96,
      description:
        "$96/year savings on Amazon Prime membership.",
    },
  },

  {
    id: "walmart-plus-ebt",
    name: "Walmart+ EBT Discount",
    displayName: "Walmart+ Discount (EBT)",
    level: "federal",
    category: "Utilities",
    description:
      "Walmart offers a 50% discount on Walmart+ membership — $6.47/month instead of $12.95/month — for households with an active SNAP or Medicaid EBT card. Includes free shipping, fuel discounts, and Paramount+ streaming.",
    targetPopulation: "SNAP or Medicaid EBT cardholders",
    rules: {
      maxIncomePctFPL: 200,
    },
    url: "https://www.walmart.com/plus/ebt",
    notes:
      "Must verify EBT eligibility through Walmart's online portal. Discount applies to monthly membership only.",
    estimatedMonthlyBenefit: {
      min: 6,
      max: 6,
      description:
        "$6.48/month savings ($12.95 standard price minus $6.47 EBT price).",
    },
    estimatedAnnualBenefit: {
      min: 78,
      max: 78,
      description:
        "$78/year savings on Walmart+ membership.",
    },
  },

  // ── Employment & Training ─────────────────────────────────────────────────

  {
    id: "snap-et-training",
    name: "SNAP Employment & Training (SNAP E&T)",
    displayName: "Job Training for SNAP Recipients (SNAP E&T)",
    level: "federal",
    category: "Employment",
    description:
      "Provides free job training, education, vocational skills, and work experience programs to SNAP recipients. May also cover transportation and dependent care costs while in training.",
    targetPopulation: "SNAP recipients seeking employment or job skills",
    rules: {
      maxIncomePctFPL: 130,
      requiresUSCitizen: true,
    },
    url: "https://www.fns.usda.gov/snap/et",
    notes:
      "Some work-eligible SNAP recipients may be required to participate (ABAWDs). Services and support vary significantly by state. Contact your local SNAP office to find available training programs.",
    estimatedMonthlyBenefit: {
      min: 100,
      max: 500,
      description:
        "$100–$500/month in free training value plus transportation/dependent care reimbursements.",
    },
    estimatedAnnualBenefit: {
      min: 1200,
      max: 6000,
      description:
        "$1,200–$6,000/year in free training services and support cost reimbursements.",
    },
  },

  // ── Tax Credits ───────────────────────────────────────────────────────────

  {
    id: "low-income-taxpayer-clinic",
    name: "Low Income Taxpayer Clinic (LITC)",
    displayName: "Free Tax Legal Help (LITC)",
    level: "federal",
    category: "Tax Credits",
    description:
      "Free or low-cost legal representation for taxpayers with IRS disputes. LITCs help low-income taxpayers resolve tax controversies, respond to IRS audits and collection actions, and understand taxpayer rights.",
    targetPopulation: "Individuals with income at or below 250% FPL facing IRS disputes",
    rules: {
      maxIncomePctFPL: 250,
    },
    url: "https://www.irs.gov/advocate/low-income-taxpayer-clinics",
    notes:
      "Fees cannot exceed $25/hour for representation. LITCs are independent from the IRS. Find a clinic near you at the IRS website. Also assists taxpayers who speak English as a second language.",
    estimatedAnnualBenefit: {
      min: 500,
      max: 5000,
      description:
        "$500–$5,000/year in free legal and tax representation value, depending on complexity of the tax dispute.",
    },
    estimatedMonthlyBenefit: {
      min: 42,
      max: 417,
      description:
        "Equivalent to $42–$417/month in free tax legal services.",
    },
  },

  // ── Cash Assistance ───────────────────────────────────────────────────────

  {
    id: "tribal-tanf",
    name: "Tribal TANF",
    displayName: "Tribal Cash Assistance (Tribal TANF)",
    level: "federal",
    category: "Cash Assistance",
    description:
      "Cash assistance and support services for Native American families administered by federally recognized Tribes. Similar to state TANF but designed to be culturally appropriate. Income limits and benefit amounts vary by tribe.",
    targetPopulation: "Native American families with children who are members of a federally recognized tribe",
    rules: {
      maxIncomePctFPL: 100,
      requiresChildren: true,
    },
    url: "https://www.acf.hhs.gov/ofa/programs/tribal-tanf",
    notes:
      "Must reside in the service area of a tribe that has its own TANF plan. Eligibility, benefit levels, and services vary widely by tribe. Contact your tribal government for details.",
    estimatedMonthlyBenefit: {
      min: 150,
      max: 700,
      description:
        "$150–$700/month depending on tribal plan, family size, and income.",
    },
    estimatedAnnualBenefit: {
      min: 1800,
      max: 8400,
      description:
        "$1,800–$8,400/year in cash assistance and support services.",
    },
  },

  // ── Utilities ─────────────────────────────────────────────────────────────

  {
    id: "wap",
    name: "Weatherization Assistance Program (WAP)",
    displayName: "Home Weatherization Assistance (WAP)",
    level: "federal",
    category: "Utilities",
    description:
      "Provides free energy efficiency improvements to the homes of low-income families — including insulation, air sealing, heating/cooling system upgrades, and weatherstripping. Reduces energy bills and improves home comfort and safety.",
    targetPopulation: "Homeowners and renters with income at or below 200% FPL who pay their own utilities",
    rules: {
      maxIncomePctFPL: 200,
    },
    url: "https://www.energy.gov/scep/slsc/wap/weatherization-assistance-program",
    notes:
      "One-time benefit per household. Average upgrade value is $5,000–$10,000. LIHEAP recipients and households with elderly, disabled, or children under 6 are prioritized. Renters must have landlord permission.",
    estimatedAnnualBenefit: {
      min: 5000,
      max: 10000,
      description:
        "One-time home improvement package worth $5,000–$10,000 on average. Ongoing savings of ~$300–$500/year in reduced energy bills.",
    },
    estimatedMonthlyBenefit: {
      min: 25,
      max: 40,
      description:
        "Ongoing energy savings of $25–$40/month after weatherization is complete.",
    },
  },
];


// ─────────────────────────────────────────────────────────────────────────────
// STATE EARNED INCOME TAX CREDITS (EITC)
// Source: IRS (https://www.irs.gov/credits-deductions/individuals/earned-income-tax-credit/states-and-local-governments-with-earned-income-tax-credit)
// ITEP State EITC Report 2025 (https://itep.org/state-earned-income-tax-credits-support-families-and-workers-in-2025/)
// ─────────────────────────────────────────────────────────────────────────────

export const stateEITCPrograms: Program[] = [
  {
    id: "eitc-ca",
    name: "California EITC (CalEITC)",
    displayName: "California Earned Income Tax Credit (CalEITC)",
    level: "state",
    stateCode: "CA",
    category: "Tax Credits",
    description:
      "California's refundable earned income tax credit is worth up to 85% of the federal EITC for the lowest-income households. The state also offers a Young Child Tax Credit of $1,196 for families with children under 6 who qualify for CalEITC. Income limit is up to $32,800 depending on family size.",
    targetPopulation: "Working individuals and families with income up to ~$32,800",
    rules: {
      maxIncomePctFPL: 200,
      requiresEmployed: true,
      applicableStates: ["CA"],
    },
    url: "https://www.ftb.ca.gov/file/personal/credits/california-earned-income-tax-credit.html",
    notes:
      "Maximum income up to ~$32,800 (varies by family size). Workers ages 18–24 and 65+ without children are eligible. ITIN filers are eligible. Young Child Tax Credit of $1,196 for families with children under 6.",
    estimatedAnnualBenefit: {
      min: 275,
      max: 3529,
      description:
        "Up to $3,529/year (approximately 85% of the max federal EITC for lowest-income filers). Add $1,196 Young Child Tax Credit if you have a child under 6.",
    },
    estimatedMonthlyBenefit: {
      min: 23,
      max: 294,
      description:
        "Paid as annual tax refund. Equivalent to $23–$294/month.",
    },
  },

  {
    id: "eitc-co",
    name: "Colorado EITC",
    displayName: "Colorado Earned Income Tax Credit",
    level: "state",
    stateCode: "CO",
    category: "Tax Credits",
    description:
      "Colorado's refundable earned income tax credit is worth 50% of the federal EITC for tax year 2025 (will be 35–50% in future years based on revenue). Workers ages 19–24 without children are eligible. ITIN filers are eligible.",
    targetPopulation: "Working individuals and families with low-moderate income",
    rules: {
      maxIncomePctFPL: 400,
      requiresEmployed: true,
      applicableStates: ["CO"],
    },
    url: "https://tax.colorado.gov/earned-income-tax-credit",
    notes:
      "50% of federal EITC in 2025. Credit varies year to year (35–50% range). Workers ages 19–24 without children are eligible. ITIN filers are eligible.",
    estimatedAnnualBenefit: {
      min: 316,
      max: 4023,
      description:
        "Up to $4,023/year (50% of the max federal EITC of $8,046 for families with 3+ children).",
    },
    estimatedMonthlyBenefit: {
      min: 26,
      max: 335,
      description:
        "Paid as annual tax refund. Equivalent to $26–$335/month.",
    },
  },

  {
    id: "eitc-ct",
    name: "Connecticut EITC",
    displayName: "Connecticut Earned Income Tax Credit",
    level: "state",
    stateCode: "CT",
    category: "Tax Credits",
    description:
      "Connecticut's refundable EITC equals 40% of the federal credit, plus an additional $250 for households with dependents (beginning tax year 2025). This makes it worth up to 40% of the federal EITC plus $250.",
    targetPopulation: "Working individuals and families with low-moderate income",
    rules: {
      maxIncomePctFPL: 400,
      requiresEmployed: true,
      applicableStates: ["CT"],
    },
    url: "https://portal.ct.gov/DRS/Individuals/Individual-Tax-Page/Credits/Earned-Income-Tax-Credit",
    notes:
      "40% of federal EITC plus $250 additional for households with dependents starting 2025.",
    estimatedAnnualBenefit: {
      min: 260,
      max: 3468,
      description:
        "Up to $3,468/year (40% of max $8,046 federal EITC plus $250 for families with dependents).",
    },
    estimatedMonthlyBenefit: {
      min: 22,
      max: 289,
      description:
        "Paid as annual tax refund. Equivalent to $22–$289/month.",
    },
  },

  {
    id: "eitc-dc",
    name: "DC EITC",
    displayName: "DC Earned Income Tax Credit",
    level: "state",
    stateCode: "DC",
    category: "Tax Credits",
    description:
      "The District of Columbia's refundable EITC equals 85% of the federal credit for families with children in 2025, and 100% of the federal credit for workers without dependents. The credit will reach 100% for all filers by 2026.",
    targetPopulation: "Working individuals and families with low-moderate income",
    rules: {
      maxIncomePctFPL: 400,
      requiresEmployed: true,
      applicableStates: ["DC"],
    },
    url: "https://otr.cfo.dc.gov/page/earned-income-tax-credit",
    notes:
      "85% of federal EITC for filers with children in 2025; 100% for workers without dependents. Expanding to 100% for all filers in 2026. ITIN filers are eligible. Expanded income eligibility.",
    estimatedAnnualBenefit: {
      min: 537,
      max: 6839,
      description:
        "Up to $6,839/year (85% of max $8,046 federal EITC for families with 3+ children).",
    },
    estimatedMonthlyBenefit: {
      min: 45,
      max: 570,
      description:
        "Paid as annual tax refund. Equivalent to $45–$570/month.",
    },
  },

  {
    id: "eitc-de",
    name: "Delaware EITC",
    displayName: "Delaware Earned Income Tax Credit",
    level: "state",
    stateCode: "DE",
    category: "Tax Credits",
    description:
      "Delaware offers a 20% nonrefundable EITC or a 4.5% refundable EITC — taxpayers choose whichever is better for them. The refundable option is worth 4.5% of the federal EITC.",
    targetPopulation: "Working individuals and families with low-moderate income",
    rules: {
      maxIncomePctFPL: 400,
      requiresEmployed: true,
      applicableStates: ["DE"],
    },
    url: "https://revenue.delaware.gov/individuals/personal-income-tax-forms/",
    notes:
      "Partially refundable: taxpayers choose between a 20% nonrefundable credit or a 4.5% refundable credit. The refundable option is small but provides cash back.",
    estimatedAnnualBenefit: {
      min: 28,
      max: 1610,
      description:
        "4.5% refundable option: up to $362/year. 20% nonrefundable: up to $1,610/year in tax reduction.",
    },
    estimatedMonthlyBenefit: {
      min: 2,
      max: 134,
      description:
        "Paid as annual tax benefit. Equivalent to $2–$134/month.",
    },
  },

  {
    id: "eitc-hi",
    name: "Hawaii EITC",
    displayName: "Hawaii Earned Income Tax Credit",
    level: "state",
    stateCode: "HI",
    category: "Tax Credits",
    description:
      "Hawaii's refundable earned income tax credit equals 40% of the federal EITC. The credit became fully refundable in recent years. ITIN filers are eligible.",
    targetPopulation: "Working individuals and families with low-moderate income",
    rules: {
      maxIncomePctFPL: 400,
      requiresEmployed: true,
      applicableStates: ["HI"],
    },
    url: "https://tax.hawaii.gov/forms/a1_b1_4_incometax/",
    notes:
      "40% of federal EITC; fully refundable. ITIN filers are eligible.",
    estimatedAnnualBenefit: {
      min: 253,
      max: 3218,
      description:
        "Up to $3,218/year (40% of max $8,046 federal EITC).",
    },
    estimatedMonthlyBenefit: {
      min: 21,
      max: 268,
      description:
        "Paid as annual tax refund. Equivalent to $21–$268/month.",
    },
  },

  {
    id: "eitc-il",
    name: "Illinois EITC",
    displayName: "Illinois Earned Income Tax Credit",
    level: "state",
    stateCode: "IL",
    category: "Tax Credits",
    description:
      "Illinois's refundable EITC equals 28% of the federal credit in 2025 (20% base plus an additional 40% match of the state credit for families with a child under 12, effectively 28%). Workers ages 18–24 and 65+ are eligible. ITIN filers are eligible.",
    targetPopulation: "Working individuals and families with low-moderate income",
    rules: {
      maxIncomePctFPL: 400,
      requiresEmployed: true,
      applicableStates: ["IL"],
    },
    url: "https://www2.illinois.gov/rev/research/taxinformation/income/Pages/Earned-Income-Credit.aspx",
    notes:
      "28% of federal EITC for families with a qualifying child under 12 in 2025; 20% base rate otherwise. Workers ages 18–24 and 65+ without children are eligible. ITIN filers are eligible.",
    estimatedAnnualBenefit: {
      min: 126,
      max: 2253,
      description:
        "Up to $2,253/year (28% of max $8,046 federal EITC for families with 3+ children).",
    },
    estimatedMonthlyBenefit: {
      min: 11,
      max: 188,
      description:
        "Paid as annual tax refund. Equivalent to $11–$188/month.",
    },
  },

  {
    id: "eitc-in",
    name: "Indiana EITC",
    displayName: "Indiana Earned Income Tax Credit",
    level: "state",
    stateCode: "IN",
    category: "Tax Credits",
    description:
      "Indiana's refundable earned income tax credit equals 10% of the federal EITC.",
    targetPopulation: "Working individuals and families with low-moderate income",
    rules: {
      maxIncomePctFPL: 400,
      requiresEmployed: true,
      applicableStates: ["IN"],
    },
    url: "https://www.in.gov/dor/individual-income-taxes/filing-my-taxes/indiana-deductions-from-income/",
    notes:
      "10% of federal EITC; fully refundable.",
    estimatedAnnualBenefit: {
      min: 63,
      max: 805,
      description:
        "Up to $805/year (10% of max $8,046 federal EITC).",
    },
    estimatedMonthlyBenefit: {
      min: 5,
      max: 67,
      description:
        "Paid as annual tax refund. Equivalent to $5–$67/month.",
    },
  },

  {
    id: "eitc-ia",
    name: "Iowa EITC",
    displayName: "Iowa Earned Income Tax Credit",
    level: "state",
    stateCode: "IA",
    category: "Tax Credits",
    description:
      "Iowa's refundable earned income tax credit equals 15% of the federal EITC.",
    targetPopulation: "Working individuals and families with low-moderate income",
    rules: {
      maxIncomePctFPL: 400,
      requiresEmployed: true,
      applicableStates: ["IA"],
    },
    url: "https://tax.iowa.gov/individual-income-tax-credits",
    notes:
      "15% of federal EITC; fully refundable.",
    estimatedAnnualBenefit: {
      min: 95,
      max: 1207,
      description:
        "Up to $1,207/year (15% of max $8,046 federal EITC).",
    },
    estimatedMonthlyBenefit: {
      min: 8,
      max: 101,
      description:
        "Paid as annual tax refund. Equivalent to $8–$101/month.",
    },
  },

  {
    id: "eitc-ks",
    name: "Kansas EITC",
    displayName: "Kansas Earned Income Tax Credit",
    level: "state",
    stateCode: "KS",
    category: "Tax Credits",
    description:
      "Kansas's refundable earned income tax credit equals 17% of the federal EITC.",
    targetPopulation: "Working individuals and families with low-moderate income",
    rules: {
      maxIncomePctFPL: 400,
      requiresEmployed: true,
      applicableStates: ["KS"],
    },
    url: "https://www.ksrevenue.gov/perstaxtypes.html",
    notes:
      "17% of federal EITC; fully refundable.",
    estimatedAnnualBenefit: {
      min: 108,
      max: 1368,
      description:
        "Up to $1,368/year (17% of max $8,046 federal EITC).",
    },
    estimatedMonthlyBenefit: {
      min: 9,
      max: 114,
      description:
        "Paid as annual tax refund. Equivalent to $9–$114/month.",
    },
  },

  {
    id: "eitc-la",
    name: "Louisiana EITC",
    displayName: "Louisiana Earned Income Tax Credit",
    level: "state",
    stateCode: "LA",
    category: "Tax Credits",
    description:
      "Louisiana's refundable earned income tax credit equals 5% of the federal EITC. The credit will sunset after 2031 at which point it reverts to 3.5%.",
    targetPopulation: "Working individuals and families with low-moderate income",
    rules: {
      maxIncomePctFPL: 400,
      requiresEmployed: true,
      applicableStates: ["LA"],
    },
    url: "https://revenue.louisiana.gov/IndividualIncomeTax",
    notes:
      "5% of federal EITC; fully refundable. Credit sunsets to 3.5% in 2031.",
    estimatedAnnualBenefit: {
      min: 32,
      max: 402,
      description:
        "Up to $402/year (5% of max $8,046 federal EITC).",
    },
    estimatedMonthlyBenefit: {
      min: 3,
      max: 34,
      description:
        "Paid as annual tax refund. Equivalent to $3–$34/month.",
    },
  },

  {
    id: "eitc-me",
    name: "Maine EITC",
    displayName: "Maine Earned Income Tax Credit",
    level: "state",
    stateCode: "ME",
    category: "Tax Credits",
    description:
      "Maine's refundable EITC equals 25% of the federal credit for families with children, and 50% for workers without qualifying children. Workers ages 18–24 are eligible. ITIN filers are eligible.",
    targetPopulation: "Working individuals and families with low-moderate income",
    rules: {
      maxIncomePctFPL: 400,
      requiresEmployed: true,
      applicableStates: ["ME"],
    },
    url: "https://www.maine.gov/revenue/taxes/income-estate-inheritance-taxes/individual-income-tax",
    notes:
      "25% of federal EITC for filers with children; 50% for workers without children. Workers ages 18–24 are eligible. ITIN filers are eligible.",
    estimatedAnnualBenefit: {
      min: 158,
      max: 2012,
      description:
        "Up to $2,012/year (25% of max $8,046 federal EITC for families; 50% or $325 max for childless workers).",
    },
    estimatedMonthlyBenefit: {
      min: 13,
      max: 168,
      description:
        "Paid as annual tax refund. Equivalent to $13–$168/month.",
    },
  },

  {
    id: "eitc-md",
    name: "Maryland EITC",
    displayName: "Maryland Earned Income Tax Credit",
    level: "state",
    stateCode: "MD",
    category: "Tax Credits",
    description:
      "Maryland's refundable EITC equals up to 50% of the federal EITC. Workers ages 18–24 without children are eligible. ITIN filers are eligible. Montgomery County adds a local supplement of up to 25% for families.",
    targetPopulation: "Working individuals and families with low-moderate income",
    rules: {
      maxIncomePctFPL: 400,
      requiresEmployed: true,
      applicableStates: ["MD"],
    },
    url: "https://www.marylandtaxes.gov/individual/pit/tax-info/credits.php",
    notes:
      "50% of federal EITC at state level (45% refundable + additional local refundable credit). Workers ages 18–24 without children are eligible. ITIN filers are eligible.",
    estimatedAnnualBenefit: {
      min: 317,
      max: 4023,
      description:
        "Up to $4,023/year (50% of max $8,046 federal EITC). Local county credits may add more.",
    },
    estimatedMonthlyBenefit: {
      min: 26,
      max: 335,
      description:
        "Paid as annual tax refund. Equivalent to $26–$335/month.",
    },
  },

  {
    id: "eitc-ma",
    name: "Massachusetts EITC",
    displayName: "Massachusetts Earned Income Tax Credit",
    level: "state",
    stateCode: "MA",
    category: "Tax Credits",
    description:
      "Massachusetts's refundable earned income tax credit equals 40% of the federal EITC.",
    targetPopulation: "Working individuals and families with low-moderate income",
    rules: {
      maxIncomePctFPL: 400,
      requiresEmployed: true,
      applicableStates: ["MA"],
    },
    url: "https://www.mass.gov/info-details/earned-income-credit-eic",
    notes:
      "40% of federal EITC; fully refundable.",
    estimatedAnnualBenefit: {
      min: 253,
      max: 3218,
      description:
        "Up to $3,218/year (40% of max $8,046 federal EITC).",
    },
    estimatedMonthlyBenefit: {
      min: 21,
      max: 268,
      description:
        "Paid as annual tax refund. Equivalent to $21–$268/month.",
    },
  },

  {
    id: "eitc-mi",
    name: "Michigan EITC",
    displayName: "Michigan Earned Income Tax Credit",
    level: "state",
    stateCode: "MI",
    category: "Tax Credits",
    description:
      "Michigan's refundable earned income tax credit equals 30% of the federal EITC, following a major expansion from 6% to 30% in 2023.",
    targetPopulation: "Working individuals and families with low-moderate income",
    rules: {
      maxIncomePctFPL: 400,
      requiresEmployed: true,
      applicableStates: ["MI"],
    },
    url: "https://www.michigan.gov/taxes/iit/tax-guidance/credits-exemptions/eitc",
    notes:
      "30% of federal EITC; fully refundable. Expanded from 6% to 30% in 2023.",
    estimatedAnnualBenefit: {
      min: 190,
      max: 2414,
      description:
        "Up to $2,414/year (30% of max $8,046 federal EITC).",
    },
    estimatedMonthlyBenefit: {
      min: 16,
      max: 201,
      description:
        "Paid as annual tax refund. Equivalent to $16–$201/month.",
    },
  },

  {
    id: "eitc-mn",
    name: "Minnesota Working Family Credit",
    displayName: "Minnesota Working Family Credit (EITC)",
    level: "state",
    stateCode: "MN",
    category: "Tax Credits",
    description:
      "Minnesota's Working Family Credit is a refundable credit based on a percentage of earned income (not directly a percentage of the federal EITC). For one dependent, the state credit is approximately 4% of earned income, up to a maximum of $369 for the lowest income level. ITIN filers are eligible.",
    targetPopulation: "Working individuals and families with low income",
    rules: {
      maxIncomePctFPL: 400,
      requiresEmployed: true,
      applicableStates: ["MN"],
    },
    url: "https://www.revenue.state.mn.us/working-family-credit",
    notes:
      "Unique structure: based on percentage of earned income, not a flat percentage of federal EITC. Maximum credit of ~$369 for one child. Workers ages 19–24 are eligible. ITIN filers are eligible.",
    estimatedAnnualBenefit: {
      min: 50,
      max: 1000,
      description:
        "Up to ~$1,000/year depending on income and number of children. Combined with state Child Tax Credit, total benefit can be substantially higher.",
    },
    estimatedMonthlyBenefit: {
      min: 4,
      max: 83,
      description:
        "Paid as annual tax refund. Equivalent to $4–$83/month.",
    },
  },

  {
    id: "eitc-mo",
    name: "Missouri EITC",
    displayName: "Missouri Earned Income Tax Credit",
    level: "state",
    stateCode: "MO",
    category: "Tax Credits",
    description:
      "Missouri's EITC equals 10% of the federal credit. Note: The Missouri credit is nonrefundable, meaning it can reduce your state tax liability to zero but will not generate a cash refund.",
    targetPopulation: "Working individuals and families with low-moderate income who owe Missouri state income tax",
    rules: {
      maxIncomePctFPL: 400,
      requiresEmployed: true,
      applicableStates: ["MO"],
    },
    url: "https://dor.mo.gov/individual/deductions/",
    notes:
      "10% of federal EITC; nonrefundable (reduces tax owed but no cash refund). Must owe Missouri state income tax to benefit.",
    estimatedAnnualBenefit: {
      min: 63,
      max: 805,
      description:
        "Up to $805/year in state income tax reduction (10% of max $8,046 federal EITC). No cash refund.",
    },
    estimatedMonthlyBenefit: {
      min: 5,
      max: 67,
      description:
        "Annual tax reduction equivalent to $5–$67/month.",
    },
  },

  {
    id: "eitc-mt",
    name: "Montana EITC",
    displayName: "Montana Earned Income Tax Credit",
    level: "state",
    stateCode: "MT",
    category: "Tax Credits",
    description:
      "Montana's refundable earned income tax credit equals 20% of the federal EITC beginning in 2025 (doubled from 10%).",
    targetPopulation: "Working individuals and families with low-moderate income",
    rules: {
      maxIncomePctFPL: 400,
      requiresEmployed: true,
      applicableStates: ["MT"],
    },
    url: "https://mtrevenue.gov/taxes/individual-income-tax/",
    notes:
      "20% of federal EITC in 2025 (doubled from 10%). Fully refundable.",
    estimatedAnnualBenefit: {
      min: 126,
      max: 1609,
      description:
        "Up to $1,609/year (20% of max $8,046 federal EITC).",
    },
    estimatedMonthlyBenefit: {
      min: 11,
      max: 134,
      description:
        "Paid as annual tax refund. Equivalent to $11–$134/month.",
    },
  },

  {
    id: "eitc-ne",
    name: "Nebraska EITC",
    displayName: "Nebraska Earned Income Tax Credit",
    level: "state",
    stateCode: "NE",
    category: "Tax Credits",
    description:
      "Nebraska's refundable earned income tax credit equals 10% of the federal EITC.",
    targetPopulation: "Working individuals and families with low-moderate income",
    rules: {
      maxIncomePctFPL: 400,
      requiresEmployed: true,
      applicableStates: ["NE"],
    },
    url: "https://revenue.nebraska.gov/individuals/nebraska-individual-income-tax",
    notes:
      "10% of federal EITC; fully refundable.",
    estimatedAnnualBenefit: {
      min: 63,
      max: 805,
      description:
        "Up to $805/year (10% of max $8,046 federal EITC).",
    },
    estimatedMonthlyBenefit: {
      min: 5,
      max: 67,
      description:
        "Paid as annual tax refund. Equivalent to $5–$67/month.",
    },
  },

  {
    id: "eitc-nj",
    name: "New Jersey EITC",
    displayName: "New Jersey Earned Income Tax Credit",
    level: "state",
    stateCode: "NJ",
    category: "Tax Credits",
    description:
      "New Jersey's refundable earned income tax credit equals 40% of the federal EITC. Workers ages 18–24 without dependents are eligible.",
    targetPopulation: "Working individuals and families with low-moderate income",
    rules: {
      maxIncomePctFPL: 400,
      requiresEmployed: true,
      applicableStates: ["NJ"],
    },
    url: "https://www.nj.gov/treasury/taxation/njeitc.shtml",
    notes:
      "40% of federal EITC; fully refundable. Workers ages 18–24 without children are eligible. ITIN filers are eligible.",
    estimatedAnnualBenefit: {
      min: 253,
      max: 3218,
      description:
        "Up to $3,218/year (40% of max $8,046 federal EITC).",
    },
    estimatedMonthlyBenefit: {
      min: 21,
      max: 268,
      description:
        "Paid as annual tax refund. Equivalent to $21–$268/month.",
    },
  },

  {
    id: "eitc-nm",
    name: "New Mexico EITC",
    displayName: "New Mexico Earned Income Tax Credit",
    level: "state",
    stateCode: "NM",
    category: "Tax Credits",
    description:
      "New Mexico's refundable earned income tax credit equals 25% of the federal EITC. Workers ages 18–24 without dependents are eligible. ITIN filers are eligible.",
    targetPopulation: "Working individuals and families with low-moderate income",
    rules: {
      maxIncomePctFPL: 400,
      requiresEmployed: true,
      applicableStates: ["NM"],
    },
    url: "https://www.tax.newmexico.gov/individuals/credits/",
    notes:
      "25% of federal EITC; fully refundable. Workers ages 18–24 without children are eligible. ITIN filers are eligible.",
    estimatedAnnualBenefit: {
      min: 158,
      max: 2012,
      description:
        "Up to $2,012/year (25% of max $8,046 federal EITC).",
    },
    estimatedMonthlyBenefit: {
      min: 13,
      max: 168,
      description:
        "Paid as annual tax refund. Equivalent to $13–$168/month.",
    },
  },

  {
    id: "eitc-ny",
    name: "New York EITC",
    displayName: "New York State Earned Income Tax Credit",
    level: "state",
    stateCode: "NY",
    category: "Tax Credits",
    description:
      "New York State's refundable earned income tax credit equals 30% of the federal EITC. New York City residents get an additional 10–30% local credit based on income.",
    targetPopulation: "Working individuals and families with low-moderate income",
    rules: {
      maxIncomePctFPL: 400,
      requiresEmployed: true,
      applicableStates: ["NY"],
    },
    url: "https://www.tax.ny.gov/pit/credits/earned_income_credit.htm",
    notes:
      "30% of federal EITC at state level; NYC residents receive an additional 10–30% local credit. Total combined credit for NYC residents can be 40–60% of the federal EITC.",
    estimatedAnnualBenefit: {
      min: 190,
      max: 2414,
      description:
        "Up to $2,414/year state credit (30% of max $8,046). NYC residents may receive an additional $1,000–$2,400+.",
    },
    estimatedMonthlyBenefit: {
      min: 16,
      max: 201,
      description:
        "Paid as annual tax refund. Equivalent to $16–$201/month (state only).",
    },
  },

  {
    id: "eitc-oh",
    name: "Ohio EITC",
    displayName: "Ohio Earned Income Tax Credit",
    level: "state",
    stateCode: "OH",
    category: "Tax Credits",
    description:
      "Ohio's earned income tax credit equals 30% of the federal EITC. Note: Ohio's credit is nonrefundable, meaning it can reduce your state tax liability to zero but will not generate a cash refund.",
    targetPopulation: "Working individuals and families with low-moderate income who owe Ohio state income tax",
    rules: {
      maxIncomePctFPL: 400,
      requiresEmployed: true,
      applicableStates: ["OH"],
    },
    url: "https://tax.ohio.gov/individual/resources/ohio-income-tax-credits",
    notes:
      "30% of federal EITC; nonrefundable. Must owe Ohio state income tax to benefit.",
    estimatedAnnualBenefit: {
      min: 190,
      max: 2414,
      description:
        "Up to $2,414/year in Ohio state income tax reduction (30% of max $8,046 federal EITC). No cash refund.",
    },
    estimatedMonthlyBenefit: {
      min: 16,
      max: 201,
      description:
        "Annual tax reduction equivalent to $16–$201/month.",
    },
  },

  {
    id: "eitc-ok",
    name: "Oklahoma EITC",
    displayName: "Oklahoma Earned Income Tax Credit",
    level: "state",
    stateCode: "OK",
    category: "Tax Credits",
    description:
      "Oklahoma's refundable earned income tax credit equals 5% of the federal EITC.",
    targetPopulation: "Working individuals and families with low-moderate income",
    rules: {
      maxIncomePctFPL: 400,
      requiresEmployed: true,
      applicableStates: ["OK"],
    },
    url: "https://oklahoma.gov/tax/individuals/income-tax/credits.html",
    notes:
      "5% of federal EITC; fully refundable.",
    estimatedAnnualBenefit: {
      min: 32,
      max: 402,
      description:
        "Up to $402/year (5% of max $8,046 federal EITC).",
    },
    estimatedMonthlyBenefit: {
      min: 3,
      max: 34,
      description:
        "Paid as annual tax refund. Equivalent to $3–$34/month.",
    },
  },

  {
    id: "eitc-or",
    name: "Oregon EITC",
    displayName: "Oregon Earned Income Tax Credit",
    level: "state",
    stateCode: "OR",
    category: "Tax Credits",
    description:
      "Oregon's refundable EITC equals 9% of the federal credit (12% for families with a qualifying child under age 3). ITIN filers are eligible through 2025.",
    targetPopulation: "Working individuals and families with low-moderate income",
    rules: {
      maxIncomePctFPL: 400,
      requiresEmployed: true,
      applicableStates: ["OR"],
    },
    url: "https://www.oregon.gov/dor/programs/individuals/Pages/credits.aspx",
    notes:
      "9% of federal EITC; 12% for families with a child under 3. Fully refundable. ITIN filers were eligible through 2025.",
    estimatedAnnualBenefit: {
      min: 57,
      max: 965,
      description:
        "Up to $724/year at 9% rate; up to $965/year at 12% rate (for families with child under 3).",
    },
    estimatedMonthlyBenefit: {
      min: 5,
      max: 80,
      description:
        "Paid as annual tax refund. Equivalent to $5–$80/month.",
    },
  },

  {
    id: "eitc-ri",
    name: "Rhode Island EITC",
    displayName: "Rhode Island Earned Income Tax Credit",
    level: "state",
    stateCode: "RI",
    category: "Tax Credits",
    description:
      "Rhode Island's refundable earned income tax credit equals 16% of the federal EITC.",
    targetPopulation: "Working individuals and families with low-moderate income",
    rules: {
      maxIncomePctFPL: 400,
      requiresEmployed: true,
      applicableStates: ["RI"],
    },
    url: "https://tax.ri.gov/tax-sections/personal-income-tax/credits",
    notes:
      "16% of federal EITC; fully refundable.",
    estimatedAnnualBenefit: {
      min: 101,
      max: 1287,
      description:
        "Up to $1,287/year (16% of max $8,046 federal EITC).",
    },
    estimatedMonthlyBenefit: {
      min: 8,
      max: 107,
      description:
        "Paid as annual tax refund. Equivalent to $8–$107/month.",
    },
  },

  {
    id: "eitc-sc",
    name: "South Carolina EITC",
    displayName: "South Carolina Earned Income Tax Credit",
    level: "state",
    stateCode: "SC",
    category: "Tax Credits",
    description:
      "South Carolina offers an EITC worth 125% of the federal EITC. However, the credit is nonrefundable — it can reduce state tax owed to zero but will not provide a cash refund.",
    targetPopulation: "Working individuals and families with low-moderate income who owe South Carolina state income tax",
    rules: {
      maxIncomePctFPL: 400,
      requiresEmployed: true,
      applicableStates: ["SC"],
    },
    url: "https://dor.sc.gov/tax/individual",
    notes:
      "125% of federal EITC; nonrefundable. Despite the high percentage, most low-income filers receive little benefit because they owe little state tax.",
    estimatedAnnualBenefit: {
      min: 100,
      max: 3000,
      description:
        "Up to $3,000/year in state income tax reduction, depending on state tax liability.",
    },
    estimatedMonthlyBenefit: {
      min: 8,
      max: 250,
      description:
        "Annual tax reduction equivalent to $8–$250/month.",
    },
  },

  {
    id: "eitc-vt",
    name: "Vermont EITC",
    displayName: "Vermont Earned Income Tax Credit",
    level: "state",
    stateCode: "VT",
    category: "Tax Credits",
    description:
      "Vermont's refundable EITC equals 38% of the federal credit for families with children. For workers without children, the credit equals 100% of the federal EITC beginning in 2026. ITIN filers are eligible.",
    targetPopulation: "Working individuals and families with low-moderate income",
    rules: {
      maxIncomePctFPL: 400,
      requiresEmployed: true,
      applicableStates: ["VT"],
    },
    url: "https://tax.vermont.gov/individuals/income-tax/credits",
    notes:
      "38% of federal EITC for filers with children; 100% for childless workers (effective 2026). Fully refundable. ITIN filers are eligible.",
    estimatedAnnualBenefit: {
      min: 240,
      max: 3057,
      description:
        "Up to $3,057/year for families with children (38% of max $8,046 federal EITC).",
    },
    estimatedMonthlyBenefit: {
      min: 20,
      max: 255,
      description:
        "Paid as annual tax refund. Equivalent to $20–$255/month.",
    },
  },

  {
    id: "eitc-va",
    name: "Virginia EITC",
    displayName: "Virginia Earned Income Tax Credit",
    level: "state",
    stateCode: "VA",
    category: "Tax Credits",
    description:
      "Virginia's earned income tax credit equals 20% of the federal EITC. Beginning in 2025, the credit is fully refundable for all qualifying households (sunsets in 2027 unless extended).",
    targetPopulation: "Working individuals and families with low-moderate income",
    rules: {
      maxIncomePctFPL: 400,
      requiresEmployed: true,
      applicableStates: ["VA"],
    },
    url: "https://www.tax.virginia.gov/individual-income-tax-credits",
    notes:
      "20% of federal EITC; fully refundable through 2026. Will revert to partially nonrefundable option in 2027 unless extended.",
    estimatedAnnualBenefit: {
      min: 126,
      max: 1609,
      description:
        "Up to $1,609/year (20% of max $8,046 federal EITC).",
    },
    estimatedMonthlyBenefit: {
      min: 11,
      max: 134,
      description:
        "Paid as annual tax refund. Equivalent to $11–$134/month.",
    },
  },

  {
    id: "eitc-wa",
    name: "Washington Working Families Tax Credit",
    displayName: "Washington Working Families Tax Credit (EITC)",
    level: "state",
    stateCode: "WA",
    category: "Tax Credits",
    description:
      "Washington State's Working Families Tax Credit provides a cash refund of $335–$1,330 depending on family size for residents who qualify for the federal EITC. Washington has no state income tax, so this is administered as a separate annual application.",
    targetPopulation: "Working individuals and families who qualify for the federal EITC and lived in WA for 183+ days",
    rules: {
      maxIncomePctFPL: 400,
      requiresEmployed: true,
      applicableStates: ["WA"],
    },
    url: "https://dor.wa.gov/taxes-rates/tax-incentives/working-families-tax-credit",
    notes:
      "Must file a federal tax return and submit a separate WA state application starting Feb. 1 each year. Must be age 25–64 (or have a qualifying child). ITIN filers are eligible. Minimum $50 credit.",
    estimatedAnnualBenefit: {
      min: 335,
      max: 1330,
      description:
        "$335/year for a single worker (no children), up to $1,330/year for a family with 3+ children.",
    },
    estimatedMonthlyBenefit: {
      min: 28,
      max: 111,
      description:
        "Paid as annual refund. Equivalent to $28–$111/month.",
    },
  },

  {
    id: "eitc-wi",
    name: "Wisconsin EITC",
    displayName: "Wisconsin Earned Income Tax Credit",
    level: "state",
    stateCode: "WI",
    category: "Tax Credits",
    description:
      "Wisconsin's refundable EITC varies by number of children: 4% for one child, 11% for two children, and 34% for three or more children. Workers without children do not qualify for Wisconsin's state EITC.",
    targetPopulation: "Working families with children and low-moderate income",
    rules: {
      maxIncomePctFPL: 400,
      requiresEmployed: true,
      requiresChildren: true,
      applicableStates: ["WI"],
    },
    url: "https://www.revenue.wi.gov/Pages/FAQS/ise-earnedincome.aspx",
    notes:
      "4% for one child, 11% for two children, 34% for three or more children. Workers without children do not qualify. Fully refundable.",
    estimatedAnnualBenefit: {
      min: 173,
      max: 2736,
      description:
        "$173–$476/year for one child (4%); $476–$787/year for two children (11%); $1,470–$2,736/year for three+ children (34%).",
    },
    estimatedMonthlyBenefit: {
      min: 14,
      max: 228,
      description:
        "Paid as annual tax refund. Equivalent to $14–$228/month.",
    },
  },
];


// ─────────────────────────────────────────────────────────────────────────────
// PROPERTY TAX RELIEF / CIRCUIT BREAKER PROGRAMS
// Source: ITEP Property Tax Circuit Breaker Report (itep.org/property-tax-affordability-circuit-breaker-credits/)
// and individual state revenue department websites
// ─────────────────────────────────────────────────────────────────────────────

export const propertyTaxPrograms: Program[] = [
  {
    id: "prop-tax-ca",
    name: "California Property Tax Relief (Homeowners' Exemption + Senior Freeze)",
    displayName: "California Property Tax Relief",
    level: "state",
    stateCode: "CA",
    category: "Tax Credits",
    description:
      "California offers a $7,000 homeowners' exemption reducing assessed value, plus the Property Tax Postponement program for seniors and disabled homeowners with household income under $51,301. Low-income seniors may postpone property taxes as a lien on the home.",
    targetPopulation: "California homeowners; seniors 62+ or disabled with income under $51,301 for postponement",
    rules: {
      maxIncomePctFPL: 300,
      minAge: 62,
      applicableStates: ["CA"],
    },
    url: "https://www.sco.ca.gov/ardtax_prop_tax_postponement.html",
    notes:
      "Homeowners' Exemption ($7,000 assessed value reduction) available to all homeowner-occupants. Property Tax Postponement: income up to $51,301, 62+ or disabled. Taxes are deferred as a lien on the property.",
    estimatedAnnualBenefit: {
      min: 70,
      max: 2000,
      description:
        "$70–$100/year from Homeowners' Exemption. Property Tax Postponement can defer hundreds to thousands of dollars per year depending on county.",
    },
    estimatedMonthlyBenefit: {
      min: 6,
      max: 167,
      description:
        "$6–$167/month equivalent in property tax savings or deferral.",
    },
  },

  {
    id: "prop-tax-ny",
    name: "New York STAR Property Tax Relief",
    displayName: "New York School Tax Relief (STAR)",
    level: "state",
    stateCode: "NY",
    category: "Tax Credits",
    description:
      "The School Tax Relief (STAR) program provides a check or reduction in school taxes for New York homeowners. Basic STAR is for homeowners with household income under $500,000. Enhanced STAR is for seniors 65+ with income under $107,300 and provides a larger benefit.",
    targetPopulation: "NY homeowners with household income under $500,000; seniors 65+ for Enhanced STAR",
    rules: {
      maxIncomePctFPL: 700,
      applicableStates: ["NY"],
    },
    url: "https://www.tax.ny.gov/star/",
    notes:
      "Basic STAR: all homeowners under $500,000 income. Enhanced STAR: age 65+, income under $107,300 (2025). Delivered as a STAR credit check (new registrants) or exemption on school tax bill.",
    estimatedAnnualBenefit: {
      min: 300,
      max: 1500,
      description:
        "$300–$800/year for Basic STAR; $600–$1,500/year for Enhanced STAR (seniors 65+), depending on school district.",
    },
    estimatedMonthlyBenefit: {
      min: 25,
      max: 125,
      description:
        "$25–$125/month equivalent in school tax savings.",
    },
  },

  {
    id: "prop-tax-nj",
    name: "New Jersey Property Tax Relief (ANCHOR + Senior Freeze + Stay NJ)",
    displayName: "New Jersey Property Tax Relief (ANCHOR/Stay NJ)",
    level: "state",
    stateCode: "NJ",
    category: "Tax Credits",
    description:
      "New Jersey's combined programs include: ANCHOR (Affordable New Jersey Communities for Homeowners and Renters) providing $1,500 for homeowners and $450 for renters; Senior Freeze reimbursing property tax increases; and Stay NJ reimbursing seniors 65+ for 50% of property taxes up to $6,500.",
    targetPopulation: "NJ homeowners and renters with income up to $150,000 (ANCHOR); seniors 65+ with income under $500,000 (Stay NJ)",
    rules: {
      maxIncomePctFPL: 700,
      applicableStates: ["NJ"],
    },
    url: "https://www.nj.gov/treasury/taxation/anchor/index.shtml",
    notes:
      "ANCHOR: homeowners with income up to $150,000 get $1,500; $100,001–$250,000 get $1,000; renters with income up to $150,000 get $450. Senior Freeze: 65+, owned/rented home 10+ years. Stay NJ: 65+, income under $500,000, reimburses 50% of property taxes up to $6,500.",
    estimatedAnnualBenefit: {
      min: 450,
      max: 8000,
      description:
        "$450/year for renters (ANCHOR); $1,000–$1,500/year for homeowners (ANCHOR); up to $6,500/year additional for seniors (Stay NJ).",
    },
    estimatedMonthlyBenefit: {
      min: 38,
      max: 667,
      description:
        "$38–$667/month equivalent in property tax relief.",
    },
  },

  {
    id: "prop-tax-pa",
    name: "Pennsylvania Property Tax/Rent Rebate Program",
    displayName: "Pennsylvania Property Tax Rebate",
    level: "state",
    stateCode: "PA",
    category: "Tax Credits",
    description:
      "Pennsylvania's Property Tax/Rent Rebate program provides rebates of up to $1,000 for seniors 65+, widows/widowers 50+, and disabled adults under 18 with income under $45,000. Renters with income under $15,000 can receive up to $650.",
    targetPopulation: "PA seniors 65+, widows/widowers 50+, and disabled adults with income under $45,000",
    rules: {
      maxIncomePctFPL: 300,
      minAge: 50,
      applicableStates: ["PA"],
    },
    url: "https://www.revenue.pa.gov/IncentivesCreditsPrograms/PropertyTaxRentRebateProgram/Pages/default.aspx",
    notes:
      "Homeowners: income up to $45,000 (half of Social Security excluded). Renters: income up to $15,000. Maximum rebate $1,000 for homeowners, $650 for renters. Supplemental rebates available for those with lowest incomes.",
    estimatedAnnualBenefit: {
      min: 380,
      max: 1000,
      description:
        "$380–$1,000/year rebate depending on income tier and whether homeowner or renter.",
    },
    estimatedMonthlyBenefit: {
      min: 32,
      max: 83,
      description:
        "$32–$83/month equivalent in property tax rebate.",
    },
  },

  {
    id: "prop-tax-il",
    name: "Illinois Property Tax Credit",
    displayName: "Illinois Property Tax Credit",
    level: "state",
    stateCode: "IL",
    category: "Tax Credits",
    description:
      "Illinois homeowners can claim a credit equal to 5% of property taxes paid on their principal residence against their state income tax. Renters can deduct 5% of rent paid (as a proxy for property taxes). No income limit for the basic credit.",
    targetPopulation: "Illinois homeowners and renters who file state income taxes",
    rules: {
      maxIncomePctFPL: 700,
      applicableStates: ["IL"],
    },
    url: "https://tax.illinois.gov/individuals/credits.html",
    notes:
      "Homeowners claim 5% of property taxes paid. Renters claim 5% of rent paid. Credit cannot exceed tax liability (nonrefundable). Separate Homestead Exemptions (General, Senior, Freeze) also available through county assessors.",
    estimatedAnnualBenefit: {
      min: 200,
      max: 1500,
      description:
        "$200–$1,500/year in state income tax reduction (5% of property taxes paid; average Illinois property tax ~$4,000–$6,000/year).",
    },
    estimatedMonthlyBenefit: {
      min: 17,
      max: 125,
      description:
        "$17–$125/month equivalent in property tax savings.",
    },
  },

  {
    id: "prop-tax-mi",
    name: "Michigan Homestead Property Tax Credit",
    displayName: "Michigan Homestead Property Tax Credit",
    level: "state",
    stateCode: "MI",
    category: "Tax Credits",
    description:
      "Michigan provides a refundable property tax credit for homeowners and renters with total household income under $71,500. The credit covers a portion of property taxes (or 23% of rent as proxy) that exceeds a threshold based on income. Maximum credit is $1,900.",
    targetPopulation: "Michigan homeowners and renters with household income under $71,500",
    rules: {
      maxIncomePctFPL: 400,
      applicableStates: ["MI"],
    },
    url: "https://www.michigan.gov/taxes/iit/tax-guidance/credits-exemptions/hptc",
    notes:
      "Available to homeowners and renters. Total household resources must be under $71,500. Property taxable value must be under $165,400. Maximum credit: $1,900. Credit phases out for income over $62,500.",
    estimatedAnnualBenefit: {
      min: 200,
      max: 1900,
      description:
        "$200–$1,900/year refundable credit for qualified homeowners and renters.",
    },
    estimatedMonthlyBenefit: {
      min: 17,
      max: 158,
      description:
        "$17–$158/month equivalent in property tax relief.",
    },
  },

  {
    id: "prop-tax-oh",
    name: "Ohio Homestead Exemption",
    displayName: "Ohio Homestead Exemption",
    level: "state",
    stateCode: "OH",
    category: "Tax Credits",
    description:
      "Ohio's Homestead Exemption reduces the taxable value of a qualifying homeowner's primary residence by $25,000 for seniors 65+ or disabled homeowners. A new means-tested homestead exemption is also available for lower-income homeowners under 65.",
    targetPopulation: "Ohio homeowners who are 65+ or permanently disabled",
    rules: {
      minAge: 65,
      maxIncomePctFPL: 400,
      applicableStates: ["OH"],
    },
    url: "https://tax.ohio.gov/individual/homestead-exemption",
    notes:
      "Senior/disabled exemption: no income limit (universal). Reduces taxable home value by $25,000. Additional means-tested exemption for lower-income seniors. Applied through county auditor.",
    estimatedAnnualBenefit: {
      min: 300,
      max: 800,
      description:
        "$300–$800/year in property tax savings from $25,000 assessed value reduction, depending on local tax rates.",
    },
    estimatedMonthlyBenefit: {
      min: 25,
      max: 67,
      description:
        "$25–$67/month equivalent in property tax savings.",
    },
  },

  {
    id: "prop-tax-ma",
    name: "Massachusetts Senior Property Tax Relief",
    displayName: "Massachusetts Property Tax Abatement & Circuit Breaker",
    level: "state",
    stateCode: "MA",
    category: "Tax Credits",
    description:
      "Massachusetts offers a refundable Circuit Breaker Tax Credit for seniors 65+ (up to $2,505 in 2025) when property taxes or 25% of rent exceed 10% of income. Also, municipalities may grant property tax exemptions for seniors and disabled residents.",
    targetPopulation: "MA seniors 65+ with income under $69,000 (single) or $86,000 (married) who own or rent",
    rules: {
      minAge: 65,
      maxIncomePctFPL: 500,
      applicableStates: ["MA"],
    },
    url: "https://www.mass.gov/info-details/circuit-breaker-tax-credit",
    notes:
      "Circuit Breaker Credit: income under $69,000 (single) or $86,000 (married) for 2025; home assessed value under $929,000. Additional local exemptions available for seniors, veterans, and disabled through local boards of assessors.",
    estimatedAnnualBenefit: {
      min: 200,
      max: 2505,
      description:
        "Up to $2,505/year refundable Circuit Breaker Credit for eligible seniors. Additional local exemptions may add $100–$1,000+.",
    },
    estimatedMonthlyBenefit: {
      min: 17,
      max: 209,
      description:
        "$17–$209/month equivalent in property tax relief.",
    },
  },

  {
    id: "prop-tax-ct",
    name: "Connecticut Property Tax Relief for Seniors",
    displayName: "Connecticut Property Tax Relief (Elderly/Disabled)",
    level: "state",
    stateCode: "CT",
    category: "Tax Credits",
    description:
      "Connecticut's Elderly and Totally Disabled Tax Relief Program provides local property tax exemptions for homeowners 65+ or totally disabled with income under $46,400 (single) or $56,800 (married). Municipalities also administer a circuit breaker program.",
    targetPopulation: "CT seniors 65+ or disabled homeowners with income under $46,400 (single) or $56,800 (married)",
    rules: {
      minAge: 65,
      maxIncomePctFPL: 350,
      applicableStates: ["CT"],
    },
    url: "https://portal.ct.gov/OPM/IGPP-MAIN/Property-Tax/Property-Tax-Relief-Programs",
    notes:
      "Income limits vary by municipality. Application filed with local assessor. Connecticut's circuit breaker credit is available for income up to about $130,000 for some programs.",
    estimatedAnnualBenefit: {
      min: 200,
      max: 1500,
      description:
        "$200–$1,500/year in property tax reduction depending on income, municipality, and program tier.",
    },
    estimatedMonthlyBenefit: {
      min: 17,
      max: 125,
      description:
        "$17–$125/month equivalent in property tax savings.",
    },
  },

  {
    id: "prop-tax-wi",
    name: "Wisconsin Homestead Credit",
    displayName: "Wisconsin Homestead Tax Credit",
    level: "state",
    stateCode: "WI",
    category: "Tax Credits",
    description:
      "Wisconsin's Homestead Credit provides a refundable property tax relief credit for low-income homeowners and renters with household income under $24,680. The maximum credit is $1,168. 12% of rent is treated as property taxes for renters.",
    targetPopulation: "WI homeowners and renters with household income under $24,680",
    rules: {
      maxIncomePctFPL: 200,
      applicableStates: ["WI"],
    },
    url: "https://www.revenue.wi.gov/Pages/FAQS/ise-homestead.aspx",
    notes:
      "Income limit: $24,680. Maximum credit: $1,168. Available to homeowners and renters. 12% of rent paid counts as property taxes for renter credit calculation.",
    estimatedAnnualBenefit: {
      min: 200,
      max: 1168,
      description:
        "$200–$1,168/year refundable credit for qualifying homeowners and renters.",
    },
    estimatedMonthlyBenefit: {
      min: 17,
      max: 97,
      description:
        "$17–$97/month equivalent in property tax relief.",
    },
  },

  {
    id: "prop-tax-mn",
    name: "Minnesota Property Tax Refund (Circuit Breaker)",
    displayName: "Minnesota Property Tax Refund",
    level: "state",
    stateCode: "MN",
    category: "Tax Credits",
    description:
      "Minnesota's Homestead Credit Refund provides a refundable credit for homeowners with household income under $142,490 whose property taxes are high relative to income. A separate Renter's Credit is available for renters. The maximum homeowner refund is approximately $3,140.",
    targetPopulation: "MN homeowners with income under $142,490 and renters with income under ~$75,000",
    rules: {
      maxIncomePctFPL: 700,
      applicableStates: ["MN"],
    },
    url: "https://www.revenue.state.mn.us/homeowners-homestead-credit-refund",
    notes:
      "Homeowners: income under $142,490, filed Form M1PR. Maximum refund ~$3,140. Renters: claim Renter's Credit on Schedule M1RENT. Special refund available if property taxes increased >12% from prior year.",
    estimatedAnnualBenefit: {
      min: 200,
      max: 3140,
      description:
        "$200–$3,140/year refundable for homeowners; $50–$2,000/year for renters depending on income and rent paid.",
    },
    estimatedMonthlyBenefit: {
      min: 17,
      max: 262,
      description:
        "$17–$262/month equivalent in property tax relief.",
    },
  },

  {
    id: "prop-tax-md",
    name: "Maryland Homeowners' and Renters' Tax Credit",
    displayName: "Maryland Property Tax Credit (Homeowners/Renters)",
    level: "state",
    stateCode: "MD",
    category: "Tax Credits",
    description:
      "Maryland's Homeowners' Property Tax Credit limits property taxes to a percentage of income based on a sliding scale. Renters' Tax Credit provides a refund to low-income renters. Income limit is approximately $60,000 for homeowners; $33,000 for renters.",
    targetPopulation: "MD homeowners with income under ~$60,000; renters under ~$33,000",
    rules: {
      maxIncomePctFPL: 400,
      applicableStates: ["MD"],
    },
    url: "https://dat.maryland.gov/realproperty/Pages/Maryland-Homeowners-Property-Tax-Credit-Program.aspx",
    notes:
      "Homeowners: income under approximately $60,000; maximum benefit ~$2,500/year. Renters: income under ~$33,000; maximum benefit ~$1,000/year. Apply through State Department of Assessments and Taxation.",
    estimatedAnnualBenefit: {
      min: 200,
      max: 2500,
      description:
        "$200–$2,500/year for homeowners; $200–$1,000/year for renters.",
    },
    estimatedMonthlyBenefit: {
      min: 17,
      max: 208,
      description:
        "$17–$208/month equivalent in property tax relief.",
    },
  },

  {
    id: "prop-tax-vt",
    name: "Vermont Property Tax Credit",
    displayName: "Vermont Household Income-Based Property Tax Adjustment",
    level: "state",
    stateCode: "VT",
    category: "Tax Credits",
    description:
      "Vermont's income-based property tax adjustment limits education property taxes for homeowners to a percentage of household income. Vermont also has a renter rebate program. Income eligibility extends up to approximately $134,800, one of the highest limits in the country.",
    targetPopulation: "VT homeowners with income under ~$134,800; renters with income under ~$47,000",
    rules: {
      maxIncomePctFPL: 700,
      applicableStates: ["VT"],
    },
    url: "https://tax.vermont.gov/property-owners/property-tax-adjustment",
    notes:
      "One of the most generous state property tax programs nationally. Homeowners file on Form HI-144. Renters file for the Renter Rebate. Maximum combined benefit can be $8,000/year.",
    estimatedAnnualBenefit: {
      min: 200,
      max: 8000,
      description:
        "$200–$8,000/year in property tax adjustments and renter rebates. Vermont has one of the highest maximum benefits in the country.",
    },
    estimatedMonthlyBenefit: {
      min: 17,
      max: 667,
      description:
        "$17–$667/month equivalent in property tax relief.",
    },
  },

  {
    id: "prop-tax-me",
    name: "Maine Property Tax Fairness Credit",
    displayName: "Maine Property Tax Fairness Credit",
    level: "state",
    stateCode: "ME",
    category: "Tax Credits",
    description:
      "Maine's refundable Property Tax Fairness Credit provides up to $1,500 ($2,000 for seniors 65+) when property taxes or rent exceed a threshold of income. Available to homeowners and renters with income up to $75,000.",
    targetPopulation: "ME homeowners and renters with income under $75,000",
    rules: {
      maxIncomePctFPL: 500,
      applicableStates: ["ME"],
    },
    url: "https://www.maine.gov/revenue/taxes/income-estate-inheritance-taxes/individual-income-tax/income-tax-credit-programs",
    notes:
      "Credit equals 50% of property taxes (or 20% of rent) exceeding 10% of income, up to $1,500 (or $2,000 for seniors). Income limit: $75,000. Filed on Maine income tax return.",
    estimatedAnnualBenefit: {
      min: 200,
      max: 2000,
      description:
        "$200–$2,000/year refundable ($1,500 max for non-seniors; $2,000 max for seniors 65+).",
    },
    estimatedMonthlyBenefit: {
      min: 17,
      max: 167,
      description:
        "$17–$167/month equivalent in property tax relief.",
    },
  },

  {
    id: "prop-tax-or",
    name: "Oregon Property Tax Deferral for Seniors",
    displayName: "Oregon Senior Property Tax Deferral",
    level: "state",
    stateCode: "OR",
    category: "Tax Credits",
    description:
      "Oregon's Property Tax Deferral program allows seniors 62+ and disabled homeowners with household income under $49,000 to defer property taxes each year as a lien on the property. Property taxes are paid in full when the home is sold.",
    targetPopulation: "OR homeowners 62+ or disabled with income under $49,000",
    rules: {
      minAge: 62,
      maxIncomePctFPL: 300,
      applicableStates: ["OR"],
    },
    url: "https://www.oregon.gov/dor/programs/property/Pages/senior-deferral.aspx",
    notes:
      "Income limit: $49,000/year. Must have at least 40% equity in the home. Taxes accrue interest at 6% per year. Program temporarily suspended 2009–2012 but has been restored.",
    estimatedAnnualBenefit: {
      min: 500,
      max: 4000,
      description:
        "$500–$4,000/year in deferred property taxes (varies by county tax rates and home value).",
    },
    estimatedMonthlyBenefit: {
      min: 42,
      max: 333,
      description:
        "$42–$333/month in property tax deferral (must be repaid when home is sold).",
    },
  },

  {
    id: "prop-tax-wa",
    name: "Washington Property Tax Exemption for Seniors",
    displayName: "Washington Senior Property Tax Exemption",
    level: "state",
    stateCode: "WA",
    category: "Tax Credits",
    description:
      "Washington provides a property tax exemption and valuation freeze for seniors 61+ and disabled persons with income under $58,423 (2025). The exemption reduces the taxable assessed value and freezes it at the year of first application.",
    targetPopulation: "WA homeowners 61+ or disabled with income under $58,423",
    rules: {
      minAge: 61,
      maxIncomePctFPL: 400,
      applicableStates: ["WA"],
    },
    url: "https://dor.wa.gov/find-taxes-rates/property-tax/property-tax-exemptions/senior-citizens-or-people-disabilities",
    notes:
      "Income threshold adjusted annually. Three income tiers determine exemption level. Must apply through county assessor. Home value assessment is frozen at year of application.",
    estimatedAnnualBenefit: {
      min: 300,
      max: 2500,
      description:
        "$300–$2,500/year depending on home value, local tax rates, and income tier.",
    },
    estimatedMonthlyBenefit: {
      min: 25,
      max: 208,
      description:
        "$25–$208/month equivalent in property tax savings.",
    },
  },

  {
    id: "prop-tax-co",
    name: "Colorado Property Tax Relief (Senior/Disabled)",
    displayName: "Colorado Senior/Disabled Property Tax Credit",
    level: "state",
    stateCode: "CO",
    category: "Tax Credits",
    description:
      "Colorado's Property Tax, Rent, and Heat (PTC) Rebate provides up to $1,112/year for seniors 65+ (or 58+ surviving spouses), disabled adults, and low-income renters or homeowners with income under $21,447 (single) or $28,588 (married) in 2025.",
    targetPopulation: "CO seniors 65+ (or surviving spouses 58+), disabled adults, low-income renters and homeowners",
    rules: {
      minAge: 65,
      maxIncomePctFPL: 200,
      applicableStates: ["CO"],
    },
    url: "https://cdor.colorado.gov/for-individuals/property-tax-rent-and-heat-ptc-rebate",
    notes:
      "Income limits: $21,447 (single) / $28,588 (married) in 2025. Maximum rebate $1,112. Available to renters and homeowners. Application filed with CO Department of Revenue.",
    estimatedAnnualBenefit: {
      min: 200,
      max: 1112,
      description:
        "$200–$1,112/year rebate for eligible seniors, disabled adults, and low-income individuals.",
    },
    estimatedMonthlyBenefit: {
      min: 17,
      max: 93,
      description:
        "$17–$93/month equivalent in property tax/rent/heat relief.",
    },
  },

  {
    id: "prop-tax-nm",
    name: "New Mexico Property Tax Rebate",
    displayName: "New Mexico Property Tax Rebate",
    level: "state",
    stateCode: "NM",
    category: "Tax Credits",
    description:
      "New Mexico provides a property tax rebate for low-income residents with household income under $18,000 (or $24,000 for renters). The maximum rebate is $250 for homeowners and $250 for renters. An additional Head of Family Exemption is available to seniors 65+.",
    targetPopulation: "NM homeowners with income under $18,000; renters under $24,000; seniors 65+ for additional exemption",
    rules: {
      maxIncomePctFPL: 150,
      applicableStates: ["NM"],
    },
    url: "https://www.tax.newmexico.gov/individuals/property-tax-rebate/",
    notes:
      "Homeowner income limit: $18,000. Renter income limit: $24,000. Maximum rebate: $250. Seniors 65+ also eligible for Head of Family Exemption ($2,000 assessed value reduction).",
    estimatedAnnualBenefit: {
      min: 100,
      max: 250,
      description:
        "$100–$250/year rebate for qualifying homeowners and renters.",
    },
    estimatedMonthlyBenefit: {
      min: 8,
      max: 21,
      description:
        "$8–$21/month equivalent in property tax relief.",
    },
  },
];


// ─────────────────────────────────────────────────────────────────────────────
// STATE PRESCRIPTION DRUG ASSISTANCE PROGRAMS (SPAP)
// ─────────────────────────────────────────────────────────────────────────────

export const prescriptionDrugPrograms: Program[] = [
  {
    id: "spap-ny-epic",
    name: "New York EPIC",
    displayName: "NY Elderly Pharmaceutical Insurance Coverage (EPIC)",
    level: "state",
    stateCode: "NY",
    category: "Healthcare",
    description:
      "New York's EPIC program helps seniors 65+ pay for Medicare Part D prescription drug costs. EPIC pays Medicare Part D premiums and provides copayment assistance for covered drugs. Income up to $75,000 (single) or $100,000 (married).",
    targetPopulation: "NY residents 65+ with income up to $75,000 (single) or $100,000 (married) not on full Medicaid",
    rules: {
      minAge: 65,
      maxIncomePctFPL: 600,
      requiresSenior: true,
      applicableStates: ["NY"],
    },
    url: "https://www.health.ny.gov/health_care/epic/",
    notes:
      "Fee Plan (income under $20,000 single/$26,000 married): EPIC pays Part D premiums. Deductible Plan (higher income): deductible applies before EPIC copays. EPIC also covers some Part D-excluded drugs. Call 1-800-332-3742 to apply.",
    estimatedAnnualBenefit: {
      min: 500,
      max: 5000,
      description:
        "$500–$5,000/year in premium payments and copay assistance, depending on income tier and drug costs.",
    },
    estimatedMonthlyBenefit: {
      min: 42,
      max: 417,
      description:
        "$42–$417/month in prescription drug savings.",
    },
  },

  {
    id: "spap-pa-pace",
    name: "Pennsylvania PACE/PACENET",
    displayName: "Pennsylvania PACE & PACENET Prescription Assistance",
    level: "state",
    stateCode: "PA",
    category: "Healthcare",
    description:
      "Pennsylvania's PACE (Pharmaceutical Assistance Contract for the Elderly) and PACENET programs help seniors 65+ afford prescriptions. PACE: income under $14,500 (single) with $6/$9 copays. PACENET: income under $33,500 (single) with a monthly premium and $8/$15 copays.",
    targetPopulation: "PA residents 65+ with income under $33,500 (single) or $41,500 (married) not on Medicaid",
    rules: {
      minAge: 65,
      maxIncomePctFPL: 300,
      requiresSenior: true,
      applicableStates: ["PA"],
    },
    url: "https://www.pa.gov/services/aging/apply-for-the-pharmaceutical-assistance-contract-for-the-elderly",
    notes:
      "PACE income: under $14,500 (single) or $17,700 (married). PACENET income: $14,501–$33,500 (single) or $17,701–$41,500 (married). Funded by Pennsylvania Lottery. Call 1-800-225-7223. Must not be on Medicaid prescription benefit.",
    estimatedAnnualBenefit: {
      min: 500,
      max: 4000,
      description:
        "$500–$4,000/year in prescription drug savings through reduced copays and premium assistance.",
    },
    estimatedMonthlyBenefit: {
      min: 42,
      max: 333,
      description:
        "$42–$333/month in prescription drug savings.",
    },
  },

  {
    id: "spap-nj-paad",
    name: "New Jersey PAAD",
    displayName: "NJ Pharmaceutical Assistance to the Aged & Disabled (PAAD)",
    level: "state",
    stateCode: "NJ",
    category: "Healthcare",
    description:
      "New Jersey's PAAD program helps eligible seniors 65+ and disabled adults afford prescription drugs. Beneficiaries pay only $5 per generic prescription and $7 per brand-name prescription. Income limit: $54,943 (single) or $62,390 (married) for 2026.",
    targetPopulation: "NJ residents 65+ (or 18–64 with Social Security disability) with income under $54,943 (single), not on Medicaid",
    rules: {
      minAge: 65,
      maxIncomePctFPL: 400,
      requiresSenior: true,
      applicableStates: ["NJ"],
    },
    url: "https://www.nj.gov/humanservices/doas/services/l-p/paad/",
    notes:
      "Must be enrolled in Medicare Part D. PAAD pays the monthly Part D premium for certain plans. Also available to adults 18–64 on Social Security disability. Apply through NJSave portal.",
    estimatedAnnualBenefit: {
      min: 600,
      max: 5000,
      description:
        "$600–$5,000/year depending on number of prescriptions and whether PAAD pays Part D premiums.",
    },
    estimatedMonthlyBenefit: {
      min: 50,
      max: 417,
      description:
        "$50–$417/month in prescription drug savings.",
    },
  },

  {
    id: "spap-ct",
    name: "Connecticut CHOICES/CONNPACE",
    displayName: "Connecticut Prescription Assistance (ConnPACE/CHOICES)",
    level: "state",
    stateCode: "CT",
    category: "Healthcare",
    description:
      "Connecticut's CHOICES program helps Medicare beneficiaries navigate prescription drug coverage options. ConnPACE was a prior direct prescription assistance program. The CHOICES counseling program helps seniors find drug cost savings through Medicare Part D and Extra Help.",
    targetPopulation: "CT residents 65+ or on Medicare needing prescription cost assistance",
    rules: {
      minAge: 65,
      maxIncomePctFPL: 400,
      requiresSenior: true,
      applicableStates: ["CT"],
    },
    url: "https://portal.ct.gov/AgingAndDisability/Services/Medicare/CHOICES-Medicare-Counseling",
    notes:
      "Free counseling and enrollment assistance through CHOICES program. Connecticut residents should also apply for Medicare Extra Help (federal). ConnPACE direct assistance was discontinued; CHOICES counseling remains.",
    estimatedAnnualBenefit: {
      min: 500,
      max: 4000,
      description:
        "$500–$4,000/year in identified savings through CHOICES counseling and optimal Part D plan selection.",
    },
    estimatedMonthlyBenefit: {
      min: 42,
      max: 333,
      description:
        "$42–$333/month in prescription drug savings through program guidance.",
    },
  },

  {
    id: "spap-il",
    name: "Illinois Circuit Breaker / SeniorCare",
    displayName: "Illinois SeniorCare Prescription Discount",
    level: "state",
    stateCode: "IL",
    category: "Healthcare",
    description:
      "Illinois's SeniorCare program provides prescription drug discounts to seniors 65+ with income under $27,610 (single) or $37,190 (household of 2). Participants pay a $25 co-payment per 30-day prescription at participating pharmacies.",
    targetPopulation: "IL residents 65+ with income under $27,610 (single) or $37,190 (couple)",
    rules: {
      minAge: 65,
      maxIncomePctFPL: 200,
      requiresSenior: true,
      applicableStates: ["IL"],
    },
    url: "https://www2.illinois.gov/aging/Pages/seniorcare.aspx",
    notes:
      "Income limits are approximate and adjusted annually. $25 flat copay per prescription at participating pharmacies. Illinois also offers the Illinois Cares Rx program for lower-income seniors.",
    estimatedAnnualBenefit: {
      min: 500,
      max: 3000,
      description:
        "$500–$3,000/year in prescription drug savings through flat $25 copays compared to retail prices.",
    },
    estimatedMonthlyBenefit: {
      min: 42,
      max: 250,
      description:
        "$42–$250/month in prescription drug savings.",
    },
  },

  {
    id: "spap-me",
    name: "Maine Rx Plus",
    displayName: "Maine Rx Plus Prescription Assistance",
    level: "state",
    stateCode: "ME",
    category: "Healthcare",
    description:
      "Maine's Rx Plus program helps low-income residents with prescription drug costs by leveraging the state's Medicaid purchasing power for discounts. Available to uninsured and underinsured Maine residents with income up to 350% FPL.",
    targetPopulation: "ME residents with income up to 350% FPL who lack adequate prescription drug coverage",
    rules: {
      minAge: 19,
      maxIncomePctFPL: 350,
      applicableStates: ["ME"],
    },
    url: "https://www.maine.gov/dhhs/oms/pharmacy-program",
    notes:
      "Income limit approximately 350% FPL. Also, seniors 65+ may access the Medicare Extra Help program and CHOICES counseling through Maine's SHIP.",
    estimatedAnnualBenefit: {
      min: 500,
      max: 3000,
      description:
        "$500–$3,000/year in prescription drug discounts for eligible Maine residents.",
    },
    estimatedMonthlyBenefit: {
      min: 42,
      max: 250,
      description:
        "$42–$250/month in prescription cost savings.",
    },
  },

  {
    id: "spap-ma",
    name: "Massachusetts Prescription Advantage",
    displayName: "Massachusetts Prescription Advantage",
    level: "state",
    stateCode: "MA",
    category: "Healthcare",
    description:
      "Massachusetts Prescription Advantage supplements Medicare Part D drug coverage for seniors 65+ and disabled adults. Income up to 500% FPL for seniors on Medicare. Provides copayment ceilings and catastrophic drug cost protection.",
    targetPopulation: "MA residents 65+ on Medicare with income up to 500% FPL, or disabled adults with income up to 188% FPL",
    rules: {
      minAge: 65,
      maxIncomePctFPL: 500,
      requiresSenior: true,
      applicableStates: ["MA"],
    },
    url: "https://www.prescriptionadvantagema.org",
    notes:
      "Must be enrolled in Medicare Part D. Provides protection from catastrophic drug costs. Also available to those 65+ not yet on Medicare and disabled individuals meeting CommonHealth guidelines. Income up to 500% FPL for seniors.",
    estimatedAnnualBenefit: {
      min: 500,
      max: 5000,
      description:
        "$500–$5,000/year in prescription drug savings, especially for those with high drug costs or gaps in Medicare Part D coverage.",
    },
    estimatedMonthlyBenefit: {
      min: 42,
      max: 417,
      description:
        "$42–$417/month in prescription drug savings.",
    },
  },

  {
    id: "spap-md",
    name: "Maryland SHIP/SPDAP",
    displayName: "Maryland Senior Prescription Drug Assistance",
    level: "state",
    stateCode: "MD",
    category: "Healthcare",
    description:
      "Maryland provides prescription drug assistance to seniors through the State Pharmaceutical Assistance Program (SPDAP) and free SHIP (State Health Insurance Assistance Program) counseling. Helps seniors 65+ on Medicare find the most affordable drug coverage and apply for Extra Help.",
    targetPopulation: "MD residents 65+ or on Medicare needing prescription drug coverage help",
    rules: {
      minAge: 65,
      maxIncomePctFPL: 400,
      requiresSenior: true,
      applicableStates: ["MD"],
    },
    url: "https://aging.maryland.gov/Pages/maryland-ship.aspx",
    notes:
      "Free SHIP counseling helps identify savings in Medicare Part D. Direct SPDAP assistance also available for qualifying seniors. Contact Maryland SHIP for most current eligibility information.",
    estimatedAnnualBenefit: {
      min: 500,
      max: 4000,
      description:
        "$500–$4,000/year in identified prescription drug savings through SHIP counseling and SPDAP assistance.",
    },
    estimatedMonthlyBenefit: {
      min: 42,
      max: 333,
      description:
        "$42–$333/month in prescription drug savings.",
    },
  },

  {
    id: "spap-fl",
    name: "Florida SHINE / Rx Savings Programs",
    displayName: "Florida Prescription Drug Savings (SHINE)",
    level: "state",
    stateCode: "FL",
    category: "Healthcare",
    description:
      "Florida's SHINE (Serving Health Insurance Needs of Elders) program provides free, unbiased counseling to help seniors find prescription drug savings, navigate Medicare Part D options, and apply for Extra Help and manufacturer patient assistance programs.",
    targetPopulation: "FL residents on Medicare needing prescription drug cost assistance",
    rules: {
      minAge: 60,
      maxIncomePctFPL: 400,
      requiresSenior: true,
      applicableStates: ["FL"],
    },
    url: "https://elderaffairs.org/shine/",
    notes:
      "SHINE counseling is free. Florida does not have a direct state prescription drug subsidy program (other than Medicaid). SHINE counselors help identify the best Medicare Part D plan and Extra Help eligibility.",
    estimatedAnnualBenefit: {
      min: 500,
      max: 4000,
      description:
        "$500–$4,000/year in identified savings through SHINE counseling and optimal plan enrollment.",
    },
    estimatedMonthlyBenefit: {
      min: 42,
      max: 333,
      description:
        "$42–$333/month in prescription drug savings.",
    },
  },

  {
    id: "spap-in",
    name: "Indiana SHIPS / Hoosier Rx",
    displayName: "Indiana Prescription Assistance (SHIP/Hoosier Rx)",
    level: "state",
    stateCode: "IN",
    category: "Healthcare",
    description:
      "Indiana's SHIP (State Health Insurance Assistance Program) provides free counseling to help Medicare beneficiaries find prescription drug savings. The Hoosier Rx program (now largely integrated into Medicare) helps low-income seniors with drug costs.",
    targetPopulation: "IN residents 65+ or on Medicare needing prescription drug cost assistance",
    rules: {
      minAge: 65,
      maxIncomePctFPL: 300,
      requiresSenior: true,
      applicableStates: ["IN"],
    },
    url: "https://www.in.gov/fssa/ompp/medicare-program/indiana-counseling-program-for-insurance-assistance-icpia/",
    notes:
      "Free SHIP counseling helps identify savings. Apply for Medicare Extra Help through Social Security. Contact Indiana SHIP at 1-800-452-4800.",
    estimatedAnnualBenefit: {
      min: 500,
      max: 3000,
      description:
        "$500–$3,000/year in identified prescription drug savings.",
    },
    estimatedMonthlyBenefit: {
      min: 42,
      max: 250,
      description:
        "$42–$250/month in prescription drug savings.",
    },
  },

  {
    id: "spap-mt",
    name: "Montana SHIP Prescription Assistance",
    displayName: "Montana Prescription Drug Assistance (SHIP)",
    level: "state",
    stateCode: "MT",
    category: "Healthcare",
    description:
      "Montana's SHIP (Senior and Long Term Care) provides free counseling to help seniors find prescription drug savings through Medicare Part D, Extra Help, and manufacturer patient assistance programs.",
    targetPopulation: "MT residents 65+ or on Medicare needing prescription drug cost help",
    rules: {
      minAge: 65,
      maxIncomePctFPL: 300,
      requiresSenior: true,
      applicableStates: ["MT"],
    },
    url: "https://dphhs.mt.gov/SLTC/aging/SHIP",
    notes:
      "Free SHIP counseling. Montana does not have a separate direct state pharmaceutical assistance program beyond counseling. Apply for federal Medicare Extra Help through Social Security.",
    estimatedAnnualBenefit: {
      min: 500,
      max: 3000,
      description:
        "$500–$3,000/year in identified prescription drug savings through SHIP counseling.",
    },
    estimatedMonthlyBenefit: {
      min: 42,
      max: 250,
      description:
        "$42–$250/month in prescription drug savings.",
    },
  },

  {
    id: "spap-wi",
    name: "Wisconsin SeniorCare",
    displayName: "Wisconsin SeniorCare Prescription Drug Assistance",
    level: "state",
    stateCode: "WI",
    category: "Healthcare",
    description:
      "Wisconsin's SeniorCare program provides prescription drug discounts to Wisconsin residents 65+ with income under 240% FPL. Participants pay a $30 annual enrollment fee and copayments of $5 per generic or $15 per brand-name drug.",
    targetPopulation: "WI residents 65+ with income under 240% FPL",
    rules: {
      minAge: 65,
      maxIncomePctFPL: 240,
      requiresSenior: true,
      applicableStates: ["WI"],
    },
    url: "https://www.dhs.wisconsin.gov/seniorcare/index.htm",
    notes:
      "Income limit: 240% FPL. Annual enrollment fee: $30. Copayments: $5 generic, $15 brand-name. SeniorCare is a qualified SPAP that allows special enrollment in Medicare Part D.",
    estimatedAnnualBenefit: {
      min: 500,
      max: 4000,
      description:
        "$500–$4,000/year in prescription drug savings through low copayments and Part D premium assistance.",
    },
    estimatedMonthlyBenefit: {
      min: 42,
      max: 333,
      description:
        "$42–$333/month in prescription drug savings.",
    },
  },

  {
    id: "spap-nv",
    name: "Nevada SHIP Prescription Assistance",
    displayName: "Nevada Prescription Drug Savings (SHIP/ADSD)",
    level: "state",
    stateCode: "NV",
    category: "Healthcare",
    description:
      "Nevada's Aging and Disability Services Division (ADSD) provides SHIP counseling to help seniors and disabled adults find prescription drug savings through Medicare Part D, Extra Help, and other assistance programs.",
    targetPopulation: "NV residents 65+ or on Medicare needing prescription drug cost assistance",
    rules: {
      minAge: 65,
      maxIncomePctFPL: 300,
      requiresSenior: true,
      applicableStates: ["NV"],
    },
    url: "https://adsd.nv.gov/Programs/Aging/SHIP/SHIP_Home/",
    notes:
      "Free SHIP counseling through Nevada ADSD. Nevada does not have a separate direct state pharmaceutical subsidy program. Extra Help (federal) is the main resource; SHIP counselors assist with applications.",
    estimatedAnnualBenefit: {
      min: 500,
      max: 3000,
      description:
        "$500–$3,000/year in identified prescription drug savings.",
    },
    estimatedMonthlyBenefit: {
      min: 42,
      max: 250,
      description:
        "$42–$250/month in prescription drug savings.",
    },
  },

  {
    id: "spap-ri",
    name: "Rhode Island RIPAE",
    displayName: "Rhode Island Pharmaceutical Assistance to the Elderly (RIPAE)",
    level: "state",
    stateCode: "RI",
    category: "Healthcare",
    description:
      "Rhode Island's RIPAE program provides prescription drug discounts to seniors 65+ and disabled adults with income under specified limits. Participants pay reduced copayments for covered medications.",
    targetPopulation: "RI residents 65+ (or disabled) with income under approximately $20,000 (single) or $25,000 (couple)",
    rules: {
      minAge: 65,
      maxIncomePctFPL: 200,
      requiresSenior: true,
      applicableStates: ["RI"],
    },
    url: "https://health.ri.gov/find/pharmacyassistance/",
    notes:
      "Income limits subject to annual update. Must be RI resident and not have equivalent prescription coverage. Contact RI Department of Health for current income thresholds.",
    estimatedAnnualBenefit: {
      min: 500,
      max: 3000,
      description:
        "$500–$3,000/year in prescription drug savings through RIPAE copay assistance.",
    },
    estimatedMonthlyBenefit: {
      min: 42,
      max: 250,
      description:
        "$42–$250/month in prescription drug savings.",
    },
  },

  {
    id: "spap-vt",
    name: "Vermont VPharm",
    displayName: "Vermont Prescription Drug Assistance (VPharm)",
    level: "state",
    stateCode: "VT",
    category: "Healthcare",
    description:
      "Vermont's VPharm program provides prescription drug coverage assistance for low-income Medicare beneficiaries with income up to 225% FPL who do not qualify for Medicaid. VPharm wraps around Medicare Part D coverage.",
    targetPopulation: "VT Medicare beneficiaries with income up to 225% FPL who don't qualify for Medicaid",
    rules: {
      minAge: 65,
      maxIncomePctFPL: 225,
      requiresSenior: true,
      applicableStates: ["VT"],
    },
    url: "https://dvha.vermont.gov/members/vhap-vpharm",
    notes:
      "Must be enrolled in Medicare Part D. Income up to 225% FPL. VPharm coordinates with Medicare Extra Help. Apply through Vermont Department of Health Access.",
    estimatedAnnualBenefit: {
      min: 500,
      max: 4000,
      description:
        "$500–$4,000/year in prescription drug savings through VPharm assistance.",
    },
    estimatedMonthlyBenefit: {
      min: 42,
      max: 333,
      description:
        "$42–$333/month in prescription drug savings.",
    },
  },

  {
    id: "spap-de",
    name: "Delaware DMMA Prescription Assistance",
    displayName: "Delaware Prescription Drug Assistance (DPAP)",
    level: "state",
    stateCode: "DE",
    category: "Healthcare",
    description:
      "Delaware's Delaware Prescription Assistance Program (DPAP) provides prescription drug discounts to seniors 65+ and adults 19–64 with disabilities who have income at or below 200% FPL and lack adequate drug coverage.",
    targetPopulation: "DE residents 65+ or disabled (19+) with income at or below 200% FPL without adequate drug coverage",
    rules: {
      minAge: 65,
      maxIncomePctFPL: 200,
      requiresSenior: true,
      applicableStates: ["DE"],
    },
    url: "https://dhss.delaware.gov/dsaapd/dpap.html",
    notes:
      "Must not be enrolled in Medicaid or have equivalent coverage. Income at or below 200% FPL. Apply through Delaware Division of Services for Aging and Adults with Physical Disabilities.",
    estimatedAnnualBenefit: {
      min: 500,
      max: 3000,
      description:
        "$500–$3,000/year in prescription drug savings through DPAP assistance.",
    },
    estimatedMonthlyBenefit: {
      min: 42,
      max: 250,
      description:
        "$42–$250/month in prescription drug savings.",
    },
  },
];


// ─────────────────────────────────────────────────────────────────────────────
// COMBINED EXPORT
// ─────────────────────────────────────────────────────────────────────────────

export const allNewPrograms: Program[] = [
  ...newFederalPrograms,
  ...stateEITCPrograms,
  ...propertyTaxPrograms,
  ...prescriptionDrugPrograms,
];
