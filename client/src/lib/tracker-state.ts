// ─── Tracker State Management ────────────────────────────────────────────────
// Provides context for Benefits Tracker, Document Checklist, and Reminders.
// Completely self-contained — does NOT modify store.ts or App.tsx.

import { createContext, useContext, useReducer, useCallback, type ReactNode, createElement } from "react";
import type { ProgramResult } from "./eligibility";

// ── Application Status Stages ─────────────────────────────────────────────────

export type ApplicationStatus =
  | "not_started"
  | "gathering_docs"
  | "applied"
  | "pending"
  | "approved"
  | "receiving";

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  not_started: "Not Started",
  gathering_docs: "Gathering Docs",
  applied: "Applied",
  pending: "Pending Review",
  approved: "Approved",
  receiving: "Receiving Benefits",
};

export const APPLICATION_STATUS_ORDER: ApplicationStatus[] = [
  "not_started",
  "gathering_docs",
  "applied",
  "pending",
  "approved",
  "receiving",
];

// Step index (0-based) for progress bars
export function getStatusStep(status: ApplicationStatus): number {
  return APPLICATION_STATUS_ORDER.indexOf(status);
}

// ── Document Checklist ────────────────────────────────────────────────────────

export type DocumentStatus = "have" | "need" | "na";

export interface DocumentItem {
  id: string;
  name: string;
  description: string;
  category: DocumentCategory;
  programs: string[]; // program IDs that require this doc
  where: string;      // where to obtain it (Pro feature detail)
  acceptedForms: string; // what forms are acceptable (Pro feature detail)
}

export type DocumentCategory =
  | "Identity"
  | "Income"
  | "Medical"
  | "Housing"
  | "Tax"
  | "Education"
  | "Other";

// ── Reminder Preferences ──────────────────────────────────────────────────────

export interface ReminderPreference {
  programId: string;
  emailEnabled: boolean;
  daysBeforeDeadline: number; // 7, 14, 30
}

// ── Core Interfaces ───────────────────────────────────────────────────────────

export interface TrackedProgram {
  programId: string;
  programName: string;
  category: string;
  estimatedMonthlyValue: number; // mid-point of benefit range
  status: ApplicationStatus;
  updatedAt: number; // unix timestamp
  notes: string;
}

export interface TrackerState {
  // Benefits tracker
  trackedPrograms: Record<string, TrackedProgram>;

  // Document checklist: docId → status
  documentStatuses: Record<string, DocumentStatus>;

  // Eligible program results (set when screener completes)
  eligibleResults: ProgramResult[];

  // Reminder preferences: programId → preference
  reminderPreferences: Record<string, ReminderPreference>;

  // Whether email reminders are globally enabled (UI-only)
  emailRemindersEnabled: boolean;
}

// ── Actions ───────────────────────────────────────────────────────────────────

export type TrackerAction =
  | { type: "SET_ELIGIBLE_RESULTS"; payload: ProgramResult[] }
  | { type: "TRACK_PROGRAM"; payload: TrackedProgram }
  | { type: "UPDATE_STATUS"; payload: { programId: string; status: ApplicationStatus; notes?: string } }
  | { type: "UNTRACK_PROGRAM"; payload: string }
  | { type: "SET_DOCUMENT_STATUS"; payload: { docId: string; status: DocumentStatus } }
  | { type: "RESET_DOCUMENT_STATUSES" }
  | { type: "SET_REMINDER_PREFERENCE"; payload: ReminderPreference }
  | { type: "TOGGLE_EMAIL_REMINDERS" };

// ── Reducer ───────────────────────────────────────────────────────────────────

const initialState: TrackerState = {
  trackedPrograms: {},
  documentStatuses: {},
  eligibleResults: [],
  reminderPreferences: {},
  emailRemindersEnabled: false,
};

