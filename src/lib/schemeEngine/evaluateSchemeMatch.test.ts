// ============================================================================
// DYNAMIS Module 2 — evaluateSchemeMatch Unit Tests
// ============================================================================
// Tests cover:
//   1. Scheme tier boundary cases (Micro Finance ≤ 140000, Term Loan ≤ 5000000)
//   2. Above overall scheme ceiling → ineligible
//   3. Income ceiling boundary cases
//   4. EMI calculation hand-verified against reducing-balance formula
//   5. Defensive input validation (zero, negative, NaN, missing fields)
//   6. calculateEMI standalone edge cases
// ============================================================================

import { describe, it, expect } from "vitest";
import {
  evaluateSchemeMatch,
  calculateEMI,
} from "./evaluateSchemeMatch";
import {
  MICRO_FINANCE_CEILING,
  TERM_LOAN_CEILING,
  INCOME_CEILING_ANNUAL,
  INTEREST_RATE_PERCENT,
  DEFAULT_TENURE_MONTHS,
} from "./constants";
import type { ApplicantInput } from "./types";

// ---------------------------------------------------------------------------
// Helper: a valid baseline input that is always eligible
// ---------------------------------------------------------------------------
const validInput: ApplicantInput = {
  annualFamilyIncome: 200_000,
  category: "OBC",
  projectCost: 350_000,
  state: "Maharashtra",
};

// ============================================================================
// 1. SCHEME TIER SELECTION — boundary cases at ₹1,40,000
// ============================================================================
describe("Scheme Tier Selection", () => {
  it("selects Micro Finance Scheme when projectCost < 140000", () => {
    const result = evaluateSchemeMatch({ ...validInput, projectCost: 100_000 });
    expect(result.eligible).toBe(true);
    expect(result.schemeName).toBe("Micro Finance Scheme");
  });

  it("selects Micro Finance Scheme at exact boundary projectCost === 140000", () => {
    const result = evaluateSchemeMatch({ ...validInput, projectCost: 140_000 });
    expect(result.eligible).toBe(true);
    expect(result.schemeName).toBe("Micro Finance Scheme");
  });

  it("selects Term Loan Scheme when projectCost === 140001 (just above Micro ceiling)", () => {
    const result = evaluateSchemeMatch({ ...validInput, projectCost: 140_001 });
    expect(result.eligible).toBe(true);
    expect(result.schemeName).toBe("Term Loan Scheme");
  });

  it("selects Term Loan Scheme for mid-range projectCost", () => {
    const result = evaluateSchemeMatch({ ...validInput, projectCost: 2_500_000 });
    expect(result.eligible).toBe(true);
    expect(result.schemeName).toBe("Term Loan Scheme");
  });

  it("selects Term Loan Scheme at exact upper boundary projectCost === 5000000", () => {
    const result = evaluateSchemeMatch({ ...validInput, projectCost: 5_000_000 });
    expect(result.eligible).toBe(true);
    expect(result.schemeName).toBe("Term Loan Scheme");
  });
});

// ============================================================================
// 2. ABOVE OVERALL SCHEME CEILING
// ============================================================================
describe("Above Scheme Ceiling", () => {
  it("returns ineligible when projectCost === 5000001 (just above ceiling)", () => {
    const result = evaluateSchemeMatch({ ...validInput, projectCost: 5_000_001 });
    expect(result.eligible).toBe(false);
    expect(result.ineligibilityReason).toContain("exceeds the maximum scheme ceiling");
  });

  it("returns ineligible for very large projectCost", () => {
    const result = evaluateSchemeMatch({ ...validInput, projectCost: 100_000_000 });
    expect(result.eligible).toBe(false);
  });
});

// ============================================================================
// 3. INCOME CEILING — boundary cases at ₹3,00,000
// ============================================================================
describe("Income Eligibility", () => {
  it("eligible when income < ceiling", () => {
    const result = evaluateSchemeMatch({ ...validInput, annualFamilyIncome: 250_000 });
    expect(result.eligible).toBe(true);
  });

  it("eligible at exact income ceiling boundary (income === 300000)", () => {
    const result = evaluateSchemeMatch({ ...validInput, annualFamilyIncome: 300_000 });
    expect(result.eligible).toBe(true);
  });

  it("ineligible when income === 300001 (just above ceiling)", () => {
    const result = evaluateSchemeMatch({ ...validInput, annualFamilyIncome: 300_001 });
    expect(result.eligible).toBe(false);
    expect(result.ineligibilityReason).toContain("exceeds the NBCFDC eligibility ceiling");
  });

  it("eligible when income is zero (valid — could be new household)", () => {
    const result = evaluateSchemeMatch({ ...validInput, annualFamilyIncome: 0 });
    expect(result.eligible).toBe(true);
  });
});

