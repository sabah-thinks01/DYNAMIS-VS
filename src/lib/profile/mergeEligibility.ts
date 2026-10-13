import type {
  UserProfile,
  EligibilityInput,
  EligibilityData,
  EnteredBy,
  Answer,
} from "./types";
import type {
  Gender,
  BackwardClassAnswer,
  IncomeBand,
  YesNo,
  ApplyMode,
} from "@/lib/eligibility/types";

const ALLOWED_APPLICANT_GENDER: readonly Gender[] = [
  "woman",
  "man",
  "preferNotToSay",
];
const ALLOWED_BACKWARD_CLASS: readonly BackwardClassAnswer[] = [
  "yes",
  "no",
  "notSure",
];
const ALLOWED_INCOME_BAND: readonly IncomeBand[] = [
  "upTo3L",
  "3to5L",
  "above5L",
  "notSure",
];
const ALLOWED_DISABILITY40: readonly YesNo[] = [
  "yes",
  "no",
  "preferNotToSay",
];
const ALLOWED_APPLY_MODE: readonly ApplyMode[] = [
  "alone",
  "shg",
];

function isPlainObject(val: unknown): val is Record<string, unknown> {
  return typeof val === "object" && val !== null && !Array.isArray(val);
}

export function mergeEligibility(
  profile: UserProfile | null | undefined,
  data: EligibilityInput | null | undefined,
  enteredBy: EnteredBy,
  now: string
): UserProfile {
  const base: Record<string, unknown> =
    isPlainObject(profile) ? { ...profile } : {};

  const existingEligibility: Record<string, unknown> =
    isPlainObject(base.eligibility) ? { ...base.eligibility } : {};

  const mergedEligibility: EligibilityData = {
    ...(existingEligibility as EligibilityData),
  };

  const isDataObj = isPlainObject(data);

  // 1. applicantGender
  if (isDataObj && ALLOWED_APPLICANT_GENDER.includes(data.applicantGender as Gender)) {
    const val = data.applicantGender as Gender;
    const existingEntry = mergedEligibility.applicantGender;
    if (!existingEntry || existingEntry.value !== val) {
      mergedEligibility.applicantGender = {
        value: val,
        enteredBy,
        updatedAt: now,
      };
    }
  }

  // 2. backwardClass
  if (isDataObj && ALLOWED_BACKWARD_CLASS.includes(data.backwardClass as BackwardClassAnswer)) {
    const val = data.backwardClass as BackwardClassAnswer;
    const existingEntry = mergedEligibility.backwardClass;
    if (!existingEntry || existingEntry.value !== val) {
      mergedEligibility.backwardClass = {
        value: val,
        enteredBy,
        updatedAt: now,
      };
    }
  }

  // 3. incomeBand
  if (isDataObj && ALLOWED_INCOME_BAND.includes(data.incomeBand as IncomeBand)) {
    const val = data.incomeBand as IncomeBand;
    const existingEntry = mergedEligibility.incomeBand;
    if (!existingEntry || existingEntry.value !== val) {
      mergedEligibility.incomeBand = {
        value: val,
        enteredBy,
        updatedAt: now,
      };
    }
  }

  // 4. disability40
  if (isDataObj && ALLOWED_DISABILITY40.includes(data.disability40 as YesNo)) {
    const val = data.disability40 as YesNo;
    const existingEntry = mergedEligibility.disability40;
    if (!existingEntry || existingEntry.value !== val) {
      mergedEligibility.disability40 = {
        value: val,
        enteredBy,
        updatedAt: now,
      };
    }
  }

  // 5. applyMode
  if (isDataObj && ALLOWED_APPLY_MODE.includes(data.applyMode as ApplyMode)) {
    const val = data.applyMode as ApplyMode;
    const existingEntry = mergedEligibility.applyMode;
    if (!existingEntry || existingEntry.value !== val) {
      mergedEligibility.applyMode = {
        value: val,
        enteredBy,
        updatedAt: now,
      };
    }
  }

  const result: UserProfile = {
    ...(base as unknown as UserProfile),
    version: 1,
  };

  const hasAnyAnswer = Object.keys(mergedEligibility).length > 0;
  if (hasAnyAnswer) {
    result.eligibility = mergedEligibility;
  } else {
    delete result.eligibility;
  }

  return result;
}
