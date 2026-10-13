import type { SchemeResult, OverallResult, MissingKey } from "./types";

export interface GroupedSchemes {
  eligible: SchemeResult[];
  needsInfo: SchemeResult[];
  notEligible: SchemeResult[];
}

export function groupSchemes(overall: OverallResult | null | undefined): GroupedSchemes {
  const result: GroupedSchemes = {
    eligible: [],
    needsInfo: [],
    notEligible: [],
  };

  if (!overall || typeof overall !== "object" || !Array.isArray(overall.schemes)) {
    return result;
  }

  for (const s of overall.schemes) {
    if (s !== null && typeof s === "object") {
      if (s.status === "eligible") {
        result.eligible.push(s);
      } else if (s.status === "needsInfo") {
        result.needsInfo.push(s);
      } else if (s.status === "notEligible") {
        result.notEligible.push(s);
      }
    }
  }

  return result;
}

export const MISSING_LABELS: Record<MissingKey, string> = {
  backwardClass: "If you are from a backward class",
  gender: "Who the loan will be in the name of",
  incomeBand: "How much your family earns in a year",
  applyMode: "Whether you apply alone or in a group",
};

export function missingLabel(key: unknown): string {
  if (typeof key === "string" && key in MISSING_LABELS) {
    return MISSING_LABELS[key as MissingKey];
  }
  return "";
}

export function rateLabel(s: SchemeResult | null | undefined): string {
  if (s && s.rate && typeof s.rate.text === "string" && s.rate.text.length > 0) {
    return s.rate.text;
  }
  return "";
}
