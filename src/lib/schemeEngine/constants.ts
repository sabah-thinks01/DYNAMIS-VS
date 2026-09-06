// ============================================================================
// DYNAMIS Module 2 — Named Rule Constants
// ============================================================================
// Every numeric threshold, rate, and ceiling used by the scheme engine is
// declared here as a named, exported constant. This is the SINGLE source of
// truth for auditing and correcting policy parameters.
//
// Constants are grouped by rule domain. Each placeholder that has NOT yet been
// confirmed against current NBCFDC scheme documentation is marked with a
// TODO: CONFIRM comment.
// ============================================================================

// ---------------------------------------------------------------------------
// 1. SCHEME TIER THRESHOLDS (by project cost)
//    Source: NBCFDC scheme guidelines — these thresholds ARE confirmed.
// ---------------------------------------------------------------------------

/** Maximum project cost eligible for the Micro Finance Scheme (inclusive). */
export const MICRO_FINANCE_CEILING = 140_000; // ₹1,40,000

/** Maximum project cost eligible for the Term Loan Scheme (inclusive). */
export const TERM_LOAN_CEILING = 5_000_000; // ₹50,00,000

// ---------------------------------------------------------------------------
// 2. CAPITAL SPLIT — confirmed two-way model
// ---------------------------------------------------------------------------

/** Entrepreneur's own contribution as a percentage of project cost. */
export const MARGIN_MONEY_PERCENT = 10; // Confirmed: 10%

/** SCA / Bank term loan as a percentage of project cost. */
export const BANK_LOAN_PERCENT = 90; // Confirmed: 90%

// ---------------------------------------------------------------------------
// 3. INCOME ELIGIBILITY
// ---------------------------------------------------------------------------

/**
 * Maximum annual family income for NBCFDC scheme eligibility (in INR).
 *
 * TODO: CONFIRM against current NBCFDC scheme guidelines before this goes
 * live. The ₹3,00,000 figure is a commonly cited rural OBC ceiling but may
 * vary by category or have been revised.
 */
export const INCOME_CEILING_ANNUAL = 300_000; // ₹3,00,000

// ---------------------------------------------------------------------------
// 4. INTEREST RATE
// ---------------------------------------------------------------------------

/**
 * Concessional annual interest rate applied to the bank loan component (%).
 *
 * TODO: CONFIRM against current NBCFDC scheme rate. May vary by scheme tier
 * (Micro Finance vs Term Loan) or by applicant category.
 */
export const INTEREST_RATE_PERCENT = 6; // 6% p.a.

// ---------------------------------------------------------------------------
// 5. LOAN TENURE
// ---------------------------------------------------------------------------

/**
 * Default repayment tenure in months.
 *
 * TODO: CONFIRM against actual NBCFDC scheme terms. Micro Finance may have
 * shorter tenures (e.g. 36 months); Term Loan may allow up to 120 months.
 * Currently defaulted to 60 months (5 years).
 */
export const DEFAULT_TENURE_MONTHS = 60;