// ============================================================================
// 4. CAPITAL SPLIT — 10% margin / 90% loan
// ============================================================================
describe("Capital Split", () => {
  it("computes correct margin money and loan amount", () => {
    const result = evaluateSchemeMatch({ ...validInput, projectCost: 500_000 });
    expect(result.eligible).toBe(true);
    expect(result.marginMoney).toBe(50_000);   // 500000 * 0.10
    expect(result.loanAmount).toBe(450_000);   // 500000 * 0.90
  });

  it("handles non-round project costs correctly", () => {
    const result = evaluateSchemeMatch({ ...validInput, projectCost: 123_456 });
    expect(result.eligible).toBe(true);
    expect(result.marginMoney).toBe(12_345.6);
    expect(result.loanAmount).toBe(111_110.4);
  });
});

// ============================================================================
// 5. EMI CALCULATION — hand-verified example
// ============================================================================
describe("EMI Calculation", () => {
  it("matches hand-verified reducing-balance amortisation", () => {
    // Hand-verification:
    //   P = ₹4,50,000 (loan amount for ₹5,00,000 project at 90%)
    //   Annual rate = 6%, so monthly rate r = 6 / 12 / 100 = 0.005
    //   Tenure n = 60 months
    //
    //   (1+r)^n = (1.005)^60 = 1.348850152...
    //
    //   EMI = P * r * (1+r)^n / ((1+r)^n - 1)
    //       = 450000 * 0.005 * 1.348850152 / (1.348850152 - 1)
    //       = 3034.912843 / 0.348850152
    //       = 8699.7554...
    //
    //   Rounded to 2dp: ₹8,699.76
    //
    //   Total repayment = round(8699.7554 * 60) = round(521985.327) = ₹5,21,985.33
    //   Total interest  = 521985.33 - 450000 = ₹71,985.33
    //
    //   Note: the engine rounds EMI first (8699.76), then multiplies
    //   for totals (8699.76 * 60 = 521985.60). So we verify against
    //   the engine's rounding strategy: round each intermediate to 2dp.
    // ---------------------------------------------------------------
    const result = evaluateSchemeMatch({ ...validInput, projectCost: 500_000 });
    expect(result.eligible).toBe(true);
    expect(result.loanAmount).toBe(450_000);
    expect(result.tenureMonths).toBe(60);
    expect(result.interestRatePercent).toBe(6);

    // Verify EMI is in the correct range (hand-calc: ~8699.76)
    expect(result.monthlyEMI).toBeGreaterThanOrEqual(8699);
    expect(result.monthlyEMI).toBeLessThanOrEqual(8700);

    // Total repayment = monthlyEMI * 60 (rounded to 2dp)
    expect(result.totalRepayment).toBeCloseTo(result.monthlyEMI! * 60, 0);

    // Total interest = total repayment - principal
    expect(result.totalInterestPayable).toBeCloseTo(
      result.totalRepayment! - result.loanAmount!,
      2
    );

    // Sanity: interest payable should be roughly ~₹72,000 for 6% over 5 years
    expect(result.totalInterestPayable).toBeGreaterThan(70_000);
    expect(result.totalInterestPayable).toBeLessThan(75_000);
  });

  it("supports custom tenure parameter", () => {
    const result = evaluateSchemeMatch({ ...validInput, projectCost: 500_000 }, 36);
    expect(result.eligible).toBe(true);
    expect(result.tenureMonths).toBe(36);
    // With 36 months the EMI should be higher than with 60 months
    expect(result.monthlyEMI!).toBeGreaterThan(8_699);
  });
});

// ============================================================================
// 6. calculateEMI standalone edge cases
// ============================================================================
describe("calculateEMI edge cases", () => {
  it("returns zero for zero principal", () => {
    const emi = calculateEMI(0, 6, 60);
    expect(emi.monthlyEMI).toBe(0);
    expect(emi.totalRepayment).toBe(0);
    expect(emi.totalInterestPayable).toBe(0);
  });

  it("returns zero for zero tenure", () => {
    const emi = calculateEMI(100_000, 6, 0);
    expect(emi.monthlyEMI).toBe(0);
  });

  it("handles zero interest rate (interest-free loan)", () => {
    const emi = calculateEMI(120_000, 0, 60);
    expect(emi.monthlyEMI).toBe(2_000); // 120000 / 60
    expect(emi.totalRepayment).toBe(120_000);
    expect(emi.totalInterestPayable).toBe(0);
  });
});

