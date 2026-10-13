import { describe, it, expect } from "vitest";
import { getMaxLoanCap } from "./loanCap";
import { SCHEME_RULES } from "./schemeRules";

describe("getMaxLoanCap", () => {
  it("L1 default -> 2500000", () => {
    expect(getMaxLoanCap()).toBe(2500000);
  });

  it("L2 custom [{...SCHEME_RULES[0], maxLoan: 1}, {...SCHEME_RULES[0], maxLoan: 9}] -> 9", () => {
    const custom = [
      { ...SCHEME_RULES[0], maxLoan: 1 },
      { ...SCHEME_RULES[0], maxLoan: 9 },
    ];
    expect(getMaxLoanCap(custom)).toBe(9);
  });

  it("L3 [] -> 0", () => {
    expect(getMaxLoanCap([])).toBe(0);
  });

  it("L4 null, x, 5 (cast) -> 0, no throw", () => {
    expect(getMaxLoanCap(null as any)).toBe(0);
    expect(getMaxLoanCap("x" as any)).toBe(0);
    expect(getMaxLoanCap(5 as any)).toBe(0);
  });

  it("L5 entries with maxLoan NaN, -1, 0, Infinity, x and null / x array entries are ignored", () => {
    const allInvalid = [
      { ...SCHEME_RULES[0], maxLoan: NaN },
      { ...SCHEME_RULES[0], maxLoan: -1 },
      { ...SCHEME_RULES[0], maxLoan: 0 },
      { ...SCHEME_RULES[0], maxLoan: Infinity },
      { ...SCHEME_RULES[0], maxLoan: "x" as any },
      null as any,
      "x" as any,
    ];
    expect(getMaxLoanCap(allInvalid)).toBe(0);

    const oneValid = [
      ...allInvalid,
      { ...SCHEME_RULES[0], maxLoan: 500000 },
    ];
    expect(getMaxLoanCap(oneValid)).toBe(500000);
  });

  it("L6 input array not mutated (JSON snapshot)", () => {
    const rulesInput = [
      { ...SCHEME_RULES[0], maxLoan: 100000 },
      { ...SCHEME_RULES[1], maxLoan: 200000 },
    ];
    const snapshot = JSON.stringify(rulesInput);
    getMaxLoanCap(rulesInput);
    expect(JSON.stringify(rulesInput)).toBe(snapshot);
  });

  it("L7 getMaxLoanCap() equals Math.max(...SCHEME_RULES.map(r => r.maxLoan)) (proves it is config-driven)", () => {
    expect(getMaxLoanCap()).toBe(Math.max(...SCHEME_RULES.map((r) => r.maxLoan)));
  });
});
