import type { Gender, BackwardClassAnswer, IncomeBand, YesNo, ApplyMode } from "@/lib/eligibility/types";

export type EnteredBy = "entrepreneur" | "officer" | "sample";

export interface Answer<T> {
  value: T;
  enteredBy: EnteredBy;
  updatedAt: string; // ISO 8601 string
}

export type BusinessType =
  | "farmSupplies"
  | "dairyAnimals"
  | "foodMaking"
  | "tailoring"
  | "smallShop"
  | "repairServices"
  | "other";

export type BusinessStage = "new" | "running";

export type LoanRange =
  | "under1L"
  | "1to5L"
  | "5to15L"
  | "above15L"
  | "notSure";

export interface QuickStartData {
  pincode: Answer<string>;
  businessType: Answer<BusinessType>;
  businessTypeOther?: Answer<string>; // Only when businessType.value === "other"
  stage: Answer<BusinessStage>;
  loanRange: Answer<LoanRange>;
  completedAt: string; // ISO 8601 string
}

export interface EligibilityData {
  applicantGender?: Answer<Gender>;
  backwardClass?: Answer<BackwardClassAnswer>;
  incomeBand?: Answer<IncomeBand>;
  disability40?: Answer<YesNo>;
  applyMode?: Answer<ApplyMode>;
}

export interface EligibilityInput {
  applicantGender?: Gender;
  backwardClass?: BackwardClassAnswer;
  incomeBand?: IncomeBand;
  disability40?: YesNo;
  applyMode?: ApplyMode;
}

export interface UserProfile {
  version: 1;
  quickStart?: QuickStartData;
  eligibility?: EligibilityData;
}
