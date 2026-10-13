import { SCHEME_RULES } from "./schemeRules";
import type { SchemeRule } from "./types";

export function getMaxLoanCap(rules: SchemeRule[] = SCHEME_RULES): number {
  if (!Array.isArray(rules)) {
    return 0;
  }

  let max = 0;
  for (const rule of rules) {
    if (rule !== null && typeof rule === "object") {
      const cap = (rule as { maxLoan?: unknown }).maxLoan;
      if (typeof cap === "number" && Number.isFinite(cap) && cap > 0) {
        if (cap > max) {
          max = cap;
        }
      }
    }
  }

  return max;
}
