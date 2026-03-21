// ─── Application Knowledge Base ──────────────────────────────────────────
// Deep knowledge for the AI assistant when helping users apply for specific programs.
// Each entry contains step-by-step instructions, required documents, tips, and common issues.

export interface ApplicationGuide {
  programId: string;
  programName: string;
  steps: { title: string; description: string; tips?: string }[];
  requiredDocuments: string[];
  commonMistakes: string[];
  processingTime: string;
  appealInfo: string;
  officialApplyUrl: string;
  helplinePhone?: string;
}

export const APPLICATION_GUIDES: Record<string, ApplicationGuide> = {
  snap: {
    programId: "snap",
    programName: "SNAP (Food Stamps)",
    steps: [
      { title: "Find your state's application", description: "Visit your state's SNAP portal or your local Department of Social Services office. Most states accept online applications.", tips: "Search '[your state] SNAP application online' to find the exact portal." },
      { title: "Complete the application form", description: "You'll provide information about everyone in your household: names, SSNs, income, expenses, and resources. Be thorough — missing info delays your case.", tips: "Gather all pay stubs, bank statements, and ID documents BEFORE you start." },
      { title: "Submit and get your interview", description: "After submitting, you'll be scheduled for an eligibility interview (phone or in-person). This is required — don't miss it.", tips: "Write down any questions beforehand. Be honest and complete in your answers." },
      { title: "Provide verification documents", description: "You'll need to prove your identity, income, and expenses. Submit everything they ask for quickly.", tips: "Make copies of everything you submit. Take photos of documents as backup." },
      { title: "Receive your decision", description: "Standard processing takes up to 30 days. Expedited processing (7 days) is available if you have less than $150 in monthly gross income and liquid resources.", tips: "If you need food NOW, ask about expedited benefits at your interview." },
      { title: "Get your EBT card", description: "If approved, you'll receive an EBT card by mail. Benefits are loaded monthly.", tips: "Download the Propel app to track your balance. Save your PIN in a safe place." },
    ],
    requiredDocuments: [
      "Photo ID (driver's license, state ID, passport)",
      "Social Security numbers for all household members",
      "Proof of income (last 30 days of pay stubs, benefit letters, tax returns)",
      "Proof of housing costs (rent receipt or lease, mortgage statement)",
      "Utility bills (electric, gas, water, phone)",
      "Bank statements (checking and savings, last 30 days)",
      "Proof of citizenship or immigration status",
      "Proof of any disability (if applicable)",
    ],
    commonMistakes: [
      "Not reporting ALL household members who buy and prepare food together",
      "Forgetting to include all income sources (child support, side jobs, cash payments)",
      "Missing the interview appointment (your application gets denied automatically)",
      "Not submitting verification documents within the deadline (usually 10-30 days)",
      "Not requesting expedited benefits when you qualify (very low income/resources)",
    ],
    processingTime: "Standard: up to 30 days. Expedited: within 7 days if you qualify (very low income or resources).",
    appealInfo: "If denied, you have 90 days to request a fair hearing. The denial letter will explain the reason and how to appeal. You can also reapply immediately.",
    officialApplyUrl: "https://www.fns.usda.gov/snap/state-directory",
    helplinePhone: "1-800-221-5689",
  },

  "medicaid-adult": {
    programId: "medicaid-adult",
    programName: "Medicaid",
    steps: [
      { title: "Check your state's expansion status", description: "If your state expanded Medicaid, adults up to 138% FPL qualify. If not, eligibility is much more limited.", tips: "Non-expansion states: AL, FL, GA, KS, MS, SC, TN, TX, WI, WY. You may still qualify if you're a parent, pregnant, disabled, or 65+." },
      { title: "Apply through Healthcare.gov or your state", description: "You can apply on Healthcare.gov (which routes you to Medicaid if eligible) or directly through your state's Medicaid agency.", tips: "Healthcare.gov is often easier. It automatically checks both Medicaid and marketplace options." },
      { title: "Complete the application", description: "Provide household information, income, current insurance status, and personal details for everyone who needs coverage.", tips: "Include ALL income but also ALL deductions — child care costs, alimony paid, and student loan interest can lower your counted income." },
      { title: "Submit verification documents", description: "Your state will request proof of income, identity, and residency. Some states verify electronically and may not need paper documents.", tips: "Respond to every notice from your state Medicaid office — ignoring mail can result in loss of coverage." },
      { title: "Get your determination", description: "Processing times vary by state (15-45 days). If approved, coverage often starts retroactively from the application date.", tips: "Ask about retroactive coverage — Medicaid may cover medical bills from up to 3 months BEFORE you applied." },
      { title: "Choose a managed care plan", description: "Most states require you to enroll in a managed care plan. Compare options based on your doctors and prescriptions.", tips: "Make sure your current doctors accept the plan. You can usually switch plans within the first 90 days." },
    ],
    requiredDocuments: [
      "Photo ID or proof of identity",
      "Social Security numbers for all applicants",
      "Proof of income (pay stubs, tax returns, benefit letters)",
      "Proof of state residency (utility bill, lease, mail with your address)",
      "Proof of citizenship or qualified immigration status",
      "Current health insurance information (if any)",
      "Proof of pregnancy (if applicable)",
      "Disability documentation (if applicable)",
    ],
    commonMistakes: [
      "Not realizing your state hasn't expanded Medicaid (childless adults may have no pathway)",
      "Forgetting to report household changes (new job, marriage, baby) which could affect eligibility",
      "Not completing the redetermination/renewal process when required (annual in most states)",
      "Assuming you don't qualify based on old rules — income limits have changed significantly",
      "Not applying because you think it takes too long — many states process within 2-3 weeks",
    ],
    processingTime: "15-45 days in most states. Emergency Medicaid for medical emergencies can be immediate.",
    appealInfo: "You have 60-90 days (varies by state) to appeal a denial. Request a fair hearing in writing. You can continue receiving benefits during the appeal if you file quickly.",
    officialApplyUrl: "https://www.healthcare.gov/medicaid-chip/getting-medicaid-chip/",
    helplinePhone: "1-800-318-2596",
  },

  ssdi: {
    programId: "ssdi",
    programName: "Social Security Disability (SSDI)",
    steps: [
      { title: "Gather your medical evidence", description: "This is the most important factor. You need comprehensive medical records showing your condition prevents you from working.", tips: "The more medical evidence, the better. Get records from EVERY doctor, hospital, and specialist you've seen." },
      { title: "Apply online, by phone, or in person", description: "Online at ssa.gov is fastest. You can also call 1-800-772-1213 or visit your local SSA office.", tips: "The online application saves your progress — you can complete it over multiple sessions." },
      { title: "Complete the detailed application", description: "You'll provide work history (last 15 years), medical conditions, doctors/hospitals, medications, and daily activity limitations.", tips: "Describe your WORST days, not your best days. Be specific about what you can't do." },
      { title: "Attend the Consultative Exam (if required)", description: "SSA may send you to their own doctor for evaluation. This is mandatory if scheduled.", tips: "Be honest about your limitations. Don't minimize your symptoms. Don't exaggerate either." },
      { title: "Wait for the initial decision", description: "Takes 3-6 months on average. About 65% of initial applications are denied. This is normal — don't give up.", tips: "Check your status online at ssa.gov. Call if you haven't heard anything after 4 months." },
      { title: "Appeal if denied", description: "You have 60 days to appeal. The reconsideration stage has a ~15% approval rate. The ALJ hearing stage has a ~50% approval rate.", tips: "Consider hiring a disability attorney — they work on contingency (25% of back pay, max $7,200). Most successful applicants have attorneys." },
    ],
    requiredDocuments: [
      "Social Security number and birth certificate",
      "Medical records from all treating sources",
      "List of all medications with dosages",
      "Names and addresses of all doctors, hospitals, and clinics",
      "Lab and test results (MRI, X-ray, blood work, etc.)",
      "Work history for the last 15 years (job titles, duties, dates)",
      "Tax returns or W-2s showing your earnings",
      "Residual Functional Capacity (RFC) form from your doctor (very helpful)",
    ],
    commonMistakes: [
      "Not including enough medical evidence (the #1 reason for denial)",
      "Not describing daily limitations in detail ('I can't lift' vs 'I can't lift more than 5 lbs without severe pain for 2+ hours')",
      "Not appealing after the initial denial (most people who eventually get approved were denied first)",
      "Waiting too long to apply — the 5-month waiting period starts from your onset date",
      "Not continuing medical treatment during the application process (gaps look bad)",
      "Trying to do it alone — disability attorneys significantly increase approval rates",
    ],
    processingTime: "Initial decision: 3-6 months. Reconsideration: 3-6 months. ALJ Hearing: 12-18 months. Total process can take 1-2+ years if all appeals needed.",
    appealInfo: "60 days to appeal at each stage. Stages: Initial → Reconsideration → ALJ Hearing → Appeals Council → Federal Court. Most successful cases are won at ALJ hearing.",
    officialApplyUrl: "https://www.ssa.gov/disability/",
    helplinePhone: "1-800-772-1213",
  },

  section8: {
    programId: "section8",
    programName: "Section 8 (Housing Choice Voucher)",
    steps: [
      { title: "Find your local Public Housing Authority (PHA)", description: "Section 8 is administered locally. Find your PHA at hud.gov or by searching '[your city/county] housing authority'.", tips: "Some areas have multiple PHAs. Check all of them — one may have a shorter waitlist." },
      { title: "Check if the waitlist is open", description: "Most PHAs have waiting lists that are often CLOSED. You can only apply when the list opens.", tips: "Sign up for notifications from your PHA's website. Lists may only open for a few days — you need to act fast." },
      { title: "Submit your pre-application", description: "When the waitlist opens, submit immediately. Priority goes to extremely low income, elderly, disabled, veterans, and homeless.", tips: "Apply to EVERY PHA within commuting distance, not just your city. Rural areas often have shorter waits." },
      { title: "Wait on the waitlist", description: "Wait times range from months to YEARS depending on your area. Metropolitan areas can be 3-7+ years.", tips: "Keep your contact information updated with the PHA. If they can't reach you, they remove you from the list." },
      { title: "Complete full application when called", description: "When your name comes up, you'll need to verify income, identity, and household composition.", tips: "Respond to the PHA within their deadline (usually 10-15 days). Missing the deadline means starting over." },
      { title: "Find a unit and move in", description: "Once approved, you have 60-120 days to find a landlord who accepts vouchers. You pay ~30% of your income.", tips: "Start looking for housing BEFORE you get your voucher. Not all landlords accept vouchers — plan ahead." },
    ],
    requiredDocuments: [
      "Photo ID for all adult household members",
      "Social Security cards for everyone in household",
      "Birth certificates for all household members",
      "Proof of income for all adults (pay stubs, benefit letters, tax returns)",
      "Bank statements",
      "Proof of current address",
      "Landlord reference or rental history",
      "Criminal background check consent form",
    ],
    commonMistakes: [
      "Only applying to one housing authority (apply to every PHA in your area)",
      "Not updating your address/phone with the PHA (they remove you if they can't contact you)",
      "Missing the deadline when your name comes up on the waitlist",
      "Not understanding that voucher amounts are based on Fair Market Rent, not actual rent",
      "Not knowing that you can be denied for certain criminal history (varies by PHA)",
    ],
    processingTime: "Waitlist: months to years. Once your name comes up, approval takes 2-4 weeks. Then 60-120 days to find housing.",
    appealInfo: "You can request an informal hearing if denied or terminated. Must request within 10-30 days of the decision.",
    officialApplyUrl: "https://www.hud.gov/topics/housing_choice_voucher_program_section_8",
    helplinePhone: "1-800-955-2232",
  },

  eitc: {
    programId: "eitc",
    programName: "Earned Income Tax Credit (EITC)",
    steps: [
      { title: "Confirm you have earned income", description: "You must have income from working — wages, salary, tips, or self-employment. Investment income must be under $11,600.", tips: "Even small amounts of earned income count. If you worked at all during the year, check your eligibility." },
      { title: "File a federal tax return", description: "You MUST file a tax return to get the EITC, even if your income is too low to require filing. Use Form 1040.", tips: "Use IRS Free File (irs.gov/freefile) if your income is under $84,000. It's completely free." },
      { title: "Claim the EITC on your return", description: "Complete Schedule EIC (if you have qualifying children). The credit is calculated based on your income and number of children.", tips: "Make sure your children meet ALL qualifying child rules: age, relationship, residency, and SSN requirements." },
      { title: "Check for state EITC too", description: "31 states + DC offer their own EITC on top of the federal credit. It's usually a percentage of your federal credit.", tips: "If your state has one, it's usually automatic when you file your state return — but double-check." },
      { title: "Get your free tax help", description: "Visit a VITA (Volunteer Income Tax Assistance) site for free tax preparation. Find one at irs.gov/vita.", tips: "VITA sites are staffed by IRS-certified volunteers. They're free and often more accurate than paid preparers for simple returns." },
      { title: "Receive your refund", description: "EITC refunds are typically available by early March if you file early. Direct deposit is fastest.", tips: "By law, EITC refunds can't be issued before mid-February even if you file in January." },
    ],
    requiredDocuments: [
      "Social Security numbers for you, spouse, and all qualifying children",
      "W-2 forms from all employers",
      "1099 forms for any self-employment or other income",
      "Records of business expenses (if self-employed)",
      "Proof of childcare expenses (if claiming Child and Dependent Care Credit too)",
      "Previous year's tax return (for reference)",
      "Bank account info for direct deposit",
      "Proof of residency for qualifying children (school records, medical records)",
    ],
    commonMistakes: [
      "Not filing a tax return because you think your income is too low (you MUST file to get the credit)",
      "Not claiming the credit for years you were eligible (you can amend up to 3 years back)",
      "Filing as 'Married Filing Separately' (you cannot claim EITC with this status)",
      "Not knowing children need a valid SSN (not an ITIN) to be qualifying children",
      "Paying a tax preparer a percentage of your refund (this is often predatory — use free VITA instead)",
    ],
    processingTime: "If e-filed with direct deposit: refund in 2-3 weeks (but not before mid-February for EITC). Paper returns: 6-8 weeks.",
    appealInfo: "If the IRS reduces or denies your EITC, you'll receive a letter explaining why. You can respond with additional documentation or request an appeal through IRS Form 12203.",
    officialApplyUrl: "https://www.irs.gov/credits-deductions/individuals/earned-income-tax-credit-eitc",
    helplinePhone: "1-800-829-1040",
  },
};

// Get a guide by program ID, with fallback
export function getGuide(programId: string): ApplicationGuide | undefined {
  // Try exact match
  if (APPLICATION_GUIDES[programId]) return APPLICATION_GUIDES[programId];
  // Try partial match (e.g., "ca-medi-cal" → "medicaid-adult")
  if (programId.includes("medicaid") || programId.includes("medi-cal")) return APPLICATION_GUIDES["medicaid-adult"];
  if (programId.includes("snap") || programId.includes("calfresh")) return APPLICATION_GUIDES["snap"];
  if (programId.includes("section8") || programId.includes("housing")) return APPLICATION_GUIDES["section8"];
  if (programId.includes("eitc") || programId.includes("earned-income")) return APPLICATION_GUIDES["eitc"];
  if (programId.includes("ssdi") || programId.includes("disability")) return APPLICATION_GUIDES["ssdi"];
  return undefined;
}
