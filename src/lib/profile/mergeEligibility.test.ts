import { describe, it, expect } from "vitest";
import { mergeEligibility } from "./mergeEligibility";
import type { UserProfile, EligibilityInput } from "./types";

const NOW = "2026-10-14T00:00:00.000Z";
const NOW2 = "2026-10-15T00:00:00.000Z";

describe("mergeEligibility", () => {
  // M1: null profile + { backwardClass:"yes" } → version 1, eligibility.backwardClass = {value "yes", enteredBy, updatedAt NOW}; no quickStart key.
  it("M1: null profile with backwardClass creates version 1 and eligibility without quickStart", () => {
    const res = mergeEligibility(null, { backwardClass: "yes" }, "entrepreneur", NOW);
    expect(res.version).toBe(1);
    expect(res.quickStart).toBeUndefined();
    expect(res.eligibility?.backwardClass).toEqual({
      value: "yes",
      enteredBy: "entrepreneur",
      updatedAt: NOW,
    });
  });

  // M2: profile with a quickStart and no eligibility + valid data → quickStart deep-equals the original; eligibility added.
  it("M2: profile with quickStart preserves quickStart intact and adds eligibility", () => {
    const base: UserProfile = {
      version: 1,
      quickStart: {
        pincode: { value: "413102", enteredBy: "sample", updatedAt: "2026-10-01T00:00:00.000Z" },
        businessType: { value: "farmSupplies", enteredBy: "sample", updatedAt: "2026-10-01T00:00:00.000Z" },
        stage: { value: "new", enteredBy: "sample", updatedAt: "2026-10-01T00:00:00.000Z" },
        loanRange: { value: "1to5L", enteredBy: "sample", updatedAt: "2026-10-01T00:00:00.000Z" },
        completedAt: "2026-10-01T00:00:00.000Z",
      },
    };
    const res = mergeEligibility(base, { applicantGender: "woman" }, "entrepreneur", NOW);
    expect(res.quickStart).toEqual(base.quickStart);
    expect(res.eligibility?.applicantGender).toEqual({
      value: "woman",
      enteredBy: "entrepreneur",
      updatedAt: NOW,
    });
  });

  // M3: existing eligibility has incomeBand; merging { backwardClass } leaves incomeBand untouched and adds backwardClass.
  it("M3: existing eligibility fields are preserved when adding new ones", () => {
    const base: UserProfile = {
      version: 1,
      eligibility: {
        incomeBand: { value: "upTo3L", enteredBy: "entrepreneur", updatedAt: NOW },
      },
    };
    const res = mergeEligibility(base, { backwardClass: "yes" }, "entrepreneur", NOW2);
    expect(res.eligibility?.incomeBand).toEqual(base.eligibility!.incomeBand);
    expect(res.eligibility?.backwardClass).toEqual({
      value: "yes",
      enteredBy: "entrepreneur",
      updatedAt: NOW2,
    });
  });

  // M4: same value again with a different enteredBy and NOW2 → the existing entry is unchanged (value, enteredBy, updatedAt all as before).
  it("M4: merging same value preserves existing entry object untouched", () => {
    const base: UserProfile = {
      version: 1,
      eligibility: {
        backwardClass: { value: "yes", enteredBy: "entrepreneur", updatedAt: NOW },
      },
    };
    const res = mergeEligibility(base, { backwardClass: "yes" }, "officer", NOW2);
    expect(res.eligibility?.backwardClass).toEqual({
      value: "yes",
      enteredBy: "entrepreneur",
      updatedAt: NOW,
    });
  });

  // M5: changed value → entry replaced (new value, new enteredBy, updatedAt NOW2).
  it("M5: changed value replaces entry with new enteredBy and updatedAt", () => {
    const base: UserProfile = {
      version: 1,
      eligibility: {
        backwardClass: { value: "yes", enteredBy: "entrepreneur", updatedAt: NOW },
      },
    };
    const res = mergeEligibility(base, { backwardClass: "no" }, "officer", NOW2);
    expect(res.eligibility?.backwardClass).toEqual({
      value: "no",
      enteredBy: "officer",
      updatedAt: NOW2,
    });
  });

  // M6: invalid data { incomeBand:"huge", applicantGender:5, applyMode:null, backwardClass:"" } (cast as needed) → all ignored; when the base had no eligibility the result has NO "eligibility" key.
  it("M6: invalid data is ignored and does not create an eligibility key if empty", () => {
    const invalid: any = {
      incomeBand: "huge",
      applicantGender: 5,
      applyMode: null,
      backwardClass: "",
    };
    const res = mergeEligibility(null, invalid, "entrepreneur", NOW);
    expect(res.version).toBe(1);
    expect(res.eligibility).toBeUndefined();
    expect("eligibility" in res).toBe(false);
  });

  // M7: data = null, undefined, "x", 5 (cast) → no throw; result deep-equals the base with version 1.
  it("M7: non-object data does not throw and deep-equals base with version 1", () => {
    const base: UserProfile = {
      version: 1,
      eligibility: {
        applyMode: { value: "alone", enteredBy: "entrepreneur", updatedAt: NOW },
      },
    };
    for (const val of [null, undefined, "x" as any, 5 as any]) {
      const res = mergeEligibility(base, val, "entrepreneur", NOW);
      expect(res).toEqual(base);
    }
  });

  // M8: base.eligibility = "x" and = [] and = 5 (cast) → treated as {}; no throw; valid data still applies.
  it("M8: corrupted base.eligibility is treated as empty object", () => {
    for (const corrupt of ["x" as any, [] as any, 5 as any]) {
      const base: any = { version: 1, eligibility: corrupt };
      const res = mergeEligibility(base, { applyMode: "shg" }, "entrepreneur", NOW);
      expect(res.eligibility?.applyMode).toEqual({
        value: "shg",
        enteredBy: "entrepreneur",
        updatedAt: NOW,
      });
    }
  });

  // M9: immutability: JSON snapshots of the input profile and data unchanged after the call; the returned object !== input profile; returned eligibility !== input eligibility.
  it("M9: immutability: inputs are not mutated and new objects are returned", () => {
    const base: UserProfile = {
      version: 1,
      eligibility: {
        applyMode: { value: "alone", enteredBy: "entrepreneur", updatedAt: NOW },
      },
    };
    const data: EligibilityInput = { backwardClass: "yes" };
    const baseSnap = JSON.stringify(base);
    const dataSnap = JSON.stringify(data);

    const res = mergeEligibility(base, data, "entrepreneur", NOW);
    expect(JSON.stringify(base)).toBe(baseSnap);
    expect(JSON.stringify(data)).toBe(dataSnap);
    expect(res).not.toBe(base);
    expect(res.eligibility).not.toBe(base.eligibility);
  });

  // M10: all five keys at once, including "preferNotToSay" and "notSure" values → all accepted.
  it("M10: all five keys accepted with preferNotToSay and notSure", () => {
    const data: EligibilityInput = {
      applicantGender: "preferNotToSay",
      backwardClass: "notSure",
      incomeBand: "3to5L",
      disability40: "preferNotToSay",
      applyMode: "shg",
    };
    const res = mergeEligibility(null, data, "entrepreneur", NOW);
    expect(res.eligibility?.applicantGender?.value).toBe("preferNotToSay");
    expect(res.eligibility?.backwardClass?.value).toBe("notSure");
    expect(res.eligibility?.incomeBand?.value).toBe("3to5L");
    expect(res.eligibility?.disability40?.value).toBe("preferNotToSay");
    expect(res.eligibility?.applyMode?.value).toBe("shg");
  });

  // M11: unknown keys in data (loanAmount: 5, foo: 1) ignored; an unknown key on the profile (cast) is preserved.
  it("M11: unknown keys in data ignored and unknown keys on profile preserved", () => {
    const base: any = {
      version: 1,
      customField: "preserved",
    };
    const data: any = {
      backwardClass: "yes",
      loanAmount: 5,
      foo: 1,
    };
    const res: any = mergeEligibility(base, data, "entrepreneur", NOW);
    expect(res.customField).toBe("preserved");
    expect(res.loanAmount).toBeUndefined();
    expect(res.foo).toBeUndefined();
    expect(res.eligibility?.backwardClass?.value).toBe("yes");
  });

  // M12: determinism: two calls with the same inputs deep-equal.
  it("M12: determinism: identical inputs produce deep-equal results", () => {
    const base: UserProfile = { version: 1 };
    const data: EligibilityInput = { incomeBand: "above5L" };
    const res1 = mergeEligibility(base, data, "entrepreneur", NOW);
    const res2 = mergeEligibility(base, data, "entrepreneur", NOW);
    expect(res1).toEqual(res2);
  });

  // M13: enteredBy "officer" and "sample" are recorded on the entries.
  it("M13: enteredBy officer and sample are recorded properly", () => {
    const resOfficer = mergeEligibility(null, { applyMode: "alone" }, "officer", NOW);
    expect(resOfficer.eligibility?.applyMode?.enteredBy).toBe("officer");

    const resSample = mergeEligibility(null, { applyMode: "shg" }, "sample", NOW);
    expect(resSample.eligibility?.applyMode?.enteredBy).toBe("sample");
  });
});
