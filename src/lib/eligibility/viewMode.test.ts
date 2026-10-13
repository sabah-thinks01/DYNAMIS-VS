import { describe, it, expect } from "vitest";
import { decideSchemeMatchView } from "./viewMode";
import type { UserProfile } from "@/lib/profile/types";

describe("decideSchemeMatchView", () => {
  const SAMPLE = "413102";

  const realProfile: UserProfile = {
    version: 1,
    quickStart: {
      pincode: { value: "411001", enteredBy: "entrepreneur", updatedAt: "2026-10-14T00:00:00.000Z" },
      businessType: { value: "dairyAnimals", enteredBy: "entrepreneur", updatedAt: "2026-10-14T00:00:00.000Z" },
      stage: { value: "running", enteredBy: "entrepreneur", updatedAt: "2026-10-14T00:00:00.000Z" },
      loanRange: { value: "5to15L", enteredBy: "entrepreneur", updatedAt: "2026-10-14T00:00:00.000Z" },
      completedAt: "2026-10-14T00:00:00.000Z",
    },
  };

  it("V1 profileReady false -> skeleton for: entrepreneur+real profile, officer+real profile, entrepreneur+null profile, role x", () => {
    expect(decideSchemeMatchView({ profileReady: false, role: "entrepreneur", profile: realProfile, samplePincode: SAMPLE })).toBe("skeleton");
    expect(decideSchemeMatchView({ profileReady: false, role: "officer", profile: realProfile, samplePincode: SAMPLE })).toBe("skeleton");
    expect(decideSchemeMatchView({ profileReady: false, role: "entrepreneur", profile: null, samplePincode: SAMPLE })).toBe("skeleton");
    expect(decideSchemeMatchView({ profileReady: false, role: "x", profile: realProfile, samplePincode: SAMPLE })).toBe("skeleton");
  });

  it("V2 officer + real profile, ready -> sample", () => {
    expect(decideSchemeMatchView({ profileReady: true, role: "officer", profile: realProfile, samplePincode: SAMPLE })).toBe("sample");
  });

  it("V3 entrepreneur, ready, profile null / undefined / {} / { version:1 } / { quickStart: {} } -> sample for each", () => {
    expect(decideSchemeMatchView({ profileReady: true, role: "entrepreneur", profile: null, samplePincode: SAMPLE })).toBe("sample");
    expect(decideSchemeMatchView({ profileReady: true, role: "entrepreneur", profile: undefined, samplePincode: SAMPLE })).toBe("sample");
    expect(decideSchemeMatchView({ profileReady: true, role: "entrepreneur", profile: {} as any, samplePincode: SAMPLE })).toBe("sample");
    expect(decideSchemeMatchView({ profileReady: true, role: "entrepreneur", profile: { version: 1 } as any, samplePincode: SAMPLE })).toBe("sample");
    expect(decideSchemeMatchView({ profileReady: true, role: "entrepreneur", profile: { quickStart: {} } as any, samplePincode: SAMPLE })).toBe("sample");
  });

  it("V4 entrepreneur + quickStart pincode 413102 -> sample", () => {
    const sampleProfile: UserProfile = {
      ...realProfile,
      quickStart: {
        ...realProfile.quickStart!,
        pincode: { value: SAMPLE, enteredBy: "entrepreneur", updatedAt: "2026-10-14T00:00:00.000Z" },
      },
    };
    expect(decideSchemeMatchView({ profileReady: true, role: "entrepreneur", profile: sampleProfile, samplePincode: SAMPLE })).toBe("sample");
  });

  it("V5 entrepreneur + quickStart pincode 411001 -> real", () => {
    expect(decideSchemeMatchView({ profileReady: true, role: "entrepreneur", profile: realProfile, samplePincode: SAMPLE })).toBe("real");
  });

  it("V6 role admin, empty, undefined, 5 with ready true and a real profile -> sample", () => {
    expect(decideSchemeMatchView({ profileReady: true, role: "admin", profile: realProfile, samplePincode: SAMPLE })).toBe("sample");
    expect(decideSchemeMatchView({ profileReady: true, role: "", profile: realProfile, samplePincode: SAMPLE })).toBe("sample");
    expect(decideSchemeMatchView({ profileReady: true, role: undefined as any, profile: realProfile, samplePincode: SAMPLE })).toBe("sample");
    expect(decideSchemeMatchView({ profileReady: true, role: 5 as any, profile: realProfile, samplePincode: SAMPLE })).toBe("sample");
  });

  it("V7 input null / undefined / x / 5 -> skeleton, no throw. profile x with ready true and role entrepreneur -> sample", () => {
    expect(decideSchemeMatchView(null as any)).toBe("skeleton");
    expect(decideSchemeMatchView(undefined as any)).toBe("skeleton");
    expect(decideSchemeMatchView("x" as any)).toBe("skeleton");
    expect(decideSchemeMatchView(5 as any)).toBe("skeleton");
    expect(decideSchemeMatchView({ profileReady: true, role: "entrepreneur", profile: "x" as any, samplePincode: SAMPLE })).toBe("sample");
  });

  it("V8 immutability (JSON snapshot of input unchanged) and determinism (two calls equal)", () => {
    const input = { profileReady: true, role: "entrepreneur", profile: realProfile, samplePincode: SAMPLE };
    const snapshotBefore = JSON.stringify(input);
    const res1 = decideSchemeMatchView(input);
    const res2 = decideSchemeMatchView(input);
    expect(JSON.stringify(input)).toBe(snapshotBefore);
    expect(res1).toBe(res2);
  });

  it("V9 entrepreneur + quickStart present but pincode is a plain string 413102 or null -> real, no throw", () => {
    const profileStringPincode = {
      version: 1,
      quickStart: {
        ...realProfile.quickStart!,
        pincode: "413102" as any,
      },
    };
    const profileNullPincode = {
      version: 1,
      quickStart: {
        ...realProfile.quickStart!,
        pincode: null as any,
      },
    };
    expect(decideSchemeMatchView({ profileReady: true, role: "entrepreneur", profile: profileStringPincode as any, samplePincode: SAMPLE })).toBe("real");
    expect(decideSchemeMatchView({ profileReady: true, role: "entrepreneur", profile: profileNullPincode as any, samplePincode: SAMPLE })).toBe("real");
  });
});