function trackerReducer(state: TrackerState, action: TrackerAction): TrackerState {
  switch (action.type) {
    case "SET_ELIGIBLE_RESULTS":
      return { ...state, eligibleResults: action.payload };

    case "TRACK_PROGRAM":
      return {
        ...state,
        trackedPrograms: {
          ...state.trackedPrograms,
          [action.payload.programId]: action.payload,
        },
      };

    case "UPDATE_STATUS": {
      const existing = state.trackedPrograms[action.payload.programId];
      if (!existing) return state;
      return {
        ...state,
        trackedPrograms: {
          ...state.trackedPrograms,
          [action.payload.programId]: {
            ...existing,
            status: action.payload.status,
            notes: action.payload.notes ?? existing.notes,
            updatedAt: Date.now(),
          },
        },
      };
    }

    case "UNTRACK_PROGRAM": {
      const { [action.payload]: _removed, ...rest } = state.trackedPrograms;
      return { ...state, trackedPrograms: rest };
    }

    case "SET_DOCUMENT_STATUS":
      return {
        ...state,
        documentStatuses: {
          ...state.documentStatuses,
          [action.payload.docId]: action.payload.status,
        },
      };

    case "RESET_DOCUMENT_STATUSES":
      return { ...state, documentStatuses: {} };

    case "SET_REMINDER_PREFERENCE":
      return {
        ...state,
        reminderPreferences: {
          ...state.reminderPreferences,
          [action.payload.programId]: action.payload,
        },
      };

    case "TOGGLE_EMAIL_REMINDERS":
      return { ...state, emailRemindersEnabled: !state.emailRemindersEnabled };

    default:
      return state;
  }
}

// ── Context ───────────────────────────────────────────────────────────────────

interface TrackerContextValue {
  state: TrackerState;
  dispatch: React.Dispatch<TrackerAction>;

  // Convenience helpers
  trackProgram: (result: ProgramResult) => void;
  updateStatus: (programId: string, status: ApplicationStatus, notes?: string) => void;
  untrackProgram: (programId: string) => void;
  setDocumentStatus: (docId: string, status: DocumentStatus) => void;
  setEligibleResults: (results: ProgramResult[]) => void;
}

export const TrackerContext = createContext<TrackerContextValue>({
  state: initialState,
  dispatch: () => {},
  trackProgram: () => {},
  updateStatus: () => {},
  untrackProgram: () => {},
  setDocumentStatus: () => {},
  setEligibleResults: () => {},
});

// ── Provider ──────────────────────────────────────────────────────────────────

interface TrackerProviderProps {
  children: ReactNode;
}

