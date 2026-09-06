// ============================================================================
// DYNAMIS Module 2 — Scheme Engine Types
// ============================================================================
// Framework-agnostic TypeScript types for the deterministic scheme router.
// These are the canonical shapes for the engine's input and output.
// They are intentionally decoupled from the UI-layer types in @/types/index.ts
// so this module can be lifted into a backend service (e.g. FastAPI) unchanged.
// ============================================================================

/**
 * Input collected from the applicant form.
 */
export interface ApplicantInput {
  annualFamilyIncome: number; // in INR
  category: 'SC' | 'ST' | 'OBC' | 'Minority' | 'General';
  projectCost: number; // in INR
  state: string;
}

/**
 * Scheme tier names as returned by the engine.
 */
export type SchemeTierName = 'Micro Finance Scheme' | 'Term Loan Scheme';

/**
 * Full result of a scheme evaluation.
 *
 * When `eligible` is false, only `ineligibilityReason` is populated.
 * When `eligible` is true, all financial fields are populated.
 */
export interface SchemeMatchResult {
  eligible: boolean;
  ineligibilityReason?: string;

  // --- Populated only when eligible ---
  schemeName?: SchemeTierName;
  marginMoney?: number;
  loanAmount?: number;
  interestRatePercent?: number;
  tenureMonths?: number;
  monthlyEMI?: number;
  totalInterestPayable?: number;
  totalRepayment?: number;
}
