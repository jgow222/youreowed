// ─── Benefits Deadline & Renewal Data ────────────────────────────────────────
// Hardcoded key deadlines for benefit programs.
// Dates are computed relative to the current year for recurring deadlines.

export type DeadlineUrgency = "critical" | "urgent" | "upcoming" | "future";
export type DeadlineType = "annual" | "recurring" | "seasonal" | "one-time";

export interface Deadline {
  id: string;
  programId: string;
  programName: string;
  category: string;
  title: string;
  description: string;
  type: DeadlineType;
  // For annual deadlines, we store month (1-based) and day
  month?: number;
  day?: number;
  // For seasonal / window deadlines
  windowStart?: { month: number; day: number };
  windowEnd?: { month: number; day: number };
  notes: string;
  actionRequired: string;
  officialUrl: string;
  renewalInfo: string;
  frequency: string; // human-readable recurrence
}

// Helper: compute the next occurrence of a monthly/day deadline
export function getNextAnnualDate(month: number, day: number): Date {
  const now = new Date();
  const thisYear = new Date(now.getFullYear(), month - 1, day);
  if (thisYear > now) return thisYear;
  return new Date(now.getFullYear() + 1, month - 1, day);
}

// Helper: days until a given date
export function getDaysUntil(date: Date): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

// Helper: compute urgency from days remaining
export function getUrgency(daysUntil: number): DeadlineUrgency {
  if (daysUntil < 0) return "future"; // past (next cycle not yet computed)
  if (daysUntil <= 7) return "critical";
  if (daysUntil <= 30) return "urgent";
  if (daysUntil <= 90) return "upcoming";
  return "future";
}

