// ============================================================================
// DYNAMIS — NBCFDC Scheme Rules Configuration
// ============================================================================
// Every number here is a policy fact; change it in this file only.
// Each rule carries a sourceUrl and lastVerified date.
// Sources:
// - https://nbcfdc.gov.in/nbcfdc/web/en/individual-loan-scheme
// - https://nbcfdc.gov.in/nbcfdc/web/en/loans-pattern-of-finance
// ============================================================================

import { SchemeRule } from "./types";

export const SCHEME_RULES: SchemeRule[] = [
  {
    id: "individual-loan",
    name: "Individual Loan Scheme",
    mode: "individual",
    womenOnly: false,
    incomeLimit: 500_000,
    incomeLimitStatus: "confirmed",
    maxLoan: 2_500_000,
    split: {
      nbcfdcPercent: 85,
      otherPercent: 15,
      text: "NBCFDC gives 85% of the project cost. The other 15% comes from your state agency or from you — your agency will confirm.",
    },
    baseRate: {
      slabs: [
        { upTo: 125_000, percent: 7, status: "confirmed", repaymentYears: 4 },
        { upTo: null, percent: 8, status: "confirmed", repaymentYears: 7 },
      ],
    },
    moratoriumMonths: 3,
    rebateNote:
      "1% yearly timely-payment rebate shared equally between channel partner and beneficiary (about 0.5% to you).",
    disabilityConcession: {
      percent: 0.25,
      status: "toConfirm",
      note: "A 0.25% interest concession may be available for disability of 40% or more — ask your state agency to confirm.",
    },
    sourceUrl: "https://nbcfdc.gov.in/nbcfdc/web/en/individual-loan-scheme",
    lastVerified: "2026-10-13",
  },
  {
    id: "group-loan",
    name: "Group Loan Scheme",
    mode: "shg",
    womenOnly: false,
    incomeLimit: 300_000,
    incomeLimitStatus: "toConfirm",
    maxLoan: 125_000,
    split: {
      nbcfdcPercent: 90,
      otherPercent: 10,
      text: "NBCFDC gives 90%. The other 10% comes from your state agency or from you.",
    },
    baseRate: {
      slabs: [
        { upTo: null, percent: 7, status: "confirmed", repaymentYears: 3 },
      ],
    },
    moratoriumMonths: 3,
    rebateNote:
      "1% yearly timely-payment rebate shared equally between channel partner and beneficiary (about 0.5% to you).",
    disabilityConcession: {
      percent: 0.25,
      status: "toConfirm",
      note: "A 0.25% interest concession may be available for disability of 40% or more — ask your state agency to confirm.",
    },
    extraNote:
      "Up to ₹1,25,000 per member (max ₹25,00,000 per group). 7% p.a. through state agencies and banks; up to 16% through micro-finance companies (NBFC-MFIs). At least 60% of group members must be from backward classes.",
    sourceUrl: "https://nbcfdc.gov.in/nbcfdc/web/en/loans-pattern-of-finance",
    lastVerified: "2026-10-13",
  },
];
