// ============================================================================
// DYNAMIS — NBCFDC Eligibility Engine Types
// ============================================================================
// Pure TypeScript types for deterministic eligibility evaluation.
// Framework-agnostic: no React, no DOM, no external dependencies.
// ============================================================================

export type IncomeBand = "upTo3L" | "3to5L" | "above5L" | "notSure";

export type Gender = "woman" | "man" | "preferNotToSay";

export type YesNo = "yes" | "no" | "preferNotToSay";

export type BackwardClassAnswer = "yes" | "no" | "notSure";

export type ApplyMode = "alone" | "shg";

export type LoanRangeKey =
  | "under1L"
  | "1to5L"
  | "5to15L"
  | "above15L"
  | "notSure";

export interface EligibilityAnswers {
  backwardClass?: BackwardClassAnswer;
  incomeBand?: IncomeBand;
  gender?: Gender;
  disability40?: YesNo;
  applyMode?: ApplyMode;
  loanAmount?: number;
  loanRange?: LoanRangeKey;
}

export type Status = "eligible" | "notEligible" | "needsInfo";

export type MissingKey =
  | "backwardClass"
  | "incomeBand"
  | "gender"
  | "applyMode";

export interface Message {
  code: string;
  text: string;
}

export interface SchemeResult {
  schemeId: string;
  schemeName: string;
  status: Status;
  reasons: Message[]; // why notEligible (all definite failures)
  missing: MissingKey[]; // what is needed when status is needsInfo
  notes: Message[]; // non-blocking info
  maxLoan: number;
  split?: {
    nbcfdcPercent: number | null;
    otherPercent: number | null;
    text: string;
  }; // only when eligible
  rate?: {
    percent: number | null;
    status: "confirmed" | "toConfirm";
    text: string;
  }; // only when eligible
  sourceUrl: string;
  lastVerified: string;
}

export interface OverallResult {
  schemes: SchemeResult[];
  eligibleIds: string[];
  summary: "someEligible" | "needMoreInfo" | "noneEligible";
}

export interface RateSlab {
  upTo: number | null;
  percent: number;
  status: "confirmed" | "toConfirm";
}

export interface SchemeRule {
  id: string;
  name: string;
  mode: "individual" | "shg";
  womenOnly: boolean;
  incomeLimit: number;
  incomeLimitStatus: "confirmed" | "toConfirm";
  maxLoan: number;
  split: {
    nbcfdcPercent: number | null;
    otherPercent: number | null;
    text: string;
  };
  baseRate: {
    slabs: RateSlab[];
  };
  disabilityConcessionPercent: number;
  extraNote?: string;
  sourceUrl: string;
  lastVerified: string;
}
