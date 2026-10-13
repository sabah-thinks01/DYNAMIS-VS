// ============================================================================
// DYNAMIS — NBCFDC Deterministic Eligibility Evaluation Function
// ============================================================================
// Pure, synchronous, side-effect-free function.
// Evaluates an applicant's answers against NBCFDC scheme rules.
// Framework-agnostic: no React, no DOM, no external dependencies.
// ============================================================================

import {
  EligibilityAnswers,
  IncomeBand,
  Gender,
  YesNo,
  BackwardClassAnswer,
  ApplyMode,
  LoanRangeKey,
  Message,
  MissingKey,
  OverallResult,
  RateSlab,
  SchemeResult,
  SchemeRule,
  Status,
} from "./types";
import { SCHEME_RULES } from "./schemeRules";
import { formatLakh } from "@/lib/format";

// Valid enum sets for defensive parsing of untrusted inputs
const VALID_BACKWARD_CLASS: Set<string> = new Set<BackwardClassAnswer>(["yes", "no", "notSure"]);
const VALID_INCOME_BAND: Set<string> = new Set<IncomeBand>(["upTo3L", "3to5L", "above5L", "notSure"]);
const VALID_GENDER: Set<string> = new Set<Gender>(["woman", "man", "preferNotToSay"]);
const VALID_DISABILITY: Set<string> = new Set<YesNo>(["yes", "no", "preferNotToSay"]);
const VALID_APPLY_MODE: Set<string> = new Set<ApplyMode>(["alone", "shg"]);
const VALID_LOAN_RANGE: Set<string> = new Set<LoanRangeKey>([
  "under1L",
  "1to5L",
  "5to15L",
  "above15L",
  "notSure",
]);

interface BandBounds {
  min: number;
  max: number;
}

const INCOME_BANDS: Record<"upTo3L" | "3to5L" | "above5L", BandBounds> = {
  upTo3L: { min: 0, max: 300_000 },
  "3to5L": { min: 300_001, max: 500_000 },
  above5L: { min: 500_001, max: Infinity },
};

const LOAN_RANGE_BANDS: Record<
  "under1L" | "1to5L" | "5to15L" | "above15L",
  BandBounds
> = {
  under1L: { min: 0, max: 100_000 },
  "1to5L": { min: 100_000, max: 500_000 },
  "5to15L": { min: 500_000, max: 1_500_000 },
  above15L: { min: 1_500_000, max: Infinity },
};

function formatLakhAmount(n: number): string {
  if (!isFinite(n)) return "₹0";
  if (Math.abs(n) >= 100_000) {
    const inLakhs = n / 100_000;
    const formatted = inLakhs.toFixed(2).replace(/\.?0+$/, "");
    return `₹${formatted} lakh`;
  }
  return formatLakh(n);
}

function formatRepaymentText(
  years: number,
  moratoriumMonths: number,
  extraNote?: string
): string {
  const prefix = extraNote
    ? `Repay over about ${years} years (${extraNote}).`
    : `Repay over about ${years} years.`;
  const morText =
    moratoriumMonths > 0
      ? ` No repayment for the first ${moratoriumMonths} months.`
      : "";
  return `${prefix}${morText} Your state agency sets the exact schedule.`;
}

