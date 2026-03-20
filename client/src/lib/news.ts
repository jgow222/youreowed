// ─── News/Policy Updates Data ──────────────────────────────────────────────
// In production, this would come from an API. For v2, we seed realistic data.

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  category: "policy-change" | "new-program" | "deadline" | "update";
  date: string;
  source: string;
  sourceUrl: string;
  programs: string[]; // related program IDs
  isBreaking?: boolean;
}

export const newsItems: NewsItem[] = [
  {
    id: "n1",
    title: "SNAP Benefits Updated for FY2026",
    summary: "The USDA has released updated SNAP allotments for fiscal year 2026, effective October 1, 2025. Maximum monthly allotments have increased by approximately 3.2% across all household sizes due to cost-of-living adjustments.",
    category: "policy-change",
    date: "2026-03-15",
    source: "USDA Food and Nutrition Service",
    sourceUrl: "https://www.fns.usda.gov/snap/allotment/main",
    programs: ["snap"],
    isBreaking: true,
  },
  {
    id: "n2",
    title: "Medicaid Unwinding Continues in Several States",
    summary: "Multiple states are continuing Medicaid redetermination processes that began after the end of the COVID-19 continuous enrollment provision. If you receive Medicaid, make sure to respond to any mail from your state agency to avoid losing coverage.",
    category: "update",
    date: "2026-03-10",
    source: "CMS.gov",
    sourceUrl: "https://www.cms.gov/medicaid/eligibility/unwinding",
    programs: ["medicaid-adult"],
  },
  {
    id: "n3",
    title: "Child Tax Credit: Filing Deadline Approaching",
    summary: "The deadline to file your 2025 tax return and claim the Child Tax Credit of up to $2,000 per qualifying child is April 15, 2026. Families who don't typically file taxes should still file to claim the refundable portion.",
    category: "deadline",
    date: "2026-03-08",
    source: "IRS",
    sourceUrl: "https://www.irs.gov/credits-deductions/individuals/child-tax-credit",
    programs: ["ctc"],
  },
  {
    id: "n4",
    title: "New York Expands Essential Plan Coverage",
    summary: "New York State has expanded the Essential Plan to cover additional preventive services and reduced copays for behavioral health visits. The program continues to provide coverage regardless of immigration status for eligible residents.",
    category: "new-program",
    date: "2026-03-05",
    source: "NY State of Health",
    sourceUrl: "https://nystateofhealth.ny.gov/essential-plan",
    programs: ["ny-essential-plan"],
  },
  {
    id: "n5",
    title: "LIHEAP Winter Heating Assistance Still Available",
    summary: "Many states still have LIHEAP funds available for the current heating season. Low-income households struggling with energy costs should apply before state-specific deadlines, which vary from March through May 2026.",
    category: "deadline",
    date: "2026-03-01",
    source: "ACF / HHS",
    sourceUrl: "https://www.acf.hhs.gov/ocs/low-income-home-energy-assistance-program-liheap",
    programs: ["liheap"],
  },
  {
    id: "n6",
    title: "SSI Federal Benefit Rate Increase for 2026",
    summary: "The Social Security Administration has announced a cost-of-living adjustment (COLA) for SSI recipients effective January 2026. The maximum federal SSI benefit for individuals has increased to approximately $987/month.",
    category: "policy-change",
    date: "2026-02-20",
    source: "Social Security Administration",
    sourceUrl: "https://www.ssa.gov/ssi",
    programs: ["ssi"],
  },
  {
    id: "n7",
    title: "Texas CHIP Enrollment Reopens After Freeze",
    summary: "Texas Health and Human Services has resumed processing new CHIP applications after a temporary enrollment freeze. Families with uninsured children with household income up to 201% FPL are encouraged to apply.",
    category: "update",
    date: "2026-02-15",
    source: "Texas HHS",
    sourceUrl: "https://www.hhs.texas.gov/services/health/medicaid-chip",
    programs: ["tx-chip"],
  },
  {
    id: "n8",
    title: "VA PACT Act: Expanded Benefits for Veterans",
    summary: "Veterans exposed to burn pits and other toxic substances during military service continue to gain access to expanded healthcare and disability benefits under the PACT Act. New presumptive conditions have been added for the 2026 cycle.",
    category: "new-program",
    date: "2026-02-10",
    source: "Department of Veterans Affairs",
    sourceUrl: "https://www.va.gov/resources/the-pact-act-and-your-va-benefits/",
    programs: ["va-healthcare", "va-disability"],
  },
  {
    id: "n9",
    title: "Pell Grant Maximum Award Increases for 2026-2027",
    summary: "The maximum Pell Grant award for the 2026-2027 academic year has been set at $7,595, an increase of $200 from the prior year. Students should complete the FAFSA as early as possible to maximize their aid.",
    category: "policy-change",
    date: "2026-02-01",
    source: "Federal Student Aid",
    sourceUrl: "https://studentaid.gov/understand-aid/types/grants/pell",
    programs: ["pell-grant"],
  },
  {
    id: "n10",
    title: "California CalFresh Expands to College Students",
    summary: "California has expanded CalFresh eligibility to include more college students, particularly those who are enrolled at least half-time and meet certain work or exemption criteria. This helps address food insecurity on campuses.",
    category: "new-program",
    date: "2026-01-25",
    source: "California CDSS",
    sourceUrl: "https://www.cdss.ca.gov/calfresh",
    programs: ["ca-calfresh"],
  },
];

export function getRecentNews(limit: number = 10): NewsItem[] {
  return [...newsItems]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
}

export function getNewsByProgram(programId: string): NewsItem[] {
  return newsItems.filter(n => n.programs.includes(programId));
}
