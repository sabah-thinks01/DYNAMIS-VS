import { describe, it, expect } from "vitest";
import { evaluateEligibility } from "./evaluateEligibility";
import { SCHEME_RULES } from "./schemeRules";
import { EligibilityAnswers, SchemeRule } from "./types";

const BASE_A: EligibilityAnswers = {
  gender: "woman",
  backwardClass: "yes",
  incomeBand: "upTo3L",
  applyMode: "alone",
  loanAmount: 150_000,
  disability40: "no",
};

describe("evaluateEligibility", () => {
  // E1: {} → all 2 needsInfo; individual-loan & group-loan missing = backwardClass, incomeBand, applyMode; no throw; summary needMoreInfo.
  it("E1: empty answers returns needsInfo for all schemes and summary needMoreInfo", () => {
    const result = evaluateEligibility({});
    expect(result.summary).toBe("needMoreInfo");
    expect(result.eligibleIds).toEqual([]);
    expect(result.schemes).toHaveLength(2);

    for (const scheme of result.schemes) {
      expect(scheme.status).toBe("needsInfo");
    }

    const ind = result.schemes.find((s) => s.schemeId === "individual-loan")!;
    expect(ind.missing).toContain("backwardClass");
    expect(ind.missing).toContain("incomeBand");
    expect(ind.missing).toContain("applyMode");
    expect(ind.missing).not.toContain("gender");

    const group = result.schemes.find((s) => s.schemeId === "group-loan")!;
    expect(group.missing).toContain("backwardClass");
    expect(group.missing).toContain("incomeBand");
    expect(group.missing).toContain("applyMode");
    expect(group.missing).not.toContain("gender");
  });

  // E2: Base A → individual-loan eligible (rate 8, split 85/15, repayment 7y, rebateNote), group-loan notEligible (wrong_apply_mode).
  it("E2: Base A returns individual-loan eligible with repayment and rebate, SHG notEligible", () => {
    const result = evaluateEligibility(BASE_A);
    expect(result.summary).toBe("someEligible");
    expect(result.eligibleIds).toEqual(["individual-loan"]);

    const ind = result.schemes.find((s) => s.schemeId === "individual-loan")!;
    expect(ind.status).toBe("eligible");
    expect(ind.rate?.percent).toBe(8);
    expect(ind.rate?.status).toBe("confirmed");
    expect(ind.rate?.text).toBe("8% a year");
    expect(ind.split?.nbcfdcPercent).toBe(85);
    expect(ind.split?.otherPercent).toBe(15);
    expect(ind.repayment?.years).toBe(7);
    expect(ind.repayment?.moratoriumMonths).toBe(3);
    expect(ind.repayment?.text).toBe(
      "Repay over about 7 years. No repayment for the first 3 months. Your state agency sets the exact schedule."
    );
    expect(ind.rebateNote).toBe(
      "1% yearly timely-payment rebate shared equally between channel partner and beneficiary (about 0.5% to you)."
    );
    expect(ind.notes.some((n) => n.code === "timely_payment_rebate")).toBe(true);

    const group = result.schemes.find((s) => s.schemeId === "group-loan")!;
    expect(group.status).toBe("notEligible");
    expect(group.reasons.some((r) => r.code === "wrong_apply_mode")).toBe(true);
  });

  // E3: A with gender "man", incomeBand "3to5L", loanAmount 400000 → individual-loan eligible (rate 8); group-loan notEligible with wrong_apply_mode, income_above_limit, and loan_above_cap reasons.
  it("E3: Male applicant with 3to5L and 4L loan passes individual-loan, fails multiple checks on group-loan", () => {
    const input: EligibilityAnswers = {
      ...BASE_A,
      gender: "man",
      incomeBand: "3to5L",
      loanAmount: 400_000,
    };
    const result = evaluateEligibility(input);
    expect(result.summary).toBe("someEligible");
    expect(result.eligibleIds).toEqual(["individual-loan"]);

    const ind = result.schemes.find((s) => s.schemeId === "individual-loan")!;
    expect(ind.status).toBe("eligible");
    expect(ind.rate?.percent).toBe(8);

    const group = result.schemes.find((s) => s.schemeId === "group-loan")!;
    expect(group.status).toBe("notEligible");
    const codes = group.reasons.map((r) => r.code);
    expect(codes).toContain("wrong_apply_mode");
    expect(codes).toContain("income_above_limit");
    expect(codes).toContain("loan_above_cap");
  });

  // E4: Base A with incomeBand "above5L" → summary "noneEligible", eligibleIds empty, 2 schemes both notEligible with code "income_above_limit".
  it("E4: Income above5L makes all schemes notEligible", () => {
    const input: EligibilityAnswers = { ...BASE_A, incomeBand: "above5L" };
    const result = evaluateEligibility(input);
    expect(result.summary).toBe("noneEligible");
    expect(result.eligibleIds).toEqual([]);
    expect(result.schemes).toHaveLength(2);

    for (const s of result.schemes) {
      expect(s.status).toBe("notEligible");
      expect(s.reasons.some((r) => r.code === "income_above_limit")).toBe(true);
    }
  });

  // E5: Base A with incomeBand "3to5L" → eligibleIds has "individual-loan" (status "eligible"), "group-loan" status "notEligible".
  it("E5: Income 3to5L passes individual-loan but fails group-loan", () => {
    const input: EligibilityAnswers = { ...BASE_A, incomeBand: "3to5L" };
    const result = evaluateEligibility(input);
    expect(result.eligibleIds).toEqual(["individual-loan"]);

    const ind = result.schemes.find((s) => s.schemeId === "individual-loan")!;
    expect(ind.status).toBe("eligible");

    const group = result.schemes.find((s) => s.schemeId === "group-loan")!;
    expect(group.status).toBe("notEligible");
  });

  // E6: A with backwardClass "no" → all notEligible (not_backward_class).
  it("E6: Non-backward class makes all schemes notEligible", () => {
    const input: EligibilityAnswers = { ...BASE_A, backwardClass: "no" };
    const result = evaluateEligibility(input);
    expect(result.summary).toBe("noneEligible");
    expect(result.eligibleIds).toEqual([]);

    for (const s of result.schemes) {
      expect(s.status).toBe("notEligible");
      expect(s.reasons.some((r) => r.code === "not_backward_class")).toBe(true);
    }
  });

  // E7: A with backwardClass "notSure" → all needsInfo, missing includes backwardClass.
  it("E7: backwardClass notSure causes needsInfo with missing backwardClass", () => {
    const input: EligibilityAnswers = { ...BASE_A, backwardClass: "notSure" };
    const result = evaluateEligibility(input);
    expect(result.summary).toBe("needMoreInfo");

    const ind = result.schemes.find((s) => s.schemeId === "individual-loan")!;
    expect(ind.status).toBe("needsInfo");
    expect(ind.missing).toContain("backwardClass");

    const resShg = evaluateEligibility({
      ...BASE_A,
      applyMode: "shg",
      loanAmount: 100_000,
      backwardClass: "notSure",
    });
    const group = resShg.schemes.find((s) => s.schemeId === "group-loan")!;
    expect(group.status).toBe("needsInfo");
    expect(group.missing).toContain("backwardClass");
  });

  // E8: loanAmount 2500000 (exactly cap) on A → individual-loan eligible, rate percent null (slab toConfirm) with the "not confirmed" text.
  // E8: loanAmount 2500000 (exactly cap) on A → individual-loan eligible, rate percent 8 (confirmed).
  it("E8: loanAmount 2500000 exactly at cap passes individual-loan with confirmed 8% rate", () => {
    const input: EligibilityAnswers = { ...BASE_A, loanAmount: 2_500_000 };
    const result = evaluateEligibility(input);
    const ind = result.schemes.find((s) => s.schemeId === "individual-loan")!;
    expect(ind.status).toBe("eligible");
    expect(ind.rate?.percent).toBe(8);
    expect(ind.rate?.status).toBe("confirmed");
    expect(ind.rate?.text).toBe("8% a year");
    expect(ind.repayment?.years).toBe(7);
  });

  // E9: loanAmount 2500001 → individual-loan notEligible loan_above_cap.
  it("E9: loanAmount 2500001 exceeds individual-loan cap", () => {
    const input: EligibilityAnswers = { ...BASE_A, loanAmount: 2_500_001 };
    const result = evaluateEligibility(input);
    const ind = result.schemes.find((s) => s.schemeId === "individual-loan")!;
    expect(ind.status).toBe("notEligible");
    expect(ind.reasons.some((r) => r.code === "loan_above_cap")).toBe(true);
  });

  // E10: Base A with applyMode "shg" and loanAmount 125000 → group-loan status "eligible", rate percent 7.
  it("E10: loanAmount 125000 passes group-loan at cap", () => {
    const input: EligibilityAnswers = { ...BASE_A, applyMode: "shg", loanAmount: 125_000 };
    const result = evaluateEligibility(input);
    const group = result.schemes.find((s) => s.schemeId === "group-loan")!;
    expect(group.status).toBe("eligible");
    expect(group.rate?.percent).toBe(7);
  });

  // E11: loanAmount 125001 with applyMode "shg" → group-loan notEligible with loan_above_cap.
  it("E11: loanAmount 125001 fails group-loan with loan_above_cap", () => {
    const input: EligibilityAnswers = { ...BASE_A, applyMode: "shg", loanAmount: 125_001 };
    const result = evaluateEligibility(input);
    const group = result.schemes.find((s) => s.schemeId === "group-loan")!;
    expect(group.status).toBe("notEligible");
    expect(group.reasons.some((r) => r.code === "loan_above_cap")).toBe(true);
  });

  // E12: A with applyMode "shg", loanAmount 100000 → group-loan eligible (rate 7, split 90/10, repayment 3y), individual-loan notEligible (wrong_apply_mode).
  it("E12: applyMode shg with 1L passes group-loan and fails individual loan", () => {
    const input: EligibilityAnswers = { ...BASE_A, applyMode: "shg", loanAmount: 100_000 };
    const result = evaluateEligibility(input);
    expect(result.eligibleIds).toEqual(["group-loan"]);

    const group = result.schemes.find((s) => s.schemeId === "group-loan")!;
    expect(group.status).toBe("eligible");
    expect(group.rate?.percent).toBe(7);
    expect(group.split?.nbcfdcPercent).toBe(90);
    expect(group.split?.otherPercent).toBe(10);
    expect(group.repayment?.years).toBe(3);
    expect(group.repayment?.moratoriumMonths).toBe(3);
    expect(group.repayment?.text).toBe(
      "Repay over about 3 years. No repayment for the first 3 months. Your state agency sets the exact schedule."
    );

    const ind = result.schemes.find((s) => s.schemeId === "individual-loan")!;
    expect(ind.status).toBe("notEligible");
    expect(ind.reasons.some((r) => r.code === "wrong_apply_mode")).toBe(true);
  });

  // E13: group-loan cap boundary at 125000 and 125001.
  it("E13: group-loan cap boundary at 125000 and 125001", () => {
    const atCap = evaluateEligibility({ ...BASE_A, applyMode: "shg", loanAmount: 125_000 });
    const groupAt = atCap.schemes.find((s) => s.schemeId === "group-loan")!;
    expect(groupAt.status).toBe("eligible");

    const aboveCap = evaluateEligibility({ ...BASE_A, applyMode: "shg", loanAmount: 125_001 });
    const groupAbove = aboveCap.schemes.find((s) => s.schemeId === "group-loan")!;
    expect(groupAbove.status).toBe("notEligible");
    expect(groupAbove.reasons.some((r) => r.code === "loan_above_cap")).toBe(true);
  });

  // E14: Male applicant in SHG is eligible for group-loan.
  it("E14: Male applicant in SHG is eligible for group-loan", () => {
    const input: EligibilityAnswers = {
      ...BASE_A,
      applyMode: "shg",
      gender: "man",
      loanAmount: 100_000,
    };
    const result = evaluateEligibility(input);
    expect(result.eligibleIds).toEqual(["group-loan"]);

    const group = result.schemes.find((s) => s.schemeId === "group-loan")!;
    expect(group.status).toBe("eligible");
    expect(group.rate?.percent).toBe(7);
  });

  // E15: disability40 "yes": individual-loan rate percent 7 (100k) and 8 (400k), group-loan rate percent 7; each has note code "disability_concession"; disability40 "no" has no "disability_concession" note.
  it("E15: disability concession adds disability_concession note to confirmed rates", () => {
    // disability40 "yes" with individual loan 100k (<=1.25L): rate remains 7%, concession note present
    const resInd100 = evaluateEligibility({ ...BASE_A, loanAmount: 100_000, disability40: "yes" });
    const ind100 = resInd100.schemes.find((s) => s.schemeId === "individual-loan")!;
    expect(ind100.rate?.percent).toBe(7);
    expect(ind100.notes.some((n) => n.code === "disability_concession")).toBe(true);

    // disability40 "yes" with individual loan 400k (>1.25L): rate remains 8%, concession note present
    const resInd400 = evaluateEligibility({ ...BASE_A, loanAmount: 400_000, disability40: "yes" });
    const ind400 = resInd400.schemes.find((s) => s.schemeId === "individual-loan")!;
    expect(ind400.rate?.percent).toBe(8);
    expect(ind400.notes.some((n) => n.code === "disability_concession")).toBe(true);

    // disability40 "yes" with group-loan: rate remains 7%, concession note present
    const resGroup = evaluateEligibility({ ...BASE_A, applyMode: "shg", loanAmount: 100_000, disability40: "yes" });
    const group = resGroup.schemes.find((s) => s.schemeId === "group-loan")!;
    expect(group.rate?.percent).toBe(7);
    expect(group.notes.some((n) => n.code === "disability_concession")).toBe(true);

    // User addition 3: disability40 "no" → no disability note
    const resNoDisability = evaluateEligibility({ ...BASE_A, disability40: "no" });
    const indNoDis = resNoDisability.schemes.find((s) => s.schemeId === "individual-loan")!;
    expect(indNoDis.notes.some((n) => n.code === "disability_concession")).toBe(false);
  });

  // E16: {gender: "man", applyMode: "alone", backwardClass: "yes"} → group-loan status "notEligible" with code "wrong_apply_mode"; individual-loan status "needsInfo" missing "incomeBand".
  it("E16: Definite failure beats missing answers", () => {
    const input: EligibilityAnswers = {
      gender: "man",
      applyMode: "alone",
      backwardClass: "yes",
    };
    const result = evaluateEligibility(input);

    const group = result.schemes.find((s) => s.schemeId === "group-loan")!;
    expect(group.status).toBe("notEligible");
    expect(group.reasons.some((r) => r.code === "wrong_apply_mode")).toBe(true);

    const ind = result.schemes.find((s) => s.schemeId === "individual-loan")!;
    expect(ind.status).toBe("needsInfo");
    expect(ind.missing).toContain("incomeBand");
  });

  // E17: loanRange on Base A without amount: "under1L" → individual-loan status "eligible", no "loan_amount_decides" note; "1to5L", "notSure", and no range → status "eligible" with note "loan_amount_decides"; "5to15L" and "above15L" → status "eligible".
  it("E17: loanRange bands drive fitting, straddling notes, and cap failures", () => {
    const baseWithoutAmount: EligibilityAnswers = { ...BASE_A, loanAmount: undefined };

    // "under1L": max 1L <= 25L cap -> fits silently
    const resUnder1L = evaluateEligibility({ ...baseWithoutAmount, loanRange: "under1L" });
    const indUnder = resUnder1L.schemes.find((s) => s.schemeId === "individual-loan")!;
    expect(indUnder.status).toBe("eligible");
    expect(indUnder.notes.some((n) => n.code === "loan_amount_decides")).toBe(false);

    // "1to5L": fits individual-loan silently
    const res1to5L = evaluateEligibility({ ...baseWithoutAmount, loanRange: "1to5L" });
    const ind1to5 = res1to5L.schemes.find((s) => s.schemeId === "individual-loan")!;
    expect(ind1to5.status).toBe("eligible");
    expect(ind1to5.notes.some((n) => n.code === "loan_amount_decides")).toBe(false);

    // "5to15L": fits individual-loan
    const res5to15L = evaluateEligibility({ ...baseWithoutAmount, loanRange: "5to15L" });
    const ind5to15 = res5to15L.schemes.find((s) => s.schemeId === "individual-loan")!;
    expect(ind5to15.status).toBe("eligible");

    // "above15L": min 15L, max Infinity -> straddles 25L cap -> individual-loan eligible with note
    const resAbove15L = evaluateEligibility({ ...baseWithoutAmount, loanRange: "above15L" });
    const indAbove = resAbove15L.schemes.find((s) => s.schemeId === "individual-loan")!;
    expect(indAbove.status).toBe("eligible");
    expect(indAbove.notes.some((n) => n.code === "loan_amount_decides")).toBe(true);

    // "notSure": eligible with note
    const resNotSure = evaluateEligibility({ ...baseWithoutAmount, loanRange: "notSure" });
    const indNotSure = resNotSure.schemes.find((s) => s.schemeId === "individual-loan")!;
    expect(indNotSure.status).toBe("eligible");
    expect(indNotSure.notes.some((n) => n.code === "loan_amount_decides")).toBe(true);
  });

  // E18: loanAmount 0, -5, NaN, Infinity, "abc" (cast) → ignored (treated as not given), no throw, falls back to loanRange.
  it("E18: Invalid loanAmount values are ignored and fallback to loanRange without throwing", () => {
    const invalidAmounts = [0, -5, NaN, Infinity, "abc" as any];
    for (const val of invalidAmounts) {
      expect(() => {
        const res = evaluateEligibility({ ...BASE_A, loanAmount: val, loanRange: "under1L" });
        const ind = res.schemes.find((s) => s.schemeId === "individual-loan")!;
        expect(ind.status).toBe("eligible");
      }).not.toThrow();
    }
  });

  // E19: corrupted values (backwardClass "maybe", incomeBand 7 as any, applyMode "" ) → treated as unanswered, no throw.
  it("E19: Corrupted input strings are treated as unanswered without throwing", () => {
    const corrupted: any = {
      backwardClass: "maybe",
      incomeBand: 7,
      applyMode: "",
    };
    const res = evaluateEligibility(corrupted);
    expect(res.summary).toBe("needMoreInfo");
    const ind = res.schemes.find((s) => s.schemeId === "individual-loan")!;
    expect(ind.status).toBe("needsInfo");
    expect(ind.missing).toContain("backwardClass");
    expect(ind.missing).toContain("incomeBand");
    expect(ind.missing).toContain("applyMode");
  });

  // E20: incomeBand "notSure" → needsInfo with missing incomeBand.
  it("E20: incomeBand notSure results in missing incomeBand", () => {
    const input: EligibilityAnswers = { ...BASE_A, incomeBand: "notSure" };
    const res = evaluateEligibility(input);
    const ind = res.schemes.find((s) => s.schemeId === "individual-loan")!;
    expect(ind.status).toBe("needsInfo");
    expect(ind.missing).toContain("incomeBand");
  });

  // E21: determinism + immutability: JSON.stringify of input unchanged after the call; two calls deep-equal.
  it("E21: Pure, immutable, and deterministic output", () => {
    const input: EligibilityAnswers = { ...BASE_A };
    const snapshotBefore = JSON.stringify(input);

    const call1 = evaluateEligibility(input);
    const snapshotAfter = JSON.stringify(input);
    expect(snapshotAfter).toBe(snapshotBefore);

    const call2 = evaluateEligibility(input);
    expect(call1).toEqual(call2);
  });

  // E22: custom rules param: pass a rule with incomeLimit 400000 → band "3to5L" straddles → needsInfo missing incomeBand.
  it("E22: Custom rules parameter proves config-driven logic", () => {
    const customRule: SchemeRule = {
      ...SCHEME_RULES[0],
      incomeLimit: 400_000,
    };
    const input: EligibilityAnswers = { ...BASE_A, incomeBand: "3to5L" };
    const res = evaluateEligibility(input, [customRule]);
    expect(res.schemes[0].status).toBe("needsInfo");
    expect(res.schemes[0].missing).toContain("incomeBand");
  });

  // E23: config sanity: 2 schemes in SCHEME_RULES ("individual-loan", "group-loan"); "general-loan", "new-swarnima", "mahila-samriddhi" not in ids; every rule has https sourceUrl, lastVerified "2026-10-13", moratoriumMonths 3, non-null split percents sum to 100, slab repaymentYears > 0.
  it("E23: Config sanity checks on SCHEME_RULES", () => {
    expect(SCHEME_RULES).toHaveLength(2);

    const ids = SCHEME_RULES.map((r) => r.id);
    expect(new Set(ids).size).toBe(2);
    expect(ids).not.toContain("general-loan");
    expect(ids).not.toContain("new-swarnima");
    expect(ids).not.toContain("mahila-samriddhi");
    expect(ids).toContain("individual-loan");
    expect(ids).toContain("group-loan");

    for (const rule of SCHEME_RULES) {
      expect(rule.sourceUrl).toMatch(/^https:\/\//);
      expect(rule.lastVerified).toBe("2026-10-13");
      expect(rule.moratoriumMonths).toBe(3);

      if (rule.split.nbcfdcPercent !== null && rule.split.otherPercent !== null) {
        expect(rule.split.nbcfdcPercent + rule.split.otherPercent).toBe(100);
      }
      for (const slab of rule.baseRate.slabs) {
        expect(slab.repaymentYears).toBeGreaterThan(0);
      }
    }
  });

  // E24: summary values: someEligible / needMoreInfo / noneEligible each demonstrated at least once.
  it("E24: Demonstrates all three summary outcomes", () => {
    const some = evaluateEligibility(BASE_A);
    expect(some.summary).toBe("someEligible");

    const need = evaluateEligibility({});
    expect(need.summary).toBe("needMoreInfo");

    const none = evaluateEligibility({ ...BASE_A, backwardClass: "no" });
    expect(none.summary).toBe("noneEligible");
  });

  // E25: individual-loan on Base A without loanAmount: under1L → rate percent 7, confirmed, years 4; 1to5L, 5to15L, above15L → rate percent 8, confirmed, years 7; disability40 "yes" retains rate percent 8 with "disability_concession" note.
  it("E25: Rate selection respects loanRange and slab overlap", () => {
    const baseWithoutAmount: EligibilityAnswers = { ...BASE_A, loanAmount: undefined };

    // individual-loan: under1L -> 7 / confirmed / 4 years repayment
    const resUnder1L = evaluateEligibility({ ...baseWithoutAmount, loanRange: "under1L" });
    const indUnder = resUnder1L.schemes.find((s) => s.schemeId === "individual-loan")!;
    expect(indUnder.rate?.percent).toBe(7);
    expect(indUnder.rate?.status).toBe("confirmed");
    expect(indUnder.rate?.text).toBe("7% a year");
    expect(indUnder.repayment?.years).toBe(4);
    expect(indUnder.repayment?.text).toBe(
      "Repay over about 4 years. No repayment for the first 3 months. Your state agency sets the exact schedule."
    );

    // individual-loan: 1to5L (straddling range) -> 8 / confirmed / 7 years repayment (mentions 4 years for <=1.25L)
    const res1to5L = evaluateEligibility({ ...baseWithoutAmount, loanRange: "1to5L" });
    const ind1to5 = res1to5L.schemes.find((s) => s.schemeId === "individual-loan")!;
    expect(ind1to5.rate?.percent).toBe(8);
    expect(ind1to5.rate?.status).toBe("confirmed");
    expect(ind1to5.rate?.text).toBe("8% a year (7% for loans up to ₹1.25 lakh)");
    expect(ind1to5.repayment?.years).toBe(7);
    expect(ind1to5.repayment?.text).toBe(
      "Repay over about 7 years (4 years for loans up to ₹1.25 lakh). No repayment for the first 3 months. Your state agency sets the exact schedule."
    );

    // individual-loan: 5to15L -> 8 / confirmed / 7 years repayment
    const res5to15L = evaluateEligibility({ ...baseWithoutAmount, loanRange: "5to15L" });
    const ind5to15 = res5to15L.schemes.find((s) => s.schemeId === "individual-loan")!;
    expect(ind5to15.rate?.percent).toBe(8);
    expect(ind5to15.rate?.status).toBe("confirmed");
    expect(ind5to15.rate?.text).toBe("8% a year");
    expect(ind5to15.repayment?.years).toBe(7);
    expect(ind5to15.repayment?.text).toBe(
      "Repay over about 7 years. No repayment for the first 3 months. Your state agency sets the exact schedule."
    );

    // individual-loan: above15L -> 8 / confirmed / 7 years repayment
    const resAbove15L = evaluateEligibility({ ...baseWithoutAmount, loanRange: "above15L" });
    const indAbove = resAbove15L.schemes.find((s) => s.schemeId === "individual-loan")!;
    expect(indAbove.rate?.percent).toBe(8);
    expect(indAbove.rate?.status).toBe("confirmed");
    expect(indAbove.rate?.text).toBe("8% a year");
    expect(indAbove.repayment?.years).toBe(7);

    // With disability40 "yes": base rate percent unchanged, concession note added
    const res1to5LDis = evaluateEligibility({ ...baseWithoutAmount, loanRange: "1to5L", disability40: "yes" });
    const ind1to5Dis = res1to5LDis.schemes.find((s) => s.schemeId === "individual-loan")!;
    expect(ind1to5Dis.rate?.percent).toBe(8);
    expect(ind1to5Dis.rate?.status).toBe("confirmed");
    expect(ind1to5Dis.notes.some((n) => n.code === "disability_concession")).toBe(true);

    const res5to15LDis = evaluateEligibility({ ...baseWithoutAmount, loanRange: "5to15L", disability40: "yes" });
    const ind5to15Dis = res5to15LDis.schemes.find((s) => s.schemeId === "individual-loan")!;
    expect(ind5to15Dis.rate?.percent).toBe(8);
    expect(ind5to15Dis.rate?.status).toBe("confirmed");
    expect(ind5to15Dis.notes.some((n) => n.code === "disability_concession")).toBe(true);
  });

  // E26: custom rules param: a copy of SCHEME_RULES[0] with baseRate slabs [{upTo 300000, percent 6, confirmed}, {upTo null, percent 0, toConfirm}] and loanRange "1to5L" (band 100,000–500,000 overlaps both slabs) → percent null, status "toConfirm", text contains "up to".
  it("E26: Multi-slab overlap returns toConfirm and text with up to", () => {
    const customRule: SchemeRule = {
      ...SCHEME_RULES[0],
      baseRate: {
        slabs: [
          { upTo: 300_000, percent: 6, status: "confirmed", repaymentYears: 4 },
          { upTo: null, percent: 0, status: "toConfirm", repaymentYears: 7 },
        ],
      },
    };
    const input: EligibilityAnswers = { ...BASE_A, loanAmount: undefined, loanRange: "1to5L" };
    const res = evaluateEligibility(input, [customRule]);
    const schemeRes = res.schemes[0];
    expect(schemeRes.rate?.percent).toBeNull();
    expect(schemeRes.rate?.status).toBe("toConfirm");
    expect(schemeRes.rate?.text).toContain("up to");
  });

  // E27: income_limit_unconfirmed note: Base A with applyMode "shg", loanAmount 100000 → present on group-loan, absent on individual-loan. Base A with applyMode "shg", incomeBand "3to5L" → present on group-loan (they are notEligible with income_above_limit). Base A with applyMode "shg", backwardClass "no" → ABSENT on group-loan (notEligible for another reason only). Base A with applyMode "shg" and incomeBand "notSure" → present on group-loan (needsInfo).
  it("E27: income_limit_unconfirmed note surfaces correctly", () => {
    // 1) Base A with applyMode "shg", loanAmount 100000 -> present on group-loan, absent on individual-loan
    const res1 = evaluateEligibility({ ...BASE_A, applyMode: "shg", loanAmount: 100_000 });
    const group1 = res1.schemes.find((s) => s.schemeId === "group-loan")!;
    const ind1 = res1.schemes.find((s) => s.schemeId === "individual-loan")!;
    expect(group1.notes.some((n) => n.code === "income_limit_unconfirmed")).toBe(true);
    expect(ind1.notes.some((n) => n.code === "income_limit_unconfirmed")).toBe(false);

    // 2) Base A with applyMode "shg", incomeBand "3to5L" -> present on group-loan (notEligible with income_above_limit)
    const res2 = evaluateEligibility({ ...BASE_A, applyMode: "shg", loanAmount: 100_000, incomeBand: "3to5L" });
    const group2 = res2.schemes.find((s) => s.schemeId === "group-loan")!;
    expect(group2.status).toBe("notEligible");
    expect(group2.reasons.some((r) => r.code === "income_above_limit")).toBe(true);
    expect(group2.notes.some((n) => n.code === "income_limit_unconfirmed")).toBe(true);

    // 3) Base A with applyMode "shg", backwardClass "no" -> ABSENT on group-loan (notEligible for another reason only)
    const res3 = evaluateEligibility({ ...BASE_A, applyMode: "shg", loanAmount: 100_000, backwardClass: "no" });
    const group3 = res3.schemes.find((s) => s.schemeId === "group-loan")!;
    expect(group3.status).toBe("notEligible");
    expect(group3.notes.some((n) => n.code === "income_limit_unconfirmed")).toBe(false);

    // 4) Base A with applyMode "shg" and incomeBand "notSure" -> present on group-loan (needsInfo)
    const res4 = evaluateEligibility({ ...BASE_A, applyMode: "shg", loanAmount: 100_000, incomeBand: "notSure" });
    const group4 = res4.schemes.find((s) => s.schemeId === "group-loan")!;
    expect(group4.status).toBe("needsInfo");
    expect(group4.notes.some((n) => n.code === "income_limit_unconfirmed")).toBe(true);
  });

  // E28: evaluateEligibility(null as any), evaluateEligibility(undefined), evaluateEligibility("x" as any), evaluateEligibility(5 as any) → none throw, each deep-equals evaluateEligibility({}).
  it("E28: Non-object input values do not throw and deep-equal evaluateEligibility({})", () => {
    const defaultRes = evaluateEligibility({});
    expect(evaluateEligibility(null as any)).toEqual(defaultRes);
    expect(evaluateEligibility(undefined)).toEqual(defaultRes);
    expect(evaluateEligibility("x" as any)).toEqual(defaultRes);
    expect(evaluateEligibility(5 as any)).toEqual(defaultRes);
  });

  // Scenario printout test
  it("scenario printout", () => {
    const scenarios = [
      { name: "E2: Base A (Woman, Alone, <=3L, 1.5L)", answers: BASE_A },
      {
        name: "E3: Man, Alone, 3to5L, 4L",
        answers: { ...BASE_A, gender: "man" as const, incomeBand: "3to5L" as const, loanAmount: 400_000 },
      },
      {
        name: "E5: Woman, Alone, 3to5L, 1.5L",
        answers: { ...BASE_A, incomeBand: "3to5L" as const },
      },
      {
        name: "E12: Woman, SHG, <=3L, 1L",
        answers: { ...BASE_A, applyMode: "shg" as const, loanAmount: 100_000 },
      },
      {
        name: "E25: Woman, Alone, <=3L, range 5to15L",
        answers: { ...BASE_A, loanAmount: undefined, loanRange: "5to15L" as const },
      },
    ];

    console.log("\n==================== ELIGIBILITY SCENARIOS ====================");
    for (const sc of scenarios) {
      const res = evaluateEligibility(sc.answers);
      console.log(`\nScenario: ${sc.name} (Summary: ${res.summary})`);
      for (const s of res.schemes) {
        const rateDisplay = s.rate ? s.rate.text : "N/A";
        console.log(`  - [${s.schemeId}] ${s.schemeName} -> ${s.status} | Rate: ${rateDisplay}`);
      }
    }
    console.log("===============================================================\n");
  });
});
