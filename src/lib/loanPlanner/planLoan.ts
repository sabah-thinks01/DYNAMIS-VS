// ============================================================================
// DYNAMIS — Pure Loan Repayment Planner Engine
// ============================================================================
// Pure, deterministic calculator with cautious repayment assumptions.
// Policy values come strictly from SchemeResult / SCHEME_RULES.
// Framework-agnostic: no React, no DOM, no side effects.
// ============================================================================

import type { SchemeResult } from "@/lib/eligibility/types";

export type PlanLoanStatus = "ok" | "noCost" | "overLimit" | "rateUnknown";

export interface PlanLoanInput {
  scheme: SchemeResult;
  totalCost: number;
}

export type PlanLoanResult =
  | {
      status: "noCost";
    }
  | {
      status: "overLimit";
      maxLoan: number;
    }
  | {
      status: "rateUnknown";
      totalCost: number;
      loanPart?: number;
      ownShare?: number;
      nbcfdcPercent?: number;
      otherPercent?: number;
    }
  | {
      status: "ok";
      totalCost: number;
      loanPart: number;
      ownShare: number;
      nbcfdcPercent: number;
      otherPercent: number;
      annualRate: number;
      years: number;
      moratoriumMonths: number;
      n: number;
      quarterly: number;
      roughMonthly: number;
      totalRepaid: number;
      totalInterest: number;
      rebateNote?: string;
    };

export function planLoan(input: PlanLoanInput): PlanLoanResult {
  const { scheme, totalCost } = input;

  // 1. Guard against invalid or zero/negative cost
  if (typeof totalCost !== "number" || !isFinite(totalCost) || totalCost <= 0) {
    return { status: "noCost" };
  }

  // 2. Guard against project cost exceeding maximum loan allowed by scheme
  if (totalCost > scheme.maxLoan) {
    return { status: "overLimit", maxLoan: scheme.maxLoan };
  }

  // 3. Inspect split percentages
  const nbcfdcPercent = scheme.split?.nbcfdcPercent;
  const otherPercent = scheme.split?.otherPercent;
  const hasSplit =
    typeof nbcfdcPercent === "number" &&
    typeof otherPercent === "number" &&
    isFinite(nbcfdcPercent) &&
    isFinite(otherPercent);

  const loanPart = hasSplit ? Math.round((totalCost * nbcfdcPercent) / 100) : undefined;
  const ownShare = hasSplit && loanPart !== undefined ? totalCost - loanPart : undefined;

  // 4. Inspect rate and repayment schedule
  const annualRate = scheme.rate?.percent;
  const isRateConfirmed = scheme.rate?.status === "confirmed";
  const years = scheme.repayment?.years;
  const moratoriumMonths = scheme.repayment?.moratoriumMonths;

  if (
    !hasSplit ||
    loanPart === undefined ||
    ownShare === undefined ||
    typeof annualRate !== "number" ||
    !isFinite(annualRate) ||
    !isRateConfirmed ||
    typeof years !== "number" ||
    !isFinite(years) ||
    years <= 0 ||
    typeof moratoriumMonths !== "number" ||
    !isFinite(moratoriumMonths)
  ) {
    return {
      status: "rateUnknown",
      totalCost,
      loanPart,
      ownShare,
      nbcfdcPercent: hasSplit ? nbcfdcPercent : undefined,
      otherPercent: hasSplit ? otherPercent : undefined,
    };
  }

  // 5. Quarterly repayment, cautious assumptions:
  // r = quarterly rate
  const r = annualRate / 4 / 100;
  const quartersTotal = years * 4;
  const graceQuarters = moratoriumMonths / 3;
  const n = quartersTotal - graceQuarters; // free months inside the years

  if (n <= 0) {
    return {
      status: "rateUnknown",
      totalCost,
      loanPart,
      ownShare,
      nbcfdcPercent,
      otherPercent,
    };
  }

  // Interest keeps adding during the free months:
  const principalAfterGrace = loanPart * Math.pow(1 + r, graceQuarters);

  // Amortization formula for quarterly instalment:
  const quarterly = Math.ceil((principalAfterGrace * r) / (1 - Math.pow(1 + r, -n)));
  const roughMonthly = Math.ceil(quarterly / 3);
  const totalRepaid = quarterly * n;
  const totalInterest = totalRepaid - loanPart;

  return {
    status: "ok",
    totalCost,
    loanPart,
    ownShare,
    nbcfdcPercent,
    otherPercent,
    annualRate,
    years,
    moratoriumMonths,
    n,
    quarterly,
    roughMonthly,
    totalRepaid,
    totalInterest,
    rebateNote: scheme.rebateNote,
  };
}
