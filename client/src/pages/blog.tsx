import { useState, useMemo } from "react";
import { Link } from "wouter";
import EmailCapture from "@/components/EmailCapture";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MapPin,
  ArrowRight,
  BookOpen,
  Sparkles,
  Heart,
  Utensils,
  Home,
  DollarSign,
  Shield,
  Briefcase,
  Baby,
  Zap,
  GraduationCap,
} from "lucide-react";
import { US_STATES } from "@/lib/states";
import { programs } from "@/lib/programs";
import type { Program } from "@/lib/programs";

// ─── Category icon mapping ───────────────────────────────────────────────────

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  "Food Assistance": <Utensils className="w-3 h-3" />,
  Healthcare: <Heart className="w-3 h-3" />,
  "Retirement & Disability": <Shield className="w-3 h-3" />,
  Employment: <Briefcase className="w-3 h-3" />,
  Housing: <Home className="w-3 h-3" />,
  "Tax Credits": <DollarSign className="w-3 h-3" />,
  Veterans: <Shield className="w-3 h-3" />,
  "Cash Assistance": <DollarSign className="w-3 h-3" />,
  Utilities: <Zap className="w-3 h-3" />,
  Education: <GraduationCap className="w-3 h-3" />,
  Telecommunications: <Zap className="w-3 h-3" />,
  Childcare: <Baby className="w-3 h-3" />,
  "Prescription Drugs": <Heart className="w-3 h-3" />,
};

function formatEstimate(min: number, max: number): string {
  if (min === max) return `$${min.toLocaleString()}`;
  return `$${min.toLocaleString()} – $${max.toLocaleString()}`;
}

function getEstimateLabel(program: Program): string | null {
  const m = program.estimatedMonthlyBenefit;
  const a = program.estimatedAnnualBenefit;
  if (m) return `${formatEstimate(m.min, m.max)}/mo`;
  if (a) return `${formatEstimate(a.min, a.max)}/yr`;
  return null;
}

// ─── Article data ────────────────────────────────────────────────────────────