function pickRateAndRepayment(
  scheme: SchemeRule,
  validLoanAmount: number | undefined,
  loanRange: LoanRangeKey | undefined
): {
  rate: {
    percent: number | null;
    status: "confirmed" | "toConfirm";
    text: string;
  };
  repayment: {
    years: number;
    moratoriumMonths: number;
    text: string;
  };
} {
  // Case a) validLoanAmount is defined
  if (validLoanAmount !== undefined) {
    let selectedSlab: RateSlab =
      scheme.baseRate.slabs[scheme.baseRate.slabs.length - 1];
    for (const slab of scheme.baseRate.slabs) {
      if (slab.upTo !== null && validLoanAmount <= slab.upTo) {
        selectedSlab = slab;
        break;
      }
    }

    const rate =
      selectedSlab.status === "toConfirm"
        ? {
            percent: null,
            status: "toConfirm" as const,
            text: "Interest rate for this loan size is not confirmed yet — your state agency will tell you.",
          }
        : {
            percent: selectedSlab.percent,
            status: "confirmed" as const,
            text: `${selectedSlab.percent}% a year`,
          };

    const repayment = {
      years: selectedSlab.repaymentYears,
      moratoriumMonths: scheme.moratoriumMonths,
      text: formatRepaymentText(
        selectedSlab.repaymentYears,
        scheme.moratoriumMonths
      ),
    };

    return { rate, repayment };
  }

  // Case b) No valid amount AND loanRange is one of under1L / 1to5L / 5to15L / above15L
  if (loanRange && loanRange !== "notSure") {
    const band = LOAN_RANGE_BANDS[loanRange];
    const overlappingSlabs: RateSlab[] = [];

    let prevUpTo = 0;
    for (const slab of scheme.baseRate.slabs) {
      const slabMax = slab.upTo ?? Infinity;
      if (band.max > prevUpTo && band.min < slabMax) {
        overlappingSlabs.push(slab);
      }
      prevUpTo = slab.upTo ?? Infinity;
    }

    if (overlappingSlabs.length === 1) {
      const slab = overlappingSlabs[0];
      const rate =
        slab.status === "toConfirm"
          ? {
              percent: null,
              status: "toConfirm" as const,
              text: "Interest rate for this loan size is not confirmed yet — your state agency will tell you.",
            }
          : {
              percent: slab.percent,
              status: "confirmed" as const,
              text: `${slab.percent}% a year`,
            };

      const repayment = {
        years: slab.repaymentYears,
        moratoriumMonths: scheme.moratoriumMonths,
        text: formatRepaymentText(
          slab.repaymentYears,
          scheme.moratoriumMonths
        ),
      };

      return { rate, repayment };
    }

    if (overlappingSlabs.length > 1) {
      const firstSlab = overlappingSlabs[0];
      const hasUnconfirmed = overlappingSlabs.some((s) => s.status === "toConfirm");

      if (hasUnconfirmed) {
        const rate =
          firstSlab.status === "toConfirm"
            ? {
                percent: null,
                status: "toConfirm" as const,
                text: "Interest rate for this loan size is not confirmed yet — your state agency will tell you.",
              }
            : {
                percent: null,
                status: "toConfirm" as const,
                text: `${firstSlab.percent}% a year for loans up to ${formatLakhAmount(
                  firstSlab.upTo ?? 0
                )}. Above that the rate is not confirmed yet — your state agency will tell you.`,
              };

        const repayment = {
          years: firstSlab.repaymentYears,
          moratoriumMonths: scheme.moratoriumMonths,
          text: formatRepaymentText(
            firstSlab.repaymentYears,
            scheme.moratoriumMonths
          ),
        };

        return { rate, repayment };
      }

      // All overlapping slabs are confirmed (e.g. NBCFDC Individual Loan: 7% up to 1.25L, 8% above)
      const chosenSlab = overlappingSlabs[overlappingSlabs.length - 1];
      const firstUpToText = formatLakhAmount(firstSlab.upTo ?? 0);

      const rate = {
        percent: chosenSlab.percent,
        status: "confirmed" as const,
        text: `${chosenSlab.percent}% a year (${firstSlab.percent}% for loans up to ${firstUpToText})`,
      };

      const repayment = {
        years: chosenSlab.repaymentYears,
        moratoriumMonths: scheme.moratoriumMonths,
        text: formatRepaymentText(
          chosenSlab.repaymentYears,
          scheme.moratoriumMonths,
          `${firstSlab.repaymentYears} years for loans up to ${firstUpToText}`
        ),
      };

      return { rate, repayment };
    }
  }

  // Case c) No valid amount AND (loanRange undefined or "notSure")
  const firstSlab = scheme.baseRate.slabs[0];
  let slabLimitText = "";
  if (firstSlab.upTo !== null && scheme.baseRate.slabs.length > 1) {
    slabLimitText = ` for loans up to ${formatLakhAmount(firstSlab.upTo)}`;
  }

  const rate =
    firstSlab.status === "toConfirm"
      ? {
          percent: null,
          status: "toConfirm" as const,
          text: "Interest rate for this loan size is not confirmed yet — your state agency will tell you.",
        }
      : {
          percent: firstSlab.percent,
          status: firstSlab.status,
          text: `${firstSlab.percent}% a year${slabLimitText}`,
        };

  const repExtra =
    firstSlab.upTo !== null && scheme.baseRate.slabs.length > 1
      ? `for loans up to ${formatLakhAmount(firstSlab.upTo)}`
      : undefined;

  const repayment = {
    years: firstSlab.repaymentYears,
    moratoriumMonths: scheme.moratoriumMonths,
    text: formatRepaymentText(
      firstSlab.repaymentYears,
      scheme.moratoriumMonths,
      repExtra
    ),
  };

  return { rate, repayment };
}