export const DEADLINES: Deadline[] = [
  // ── Tax Filing ──────────────────────────────────────────────────────────────
  {
    id: "tax-filing",
    programId: "eitc",
    programName: "Federal Tax Return",
    category: "Tax Credits",
    title: "Federal Tax Filing Deadline",
    description:
      "File your federal income tax return to claim the Earned Income Tax Credit (EITC), Child Tax Credit (CTC), and other refundable credits.",
    type: "annual",
    month: 4,
    day: 15,
    notes:
      "If April 15 falls on a weekend or holiday, the deadline shifts to the next business day. You can request an automatic 6-month extension (Form 4868), but this does NOT extend time to pay any taxes owed.",
    actionRequired:
      "Gather W-2s, 1099s, and SSNs for all dependents. File online for free at irs.gov/freefile if income is under $84,000.",
    officialUrl: "https://www.irs.gov/filing",
    renewalInfo:
      "Annual — file every year by April 15. You can claim EITC for up to 3 prior years by filing amended returns.",
    frequency: "Annually (April 15)",
  },

  // ── SNAP Recertification ───────────────────────────────────────────────────
  {
    id: "snap-recert",
    programId: "snap",
    programName: "SNAP (Food Stamps)",
    category: "Food Assistance",
    title: "SNAP Recertification",
    description:
      "SNAP benefits must be renewed periodically. Your state will send a notice with your recertification date. Missing this deadline stops your benefits.",
    type: "recurring",
    notes:
      "Recertification periods vary: 6 months for most households, 12 months for households with elderly/disabled members, up to 24 months in some states. Your certification end date is on your approval letter.",
    actionRequired:
      "Watch for your recertification notice (usually sent 30–45 days before expiration). Submit a renewal application and complete a phone or in-person interview.",
    officialUrl: "https://www.fns.usda.gov/snap/recipient/recertification",
    renewalInfo:
      "Every 6–12 months depending on your state and household type. Some states allow online renewal.",
    frequency: "Every 6–12 months (varies by state)",
  },

  // ── Medicaid Annual Renewal ────────────────────────────────────────────────
  {
    id: "medicaid-renewal",
    programId: "medicaid-adult",
    programName: "Medicaid",
    category: "Healthcare",
    title: "Medicaid Annual Renewal",
    description:
      "Medicaid eligibility must be renewed annually. Your state sends a renewal notice with a deadline — failure to respond can result in loss of coverage.",
    type: "annual",
    notes:
      "States conduct an ex parte review first (using data on file). If they can confirm your eligibility automatically, you don't need to take action. If not, you'll receive a renewal form to complete.",
    actionRequired:
      "Update your contact information with your state Medicaid office. Respond to any renewal notices promptly. Report changes in income or household size.",
    officialUrl: "https://www.medicaid.gov/medicaid/eligibility/index.html",
    renewalInfo:
      "Annually on your renewal month. After COVID-era continuous enrollment ended in 2023, states resumed annual renewals.",
    frequency: "Annually (on your renewal anniversary month)",
  },

  // ── Section 8 Annual Review ────────────────────────────────────────────────
  {
    id: "section8-review",
    programId: "section8",
    programName: "Section 8 / Housing Choice Voucher",
    category: "Housing",
    title: "Section 8 Annual Recertification",
    description:
      "Housing Choice Voucher holders must complete an annual recertification to verify income, family composition, and continued eligibility.",
    type: "annual",
    notes:
      "The housing authority will schedule an inspection of your unit and a recertification interview. Your rent contribution may change based on updated income. Failure to recertify results in termination of your voucher.",
    actionRequired:
      "Gather current income documents (pay stubs, benefit letters). Complete the recertification packet sent by your Public Housing Authority (PHA). Allow access for unit inspection.",
    officialUrl: "https://www.hud.gov/topics/housing_choice_voucher_program_section_8",
    renewalInfo:
      "Annually on the anniversary of your voucher. Your PHA will contact you 60–90 days in advance.",
    frequency: "Annually (on voucher anniversary)",
  },

  // ── LIHEAP Application Window ──────────────────────────────────────────────
  {
    id: "liheap-window",
    programId: "liheap",
    programName: "LIHEAP (Energy Assistance)",
    category: "Utilities",
    title: "LIHEAP Heating Season Application Window",
    description:
      "LIHEAP funds are available on a first-come, first-served basis. The main heating season window typically runs from October through May, but varies significantly by state.",
    type: "seasonal",
    windowStart: { month: 10, day: 1 },
    windowEnd: { month: 5, day: 31 },
    notes:
      "Funds run out fast — many states exhaust funding before the window closes. Apply early in October. Some states also offer cooling assistance in summer (June–September).",
    actionRequired:
      "Contact your state or local LIHEAP agency to apply. Bring ID, proof of income, and a recent utility bill. Find your agency at acf.hhs.gov/ocs/liheap.",
    officialUrl: "https://www.acf.hhs.gov/ocs/low-income-home-energy-assistance-program-liheap",
    renewalInfo:
      "Apply every year — benefits don't automatically renew. Apply as early as October when the new program year begins.",
    frequency: "Annual application window (Oct–May for heating; varies by state)",
  },

  // ── FAFSA Deadline ─────────────────────────────────────────────────────────
  {
    id: "fafsa-deadline",
    programId: "pell-grant",
    programName: "FAFSA / Pell Grant",
    category: "Education",
    title: "FAFSA Federal Deadline",
    description:
      "The FAFSA must be submitted by June 30 to be considered for Pell Grants and other federal student aid for the award year. State and school deadlines are often much earlier.",
    type: "annual",
    month: 6,
    day: 30,
    notes:
      "Most state grants and many school scholarships have deadlines as early as February or March. File FAFSA as early as October 1 (when it opens) for the best chance at aid. The earlier you file, the better.",
    actionRequired:
      "Create or update your studentaid.gov account. Gather tax returns (or use IRS DRT), SSNs, and asset information. Complete and submit the FAFSA online.",
    officialUrl: "https://studentaid.gov/h/apply-for-aid/fafsa",
    renewalInfo:
      "File a new FAFSA every year — your aid does not automatically renew. Opens October 1 for the following academic year.",
    frequency: "Annually by June 30 (state/school deadlines earlier — often Feb–March)",
  },

  // ── ACA Open Enrollment ────────────────────────────────────────────────────
  {
    id: "aca-enrollment",
    programId: "medicaid-adult",
    programName: "ACA Marketplace / Healthcare.gov",
    category: "Healthcare",
    title: "ACA Open Enrollment Period",
    description:
      "The annual window to enroll in or change a health insurance plan on the ACA Marketplace. Outside this window, you can only enroll if you have a qualifying life event.",
    type: "seasonal",
    windowStart: { month: 11, day: 1 },
    windowEnd: { month: 1, day: 15 },
    notes:
      "Coverage starting January 1 requires enrollment by December 15. Enrollment between December 16 and January 15 provides coverage starting February 1. Special Enrollment Periods (SEPs) are available after qualifying life events (job loss, marriage, having a baby, etc.).",
    actionRequired:
      "Visit healthcare.gov to compare plans. Check if you qualify for premium tax credits (available up to 400% FPL). Enroll by December 15 for January 1 coverage.",
    officialUrl: "https://www.healthcare.gov/quick-guide/deadlines/",
    renewalInfo:
      "Annual open enrollment runs November 1 – January 15 each year. Your plan auto-renews if you don't make changes, but check for better options and updated subsidies annually.",
    frequency: "Annual open enrollment (Nov 1 – Jan 15)",
  },

  // ── Social Security (SS Retirement) ───────────────────────────────────────
  {
    id: "ss-retirement-apply",
    programId: "ss-retirement",
    programName: "Social Security Retirement",
    category: "Retirement & Disability",
    title: "Social Security Application Timing",
    description:
      "You can apply for Social Security retirement benefits up to 4 months before you want benefits to start. Applying late can mean losing months of benefits.",
    type: "one-time",
    notes:
      "Claiming at 62 reduces benefits permanently (up to 30% less). Full Retirement Age is 66–67 depending on birth year. Delaying to 70 increases benefits by 8% per year after FRA. There is no benefit to waiting past 70.",
    actionRequired:
      "Apply online at ssa.gov/retirement, by phone at 1-800-772-1213, or visit your local SSA office. Apply 4 months before your desired start date.",
    officialUrl: "https://www.ssa.gov/retirement/apply.html",
    renewalInfo:
      "One-time application. Benefits continue for life once started. Medicare enrollment (at 65) is separate.",
    frequency: "One-time application (apply 4 months before desired start)",
  },

  // ── SSI / SSDI ─────────────────────────────────────────────────────────────
  {
    id: "ssdi-review",
    programId: "ssdi",
    programName: "SSDI / SSI",
    category: "Retirement & Disability",
    title: "Continuing Disability Review (CDR)",
    description:
      "SSA periodically reviews your disability status to confirm you still meet the medical requirements. Missing or failing a CDR can result in benefits being terminated.",
    type: "recurring",
    notes:
      "CDR frequency: every 3 years if improvement is expected, every 5–7 years if improvement is not expected. SSA will send you Form SSA-454 or SSA-455. You must respond or benefits stop.",
    actionRequired:
      "When you receive a CDR notice, respond promptly. Update your medical records and provide current treatment information. Continue seeing your doctors — gaps in treatment hurt your case.",
    officialUrl: "https://www.ssa.gov/disability/professionals/bluebook/review.htm",
    renewalInfo:
      "Occurs every 3–7 years depending on your case. SSA will notify you in advance.",
    frequency: "Every 3–7 years (per SSA schedule)",
  },

  // ── WIC Certification ──────────────────────────────────────────────────────
  {
    id: "wic-cert",
    programId: "wic",
    programName: "WIC",
    category: "Food Assistance",
    title: "WIC Certification Renewal",
    description:
      "WIC participants must be recertified periodically. Infants are certified for 6 months; children are certified annually; pregnant women through 6 weeks postpartum.",
    type: "recurring",
    notes:
      "You'll receive a notification before your certification expires. Missing the renewal appointment means losing WIC benefits until you are recertified.",
    actionRequired:
      "Schedule your recertification appointment at your local WIC office before your current certification expires. Bring proof of income, ID, and proof of pregnancy/birth (if applicable).",
    officialUrl: "https://www.fns.usda.gov/wic/certification-and-documentation",
    renewalInfo:
      "Every 6 months for infants, annually for children 1–5. Certification dates are tracked by your WIC clinic.",
    frequency: "Every 6 months (infants) or annually (children)",
  },

  // ── TANF Recertification ───────────────────────────────────────────────────
  {
    id: "tanf-recert",
    programId: "tanf",
    programName: "TANF",
    category: "Cash Assistance",
    title: "TANF Recertification",
    description:
      "TANF benefits require periodic recertification. Recertification periods vary by state — typically every 3 to 12 months.",
    type: "recurring",
    notes:
      "TANF has a 60-month federal lifetime limit. Track your months carefully. Work requirements apply in most states — document work activities to avoid sanctions.",
    actionRequired:
      "Complete recertification forms and attend any required interviews. Update income and employment information. Document work participation activities.",
    officialUrl: "https://www.acf.hhs.gov/ofa/programs/temporary-assistance-needy-families-tanf",
    renewalInfo:
      "Varies by state — typically every 3–12 months. Watch for renewal notices from your state welfare agency.",
    frequency: "Every 3–12 months (varies by state)",
  },
];