const ARTICLES = [
  {
    title: "How to Apply for SNAP Benefits: Complete Guide",
    description:
      "Learn the step-by-step process for applying for food assistance, including required documents, income limits, and how to get expedited benefits.",
    category: "Food Assistance",
  },
  {
    title: "Medicaid vs Medicare: What's the Difference?",
    description:
      "Understand the key differences between Medicaid and Medicare — who qualifies, what's covered, and how to apply for each program.",
    category: "Healthcare",
  },
  {
    title: "Earned Income Tax Credit: Are You Missing Free Money?",
    description:
      "The EITC puts thousands of dollars back in working families' pockets. Find out if you qualify and how to claim it on your tax return.",
    category: "Tax Credits",
  },
  {
    title: "Section 8 Housing Voucher: How to Apply and What to Expect",
    description:
      "Navigate the Housing Choice Voucher waitlist, application process, and what to know about inspections and landlord requirements.",
    category: "Housing",
  },
  {
    title: "Social Security Disability (SSDI): Application Timeline and Tips",
    description:
      "The SSDI process can take months. Learn how to strengthen your application, gather medical evidence, and navigate the appeals process.",
    category: "Retirement & Disability",
  },
  {
    title: "WIC Benefits: Who Qualifies and How to Apply",
    description:
      "WIC provides nutrition assistance for pregnant women, new mothers, and young children. Here's how income limits work and what benefits you receive.",
    category: "Food Assistance",
  },
  {
    title: "State EITC: Does Your State Offer Extra Tax Credits?",
    description:
      "31 states offer their own Earned Income Tax Credit on top of the federal credit. Find out if your state is one of them and how much extra you could get.",
    category: "Tax Credits",
  },
  {
    title: "CHIP: Free Health Insurance for Your Children",
    description:
      "The Children's Health Insurance Program covers millions of kids. Learn income limits by state, what's covered, and how to enroll your children.",
    category: "Healthcare",
  },
  {
    id: "snap-apply-2026",
    slug: "how-to-apply-for-snap-food-stamps-2026",
    title: "How to Apply for SNAP Food Stamps in 2026 — Step by Step",
    description:
      "Learn how to apply for SNAP (food stamps) in 2026 — including income limits, required documents, how to apply online or in person, and what to expect at your interview.",
    category: "Food Assistance",
    state: "all",
    publishedDate: "2026-03-22",
    readTime: "6 min read",
    content: `<h2>What Is SNAP and Who Can Apply?</h2>
<p>SNAP (Supplemental Nutrition Assistance Program) helps low-income individuals and families buy groceries. In 2026, about 42 million Americans receive SNAP benefits each month. If your household income is at or below 130% of the federal poverty level (FPL), you may qualify.</p>
<p>For a family of four, 130% FPL is about $3,645 per month (before taxes) in 2026. Single adults earning up to $1,580 per month may also qualify.</p>

<h2>Who Qualifies for SNAP?</h2>
<ul>
  <li>U.S. citizens and most legal immigrants</li>
  <li>Households with gross income at or below 130% FPL</li>
  <li>Households with net income at or below 100% FPL (after deductions)</li>
  <li>Households with less than $2,750 in countable assets (or $4,250 if a member is elderly or disabled)</li>
</ul>
<p>Most able-bodied adults between 18 and 49 without dependents must work or participate in job training to receive benefits longer than 3 months in a 36-month period.</p>

<h2>Documents You'll Need</h2>
<ul>
  <li>Proof of identity (driver's license, state ID, passport)</li>
  <li>Social Security numbers for all household members</li>
  <li>Proof of residence (utility bill, lease agreement)</li>
  <li>Recent pay stubs or proof of income (or a letter if self-employed)</li>
  <li>Bank account statements</li>
  <li>Proof of any expenses like rent, childcare, or medical costs</li>
</ul>

<h2>How to Apply</h2>
<p><strong>Online:</strong> Most states let you apply at your state SNAP website or through benefits.gov. The online application takes about 20–30 minutes.</p>
<p><strong>In person:</strong> Visit your local Department of Social Services or SNAP office. Bring all your documents.</p>
<p><strong>By mail or fax:</strong> Many states still accept paper applications.</p>

<h2>The Interview</h2>
<p>After applying, most households must complete a phone or in-person interview. The caseworker will ask about your household size, income, expenses, and living situation. Be honest — and have your documents ready.</p>

<h2>How Long Does It Take?</h2>
<ul>
  <li><strong>Standard processing:</strong> Up to 30 days</li>
  <li><strong>Expedited benefits:</strong> Within 7 days if you have very low income (under $150/month) or your rent/utilities exceed your income</li>
</ul>
<p>If approved, you'll receive an EBT card loaded with your monthly benefit. Average monthly benefit per household is around $331 in 2026.</p>

<p><em>Want to see all the programs you qualify for? Use our free screener to check in 2 minutes.</em></p>`,
  },
  {
    id: "medicaid-eligibility-2026",
    slug: "am-i-eligible-for-medicaid-2026",
    title: "Am I Eligible for Medicaid? A Simple Guide for 2026",
    description:
      "Find out if you qualify for Medicaid in 2026. This guide covers income limits by household size, expansion vs non-expansion states, and how to apply.",
    category: "Healthcare",
    state: "all",
    publishedDate: "2026-03-22",
    readTime: "5 min read",
    content: `<h2>What Is Medicaid?</h2>
<p>Medicaid is a free or low-cost health insurance program run jointly by the federal government and each state. It covers doctor visits, hospital stays, prescriptions, mental health care, and more. Over 90 million Americans are enrolled as of 2026.</p>

<h2>Expansion vs. Non-Expansion States</h2>
<p>The Affordable Care Act allowed states to expand Medicaid to adults earning up to 138% of the federal poverty level. As of 2026, 41 states plus D.C. have expanded Medicaid. In expansion states, a single adult earning up to about $20,120 per year qualifies.</p>
<p>In the 10 non-expansion states (Alabama, Florida, Georgia, Kansas, Mississippi, South Carolina, Tennessee, Texas, Wisconsin, Wyoming), eligibility is much more restrictive — often limited to children, pregnant women, and people with disabilities.</p>

<h2>Income Limits by Household Size (Expansion States, 2026)</h2>
<ul>
  <li>1 person: up to ~$20,120/year</li>
  <li>2 people: up to ~$27,214/year</li>
  <li>3 people: up to ~$34,307/year</li>
  <li>4 people: up to ~$41,400/year</li>
</ul>

<h2>Who Typically Qualifies</h2>
<ul>
  <li><strong>Low-income adults</strong> (in expansion states)</li>
  <li><strong>Children</strong> — income limits are often higher than for adults</li>
  <li><strong>Pregnant women</strong> — most states cover up to 200% FPL</li>
  <li><strong>People with disabilities</strong> — may qualify through SSI receipt</li>
  <li><strong>Elderly adults</strong> (65+) — may qualify for long-term care Medicaid</li>
</ul>

<h2>How to Apply</h2>
<p>You can apply for Medicaid three ways:</p>
<ul>
  <li><strong>Healthcare.gov:</strong> Start your application and you'll be redirected to your state's Medicaid agency if you qualify.</li>
  <li><strong>Your state Medicaid website:</strong> Search "[your state] Medicaid apply" to find the direct portal.</li>
  <li><strong>In person:</strong> Visit your local Department of Social Services.</li>
</ul>
<p>There is no enrollment period for Medicaid — you can apply any time of year. Coverage can start as early as the first day of the month you apply.</p>

<p><em>Want to see all the programs you qualify for? Use our free screener to check in 2 minutes.</em></p>`,
  },
  {
    id: "eitc-calculator-2026",
    slug: "eitc-calculator-2026",
    title: "EITC Calculator 2026 — How Much Will I Get?",
    description:
      "The Earned Income Tax Credit can put up to $7,830 back in your pocket in 2026. Find out how much you qualify for and how to claim it — even if you owe no taxes.",
    category: "Tax Credits",
    state: "all",
    publishedDate: "2026-03-22",
    readTime: "5 min read",
    content: `<h2>What Is the EITC?</h2>
<p>The Earned Income Tax Credit (EITC) is a refundable federal tax credit for working people with low to moderate income. "Refundable" means you can get money back even if you don't owe any taxes. In 2026, about 23 million workers claim the EITC each year.</p>

<h2>How Much Can I Get? (2026 Amounts)</h2>
<ul>
  <li><strong>No children:</strong> Up to $632</li>
  <li><strong>1 child:</strong> Up to $4,213</li>
  <li><strong>2 children:</strong> Up to $6,960</li>
  <li><strong>3 or more children:</strong> Up to $7,830</li>
</ul>

<h2>Income Limits for 2026</h2>
<ul>
  <li>No children (single): up to $18,591</li>
  <li>No children (married filing jointly): up to $25,511</li>
  <li>1 child (single): up to $49,084</li>
  <li>1 child (married filing jointly): up to $56,004</li>
  <li>3+ children (single): up to $59,899</li>
  <li>3+ children (married filing jointly): up to $66,819</li>
</ul>

<h2>Who Qualifies?</h2>
<p>To claim the EITC you must:</p>
<ul>
  <li>Have earned income from a job or self-employment</li>
  <li>Have a valid Social Security number</li>
  <li>Not be claimed as a dependent on someone else's return</li>
  <li>Have investment income under $11,600</li>
  <li>File a federal tax return (even if you owe nothing)</li>
</ul>

<h2>Common Mistakes to Avoid</h2>
<ul>
  <li>Not filing because you think you owe nothing — you must file to claim the credit</li>
  <li>Using the wrong filing status</li>
  <li>Forgetting to include all earned income (tips, freelance pay)</li>
  <li>Claiming a child who doesn't meet the qualifying child rules</li>
</ul>

<h2>How to Claim It</h2>
<p>Fill out Schedule EIC when filing your federal tax return. Use IRS Free File (free.efile.com) if your income is under $79,000 — it's free to file and calculates the credit automatically. You can also visit a free VITA tax prep site near you.</p>

<p><em>Want to see all the programs you qualify for? Use our free screener to check in 2 minutes.</em></p>`,
  },
  {
    id: "section-8-how-to-apply",
    slug: "section-8-housing-voucher-how-to-apply",
    title: "Section 8 Housing Voucher: How to Apply and What to Expect",
    description:
      "Section 8 housing vouchers help low-income families pay rent. Learn how to get on the waiting list, what documents you need, and how voucher amounts are calculated.",
    category: "Housing",
    state: "all",
    publishedDate: "2026-03-22",
    readTime: "6 min read",
    content: `<h2>What Is Section 8?</h2>
<p>Section 8, officially called the Housing Choice Voucher (HCV) Program, is a federal program that helps low-income families, the elderly, and people with disabilities afford safe housing. With a voucher, you pay roughly 30% of your income toward rent, and the government pays the rest directly to your landlord.</p>

<h2>Do I Qualify?</h2>
<p>Eligibility is primarily based on income. To qualify, your household income generally must be at or below 50% of the Area Median Income (AMI) for your county. By law, 75% of vouchers go to households earning below 30% AMI (the "extremely low income" tier).</p>
<p>For example, in a county with a median income of $80,000:</p>
<ul>
  <li>50% AMI for a family of 4: ~$40,000/year</li>
  <li>30% AMI for a family of 4: ~$24,000/year</li>
</ul>
<p>You must also be a U.S. citizen or eligible non-citizen, and pass a background check.</p>

<h2>How to Apply</h2>
<p>Section 8 is administered by local Public Housing Authorities (PHAs). To apply:</p>
<ol>
  <li>Find your local PHA at hud.gov/topics/housing_choice_voucher_program_section_8</li>
  <li>Check if the waiting list is open — many PHAs close their lists for months or years</li>
  <li>Submit an application when the list opens (online, in person, or by mail)</li>
  <li>Provide all required documents promptly</li>
</ol>

<h2>Documents Needed</h2>
<ul>
  <li>Photo ID for all adult household members</li>
  <li>Social Security cards for all members</li>
  <li>Birth certificates for children</li>
  <li>Proof of income (pay stubs, benefit letters, tax returns)</li>
  <li>Proof of current address</li>
</ul>

<h2>The Waiting List</h2>
<p>Waiting lists are long — often 1 to 5 years in most cities, and some lists in high-cost areas are closed indefinitely. Sign up for multiple PHAs near you to increase your chances. Some PHAs give priority to homeless families, veterans, or people leaving domestic violence situations.</p>

<h2>How Voucher Amounts Are Set</h2>
<p>Each PHA sets "payment standards" based on local fair market rents. If you find a unit at or below the payment standard, you pay about 30% of your income and the voucher covers the rest. If rent exceeds the payment standard, you pay the difference — but you cannot pay more than 40% of your income for the first unit you lease.</p>

<p><em>Want to see all the programs you qualify for? Use our free screener to check in 2 minutes.</em></p>`,
  },
  {
    id: "free-health-insurance-2026",
    slug: "free-health-insurance-medicaid-chip-aca-explained",
    title: "Free Health Insurance: Medicaid vs CHIP vs ACA Marketplace Explained",
    description:
      "Confused about free or low-cost health insurance options? This guide compares Medicaid, CHIP, and ACA marketplace subsidies — who qualifies and how to apply.",
    category: "Healthcare",
    state: "all",
    publishedDate: "2026-03-22",
    readTime: "6 min read",
    content: `<h2>Three Ways to Get Free or Low-Cost Health Insurance</h2>
<p>If you have a low or moderate income, you may qualify for free or heavily subsidized health insurance through one of three federal programs: Medicaid, CHIP, or the ACA Marketplace. Here's how they compare.</p>

<h2>Medicaid — Free Coverage for Low-Income Adults and Families</h2>
<p>Medicaid provides free or very low-cost health insurance. In the 41 expansion states, adults with income up to 138% of the federal poverty level (about $20,120/year for a single person in 2026) qualify. Coverage includes doctor visits, hospital care, prescriptions, mental health, and preventive care.</p>
<p>There is no open enrollment period — you can apply any time. Apply at healthcare.gov or your state Medicaid website.</p>

<h2>CHIP — Low-Cost Insurance for Children</h2>
<p>The Children's Health Insurance Program (CHIP) covers kids in families that earn too much for Medicaid but can't afford private insurance. Income limits vary by state but often go up to 200–300% FPL. In most states, premiums are $0 to $50 per month.</p>
<p>CHIP covers doctor visits, dental, vision, prescriptions, and emergency care. Apply through healthcare.gov or your state CHIP program.</p>

<h2>ACA Marketplace — Subsidized Plans for Everyone Else</h2>
<p>If you earn between 100% and 400% FPL (or higher in 2026 due to enhanced subsidies), you may qualify for premium tax credits that dramatically lower your monthly cost. Some people qualify for $0 per month "Silver" plans.</p>
<ul>
  <li>Open enrollment: November 1 – January 15 each year</li>
  <li>Special enrollment: available if you lose other coverage, have a baby, get married, etc.</li>
  <li>Apply at healthcare.gov</li>
</ul>

<h2>Which Program Is Right for Me?</h2>
<ul>
  <li><strong>Income under 138% FPL:</strong> Apply for Medicaid first</li>
  <li><strong>Kids in the household:</strong> Check CHIP regardless of your income</li>
  <li><strong>Income 138–400% FPL:</strong> Explore ACA marketplace subsidies</li>
  <li><strong>Pregnant?</strong> Apply for Medicaid immediately — income limits are higher for pregnant women in every state</li>
</ul>

<p><em>Want to see all the programs you qualify for? Use our free screener to check in 2 minutes.</em></p>`,
  },
  {
    id: "ssi-vs-ssdi-2026",
    slug: "ssi-vs-ssdi-difference-which-do-i-qualify-for",
    title: "SSI vs SSDI: What's the Difference and Which Do I Qualify For?",
    description:
      "SSI and SSDI are both Social Security disability programs, but they work very differently. Learn the key differences, benefit amounts, and how to apply in 2026.",
    category: "Disability",
    state: "all",
    publishedDate: "2026-03-22",
    readTime: "7 min read",
    content: `<h2>The Key Difference in One Sentence</h2>
<p>SSI (Supplemental Security Income) is need-based and doesn't require a work history. SSDI (Social Security Disability Insurance) requires you to have worked and paid Social Security taxes for a certain number of years.</p>

<h2>SSI — Supplemental Security Income</h2>
<p>SSI pays a monthly benefit to people who are disabled, blind, or 65 and older AND have limited income and resources. You do not need a work history to qualify.</p>
<ul>
  <li><strong>2026 monthly benefit:</strong> Up to $994 for an individual; $1,491 for a couple</li>
  <li><strong>Income limit:</strong> You must have very limited income and less than $2,000 in assets ($3,000 for couples). Your home and one car are excluded.</li>
  <li><strong>Medicaid:</strong> SSI recipients automatically qualify for Medicaid in most states</li>
</ul>

<h2>SSDI — Social Security Disability Insurance</h2>
<p>SSDI pays benefits to workers who become disabled before retirement age and have enough work credits. You earn credits by working and paying Social Security taxes — most people need 40 credits (about 10 years of work), though younger workers may qualify with fewer.</p>
<ul>
  <li><strong>2026 average monthly benefit:</strong> About $1,630</li>
  <li><strong>Maximum benefit:</strong> Up to $4,018/month depending on your earnings history</li>
  <li><strong>Medicare:</strong> SSDI recipients get Medicare after a 24-month waiting period</li>
  <li><strong>No asset limit:</strong> SSDI has no resource test</li>
</ul>

<h2>What Counts as a Disability?</h2>
<p>For both programs, you must have a medical condition that prevents substantial gainful activity (SGA) and has lasted (or is expected to last) at least 12 months or result in death. In 2026, SGA is defined as earning more than $1,620/month ($2,700 for blind individuals).</p>

<h2>Common Denial Reasons</h2>
<ul>
  <li>Your condition is not considered severe enough</li>
  <li>You don't have enough medical documentation</li>
  <li>SSA believes you can do other types of work</li>
  <li>You failed to follow prescribed treatment</li>
  <li>Your disability is expected to last less than 12 months</li>
</ul>

<h2>How to Apply</h2>
<p>Apply online at ssa.gov, call 1-800-772-1213, or visit your local Social Security office. The process typically takes 3–6 months for an initial decision. If denied (about 65% of applicants are denied initially), you have the right to appeal — and many people who appeal ultimately win.</p>

<p><em>Want to see all the programs you qualify for? Use our free screener to check in 2 minutes.</em></p>`,
  },
  {
    id: "child-tax-credit-2026",
    slug: "child-tax-credit-2026-how-much-how-to-claim",
    title: "Child Tax Credit 2026: How Much and How to Claim",
    description:
      "The Child Tax Credit is worth up to $2,200 per child in 2026, with up to $1,700 refundable. Learn who qualifies, income limits, and how to claim it on your tax return.",
    category: "Tax Credits",
    state: "all",
    publishedDate: "2026-03-22",
    readTime: "5 min read",
    content: `<h2>What Is the Child Tax Credit?</h2>
<p>The Child Tax Credit (CTC) reduces your federal tax bill by up to $2,200 for each qualifying child under age 17. Up to $1,700 of that amount is refundable (called the Additional Child Tax Credit), meaning you can receive it as a refund even if you owe little or no tax.</p>

<h2>2026 Credit Amounts</h2>
<ul>
  <li><strong>Credit per child:</strong> $2,200</li>
  <li><strong>Refundable portion (ACTC):</strong> Up to $1,700 per child</li>
  <li><strong>To receive the full refundable credit:</strong> You need at least $2,500 in earned income</li>
</ul>

<h2>Income Phase-Out Thresholds</h2>
<p>The credit begins to phase out once your modified adjusted gross income (MAGI) exceeds:</p>
<ul>
  <li><strong>$400,000</strong> for married filing jointly</li>
  <li><strong>$200,000</strong> for all other filers</li>
</ul>
<p>The credit reduces by $50 for every $1,000 of income above those thresholds.</p>

<h2>What Is a Qualifying Child?</h2>
<p>To count for the CTC, a child must:</p>
<ul>
  <li>Be under age 17 at the end of the tax year</li>
  <li>Be your son, daughter, stepchild, foster child, sibling, or descendant of any of these</li>
  <li>Have lived with you for more than half the year</li>
  <li>Not have provided more than half their own support</li>
  <li>Have a valid Social Security number</li>
</ul>

<h2>How to Claim It</h2>
<p>The CTC is claimed on your federal tax return (Form 1040). Use Schedule 8812 to calculate the refundable portion. Tax software like TurboTax, H&R Block, or IRS Free File will guide you through the calculation automatically.</p>
<p>You do not need to apply separately — just file your tax return with the correct information. Even if you had no federal income tax withheld, you should still file to claim the refundable portion.</p>

<p><em>Want to see all the programs you qualify for? Use our free screener to check in 2 minutes.</em></p>`,
  },
  {
    id: "liheap-energy-assistance-2026",
    slug: "liheap-energy-assistance-help-paying-utility-bills",
    title: "LIHEAP Energy Assistance: How to Get Help With Utility Bills",
    description:
      "LIHEAP helps low-income households pay heating and cooling bills. Learn income limits, how much you can get, when to apply, and how to find your local agency.",
    category: "Utilities",
    state: "all",
    publishedDate: "2026-03-22",
    readTime: "5 min read",
    content: `<h2>What Is LIHEAP?</h2>
<p>LIHEAP (Low Income Home Energy Assistance Program) is a federally funded program that helps low-income households pay their heating and cooling bills. It can also help with energy-related crises (like a shut-off notice) and weatherization to lower future energy costs.</p>

<h2>Who Qualifies?</h2>
<p>Income limits vary by state, but most states set them between 150% and 200% of the federal poverty level. In 2026:</p>
<ul>
  <li>1 person: up to ~$23,226–$30,968/year (150–200% FPL)</li>
  <li>2 people: up to ~$31,396–$41,860/year</li>
  <li>4 people: up to ~$47,737–$63,683/year</li>
</ul>
<p>SSI and SNAP recipients often automatically qualify. Households with young children, the elderly, or someone with a disability may get priority.</p>

<h2>How Much Can I Get?</h2>
<p>Benefit amounts vary widely by state, your income, household size, and energy costs. Average annual benefits nationally range from $200 to $1,000. Some states provide one-time payments; others offer ongoing assistance throughout the heating or cooling season.</p>
<p>Crisis assistance (for imminent shut-offs) is often higher and processed faster — typically within 18–48 hours.</p>

<h2>When to Apply</h2>
<p>LIHEAP has a limited annual budget, and funds often run out — especially in high-demand states. Applying early is critical:</p>
<ul>
  <li><strong>Heating assistance:</strong> Applications often open in fall (September–November)</li>
  <li><strong>Cooling assistance:</strong> Applications often open in spring (April–June)</li>
  <li><strong>Crisis assistance:</strong> Available year-round in most states</li>
</ul>

<h2>Documents You'll Need</h2>
<ul>
  <li>Photo ID</li>
  <li>Social Security numbers for all household members</li>
  <li>Proof of income (pay stubs, benefit award letters)</li>
  <li>Most recent utility bills</li>
  <li>Proof of address</li>
</ul>

<h2>How to Apply</h2>
<p>LIHEAP is administered by state and local agencies. To find your local office, visit liheap.acf.hhs.gov or call 1-866-674-6327. Many community action agencies also accept applications in person.</p>

<p><em>Want to see all the programs you qualify for? Use our free screener to check in 2 minutes.</em></p>`,
  },
  {
    id: "wic-benefits-2026",
    slug: "wic-benefits-2026-who-qualifies-what-you-get",
    title: "WIC Benefits 2026: Who Qualifies and What You Get",
    description:
      "WIC provides free food, formula, and nutrition support to pregnant women, new moms, and young children. Learn income limits, what's covered, and how to apply in 2026.",
    category: "Food Assistance",
    state: "all",
    publishedDate: "2026-03-22",
    readTime: "5 min read",
    content: `<h2>What Is WIC?</h2>
<p>WIC (Women, Infants, and Children) is a federal nutrition program that provides free food, nutrition counseling, and breastfeeding support to low-income pregnant women, new mothers, infants, and children up to age 5. About 6.5 million people receive WIC benefits each month in 2026.</p>

<h2>Who Qualifies?</h2>
<p>You may qualify for WIC if you are:</p>
<ul>
  <li><strong>Pregnant</strong> (any trimester)</li>
  <li><strong>Up to 6 months postpartum</strong> (or up to 12 months if breastfeeding)</li>
  <li><strong>An infant</strong> under 12 months</li>
  <li><strong>A child</strong> between 1 and 5 years old</li>
</ul>
<p>Income limit: your household income must be at or below 185% of the federal poverty level. In 2026, that's about $2,823/month for a single person, or $5,789/month for a family of four. If you already receive Medicaid, SNAP, or TANF, you automatically meet the income requirement.</p>

<h2>What WIC Covers</h2>
<p>WIC provides a monthly food package loaded onto an EBT-style card. Covered items include:</p>
<ul>
  <li>Infant formula (if not breastfeeding)</li>
  <li>Baby food (fruits, vegetables, and grains)</li>
  <li>Milk, cheese, and eggs</li>
  <li>Whole grains (bread, cereal, rice, oatmeal)</li>
  <li>Fresh and frozen fruits and vegetables (Cash Value Benefit: $26/month for children)</li>
  <li>Juice, legumes (beans/peas), and peanut butter</li>
</ul>
<p>Monthly benefit values range from about $40 for a non-breastfeeding mother to over $100 for an infant receiving formula.</p>

<h2>How to Apply</h2>
<p>WIC is run by state and local agencies. To apply:</p>
<ol>
  <li>Find your local WIC office at signupwic.com or call 1-800-942-3678</li>
  <li>Schedule an appointment (most offices have walk-in hours too)</li>
  <li>Bring ID, proof of income, proof of residency, and your child's immunization records if applicable</li>
  <li>A health screening will be done at your first appointment</li>
</ol>

<p><em>Want to see all the programs you qualify for? Use our free screener to check in 2 minutes.</em></p>`,
  },
  {
    id: "ebt-discounts-amazon-walmart-2026",
    slug: "amazon-prime-walmart-plus-ebt-discounts",
    title: "Amazon Prime and Walmart+ Discounts for EBT Cardholders",
    description:
      "Did you know EBT cardholders get Amazon Prime for $6.99/month and Walmart+ for $6.47/month? Here's how to sign up and what other discounts you qualify for.",
    category: "Savings",
    state: "all",
    publishedDate: "2026-03-22",
    readTime: "4 min read",
    content: `<h2>Big Savings for EBT and Medicaid Recipients</h2>
<p>If you receive SNAP (food stamps), Medicaid, SSI, or other qualifying benefits, you're eligible for deep discounts on popular subscription services and other programs. Many people don't know about these benefits — here's a full rundown.</p>

<h2>Amazon Prime — 50% Off</h2>
<p>Amazon offers Prime at 50% off for EBT and Medicaid cardholders. In 2026, that's just $6.99 per month (down from the regular $14.99). You get all the same Prime benefits:</p>
<ul>
  <li>Free 2-day shipping on millions of items</li>
  <li>Prime Video streaming</li>
  <li>Prime Music, Prime Reading, and more</li>
  <li>Access to Amazon Fresh grocery delivery discounts</li>
</ul>
<p><strong>How to sign up:</strong> Go to amazon.com/prime/ebt and click "Verify your EBT card." Amazon will confirm your eligibility and enroll you at the discounted rate. You'll need to re-verify every 12 months.</p>

<h2>Walmart+ — 50% Off</h2>
<p>Walmart+ is available for $6.47 per month (half off the regular $12.95) if you receive government assistance. Benefits include free delivery from Walmart stores, fuel discounts, and Paramount+ streaming.</p>
<p><strong>How to sign up:</strong> Visit walmart.com/plus and select the government benefit discount option during sign-up. You'll verify your eligibility through an ID.me verification process.</p>

<h2>Museums for All — $3 Admission</h2>
<p>Over 1,000 museums across the country offer $3 or less admission to EBT cardholders through the Museums for All program. This includes science museums, art museums, children's museums, zoos, and aquariums. Show your EBT card at the admission desk. Find participating museums at museums4all.org.</p>

<h2>Other Discounts Worth Knowing</h2>
<ul>
  <li><strong>Xfinity Internet Essentials:</strong> $9.95/month broadband for SNAP recipients</li>
  <li><strong>AT&T Access:</strong> $30/month internet for SNAP households</li>
  <li><strong>T-Mobile Connect:</strong> Discounted phone plans through the ACP (if available)</li>
  <li><strong>Peloton:</strong> 50% off digital membership for those on government assistance</li>
  <li><strong>National Park Service:</strong> Some parks offer free or reduced entry for EBT holders on select days</li>
  <li><strong>Local transit discounts:</strong> Many cities offer reduced bus/train fares with EBT card — check your local transit authority</li>
</ul>

<p><em>Want to see all the programs you qualify for? Use our free screener to check in 2 minutes.</em></p>`,
  },
];