export function evaluateEligibility(
  answers: EligibilityAnswers = {},
  rules: SchemeRule[] = SCHEME_RULES
): OverallResult {
  // Fix 3: Robustness: if answers is null, undefined, or not an object, treat as {}
  const safeAnswers: EligibilityAnswers =
    typeof answers === "object" && answers !== null ? answers : {};

  // Defensive validation of input: treat any unknown string/value as undefined without mutating input
  const backwardClass: BackwardClassAnswer | undefined =
    safeAnswers.backwardClass && VALID_BACKWARD_CLASS.has(safeAnswers.backwardClass)
      ? safeAnswers.backwardClass
      : undefined;

  const incomeBand: IncomeBand | undefined =
    safeAnswers.incomeBand && VALID_INCOME_BAND.has(safeAnswers.incomeBand)
      ? safeAnswers.incomeBand
      : undefined;

  const gender: Gender | undefined =
    safeAnswers.gender && VALID_GENDER.has(safeAnswers.gender)
      ? safeAnswers.gender
      : undefined;

  const disability40: YesNo | undefined =
    safeAnswers.disability40 && VALID_DISABILITY.has(safeAnswers.disability40)
      ? safeAnswers.disability40
      : undefined;

  const applyMode: ApplyMode | undefined =
    safeAnswers.applyMode && VALID_APPLY_MODE.has(safeAnswers.applyMode)
      ? safeAnswers.applyMode
      : undefined;

  // Use loanAmount if it is a finite number > 0; otherwise ignore as if not given
  const validLoanAmount: number | undefined =
    typeof safeAnswers.loanAmount === "number" &&
    isFinite(safeAnswers.loanAmount) &&
    safeAnswers.loanAmount > 0
      ? safeAnswers.loanAmount
      : undefined;

  const loanRange: LoanRangeKey | undefined =
    safeAnswers.loanRange && VALID_LOAN_RANGE.has(safeAnswers.loanRange)
      ? safeAnswers.loanRange
      : undefined;

  const schemeResults: SchemeResult[] = rules.map((scheme) => {
    const reasons: Message[] = [];
    const missing: MissingKey[] = [];
    const notes: Message[] = [];

    // a) Backward class check
    if (backwardClass === "no") {
      reasons.push({
        code: "not_backward_class",
        text: "These loans are for people from backward classes notified by the Central or State Government.",
      });
    } else if (backwardClass === "notSure" || backwardClass === undefined) {
      missing.push("backwardClass");
    }

    // b) Women-only check
    if (scheme.womenOnly) {
      if (gender === "man") {
        reasons.push({
          code: "women_only",
          text: "This loan is only for women.",
        });
      } else if (gender === "preferNotToSay" || gender === undefined) {
        missing.push("gender");
      }
    }

    // c) Apply mode check
    if (applyMode === undefined) {
      missing.push("applyMode");
    } else {
      if (scheme.mode === "individual" && applyMode === "shg") {
        reasons.push({
          code: "wrong_apply_mode",
          text: "This loan is for one person applying alone.",
        });
      } else if (scheme.mode === "shg" && applyMode === "alone") {
        reasons.push({
          code: "wrong_apply_mode",
          text: "This loan is given through self-help groups.",
        });
      }
    }

    // d) Income band check
    if (incomeBand === "notSure" || incomeBand === undefined) {
      missing.push("incomeBand");
    } else {
      const band = INCOME_BANDS[incomeBand];
      if (band.max <= scheme.incomeLimit) {
        // passes
      } else if (band.min > scheme.incomeLimit) {
        reasons.push({
          code: "income_above_limit",
          text: `Your family income is above the limit for this loan (${formatLakh(scheme.incomeLimit)} a year).`,
        });
      } else {
        // straddles the limit
        missing.push("incomeBand");
      }
    }

    // e) Loan size check
    if (validLoanAmount !== undefined) {
      if (validLoanAmount > scheme.maxLoan) {
        reasons.push({
          code: "loan_above_cap",
          text: `The amount you need is more than this loan gives (up to ${formatLakh(scheme.maxLoan)}).`,
        });
      }
    } else if (loanRange && loanRange !== "notSure") {
      const rBand = LOAN_RANGE_BANDS[loanRange];
      if (rBand.max <= scheme.maxLoan) {
        // fits silently
      } else if (rBand.min > scheme.maxLoan) {
        reasons.push({
          code: "loan_above_cap",
          text: `The amount you need is more than this loan gives (up to ${formatLakh(scheme.maxLoan)}).`,
        });
      } else {
        // straddles: NOT a failure; add note loan_amount_decides
        notes.push({
          code: "loan_amount_decides",
          text: `The exact amount you need decides this. This loan gives up to ${formatLakh(scheme.maxLoan)}.`,
        });
      }
    } else {
      // loanRange "notSure" or undefined with no amount
      notes.push({
        code: "loan_amount_decides",
        text: `The exact amount you need decides this. This loan gives up to ${formatLakh(scheme.maxLoan)}.`,
      });
    }

    // Determine status:
    // Any failure -> "notEligible" (even if other answers are missing)
    // Else any missing -> "needsInfo"
    // Else -> "eligible"
    let status: Status = "eligible";
    if (reasons.length > 0) {
      status = "notEligible";
    } else if (missing.length > 0) {
      status = "needsInfo";
    } else {
      status = "eligible";
    }

    // Add extraNote for eligible or needsInfo
    if ((status === "eligible" || status === "needsInfo") && scheme.extraNote) {
      notes.push({
        code: "scheme_note",
        text: scheme.extraNote,
      });
    }

    // Fix 2: Surface unconfirmed income limits
    if (scheme.incomeLimitStatus === "toConfirm") {
      const shouldAddIncomeUnconfirmedNote =
        status === "eligible" ||
        status === "needsInfo" ||
        (status === "notEligible" && reasons.some((r) => r.code === "income_above_limit"));

      if (shouldAddIncomeUnconfirmedNote) {
        notes.push({
          code: "income_limit_unconfirmed",
          text: "The family income limit for this loan is still being confirmed — your state agency will check it.",
        });
      }
    }

    const res: SchemeResult = {
      schemeId: scheme.id,
      schemeName: scheme.name,
      status,
      reasons,
      missing,
      notes,
      maxLoan: scheme.maxLoan,
      sourceUrl: scheme.sourceUrl,
      lastVerified: scheme.lastVerified,
    };

    // Populate split, rate, repayment, rebateNote ONLY when eligible
    if (status === "eligible") {
      res.split = {
        nbcfdcPercent: scheme.split.nbcfdcPercent,
        otherPercent: scheme.split.otherPercent,
        text: scheme.split.text,
      };

      const { rate, repayment } = pickRateAndRepayment(
        scheme,
        validLoanAmount,
        loanRange
      );
      res.rate = rate;
      res.repayment = repayment;

      if (scheme.rebateNote) {
        res.rebateNote = scheme.rebateNote;
        notes.push({
          code: "timely_payment_rebate",
          text: scheme.rebateNote,
        });
      }

      if (disability40 === "yes" && scheme.disabilityConcession) {
        notes.push({
          code: "disability_concession",
          text: scheme.disabilityConcession.note,
        });
      }
    }

    return res;
  });

  const eligibleIds: string[] = schemeResults
    .filter((s) => s.status === "eligible")
    .map((s) => s.schemeId);

  const hasAnyEligible = eligibleIds.length > 0;
  const hasAnyNeedsInfo = schemeResults.some((s) => s.status === "needsInfo");

  let summary: "someEligible" | "needMoreInfo" | "noneEligible";
  if (hasAnyEligible) {
    summary = "someEligible";
  } else if (hasAnyNeedsInfo) {
    summary = "needMoreInfo";
  } else {
    summary = "noneEligible";
  }

  return {
    schemes: schemeResults,
    eligibleIds,
    summary,
  };
}