// ── Computed Deadline with timing info ────────────────────────────────────────

export interface ComputedDeadline extends Deadline {
  nextDate: Date | null;        // null for purely recurring without computed date
  daysUntil: number | null;
  urgency: DeadlineUrgency;
  isWindowOpen: boolean;        // for seasonal deadlines
  displayDate: string;          // formatted date string for UI
}

export function computeDeadlines(): ComputedDeadline[] {
  const now = new Date();

  return DEADLINES.map((deadline) => {
    let nextDate: Date | null = null;
    let daysUntil: number | null = null;
    let isWindowOpen = false;
    let displayDate = "";
    let urgency: DeadlineUrgency = "future";

    if (deadline.type === "annual" && deadline.month && deadline.day) {
      nextDate = getNextAnnualDate(deadline.month, deadline.day);
      daysUntil = getDaysUntil(nextDate);
      urgency = getUrgency(daysUntil);
      displayDate = nextDate.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    } else if (deadline.type === "seasonal" && deadline.windowStart && deadline.windowEnd) {
      // Determine if window is currently open (handles year wrap-around for Nov-Jan)
      const currentMonth = now.getMonth() + 1;
      const currentDay = now.getDate();
      const startM = deadline.windowStart.month;
      const startD = deadline.windowStart.day;
      const endM = deadline.windowEnd.month;
      const endD = deadline.windowEnd.day;

      // Check if window crosses year boundary (e.g., Nov–Jan)
      if (startM > endM) {
        // Window crosses Dec/Jan boundary
        isWindowOpen =
          currentMonth > startM ||
          (currentMonth === startM && currentDay >= startD) ||
          currentMonth < endM ||
          (currentMonth === endM && currentDay <= endD);
      } else {
        isWindowOpen =
          (currentMonth > startM || (currentMonth === startM && currentDay >= startD)) &&
          (currentMonth < endM || (currentMonth === endM && currentDay <= endD));
      }

      // Next window open date
      if (isWindowOpen) {
        // window is currently open — when does it end?
        let windowEnd = new Date(now.getFullYear(), endM - 1, endD);
        if (windowEnd < now) windowEnd = new Date(now.getFullYear() + 1, endM - 1, endD);
        nextDate = windowEnd;
        daysUntil = getDaysUntil(nextDate);
        urgency = daysUntil <= 30 ? "urgent" : "upcoming";
        displayDate = `Open now — closes ${nextDate.toLocaleDateString("en-US", { month: "long", day: "numeric" })}`;
      } else {
        // Window is closed — when does it reopen?
        let windowStart = new Date(now.getFullYear(), startM - 1, startD);
        if (windowStart <= now) windowStart = new Date(now.getFullYear() + 1, startM - 1, startD);
        nextDate = windowStart;
        daysUntil = getDaysUntil(nextDate);
        urgency = getUrgency(daysUntil);
        displayDate = `Opens ${nextDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`;
      }
    } else if (deadline.type === "recurring") {
      // No fixed date — just informational
      displayDate = deadline.frequency;
      urgency = "upcoming";
    } else if (deadline.type === "one-time") {
      displayDate = "Apply before you're ready to claim";
      urgency = "future";
    }

    return {
      ...deadline,
      nextDate,
      daysUntil,
      urgency,
      isWindowOpen,
      displayDate,
    };
  });
}

