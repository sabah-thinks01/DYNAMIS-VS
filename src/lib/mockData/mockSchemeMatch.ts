import { SchemeMatch } from "@/types";

// TODO: Module 2 deterministic rules engine integration point
export const mockSchemeMatch: SchemeMatch = {
  schemeName: "NBCFDC General Term Loan Scheme (Micro-Enterprise)",
  marginMoneyPercent: 10, // 10% entrepreneur contribution
  bankLoanPercent: 90,    // 90% SCA / Bank Term Loan split
  interestRatePercent: 6.0, // 6% concessional interest rate
  estimatedEMI: 4850,
  maxLoanAmount: 500000,
};
