// ============================================================================
// DYNAMIS — NBCFDC Scheme Rules Configuration
// ============================================================================
// Every number here is a policy fact; change it in this file only.
// Each rule carries a sourceUrl and lastVerified date.
//
// NOTE: The legacy General Loan (₹3,00,000 income limit / ₹15,00,000 cap)
// is legacy and NOT used for matching, pending confirmation from an SCA
// officer or NBCFDC.
// Source: https://nbcfdc.gov.in/nbcfdc/web/general-loan
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
        { upTo: 500_000, percent: 6, status: "confirmed" },
        { upTo: null, percent: 0, status: "toConfirm" },
      ],
    },
    disabilityConcessionPercent: 0.25,
    sourceUrl: "https://nbcfdc.gov.in/nbcfdc/web/individual-loan-scheme",
    lastVerified: "2026-10-13",
  },
  {
    id: "new-swarnima",
    name: "New Swarnima Scheme (women)",
    mode: "individual",
    womenOnly: true,
    incomeLimit: 300_000,
    incomeLimitStatus: "confirmed",
    maxLoan: 200_000,
    split: {
      nbcfdcPercent: null,
      otherPercent: null,
      text: "You do not need to put in your own money for a project up to ₹2 lakh.",
    },
    baseRate: {
      slabs: [
        { upTo: null, percent: 5, status: "confirmed" },
      ],
    },
    disabilityConcessionPercent: 0.25,
    sourceUrl: "https://nbcfdc.gov.in/nbcfdc/web/en/loan-scheme-description",
    lastVerified: "2026-10-13",
  },
  {
    id: "micro-finance-shg",
    name: "Micro Finance Scheme (self-help group)",
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
        { upTo: null, percent: 5, status: "confirmed" },
      ],
    },
    disabilityConcessionPercent: 0.25,
    extraNote: "At least 60% of the group's members must be from backward classes.",
    sourceUrl: "https://nbcfdc.gov.in/nbcfdc/web/loan-flyer",
    lastVerified: "2026-10-13",
  },
  {
    id: "mahila-samriddhi",
    name: "Mahila Samriddhi Yojana (women's self-help group)",
    mode: "shg",
    womenOnly: true,
    incomeLimit: 300_000,
    incomeLimitStatus: "toConfirm",
    maxLoan: 125_000,
    split: {
      nbcfdcPercent: 95,
      otherPercent: 5,
      text: "NBCFDC gives 95%. The other 5% comes from your state agency or from you.",
    },
    baseRate: {
      slabs: [
        { upTo: null, percent: 4, status: "confirmed" },
      ],
    },
    disabilityConcessionPercent: 0.25,
    extraNote: "At least 60% of the group's members must be from backward classes.",
    sourceUrl: "https://nbcfdc.gov.in/nbcfdc/web/loan-flyer",
    lastVerified: "2026-10-13",
  },
];
