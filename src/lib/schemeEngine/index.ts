// ============================================================================
// DYNAMIS Module 2 — Scheme Engine Public API
// ============================================================================
// Barrel file: re-exports everything a consumer needs from a single import.
//
// Usage:
//   import { evaluateSchemeMatch, calculateEMI } from '@/lib/schemeEngine';
//   import type { ApplicantInput, SchemeMatchResult } from '@/lib/schemeEngine';
// ============================================================================

export { evaluateSchemeMatch, calculateEMI } from "./evaluateSchemeMatch";
export type { ApplicantInput, SchemeMatchResult, SchemeTierName } from "./types";
export {
  MICRO_FINANCE_CEILING,
  TERM_LOAN_CEILING,
  MARGIN_MONEY_PERCENT,
  BANK_LOAN_PERCENT,
  INCOME_CEILING_ANNUAL,
  INTEREST_RATE_PERCENT,
  DEFAULT_TENURE_MONTHS,
} from "./constants";
