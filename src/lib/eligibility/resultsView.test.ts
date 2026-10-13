import { describe, it, expect } from "vitest";
import { groupSchemes, MISSING_LABELS, missingLabel, rateLabel } from "./resultsView";
import { evaluateEligibility } from "./evaluateEligibility";
import { SAMPLE_ELIGIBILITY_ANSWERS } from "./profileAnswers";
import { SCHEME_RULES } from "./schemeRules";
import type { OverallResult, SchemeResult } from "./types";

describe("resultsView", () => {
  it("R1 groupSchemes(evaluateEligibility(SAMPLE_ELIGIBILITY_ANSWERS))", () => {
    const res = evaluateEligibility(SAMPLE_ELIGIBILITY_ANSWERS);
    const grouped = groupSchemes(res);

    expect(grouped.eligible.map((s) => s.schemeId)).toEqual(["individual-loan"]);
    expect(grouped.notEligible.map((s) => s.schemeId)).toEqual(["group-loan"]);
    expect(grouped.needsInfo).toEqual([]);
  });

  it("R2 groupSchemes(evaluateEligibility({}))", () => {
    const res = evaluateEligibility({});
    const grouped = groupSchemes(res);

    expect(grouped.needsInfo).toHaveLength(2);
    expect(grouped.eligible).toEqual([]);
    expect(grouped.notEligible).toEqual([]);
  });

  it("R3 groupSchemes(null / undefined / x / 5 / {} / {schemes:x} — cast)", () => {
    const emptyResult = { eligible: [], needsInfo: [], notEligible: [] };
    expect(groupSchemes(null as any)).toEqual(emptyResult);
    expect(groupSchemes(undefined as any)).toEqual(emptyResult);
    expect(groupSchemes("x" as any)).toEqual(emptyResult);
    expect(groupSchemes(5 as any)).toEqual(emptyResult);
    expect(groupSchemes({} as any)).toEqual(emptyResult);
    expect(groupSchemes({ schemes: "x" } as any)).toEqual(emptyResult);
  });

  it("R4 junk entries inside schemes are skipped while valid ones are kept", () => {
    const customOverall: OverallResult = {
      summary: "someEligible",
      eligibleIds: ["valid-1"],
      schemes: [
        null as any,
        "x" as any,
        { status: "weird" } as any,
        {
          schemeId: "valid-1",
          schemeName: "Valid 1",
          status: "eligible",
          reasons: [],
          missing: [],
          notes: [],
          maxLoan: 100000,
          sourceUrl: "",
          lastVerified: "",
        },
      ],
    };
    const grouped = groupSchemes(customOverall);
    expect(grouped.eligible.map((s) => s.schemeId)).toEqual(["valid-1"]);
    expect(grouped.needsInfo).toEqual([]);
    expect(grouped.notEligible).toEqual([]);
  });

  it("R5 order preserved: with SAMPLE answers the eligible list order equals SCHEME_RULES order", () => {
    const res = evaluateEligibility(SAMPLE_ELIGIBILITY_ANSWERS);
    const grouped = groupSchemes(res);
    const eligibleIds = grouped.eligible.map((s) => s.schemeId);
    const expectedOrder = SCHEME_RULES.map((r) => r.id).filter((id) => eligibleIds.includes(id));
    expect(eligibleIds).toEqual(expectedOrder);
  });

  it("R6 immutability: JSON snapshot unchanged and array reference distinct", () => {
    const res = evaluateEligibility(SAMPLE_ELIGIBILITY_ANSWERS);
    const snapshotBefore = JSON.stringify(res);
    const grouped = groupSchemes(res);

    expect(JSON.stringify(res)).toBe(snapshotBefore);
    expect(grouped.eligible).not.toBe(res.schemes);
    expect(grouped.needsInfo).not.toBe(res.schemes);
    expect(grouped.notEligible).not.toBe(res.schemes);
  });

  it("R7 missingLabel returns non-empty strings for known keys and empty string for unknown", () => {
    expect(missingLabel("backwardClass")).toBe(MISSING_LABELS.backwardClass);
    expect(missingLabel("gender")).toBe(MISSING_LABELS.gender);
    expect(missingLabel("incomeBand")).toBe(MISSING_LABELS.incomeBand);
    expect(missingLabel("applyMode")).toBe(MISSING_LABELS.applyMode);

    expect(missingLabel("backwardClass").length).toBeGreaterThan(0);
    expect(missingLabel("gender").length).toBeGreaterThan(0);
    expect(missingLabel("incomeBand").length).toBeGreaterThan(0);
    expect(missingLabel("applyMode").length).toBeGreaterThan(0);

    expect(missingLabel("x")).toBe("");
    expect(missingLabel(undefined)).toBe("");
    expect(missingLabel(5)).toBe("");
    expect(missingLabel(null)).toBe("");
  });

  it("R8 rateLabel returns text, never builds from percent, and returns empty for missing", () => {
    const sampleRes = evaluateEligibility(SAMPLE_ELIGIBILITY_ANSWERS);
    const individualSample = sampleRes.schemes.find((s) => s.schemeId === "individual-loan");
    expect(individualSample?.rate?.percent).toBe(8);
    expect(rateLabel(individualSample)).toBe(individualSample?.rate?.text);

    const bandRes = evaluateEligibility({
      gender: "woman",
      backwardClass: "yes",
      incomeBand: "upTo3L",
      applyMode: "alone",
      loanRange: "5to15L",
    });
    const individualBand = bandRes.schemes.find((s) => s.schemeId === "individual-loan");
    expect(individualBand?.rate?.percent).toBe(8);
    expect(rateLabel(individualBand)).toBe(individualBand?.rate?.text);
    expect(rateLabel(individualBand).length).toBeGreaterThan(0);

    // Unconfirmed slab returns null percent but rateLabel returns the explanatory text
    const customRes = evaluateEligibility(SAMPLE_ELIGIBILITY_ANSWERS, [
      {
        ...SCHEME_RULES[0],
        baseRate: {
          slabs: [{ upTo: null, percent: 0, status: "toConfirm", repaymentYears: 5 }],
        },
      },
    ]);
    expect(customRes.schemes[0].rate?.percent).toBeNull();
    expect(rateLabel(customRes.schemes[0])).toBe(customRes.schemes[0].rate?.text);
    expect(rateLabel(customRes.schemes[0]).length).toBeGreaterThan(0);

    expect(rateLabel({} as SchemeResult)).toBe("");
    expect(rateLabel(null)).toBe("");
    expect(rateLabel(undefined)).toBe("");
    expect(rateLabel({ rate: { percent: 5, status: "confirmed", text: "" } } as any)).toBe("");
  });
});
