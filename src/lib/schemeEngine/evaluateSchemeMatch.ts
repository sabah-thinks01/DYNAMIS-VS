// ============================================================================
// DYNAMIS Module 2 — evaluateSchemeMatch
// ============================================================================
// Pure, synchronous, side-effect-free function.
// Given an ApplicantInput, determines:
//   1. Input validity (defensive checks)
//   2. Income eligibility
//   3. Scheme tier selection (Micro Finance vs Term Loan)
//   4. Capital split (10% margin / 90% loan)
//   5. EMI breakdown (standard reducing-balance amortisation)
//
// Returns a SchemeMatchResult — never throws. Ineligibility and validation
// failures are expressed through { eligible: false, ineligibilityReason }.
// ============================================================================

import { ApplicantInput, SchemeMatchResult, SchemeTierName } from "./types";
import {
  MICRO_FINANCE_CEILING,
  TERM_LOAN_CEILING,
  MARGIN_MONEY_PERCENT,
  BANK_LOAN_PERCENT,
  INCOME_CEILING_ANNUAL,
  INTEREST_RATE_PERCENT,
  DEFAULT_TENURE_MONTHS,
} from "./constants";

// ---------------------------------------------------------------------------
// EMI helper — standard reducing-balance amortisation formula
// ---------------------------------------------------------------------------
//
//   EMI = P × r × (1+r)^n / ((1+r)^n − 1)
//
// where:
//   P = principal (loan amount)
//   r = monthly interest rate (annual rate / 12 / 100)
//   n = tenure in months
//
// Edge cases:
//   - If r === 0 (interest-free), EMI = P / n
//   - If P === 0, all outputs are 0
// ---------------------------------------------------------------------------

export function calculateEMI(
  principal: number,
  annualRatePercent: number,
  tenureMonths: number
): { monthlyEMI: number; totalRepayment: number; totalInterestPayable: number } {
  if (principal === 0 || tenureMonths === 0) {
    return { monthlyEMI: 0, totalRepayment: 0, totalInterestPayable: 0 };
  }

  if (annualRatePercent === 0) {
    const monthlyEMI = principal / tenureMonths;
    return {
      monthlyEMI: Math.round(monthlyEMI * 100) / 100,
      totalRepayment: principal,
      totalInterestPayable: 0,
    };
  }

  const r = annualRatePercent / 12 / 100; // monthly rate as decimal
  const n = tenureMonths;
  const compoundFactor = Math.pow(1 + r, n); // (1+r)^n

  const monthlyEMI = (principal * r * compoundFactor) / (compoundFactor - 1);
  const totalRepayment = monthlyEMI * n;
  const totalInterestPayable = totalRepayment - principal;

  return {
    monthlyEMI: Math.round(monthlyEMI * 100) / 100,
    totalRepayment: Math.round(totalRepayment * 100) / 100,
    totalInterestPayable: Math.round(totalInterestPayable * 100) / 100,
  };
}

// ---------------------------------------------------------------------------
// Main evaluation function
// ---------------------------------------------------------------------------

export function evaluateSchemeMatch(
  input: ApplicantInput,
  tenureMonths: number = DEFAULT_TENURE_MONTHS
): SchemeMatchResult {
  // ---- Defensive input validation ----

  if (input == null) {
    return { eligible: false, ineligibilityReason: "No input provided." };
  }

  if (typeof input.projectCost !== "number" || !isFinite(input.projectCost)) {
    return {
      eligible: false,
      ineligibilityReason: "Project cost must be a valid number.",
    };
  }
  if (input.projectCost <= 0) {
    return {
      eligible: false,
      ineligibilityReason: "Project cost must be a positive amount.",
    };
  }

  if (
    typeof input.annualFamilyIncome !== "number" ||
    !isFinite(input.annualFamilyIncome)
  ) {
    return {
      eligible: false,
      ineligibilityReason: "Annual family income must be a valid number.",
    };
  }
  if (input.annualFamilyIncome < 0) {
    return {
      eligible: false,
      ineligibilityReason: "Annual family income cannot be negative.",
    };
  }

  if (!input.state || typeof input.state !== "string" || input.state.trim() === "") {
    return {
      eligible: false,
      ineligibilityReason: "State of operation is required.",
    };
  }

  const validCategories = ["SC", "ST", "OBC", "Minority", "General"] as const;
  if (!validCategories.includes(input.category as (typeof validCategories)[number])) {
    return {
      eligible: false,
      ineligibilityReason: `Invalid category "${input.category}". Must be one of: ${validCategories.join(", ")}.`,
    };
  }

  if (tenureMonths <= 0 || !isFinite(tenureMonths)) {
    return {
      eligible: false,
      ineligibilityReason: "Loan tenure must be a positive number of months.",
    };
  }

  // ---- Rule 3: Income eligibility check ----

  if (input.annualFamilyIncome > INCOME_CEILING_ANNUAL) {
    return {
      eligible: false,
      ineligibilityReason: `Annual family income (₹${input.annualFamilyIncome.toLocaleString("en-IN")}) exceeds the NBCFDC eligibility ceiling of ₹${INCOME_CEILING_ANNUAL.toLocaleString("en-IN")}.`,
    };
  }

  // ---- Rule 1: Scheme tier selection ----

  let schemeName: SchemeTierName;

  if (input.projectCost <= MICRO_FINANCE_CEILING) {
    schemeName = "Micro Finance Scheme";
  } else if (input.projectCost <= TERM_LOAN_CEILING) {
    schemeName = "Term Loan Scheme";
  } else {
    return {
      eligible: false,
      ineligibilityReason: `Project cost (₹${input.projectCost.toLocaleString("en-IN")}) exceeds the maximum scheme ceiling of ₹${TERM_LOAN_CEILING.toLocaleString("en-IN")}.`,
    };
  }

  // ---- Rule 2: Capital split ----

  const marginMoney = Math.round((input.projectCost * MARGIN_MONEY_PERCENT) / 100 * 100) / 100;
  const loanAmount = Math.round((input.projectCost * BANK_LOAN_PERCENT) / 100 * 100) / 100;

  // ---- Rules 4 & 5: Interest rate + EMI ----

  const { monthlyEMI, totalRepayment, totalInterestPayable } = calculateEMI(
    loanAmount,
    INTEREST_RATE_PERCENT,
    tenureMonths
  );

  return {
    eligible: true,
    schemeName,
    marginMoney,
    loanAmount,
    interestRatePercent: INTEREST_RATE_PERCENT,
    tenureMonths,
    monthlyEMI,
    totalInterestPayable,
    totalRepayment,
  };
}
