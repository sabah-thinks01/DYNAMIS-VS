// ============================================================================
// DYNAMIS — Profile to Eligibility Answers Mapper
// ============================================================================
// Pure, synchronous, side-effect-free mapper.
// Framework-agnostic: no React, no DOM, no external dependencies.
// ============================================================================

import type { UserProfile } from "@/lib/profile/types";
import type {
  EligibilityAnswers,
  Gender,
  BackwardClassAnswer,
  IncomeBand,
  YesNo,
  ApplyMode,
  LoanRangeKey,
} from "./types";

export const QUESTION_KEYS = [
  "applicantGender",
  "backwardClass",
  "incomeBand",
  "disability40",
  "applyMode",
] as const;

export type EligibilityQuestionKey = (typeof QUESTION_KEYS)[number];

const VALID_GENDER: readonly Gender[] = ["woman", "man", "preferNotToSay"];
const VALID_BACKWARD_CLASS: readonly BackwardClassAnswer[] = ["yes", "no", "notSure"];
const VALID_INCOME_BAND: readonly IncomeBand[] = ["upTo3L", "3to5L", "above5L", "notSure"];
const VALID_DISABILITY40: readonly YesNo[] = ["yes", "no", "preferNotToSay"];
const VALID_APPLY_MODE: readonly ApplyMode[] = ["alone", "shg"];
const VALID_LOAN_RANGE: readonly LoanRangeKey[] = [
  "under1L",
  "1to5L",
  "5to15L",
  "above15L",
  "notSure",
];

function isPlainObject(val: unknown): val is Record<string, unknown> {
  return typeof val === "object" && val !== null && !Array.isArray(val);
}

export function buildEligibilityAnswers(
  profile: UserProfile | null | undefined,
  options?: { genderOverride?: Gender }
): EligibilityAnswers {
  const result: EligibilityAnswers = {};

  const profileObj = isPlainObject(profile) ? profile : undefined;
  const eligObj =
    profileObj && isPlainObject(profileObj.eligibility)
      ? profileObj.eligibility
      : undefined;
  const quickStartObj =
    profileObj && isPlainObject(profileObj.quickStart)
      ? profileObj.quickStart
      : undefined;

  // 1. Gender: valid options.genderOverride if given, else stored applicantGender value if valid
  if (
    options &&
    typeof options.genderOverride === "string" &&
    VALID_GENDER.includes(options.genderOverride)
  ) {
    result.gender = options.genderOverride;
  } else if (
    eligObj &&
    isPlainObject(eligObj.applicantGender) &&
    typeof eligObj.applicantGender.value === "string" &&
    VALID_GENDER.includes(eligObj.applicantGender.value as Gender)
  ) {
    result.gender = eligObj.applicantGender.value as Gender;
  }

  // 2. backwardClass
  if (
    eligObj &&
    isPlainObject(eligObj.backwardClass) &&
    typeof eligObj.backwardClass.value === "string" &&
    VALID_BACKWARD_CLASS.includes(eligObj.backwardClass.value as BackwardClassAnswer)
  ) {
    result.backwardClass = eligObj.backwardClass.value as BackwardClassAnswer;
  }

  // 3. incomeBand
  if (
    eligObj &&
    isPlainObject(eligObj.incomeBand) &&
    typeof eligObj.incomeBand.value === "string" &&
    VALID_INCOME_BAND.includes(eligObj.incomeBand.value as IncomeBand)
  ) {
    result.incomeBand = eligObj.incomeBand.value as IncomeBand;
  }

  // 4. disability40
  if (
    eligObj &&
    isPlainObject(eligObj.disability40) &&
    typeof eligObj.disability40.value === "string" &&
    VALID_DISABILITY40.includes(eligObj.disability40.value as YesNo)
  ) {
    result.disability40 = eligObj.disability40.value as YesNo;
  }

  // 5. applyMode
  if (
    eligObj &&
    isPlainObject(eligObj.applyMode) &&
    typeof eligObj.applyMode.value === "string" &&
    VALID_APPLY_MODE.includes(eligObj.applyMode.value as ApplyMode)
  ) {
    result.applyMode = eligObj.applyMode.value as ApplyMode;
  }

  // 6. loanRange from quickStart.loanRange.value if valid
  if (
    quickStartObj &&
    isPlainObject(quickStartObj.loanRange) &&
    typeof quickStartObj.loanRange.value === "string" &&
    VALID_LOAN_RANGE.includes(quickStartObj.loanRange.value as LoanRangeKey)
  ) {
    result.loanRange = quickStartObj.loanRange.value as LoanRangeKey;
  }

  return result;
}

export function unansweredQuestions(
  profile: UserProfile | null | undefined
): EligibilityQuestionKey[] {
  const result: EligibilityQuestionKey[] = [];

  const profileObj = isPlainObject(profile) ? profile : undefined;
  const eligObj =
    profileObj && isPlainObject(profileObj.eligibility)
      ? profileObj.eligibility
      : undefined;

  // applicantGender
  const hasGender =
    eligObj &&
    isPlainObject(eligObj.applicantGender) &&
    typeof eligObj.applicantGender.value === "string" &&
    VALID_GENDER.includes(eligObj.applicantGender.value as Gender);
  if (!hasGender) result.push("applicantGender");

  // backwardClass
  const hasBackwardClass =
    eligObj &&
    isPlainObject(eligObj.backwardClass) &&
    typeof eligObj.backwardClass.value === "string" &&
    VALID_BACKWARD_CLASS.includes(eligObj.backwardClass.value as BackwardClassAnswer);
  if (!hasBackwardClass) result.push("backwardClass");

  // incomeBand
  const hasIncomeBand =
    eligObj &&
    isPlainObject(eligObj.incomeBand) &&
    typeof eligObj.incomeBand.value === "string" &&
    VALID_INCOME_BAND.includes(eligObj.incomeBand.value as IncomeBand);
  if (!hasIncomeBand) result.push("incomeBand");

  // disability40
  const hasDisability =
    eligObj &&
    isPlainObject(eligObj.disability40) &&
    typeof eligObj.disability40.value === "string" &&
    VALID_DISABILITY40.includes(eligObj.disability40.value as YesNo);
  if (!hasDisability) result.push("disability40");

  // applyMode
  const hasApplyMode =
    eligObj &&
    isPlainObject(eligObj.applyMode) &&
    typeof eligObj.applyMode.value === "string" &&
    VALID_APPLY_MODE.includes(eligObj.applyMode.value as ApplyMode);
  if (!hasApplyMode) result.push("applyMode");

  return result;
}

export const SAMPLE_ELIGIBILITY_ANSWERS: EligibilityAnswers = {
  gender: "woman",
  backwardClass: "yes",
  incomeBand: "upTo3L",
  disability40: "no",
  applyMode: "alone",
  loanRange: "1to5L",
};