// ── Category-level renewal info cards ────────────────────────────────────────

export interface RenewalInfoCard {
  programId: string;
  programName: string;
  renewalFrequency: string;
  keyFacts: string[];
  tipText: string;
}

export const RENEWAL_INFO_CARDS: RenewalInfoCard[] = [
  {
    programId: "snap",
    programName: "SNAP",
    renewalFrequency: "Every 6–12 months",
    keyFacts: [
      "You will receive a recertification notice 30–45 days before your benefits expire",
      "Missing your recertification interview will result in your benefits being cut off",
      "In many states you can renew online",
      "Report any changes in income or household size immediately",
    ],
    tipText: "Set a calendar reminder 45 days before your SNAP expiration date to start the renewal process.",
  },
  {
    programId: "medicaid-adult",
    programName: "Medicaid",
    renewalFrequency: "Annually",
    keyFacts: [
      "Keep your contact information current so you receive renewal notices",
      "Many renewals are now done electronically — you may not need to do anything if your income hasn't changed",
      "Report changes in income, household size, or address within 30 days",
      "You have 90 days after losing Medicaid to enroll in marketplace coverage",
    ],
    tipText: "Update your mailing address with your state Medicaid office any time you move.",
  },
  {
    programId: "section8",
    programName: "Section 8 Voucher",
    renewalFrequency: "Annually",
    keyFacts: [
      "Your housing authority will contact you 60–90 days before your recertification date",
      "A unit inspection is required each year",
      "Your share of rent may change if your income changes",
      "Notify your PHA of any changes in household members",
    ],
    tipText: "Always respond to PHA notices within the deadline — late responses can result in losing your voucher.",
  },
  {
    programId: "liheap",
    programName: "LIHEAP",
    renewalFrequency: "Annual application",
    keyFacts: [
      "LIHEAP benefits do NOT automatically renew — you must apply each year",
      "Funding is limited and runs out fast — apply as early as October",
      "Some states offer both heating (winter) and cooling (summer) assistance",
      "Crisis assistance may be available if you face utility shutoff",
    ],
    tipText: "Apply on the first day your state's LIHEAP program opens — funds are exhausted quickly in many states.",
  },
  {
    programId: "pell-grant",
    programName: "Pell Grant",
    renewalFrequency: "Annual FAFSA",
    keyFacts: [
      "You must file a new FAFSA every year to renew your Pell Grant",
      "File as early as October 1 for the best access to state and school aid",
      "Your expected aid may change based on income changes from year to year",
      "Pell Grant eligibility is limited to 12 semesters (6 academic years)",
    ],
    tipText: "File your FAFSA the same day it opens (October 1) — many state grants are awarded on a first-come, first-served basis.",
  },
];
