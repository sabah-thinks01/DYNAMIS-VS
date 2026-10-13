import { describe, it, expect } from "vitest";
import {
  QUESTION_KEYS,
  buildEligibilityAnswers,
  unansweredQuestions,
  SAMPLE_ELIGIBILITY_ANSWERS,
} from "./profileAnswers";
import { evaluateEligibility } from "./evaluateEligibility";
import { mergeEligibility } from "@/lib/profile/mergeEligibility";
import type { UserProfile } from "@/lib/profile/types";

const NOW = "2026-10-14T00:00:00.000Z";

describe("profileAnswers", () => {
  // P1: null and undefined profile → buildEligibilityAnswers = {}; unansweredQuestions = all five in QUESTION_KEYS order.
  it("P1: null and undefined profile return empty answers and all five unanswered", () => {
    for (const p of [null, undefined]) {
      expect(buildEligibilityAnswers(p)).toEqual({});
      expect(unansweredQuestions(p)).toEqual([
        "applicantGender",
        "backwardClass",
        "incomeBand",
        "disability40",
        "applyMode",
      ]);
    }
  });

  // P2: profile with only quickStart (loanRange 5to15L) → { loanRange:"5to15L" } only; unanswered = all five.
  it("P2: profile with only quickStart maps loanRange and reports all five unanswered", () => {
    const p: UserProfile = {
      version: 1,
      quickStart: {
        pincode: { value: "413102", enteredBy: "sample", updatedAt: NOW },
        businessType: { value: "farmSupplies", enteredBy: "sample", updatedAt: NOW },
        stage: { value: "new", enteredBy: "sample", updatedAt: NOW },
        loanRange: { value: "5to15L", enteredBy: "sample", updatedAt: NOW },
        completedAt: NOW,
      },
    };
    expect(buildEligibilityAnswers(p)).toEqual({ loanRange: "5to15L" });
    expect(unansweredQuestions(p)).toEqual([...QUESTION_KEYS]);
  });

  // P3: full profile (all five eligibility answers + quickStart loanRange) → maps applicantGender→gender and all others; unansweredQuestions = [].
  it("P3: full profile maps all five answers + loanRange and reports zero unanswered", () => {
    const p: UserProfile = {
      version: 1,
      quickStart: {
        pincode: { value: "413102", enteredBy: "sample", updatedAt: NOW },
        businessType: { value: "farmSupplies", enteredBy: "sample", updatedAt: NOW },
        stage: { value: "new", enteredBy: "sample", updatedAt: NOW },
        loanRange: { value: "1to5L", enteredBy: "sample", updatedAt: NOW },
        completedAt: NOW,
      },
      eligibility: {
        applicantGender: { value: "woman", enteredBy: "entrepreneur", updatedAt: NOW },
        backwardClass: { value: "yes", enteredBy: "entrepreneur", updatedAt: NOW },
        incomeBand: { value: "upTo3L", enteredBy: "entrepreneur", updatedAt: NOW },
        disability40: { value: "no", enteredBy: "entrepreneur", updatedAt: NOW },
        applyMode: { value: "alone", enteredBy: "entrepreneur", updatedAt: NOW },
      },
    };
    expect(buildEligibilityAnswers(p)).toEqual({
      gender: "woman",
      backwardClass: "yes",
      incomeBand: "upTo3L",
      disability40: "no",
      applyMode: "alone",
      loanRange: "1to5L",
    });
    expect(unansweredQuestions(p)).toEqual([]);
  });

  // P4: genderOverride "man" beats stored "woman"; the profile object is unchanged afterwards (JSON snapshot); an invalid override ("x" cast) is ignored and the stored value is used.
  it("P4: genderOverride overrides stored value without mutating profile, invalid override ignored", () => {
    const p: UserProfile = {
      version: 1,
      eligibility: {
        applicantGender: { value: "woman", enteredBy: "entrepreneur", updatedAt: NOW },
      },
    };
    const snapBefore = JSON.stringify(p);

    const withOverride = buildEligibilityAnswers(p, { genderOverride: "man" });
    expect(withOverride.gender).toBe("man");
    expect(JSON.stringify(p)).toBe(snapBefore);

    const invalidOverride = buildEligibilityAnswers(p, { genderOverride: "x" as any });
    expect(invalidOverride.gender).toBe("woman");
  });

  // P5: stored "preferNotToSay" / "notSure" count as answered; genderOverride still works when stored applicantGender is "preferNotToSay".
  it("P5: preferNotToSay and notSure count as answered, genderOverride applies over preferNotToSay", () => {
    const p: UserProfile = {
      version: 1,
      eligibility: {
        applicantGender: { value: "preferNotToSay", enteredBy: "entrepreneur", updatedAt: NOW },
        backwardClass: { value: "notSure", enteredBy: "entrepreneur", updatedAt: NOW },
        incomeBand: { value: "notSure", enteredBy: "entrepreneur", updatedAt: NOW },
        disability40: { value: "preferNotToSay", enteredBy: "entrepreneur", updatedAt: NOW },
        applyMode: { value: "shg", enteredBy: "entrepreneur", updatedAt: NOW },
      },
    };
    expect(unansweredQuestions(p)).toEqual([]);

    const withOverride = buildEligibilityAnswers(p, { genderOverride: "woman" });
    expect(withOverride.gender).toBe("woman");
  });

  // P6: invalid stored values (incomeBand "huge", applyMode 3 — cast) → omitted from the output and listed as unanswered.
  it("P6: invalid stored values are omitted from answers and listed in unanswered", () => {
    const p: any = {
      version: 1,
      eligibility: {
        incomeBand: { value: "huge", enteredBy: "entrepreneur", updatedAt: NOW },
        applyMode: { value: 3, enteredBy: "entrepreneur", updatedAt: NOW },
        backwardClass: { value: "yes", enteredBy: "entrepreneur", updatedAt: NOW },
      },
    };
    const answers = buildEligibilityAnswers(p);
    expect(answers.incomeBand).toBeUndefined();
    expect(answers.applyMode).toBeUndefined();
    expect(answers.backwardClass).toBe("yes");

    const unanswered = unansweredQuestions(p);
    expect(unanswered).toContain("incomeBand");
    expect(unanswered).toContain("applyMode");
    expect(unanswered).not.toContain("backwardClass");
  });

  // P7: output never has loanAmount and has no keys outside: gender, backwardClass, incomeBand, disability40, applyMode, loanRange.
  it("P7: output never contains loanAmount or unexpected keys", () => {
    const p: any = {
      version: 1,
      quickStart: {
        loanRange: { value: "1to5L" },
        loanAmount: 500000,
        pincode: { value: "413102" },
      },
      eligibility: {
        backwardClass: { value: "yes" },
        loanAmount: 400000,
        extraKey: "ignored",
      },
    };
    const answers: any = buildEligibilityAnswers(p);
    expect(answers.loanAmount).toBeUndefined();
    expect(answers.pincode).toBeUndefined();
    expect(answers.extraKey).toBeUndefined();

    const allowedKeys = new Set([
      "gender",
      "backwardClass",
      "incomeBand",
      "disability40",
      "applyMode",
      "loanRange",
    ]);
    for (const k of Object.keys(answers)) {
      expect(allowedKeys.has(k)).toBe(true);
    }
  });

  // P8: malformed profiles ("x", {}, {quickStart:{}}, {eligibility:"x"} — cast) → no throw for both functions.
  it("P8: malformed profiles do not throw for both functions", () => {
    const malformed = ["x" as any, {}, { quickStart: {} } as any, { eligibility: "x" } as any];
    for (const m of malformed) {
      expect(() => buildEligibilityAnswers(m)).not.toThrow();
      expect(() => unansweredQuestions(m)).not.toThrow();
    }
  });

  // P9: immutability and determinism of both functions.
  it("P9: immutability and determinism of both functions", () => {
    const p: UserProfile = {
      version: 1,
      eligibility: {
        backwardClass: { value: "yes", enteredBy: "entrepreneur", updatedAt: NOW },
      },
    };
    const snap = JSON.stringify(p);

    const a1 = buildEligibilityAnswers(p);
    const a2 = buildEligibilityAnswers(p);
    expect(a1).toEqual(a2);
    expect(JSON.stringify(p)).toBe(snap);

    const u1 = unansweredQuestions(p);
    const u2 = unansweredQuestions(p);
    expect(u1).toEqual(u2);
    expect(JSON.stringify(p)).toBe(snap);
  });

  // P10: evaluateEligibility(SAMPLE_ELIGIBILITY_ANSWERS): individual-loan eligible with rate.percent 8 and status "confirmed"; group-loan notEligible with a wrong_apply_mode reason; summary "someEligible".
  it("P10: SAMPLE_ELIGIBILITY_ANSWERS evaluates deterministically", () => {
    const res = evaluateEligibility(SAMPLE_ELIGIBILITY_ANSWERS);
    expect(res.summary).toBe("someEligible");

    const ind = res.schemes.find((s) => s.schemeId === "individual-loan")!;
    expect(ind.status).toBe("eligible");
    expect(ind.rate?.percent).toBe(8);
    expect(ind.rate?.status).toBe("confirmed");

    const group = res.schemes.find((s) => s.schemeId === "group-loan")!;
    expect(group.status).toBe("notEligible");
    expect(group.reasons.some((r) => r.code === "wrong_apply_mode")).toBe(true);
  });

  // P11: integration: take mergeEligibility(null, { applicantGender:"woman", backwardClass:"yes", incomeBand:"upTo3L", disability40:"no", applyMode:"alone" }, "entrepreneur", NOW), pass it through buildEligibilityAnswers, then evaluateEligibility → individual-loan status "eligible" with a note code "loan_amount_decides" (no loanRange stored).
  it("P11: full pipeline integration from merge to answers to evaluation", () => {
    const profile = mergeEligibility(
      null,
      {
        applicantGender: "woman",
        backwardClass: "yes",
        incomeBand: "upTo3L",
        disability40: "no",
        applyMode: "alone",
      },
      "entrepreneur",
      NOW
    );

    const answers = buildEligibilityAnswers(profile);
    expect(answers.loanRange).toBeUndefined();

    const evalRes = evaluateEligibility(answers);
    const ind = evalRes.schemes.find((s) => s.schemeId === "individual-loan")!;
    expect(ind.status).toBe("eligible");
    expect(ind.notes.some((n) => n.code === "loan_amount_decides")).toBe(true);
  });
});