// ─── State benefits section ──────────────────────────────────────────────────

function StateBenefitsSection({ stateCode }: { stateCode: string }) {
  const stateInfo = US_STATES.find((s) => s.code === stateCode);
  const stateName = stateInfo?.name || stateCode;

  const statePrograms = useMemo(() => {
    return programs.filter((p) => {
      if (p.level === "federal") return true;
      if (p.stateCode === stateCode) return true;
      if (
        p.rules.applicableStates &&
        p.rules.applicableStates.includes(stateCode)
      )
        return true;
      return false;
    });
  }, [stateCode]);

  const categories = useMemo(() => {
    const cats = new Map<string, Program[]>();
    for (const p of statePrograms) {
      const list = cats.get(p.category) || [];
      list.push(p);
      cats.set(p.category, list);
    }
    return Array.from(cats.entries()).sort((a, b) => b[1].length - a[1].length);
  }, [statePrograms]);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold">{stateName} Benefits Guide</h2>
        <p className="text-sm text-muted-foreground">
          {statePrograms.length} programs available in {stateName} — including
          federal programs and state-specific benefits.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {statePrograms.slice(0, 12).map((program) => {
          const estimate = getEstimateLabel(program);
          return (
            <Card
              key={program.id}
              className="p-3 border border-card-border flex flex-col"
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <h3 className="text-sm font-semibold leading-tight line-clamp-2">
                  {program.name}
                </h3>
                <Badge
                  variant="secondary"
                  className="text-[10px] flex-shrink-0 gap-1 h-5"
                >
                  {CATEGORY_ICONS[program.category] || null}
                  {program.category}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2 mb-2 flex-1">
                {program.description}
              </p>
              <div className="flex items-center justify-between">
                {estimate && (
                  <Badge
                    variant="outline"
                    className="text-[10px] text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
                  >
                    {estimate}
                  </Badge>
                )}
                <Link href="/screener">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs gap-1 ml-auto"
                  >
                    Learn More <ArrowRight className="w-3 h-3" />
                  </Button>
                </Link>
              </div>
            </Card>
          );
        })}
      </div>

      {statePrograms.length > 12 && (
        <p className="text-xs text-muted-foreground text-center">
          Showing 12 of {statePrograms.length} programs.{" "}
          <Link href="/screener" className="text-primary hover:underline">
            Run a full screening
          </Link>{" "}
          to see all programs and your eligibility.
        </p>
      )}

      {/* Category summary */}
      <div className="flex flex-wrap gap-2">
        {categories.map(([cat, progs]) => (
          <Badge key={cat} variant="secondary" className="text-xs gap-1">
            {CATEGORY_ICONS[cat] || null}
            {cat}: {progs.length}
          </Badge>
        ))}
      </div>

      {/* State CTA */}
      <Card className="p-4 text-center border-2 border-primary/20 bg-primary/[0.02]">
        <Link href="/screener">
          <Button className="gap-2">
            Check your eligibility for {stateName} benefits in 2 minutes
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </Card>
    </div>
  );
}

