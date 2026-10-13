import { describe, it, expect } from "vitest";
import { planLoan } from "./planLoan";
import { evaluateEligibility } from "@/lib/eligibility/evaluateEligibility";
import { SAMPLE_ELIGIBILITY_ANSWERS } from "@/lib/eligibility/profileAnswers";
import type { SchemeResult } from "@/lib/eligibility/types";

describe("planLoan Repayment Engine", () => {
  function getRealScheme(schemeId: string, totalCost: number): SchemeResult {
    const isShg = schemeId === "group-loan";
    const answers = {
      ...SAMPLE_ELIGIBILITY_ANSWERS,
      applyMode: isShg ? ("shg" as const) : ("alone" as const),
      loanAmount: totalCost,
    };
    const result = evaluateEligibility(answers);
    const found = result.schemes.find((s) => s.schemeId === schemeId);
    if (!found) {
      throw new Error(`Scheme ${schemeId} not found in evaluateEligibility results`);
    }
    return found;
  }

  // Row 1: individual, 1,00,000
  it("individual, 1,00,000: loanPart 85,000; ownShare 15,000; rate 7; years 4; n 15; quarterly ≈ 6,607; roughMonthly ≈ 2,203", () => {
    const totalCost = 100_000;
    const scheme = getRealScheme("individual-loan", totalCost);
    const res = planLoan({ scheme, totalCost });

    expect(res.status).toBe("ok");
    if (res.status !== "ok") return;

    expect(res.loanPart).toBe(85_000);
    expect(res.ownShare).toBe(15_000);
    expect(res.annualRate).toBe(7);
    expect(res.years).toBe(4);
    expect(res.n).toBe(15);
    expect(Math.abs(res.quarterly - 6607)).toBeLessThanOrEqual(2);
    expect(Math.abs(res.roughMonthly - 2203)).toBeLessThanOrEqual(2);
    expect(res.totalRepaid).toBeGreaterThan(res.loanPart);
    expect(Number.isInteger(res.quarterly)).toBe(true);
    expect(Number.isInteger(res.roughMonthly)).toBe(true);
  });

  // Row 2: individual, 3,00,000
  it("individual, 3,00,000: loanPart 2,55,000; rate 8; years 7; n 27; quarterly ≈ 12,561", () => {
    const totalCost = 300_000;
    const scheme = getRealScheme("individual-loan", totalCost);
    const res = planLoan({ scheme, totalCost });

    expect(res.status).toBe("ok");
    if (res.status !== "ok") return;

    expect(res.loanPart).toBe(255_000);
    expect(res.annualRate).toBe(8);
    expect(res.years).toBe(7);
    expect(res.n).toBe(27);
    expect(Math.abs(res.quarterly - 12561)).toBeLessThanOrEqual(2);
    expect(res.totalRepaid).toBeGreaterThan(res.loanPart);
  });

  // Row 3: individual, 1,25,000
  it("individual, 1,25,000: rate 7, years 4", () => {
    const totalCost = 125_000;
    const scheme = getRealScheme("individual-loan", totalCost);
    const res = planLoan({ scheme, totalCost });

    expect(res.status).toBe("ok");
    if (res.status !== "ok") return;

    expect(res.annualRate).toBe(7);
    expect(res.years).toBe(4);
  });

  // Row 4: individual, 1,25,001
  it("individual, 1,25,001: rate 8, years 7", () => {
    const totalCost = 125_001;
    const scheme = getRealScheme("individual-loan", totalCost);
    const res = planLoan({ scheme, totalCost });

    expect(res.status).toBe("ok");
    if (res.status !== "ok") return;

    expect(res.annualRate).toBe(8);
    expect(res.years).toBe(7);
  });

  // Row 5: individual, 25,00,000
  it("individual, 25,00,000: status ok, rate 8", () => {
    const totalCost = 2_500_000;
    const scheme = getRealScheme("individual-loan", totalCost);
    const res = planLoan({ scheme, totalCost });

    expect(res.status).toBe("ok");
    if (res.status !== "ok") return;

    expect(res.annualRate).toBe(8);
  });

  // Row 6: individual, 25,00,001
  it("individual, 25,00,001: status overLimit", () => {
    const totalCost = 2_500_001;
    const scheme = getRealScheme("individual-loan", totalCost);
    const res = planLoan({ scheme, totalCost });

    expect(res.status).toBe("overLimit");
    if (res.status === "overLimit") {
      expect(res.maxLoan).toBe(scheme.maxLoan);
    }
  });

  // Row 7: group, 1,00,000
  it("group, 1,00,000: loanPart 90,000; ownShare 10,000; rate 7; years 3; n 11; quarterly ≈ 9,224", () => {
    const totalCost = 100_000;
    const scheme = getRealScheme("group-loan", totalCost);
    const res = planLoan({ scheme, totalCost });

    expect(res.status).toBe("ok");
    if (res.status !== "ok") return;

    expect(res.loanPart).toBe(90_000);
    expect(res.ownShare).toBe(10_000);
    expect(res.annualRate).toBe(7);
    expect(res.years).toBe(3);
    expect(res.n).toBe(11);
    expect(Math.abs(res.quarterly - 9224)).toBeLessThanOrEqual(2);
    expect(res.totalRepaid).toBeGreaterThan(res.loanPart);
  });

  // Row 8: any, 0 / negative / NaN -> status noCost
  it("any, 0 / negative / NaN: status noCost", () => {
    const scheme = getRealScheme("individual-loan", 100_000);

    expect(planLoan({ scheme, totalCost: 0 }).status).toBe("noCost");
    expect(planLoan({ scheme, totalCost: -50_000 }).status).toBe("noCost");
    expect(planLoan({ scheme, totalCost: NaN }).status).toBe("noCost");
    expect(planLoan({ scheme, totalCost: Infinity }).status).toBe("noCost");
  });

  // Row 9: scheme with rate.percent null -> status rateUnknown
  it("scheme with rate.percent null: status rateUnknown", () => {
    const baseScheme = getRealScheme("individual-loan", 100_000);
    const unknownRateScheme: SchemeResult = {
      ...baseScheme,
      rate: {
        percent: null,
        status: "toConfirm",
        text: "Rate to be confirmed",
      },
    };

    const res = planLoan({ scheme: unknownRateScheme, totalCost: 100_000 });
    expect(res.status).toBe("rateUnknown");
    if (res.status === "rateUnknown") {
      expect(res.loanPart).toBe(85_000);
      expect(res.ownShare).toBe(15_000);
      expect(res.nbcfdcPercent).toBe(85);
      expect(res.otherPercent).toBe(15);
    }
  });

  // Change 3: Missing data test
  it("Change 3: Missing split or repayment returns rateUnknown with no NaN fields", () => {
    const baseScheme = getRealScheme("individual-loan", 100_000);

    // 1) missing split
    const missingSplitScheme: SchemeResult = {
      ...baseScheme,
      split: undefined,
    };
    const res1 = planLoan({ scheme: missingSplitScheme, totalCost: 100_000 });
    expect(res1.status).toBe("rateUnknown");
    if (res1.status === "rateUnknown") {
      expect(res1.loanPart).toBeUndefined();
      expect(res1.ownShare).toBeUndefined();
      expect(res1.nbcfdcPercent).toBeUndefined();
      expect(res1.otherPercent).toBeUndefined();
    }

    // 2) null percents in split
    const nullSplitScheme: SchemeResult = {
      ...baseScheme,
      split: {
        nbcfdcPercent: null,
        otherPercent: null,
        text: "Split not confirmed",
      },
    };
    const res2 = planLoan({ scheme: nullSplitScheme, totalCost: 100_000 });
    expect(res2.status).toBe("rateUnknown");

    // 3) missing repayment
    const missingRepayScheme: SchemeResult = {
      ...baseScheme,
      repayment: undefined,
    };
    const res3 = planLoan({ scheme: missingRepayScheme, totalCost: 100_000 });
    expect(res3.status).toBe("rateUnknown");
  });

  // Generic sanity checks: quarterly is integer, totalRepaid > loanPart, no NaN
  it("ensures no output field is NaN in ok status", () => {
    const scheme = getRealScheme("individual-loan", 200_000);
    const res = planLoan({ scheme, totalCost: 200_000 });
    expect(res.status).toBe("ok");

    if (res.status === "ok") {
      Object.entries(res).forEach(([key, val]) => {
        if (typeof val === "number") {
          expect(Number.isNaN(val)).toBe(false);
        }
      });
    }
  });
});
