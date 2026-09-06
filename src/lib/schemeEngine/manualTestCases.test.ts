// Manual-test verification script — confirms all four UI render states produce
// the expected evaluateSchemeMatch() output before running in the browser.
// Run with: npx vitest run src/lib/schemeEngine/manualTestCases.test.ts

import { describe, it, expect } from "vitest";
import { evaluateSchemeMatch } from "./evaluateSchemeMatch";

describe("Manual Browser Test Cases — Four Render States", () => {
  // ---- Case (a): Micro Finance Scheme (eligible) ----
  // projectCost ≤ ₹1,40,000, income ≤ ₹3,00,000
  it("(a) Eligible — Micro Finance Scheme: projectCost=100000, income=150000", () => {
    const result = evaluateSchemeMatch({
      annualFamilyIncome: 150_000,
      category: "OBC",
      projectCost: 100_000,
      state: "Maharashtra",
    });
    console.log("[Case a] Micro Finance:", JSON.stringify(result, null, 2));
    expect(result.eligible).toBe(true);
    expect(result.schemeName).toBe("Micro Finance Scheme");
    expect(result.marginMoney).toBe(10_000);
    expect(result.loanAmount).toBe(90_000);
    expect(result.monthlyEMI).toBeGreaterThan(0);
  });

  // ---- Case (b): Term Loan Scheme (eligible) ----
  // 1,40,000 < projectCost ≤ 50,00,000, income ≤ ₹3,00,000
  it("(b) Eligible — Term Loan Scheme: projectCost=350000, income=180000", () => {
    const result = evaluateSchemeMatch({
      annualFamilyIncome: 180_000,
      category: "OBC",
      projectCost: 350_000,
      state: "Maharashtra",
    });
    console.log("[Case b] Term Loan:", JSON.stringify(result, null, 2));
    expect(result.eligible).toBe(true);
    expect(result.schemeName).toBe("Term Loan Scheme");
    expect(result.marginMoney).toBe(35_000);
    expect(result.loanAmount).toBe(315_000);
    expect(result.monthlyEMI).toBeGreaterThan(0);
  });

  // ---- Case (c1): Ineligible — income above ceiling ----
  it("(c1) Ineligible — income above ceiling: income=400000", () => {
    const result = evaluateSchemeMatch({
      annualFamilyIncome: 400_000,
      category: "OBC",
      projectCost: 350_000,
      state: "Maharashtra",
    });
    console.log("[Case c1] Income exceeded:", JSON.stringify(result, null, 2));
    expect(result.eligible).toBe(false);
    expect(result.ineligibilityReason).toContain("NBCFDC eligibility ceiling");
  });

  // ---- Case (c2): Ineligible — project cost above overall ceiling ----
  it("(c2) Ineligible — project cost above ceiling: projectCost=6000000", () => {
    const result = evaluateSchemeMatch({
      annualFamilyIncome: 150_000,
      category: "SC",
      projectCost: 6_000_000,
      state: "Karnataka",
    });
    console.log("[Case c2] Cost exceeded:", JSON.stringify(result, null, 2));
    expect(result.eligible).toBe(false);
    expect(result.ineligibilityReason).toContain("maximum scheme ceiling");
  });

  // ---- Case (d): Incomplete form (projectCost = 0) → null from isFormComplete() ----
  // The isFormComplete() guard in the page prevents calling evaluateSchemeMatch()
  // with projectCost=0. We verify the engine would also reject it gracefully.
  it("(d) Incomplete form guard — projectCost=0 rejected defensively by engine", () => {
    const result = evaluateSchemeMatch({
      annualFamilyIncome: 0,
      category: "OBC",
      projectCost: 0,
      state: "Maharashtra",
    });
    console.log("[Case d] Zero cost:", JSON.stringify(result, null, 2));
    expect(result.eligible).toBe(false);
    expect(result.ineligibilityReason).toContain("positive amount");
  });
});