// ─── Article cards section ───────────────────────────────────────────────────

function ArticleGrid() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-bold flex items-center gap-2">
          <BookOpen className="w-4 h-4" />
          Benefit Guides & Resources
        </h2>
        <p className="text-sm text-muted-foreground">
          In-depth guides to help you understand and apply for government
          benefits.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {ARTICLES.map((article, i) => (
          <Card key={i} className="p-4 border border-card-border flex flex-col">
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <h3 className="text-sm font-semibold leading-tight line-clamp-2">
                {article.title}
              </h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-3 flex-1">
              {article.description}
            </p>
            <div className="flex items-center justify-between">
              <Badge
                variant="secondary"
                className="text-[10px] gap-1 h-5"
              >
                {CATEGORY_ICONS[article.category] || null}
                {article.category}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs gap-1"
              >
                Read Guide <ArrowRight className="w-3 h-3" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─── Main export ─────────────────────────────────────────────────────────────

export default function BlogPage() {
  const [selectedState, setSelectedState] = useState<string>("");

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-8">
      {/* Page header */}
      <div className="text-center max-w-lg mx-auto">
        <h1 className="text-xl font-bold">Benefits Resources</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Guides, state-by-state breakdowns, and everything you need to
          understand and claim the benefits you deserve.
        </p>
      </div>

      {/* State selector */}
      <Card className="p-5 border-2 border-primary/20 bg-primary/[0.02]">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-2 flex-shrink-0">
            <MapPin className="w-4 h-4 text-primary" />
            <Label className="text-sm font-semibold">
              Find benefits in your state
            </Label>
          </div>
          <Select
            value={selectedState}
            onValueChange={setSelectedState}
          >
            <SelectTrigger
              className="w-full sm:w-64"
              data-testid="select-blog-state"
            >
              <SelectValue placeholder="Select a state..." />
            </SelectTrigger>
            <SelectContent>
              {US_STATES.map((s) => (
                <SelectItem key={s.code} value={s.code}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* State-specific section */}
      {selectedState && <StateBenefitsSection stateCode={selectedState} />}

      {/* Article grid */}
      <ArticleGrid />

      {/* Email Capture */}
      <EmailCapture source="blog" />

      {/* Bottom CTA */}
      <Card className="p-6 text-center border-2 border-primary bg-primary/[0.03]">
        <Sparkles className="w-6 h-6 text-primary mx-auto mb-2" />
        <h2 className="text-base font-bold mb-1">
          Stop leaving money on the table.
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          Run your free benefits screening now and discover programs you didn't
          know existed.
        </p>
        <Link href="/screener">
          <Button size="lg" className="gap-2">
            Start Free Screening
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </Card>
    </div>
  );
}

// Label is used inline but imported from the select pattern — define locally
function Label({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <label className={className}>{children}</label>;
}