// ============================================================================
// 7. DEFENSIVE INPUT VALIDATION
// ============================================================================
describe("Input Validation", () => {
  it("rejects null input", () => {
    const result = evaluateSchemeMatch(null as unknown as ApplicantInput);
    expect(result.eligible).toBe(false);
    expect(result.ineligibilityReason).toContain("No input provided");
  });

  it("rejects negative project cost", () => {
    const result = evaluateSchemeMatch({ ...validInput, projectCost: -100_000 });
    expect(result.eligible).toBe(false);
    expect(result.ineligibilityReason).toContain("positive amount");
  });

  it("rejects zero project cost", () => {
    const result = evaluateSchemeMatch({ ...validInput, projectCost: 0 });
    expect(result.eligible).toBe(false);
    expect(result.ineligibilityReason).toContain("positive amount");
  });

  it("rejects NaN project cost", () => {
    const result = evaluateSchemeMatch({ ...validInput, projectCost: NaN });
    expect(result.eligible).toBe(false);
    expect(result.ineligibilityReason).toContain("valid number");
  });

  it("rejects negative income", () => {
    const result = evaluateSchemeMatch({ ...validInput, annualFamilyIncome: -50_000 });
    expect(result.eligible).toBe(false);
    expect(result.ineligibilityReason).toContain("cannot be negative");
  });

  it("rejects NaN income", () => {
    const result = evaluateSchemeMatch({ ...validInput, annualFamilyIncome: NaN });
    expect(result.eligible).toBe(false);
    expect(result.ineligibilityReason).toContain("valid number");
  });

  it("rejects empty state string", () => {
    const result = evaluateSchemeMatch({ ...validInput, state: "" });
    expect(result.eligible).toBe(false);
    expect(result.ineligibilityReason).toContain("State of operation is required");
  });

  it("rejects whitespace-only state string", () => {
    const result = evaluateSchemeMatch({ ...validInput, state: "   " });
    expect(result.eligible).toBe(false);
    expect(result.ineligibilityReason).toContain("State of operation is required");
  });

  it("rejects invalid category", () => {
    const result = evaluateSchemeMatch({
      ...validInput,
      category: "InvalidCategory" as ApplicantInput["category"],
    });
    expect(result.eligible).toBe(false);
    expect(result.ineligibilityReason).toContain("Invalid category");
  });

  it("rejects invalid tenure", () => {
    const result = evaluateSchemeMatch(validInput, 0);
    expect(result.eligible).toBe(false);
    expect(result.ineligibilityReason).toContain("positive number of months");
  });

  it("rejects negative tenure", () => {
    const result = evaluateSchemeMatch(validInput, -12);
    expect(result.eligible).toBe(false);
    expect(result.ineligibilityReason).toContain("positive number of months");
  });
});

// ============================================================================
// 8. ALL VALID CATEGORIES PASS
// ============================================================================
describe("Valid Categories", () => {
  const categories: ApplicantInput["category"][] = ["SC", "ST", "OBC", "Minority", "General"];

  for (const category of categories) {
    it(`accepts category "${category}"`, () => {
      const result = evaluateSchemeMatch({ ...validInput, category });
      expect(result.eligible).toBe(true);
    });
  }
});

// ============================================================================
// 9. FULL ELIGIBLE RESULT SHAPE
// ============================================================================
describe("Eligible result completeness", () => {
  it("populates all financial fields when eligible", () => {
    const result = evaluateSchemeMatch(validInput);
    expect(result.eligible).toBe(true);
    expect(result.schemeName).toBeDefined();
    expect(result.marginMoney).toBeDefined();
    expect(result.loanAmount).toBeDefined();
    expect(result.interestRatePercent).toBe(INTEREST_RATE_PERCENT);
    expect(result.tenureMonths).toBe(DEFAULT_TENURE_MONTHS);
    expect(result.monthlyEMI).toBeGreaterThan(0);
    expect(result.totalInterestPayable).toBeGreaterThan(0);
    expect(result.totalRepayment).toBeGreaterThan(result.loanAmount!);
    expect(result.ineligibilityReason).toBeUndefined();
  });

  it("does NOT populate financial fields when ineligible", () => {
    const result = evaluateSchemeMatch({ ...validInput, projectCost: 10_000_000 });
    expect(result.eligible).toBe(false);
    expect(result.schemeName).toBeUndefined();
    expect(result.marginMoney).toBeUndefined();
    expect(result.loanAmount).toBeUndefined();
    expect(result.monthlyEMI).toBeUndefined();
    expect(result.ineligibilityReason).toBeDefined();
  });
});