export function TrackerProvider({ children }: TrackerProviderProps) {
  const [state, dispatch] = useReducer(trackerReducer, initialState);

  const trackProgram = useCallback((result: ProgramResult) => {
    const monthlyBenefit = result.program.estimatedMonthlyBenefit;
    const midPoint = monthlyBenefit
      ? Math.round((monthlyBenefit.min + monthlyBenefit.max) / 2)
      : 0;

    dispatch({
      type: "TRACK_PROGRAM",
      payload: {
        programId: result.program.id,
        programName: result.program.name,
        category: result.program.category,
        estimatedMonthlyValue: midPoint,
        status: "not_started",
        updatedAt: Date.now(),
        notes: "",
      },
    });
  }, []);

  const updateStatus = useCallback(
    (programId: string, status: ApplicationStatus, notes?: string) => {
      dispatch({ type: "UPDATE_STATUS", payload: { programId, status, notes } });
    },
    []
  );

  const untrackProgram = useCallback((programId: string) => {
    dispatch({ type: "UNTRACK_PROGRAM", payload: programId });
  }, []);

  const setDocumentStatus = useCallback((docId: string, status: DocumentStatus) => {
    dispatch({ type: "SET_DOCUMENT_STATUS", payload: { docId, status } });
  }, []);

  const setEligibleResults = useCallback((results: ProgramResult[]) => {
    dispatch({ type: "SET_ELIGIBLE_RESULTS", payload: results });
  }, []);

  return createElement(
    TrackerContext.Provider,
    {
      value: {
        state,
        dispatch,
        trackProgram,
        updateStatus,
        untrackProgram,
        setDocumentStatus,
        setEligibleResults,
      },
    },
    children
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useTracker() {
  return useContext(TrackerContext);
}

// ── Selectors / Derived Data ──────────────────────────────────────────────────

export function getTrackerStats(trackedPrograms: Record<string, TrackedProgram>) {
  const programs = Object.values(trackedPrograms);
  const total = programs.length;
  const pending = programs.filter(
    (p) => p.status === "applied" || p.status === "pending"
  ).length;
  const approved = programs.filter(
    (p) => p.status === "approved" || p.status === "receiving"
  ).length;
  const estimatedMonthly = programs.reduce(
    (sum, p) => sum + p.estimatedMonthlyValue,
    0
  );

  return { total, pending, approved, estimatedMonthly };
}

// ── Master Document List ──────────────────────────────────────────────────────
// All documents required across the major programs

export const MASTER_DOCUMENTS: DocumentItem[] = [
  // Identity
  {
    id: "doc-photo-id",
    name: "Government-Issued Photo ID",
    description: "Driver's license, state ID, or passport",
    category: "Identity",
    programs: ["snap", "medicaid-adult", "section8", "wic", "liheap", "ssi", "ssdi"],
    where: "Your state DMV. If you don't have one, apply at your local DMV — fee waivers are available in most states.",
    acceptedForms: "Driver's license, state ID card, U.S. passport, passport card, military ID, tribal ID",
  },
  {
    id: "doc-ssn",
    name: "Social Security Number (SSN)",
    description: "SSN card or document showing your SSN",
    category: "Identity",
    programs: ["snap", "medicaid-adult", "section8", "eitc", "ctc", "ssi", "ssdi"],
    where: "SSA office (ssa.gov/ssnumber). You can get a replacement card for free up to 3 times per year.",
    acceptedForms: "Original Social Security card, SSA-issued letter showing SSN, Medicare card (some programs)",
  },
  {
    id: "doc-birth-cert",
    name: "Birth Certificate",
    description: "For yourself and all household members",
    category: "Identity",
    programs: ["section8", "ssdi", "ssi", "wic"],
    where: "Your state/county vital records office. Many states offer online ordering. Costs $10–$30.",
    acceptedForms: "Original or certified copy from a vital records office. Hospital-issued birth certificates are generally not accepted.",
  },
  {
    id: "doc-citizenship",
    name: "Citizenship / Immigration Status Proof",
    description: "U.S. passport, naturalization certificate, or immigration documents",
    category: "Identity",
    programs: ["snap", "medicaid-adult", "section8", "eitc", "ssi", "lifeline"],
    where: "USCIS (uscis.gov) for immigration documents. Vital records for birth certificate if born in U.S.",
    acceptedForms: "U.S. passport, U.S. birth certificate, Certificate of Citizenship, Permanent Resident Card (Green Card), Employment Authorization Document",
  },

  // Income
  {
    id: "doc-pay-stubs",
    name: "Recent Pay Stubs",
    description: "Last 30 days of pay stubs from all employers",
    category: "Income",
    programs: ["snap", "medicaid-adult", "section8", "wic", "liheap"],
    where: "From your employer. If you don't get paper stubs, check your employer's online HR portal.",
    acceptedForms: "Pay stubs from last 30 days. If paid weekly, provide 4 stubs. If bi-weekly, provide 2 stubs.",
  },
  {
    id: "doc-w2",
    name: "W-2 Forms",
    description: "Annual wage statements from employers",
    category: "Income",
    programs: ["eitc", "ctc", "cdctc", "pell-grant"],
    where: "From your employer by January 31 each year. If missing, request from your employer or use IRS Get Transcript tool.",
    acceptedForms: "Form W-2 from all employers for the tax year. Keep all copies — they're required for multiple programs.",
  },
  {
    id: "doc-1099",
    name: "1099 Forms",
    description: "Income statements for freelance, gig work, or other non-W2 income",
    category: "Income",
    programs: ["eitc", "ctc", "cdctc", "pell-grant"],
    where: "From clients or platforms (Uber, DoorDash, Etsy, etc.) by January 31. Access through platform tax dashboards.",
    acceptedForms: "Form 1099-NEC (freelance), 1099-K (payment platforms), 1099-MISC, 1099-G (unemployment), 1099-SSA (Social Security)",
  },
  {
    id: "doc-bank-statements",
    name: "Bank Statements",
    description: "Checking and savings account statements (last 30–60 days)",
    category: "Income",
    programs: ["snap", "section8", "ssi"],
    where: "Log into your bank's online portal or request paper statements at a branch.",
    acceptedForms: "Official bank statements showing account holder name, account number, and transaction history. Screenshots are often not accepted — use official PDFs.",
  },
  {
    id: "doc-benefit-letters",
    name: "Benefit Award Letters",
    description: "Letters showing Social Security, disability, or other benefit amounts",
    category: "Income",
    programs: ["snap", "medicaid-adult", "section8", "wic", "liheap"],
    where: "From the agency that sends you benefits (SSA, state agencies). Log into ssa.gov to get a Benefit Verification Letter instantly.",
    acceptedForms: "Official benefit award letters, SSA benefit verification letters, state benefit determination notices",
  },

  // Medical
  {
    id: "doc-medical-records",
    name: "Medical Records",
    description: "Records documenting disability, condition, or treatment history",
    category: "Medical",
    programs: ["ssdi", "ssi", "medicaid-adult"],
    where: "Request from each doctor, hospital, or clinic. Under HIPAA, providers must give you your records within 30 days. Fee may apply.",
    acceptedForms: "Doctor's notes, hospital discharge summaries, specialist reports, lab results, imaging reports (MRI, X-ray), treatment records",
  },
  {
    id: "doc-disability-proof",
    name: "Disability Documentation",
    description: "Medical evidence of disability from treating physicians",
    category: "Medical",
    programs: ["ssdi", "ssi", "va-disability"],
    where: "Request from your treating physicians. Ask your doctor to complete an RFC (Residual Functional Capacity) form for SSDI cases.",
    acceptedForms: "Physician statements, RFC forms, specialist evaluations, psychiatric evaluations, functional capacity assessments",
  },
  {
    id: "doc-pregnancy-proof",
    name: "Pregnancy Verification",
    description: "Doctor's statement confirming pregnancy and due date",
    category: "Medical",
    programs: ["wic", "medicaid-adult"],
    where: "From your OB-GYN or midwife. A standard pregnancy verification letter is typically provided at your first prenatal visit.",
    acceptedForms: "Physician letter confirming pregnancy with estimated due date, prenatal care documentation",
  },

  // Housing
  {
    id: "doc-lease",
    name: "Lease Agreement or Rent Receipt",
    description: "Proof of your current rental arrangement",
    category: "Housing",
    programs: ["snap", "medicaid-adult", "section8", "liheap"],
    where: "From your landlord. If you don't have a written lease, ask your landlord for a signed rent receipt or letter.",
    acceptedForms: "Signed lease agreement, month-to-month rental agreement, landlord letter, rent receipts with landlord signature",
  },
  {
    id: "doc-utility-bills",
    name: "Utility Bills",
    description: "Recent electric, gas, water, or phone bills",
    category: "Housing",
    programs: ["snap", "liheap", "lifeline"],
    where: "From your utility company's website or paper billing. Most can be downloaded as PDFs.",
    acceptedForms: "Bills in your name from last 30–90 days. Electric, gas, water, phone, or cable bills are all accepted.",
  },
  {
    id: "doc-proof-address",
    name: "Proof of Residency",
    description: "Document showing your current address",
    category: "Housing",
    programs: ["snap", "medicaid-adult", "section8", "wic", "liheap"],
    where: "Any official mail at your address works. Utility bills, bank statements, or government mail.",
    acceptedForms: "Utility bill, bank statement, government mail, lease agreement, mortgage statement — must show your name and current address",
  },
  {
    id: "doc-landlord-info",
    name: "Landlord Information",
    description: "Landlord name, address, and contact for housing applications",
    category: "Housing",
    programs: ["section8"],
    where: "Ask your landlord directly. For Section 8, the housing authority will contact your landlord to inspect the unit.",
    acceptedForms: "Landlord name, address, phone number, and email. The landlord must agree to participate in the program.",
  },

  // Tax
  {
    id: "doc-tax-returns",
    name: "Federal Tax Returns",
    description: "Prior year (or prior 2 years) federal tax returns",
    category: "Tax",
    programs: ["pell-grant", "eitc", "section8"],
    where: "From your records or the IRS. Get a transcript free at irs.gov/transcript — available for last 3 years.",
    acceptedForms: "Form 1040 with all schedules. Tax transcripts from IRS are also accepted by most programs.",
  },
  {
    id: "doc-ssn-dependents",
    name: "SSNs for All Dependents",
    description: "Social Security numbers for all children and dependents",
    category: "Tax",
    programs: ["eitc", "ctc", "cdctc"],
    where: "SSA office. Children must have SSNs to qualify for EITC — ITINs are NOT accepted for EITC purposes.",
    acceptedForms: "Social Security card for each child. ITINs do not qualify for EITC — only SSNs.",
  },
  {
    id: "doc-childcare-receipts",
    name: "Childcare Receipts / Provider Info",
    description: "Receipts and EIN/SSN of childcare provider",
    category: "Tax",
    programs: ["cdctc", "ctc"],
    where: "From your childcare provider. They must provide their EIN or SSN. Keep all monthly receipts throughout the year.",
    acceptedForms: "Receipts showing provider name, EIN/SSN, amount paid, and care period. Daycare, babysitter, or after-school program receipts.",
  },

  // Education
  {
    id: "doc-fafsa",
    name: "FAFSA Confirmation",
    description: "Completed FAFSA application confirmation",
    category: "Education",
    programs: ["pell-grant"],
    where: "Complete at studentaid.gov. Free to file. Use IRS Data Retrieval Tool to transfer tax data automatically.",
    acceptedForms: "FAFSA submission confirmation email, Student Aid Report (SAR), or financial aid award letter from school.",
  },
  {
    id: "doc-enrollment",
    name: "Enrollment Verification",
    description: "Proof of current enrollment at an eligible school",
    category: "Education",
    programs: ["pell-grant"],
    where: "From your school's registrar office. Most schools provide official enrollment letters or transcripts.",
    acceptedForms: "Official enrollment letter, transcript showing current term enrollment, student ID (some programs)",
  },
  {
    id: "doc-work-history",
    name: "Work History Documentation",
    description: "Record of employment for last 15 years (for disability claims)",
    category: "Other",
    programs: ["ssdi"],
    where: "Your own records, W-2s, and SSA earnings statement. Get your SSA Statement at ssa.gov/myaccount.",
    acceptedForms: "Work history form (SSA-3369), W-2s from prior years, SSA earnings statement, employer contact information",
  },
  {
    id: "doc-family-composition",
    name: "Family Composition Proof",
    description: "Documents proving household members and relationships",
    category: "Other",
    programs: ["section8", "tanf", "wic"],
    where: "Birth certificates for children, marriage certificate, court orders for custody/child support.",
    acceptedForms: "Birth certificates, marriage certificate, adoption papers, custody orders, foster care documentation",
  },
  {
    id: "doc-va-dd214",
    name: "DD-214 (Military Discharge Papers)",
    description: "Certificate of Release or Discharge from Active Duty",
    category: "Other",
    programs: ["va-healthcare", "va-disability", "va-pension"],
    where: "Request from National Personnel Records Center at archives.gov/veterans, or through the VA's eBenefits portal.",
    acceptedForms: "DD-214 (all copies), NGB-22 (National Guard), Report of Separation",
  },
];
