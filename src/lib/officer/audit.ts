import type { Applicant, AuditEntry } from "@/types";

/**
 * Sorts audit entries newest first (descending by timestamp).
 */
export function sortAuditEntries(entries: AuditEntry[]): AuditEntry[] {
  return [...entries].sort(
    (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()
  );
}

/**
 * Formats an ISO datetime string into Indian Standard Time (IST) en-IN format.
 * Explicitly pins timeZone to "Asia/Kolkata" so output is deterministic across systems.
 */
export function formatAuditDateTime(isoString: string): string {
  const d = new Date(isoString);
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(d);
}

export interface HistoryValidationResult {
  isValid: boolean;
  issues: string[];
}

/**
 * Validates the audit history of an applicant against business rules:
 * 1. Entries are sorted newest first.
 * 2. If applicant has any statusChanged entry, the latest one's toStatus equals current status.
 * 3. If applicant has no statusChanged entry, its status must be "pending".
 * 4. Exactly one "submitted" entry exists and it is the earliest in the history.
 * 5. If applicant is approved + high risk, history has both a "riskFlagged" entry and an officer "noteAdded" entry.
 */
export function validateApplicantHistory(applicant: Applicant): HistoryValidationResult {
  const issues: string[] = [];
  const history = applicant.history;

  if (!history || history.length === 0) {
    issues.push(`Applicant ${applicant.id} has no audit history`);
    return { isValid: false, issues };
  }

  // Rule 1: Entries sorted newest first
  for (let i = 0; i < history.length - 1; i++) {
    const current = new Date(history[i].at).getTime();
    const next = new Date(history[i + 1].at).getTime();
    if (current < next) {
      issues.push(
        `History entries for ${applicant.id} are not sorted newest first at index ${i} (${history[i].at} is older than ${history[i + 1].at})`
      );
      break;
    }
  }

  // Rule 2 & 3: Latest statusChanged matches status; if none, status must be "pending"
  const statusChangedEntries = history.filter((e) => e.action === "statusChanged");
  if (statusChangedEntries.length > 0) {
    // Since entries are sorted newest first, the first statusChanged entry is the latest one
    const latestStatusChange = statusChangedEntries[0];
    if (latestStatusChange.toStatus !== applicant.status) {
      issues.push(
        `Latest statusChanged toStatus "${latestStatusChange.toStatus}" does not match applicant status "${applicant.status}" for ${applicant.id}`
      );
    }
  } else {
    if (applicant.status !== "pending") {
      issues.push(
        `Applicant ${applicant.id} has no statusChanged entry but status is "${applicant.status}" (expected "pending")`
      );
    }
  }

  // Rule 4: Exactly one "submitted" entry and it is the earliest
  const submittedEntries = history.filter((e) => e.action === "submitted");
  if (submittedEntries.length !== 1) {
    issues.push(
      `Applicant ${applicant.id} must have exactly one "submitted" entry, found ${submittedEntries.length}`
    );
  }

  // In newest-first order, the earliest entry is the last element
  const earliestEntry = history[history.length - 1];
  if (earliestEntry.action !== "submitted") {
    issues.push(
      `The earliest history entry for ${applicant.id} must have action "submitted", found "${earliestEntry.action}"`
    );
  }

  // Rule 5: Approved + High-Risk requires riskFlagged and officer noteAdded
  if (applicant.status === "approved" && applicant.riskLevel === "high") {
    const hasRiskFlagged = history.some((e) => e.action === "riskFlagged");
    if (!hasRiskFlagged) {
      issues.push(
        `Approved high-risk applicant ${applicant.id} is missing a "riskFlagged" history entry`
      );
    }

    const hasOfficerNote = history.some(
      (e) => e.action === "noteAdded" && e.actor.role === "officer"
    );
    if (!hasOfficerNote) {
      issues.push(
        `Approved high-risk applicant ${applicant.id} is missing an officer "noteAdded" history entry`
      );
    }
  }

  return {
    isValid: issues.length === 0,
    issues,
  };
}
