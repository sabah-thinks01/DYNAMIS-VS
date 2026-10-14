import { describe, it, expect } from "vitest";
import {
  sortAuditEntries,
  formatAuditDateTime,
  validateApplicantHistory,
} from "./audit";
import { mockApplicants } from "@/lib/mockData/mockApplicants";
import type { Applicant, AuditEntry } from "@/types";

describe("audit helpers", () => {
  describe("formatAuditDateTime", () => {
    it("formats ISO timestamps in en-IN and Asia/Kolkata timezone deterministically", () => {
      // 10:30 UTC is 16:00 IST (4:00 pm)
      const formatted1 = formatAuditDateTime("2026-08-15T10:30:00Z");
      // Match regardless of narrow no-break space or standard space between time and am/pm
      expect(formatted1).toMatch(/^15\sAug\s2026,\s4:00\s[pP][mM]$/);

      // 03:45 UTC is 09:15 IST (9:15 am)
      const formatted2 = formatAuditDateTime("2026-09-01T03:45:00Z");
      expect(formatted2).toMatch(/^1\sSept?\s2026,\s9:15\s[aA][mM]$/);
    });
  });

  describe("sortAuditEntries", () => {
    it("sorts entries newest first (descending by timestamp)", () => {
      const unsorted: AuditEntry[] = [
        {
          id: "1",
          at: "2026-08-15T10:00:00Z",
          actor: { name: "Pooja", role: "applicant" },
          action: "submitted",
          detail: "Submitted",
        },
        {
          id: "3",
          at: "2026-08-20T10:00:00Z",
          actor: { name: "Officer", role: "officer" },
          action: "noteAdded",
          detail: "Note",
        },
        {
          id: "2",
          at: "2026-08-18T10:00:00Z",
          actor: { name: "Officer", role: "officer" },
          action: "documentsChecked",
          detail: "Docs",
        },
      ];

      const sorted = sortAuditEntries(unsorted);
      expect(sorted.map((e) => e.id)).toEqual(["3", "2", "1"]);
    });

    it("handles empty arrays and single items without error", () => {
      expect(sortAuditEntries([])).toEqual([]);
      const single: AuditEntry[] = [
        {
          id: "1",
          at: "2026-08-15T10:00:00Z",
          actor: { name: "Pooja", role: "applicant" },
          action: "submitted",
          detail: "Submitted",
        },
      ];
      expect(sortAuditEntries(single)).toEqual(single);
    });
  });

  describe("validateApplicantHistory", () => {
    it("validates all mock applicants in the dataset without any issues", () => {
      expect(mockApplicants.length).toBeGreaterThan(0);
      for (const app of mockApplicants) {
        const result = validateApplicantHistory(app);
        expect(result.isValid).toBe(true);
        expect(result.issues).toEqual([]);
      }
    });

    it("confirms APP-904 is approved+high-risk with riskFlagged, officer noteAdded, and latest statusChanged to approved", () => {
      const app904 = mockApplicants.find((a) => a.id === "APP-904");
      expect(app904).toBeDefined();
      expect(app904?.status).toBe("approved");
      expect(app904?.riskLevel).toBe("high");
      expect(app904?.approvedRiskReason).toBeDefined();

      const history = app904?.history || [];
      const hasRiskFlagged = history.some((e) => e.action === "riskFlagged");
      const hasOfficerNote = history.some(
        (e) => e.action === "noteAdded" && e.actor.role === "officer"
      );
      const latestStatusChange = history.find((e) => e.action === "statusChanged");

      expect(hasRiskFlagged).toBe(true);
      expect(hasOfficerNote).toBe(true);
      expect(latestStatusChange?.toStatus).toBe("approved");

      const validation = validateApplicantHistory(app904!);
      expect(validation.isValid).toBe(true);
    });

    it("flags error if entries are not sorted newest first", () => {
      const invalidApp: Applicant = {
        id: "TEST-01",
        name: "Test",
        businessType: "Retail",
        viabilityScore: 70,
        schemeTier: "Individual Loan Scheme",
        status: "pending",
        riskLevel: "low",
        submittedDate: "2026-09-01",
        projectCost: 100000,
        history: [
          {
            id: "1",
            at: "2026-09-01T10:00:00Z", // older
            actor: { name: "Test", role: "applicant" },
            action: "submitted",
            detail: "Submitted",
          },
          {
            id: "2",
            at: "2026-09-02T10:00:00Z", // newer placed after older
            actor: { name: "Officer", role: "officer" },
            action: "documentsChecked",
            detail: "Checked",
          },
        ],
      };

      const result = validateApplicantHistory(invalidApp);
      expect(result.isValid).toBe(false);
      expect(result.issues.some((i) => i.includes("not sorted newest first"))).toBe(true);
    });

    it("flags error if latest statusChanged toStatus does not match applicant status", () => {
      const invalidApp: Applicant = {
        id: "TEST-02",
        name: "Test",
        businessType: "Retail",
        viabilityScore: 70,
        schemeTier: "Individual Loan Scheme",
        status: "approved",
        riskLevel: "low",
        submittedDate: "2026-09-01",
        projectCost: 100000,
        history: [
          {
            id: "2",
            at: "2026-09-02T10:00:00Z",
            actor: { name: "Officer", role: "officer" },
            action: "statusChanged",
            fromStatus: "pending",
            toStatus: "needs_review", // Mismatch with status: "approved"
            detail: "Under review",
          },
          {
            id: "1",
            at: "2026-09-01T10:00:00Z",
            actor: { name: "Test", role: "applicant" },
            action: "submitted",
            detail: "Submitted",
          },
        ],
      };

      const result = validateApplicantHistory(invalidApp);
      expect(result.isValid).toBe(false);
      expect(result.issues.some((i) => i.includes("does not match applicant status"))).toBe(true);
    });

    it("flags error if applicant has no statusChanged entry but status is not pending", () => {
      const invalidApp: Applicant = {
        id: "TEST-03",
        name: "Test",
        businessType: "Retail",
        viabilityScore: 70,
        schemeTier: "Individual Loan Scheme",
        status: "approved", // No statusChanged but status is approved
        riskLevel: "low",
        submittedDate: "2026-09-01",
        projectCost: 100000,
        history: [
          {
            id: "2",
            at: "2026-09-02T10:00:00Z",
            actor: { name: "Officer", role: "officer" },
            action: "documentsChecked",
            detail: "Checked",
          },
          {
            id: "1",
            at: "2026-09-01T10:00:00Z",
            actor: { name: "Test", role: "applicant" },
            action: "submitted",
            detail: "Submitted",
          },
        ],
      };

      const result = validateApplicantHistory(invalidApp);
      expect(result.isValid).toBe(false);
      expect(result.issues.some((i) => i.includes('expected "pending"'))).toBe(true);
    });

    it("flags error if applicant has more than one submitted entry or submitted is not the earliest", () => {
      const invalidApp: Applicant = {
        id: "TEST-04",
        name: "Test",
        businessType: "Retail",
        viabilityScore: 70,
        schemeTier: "Individual Loan Scheme",
        status: "pending",
        riskLevel: "low",
        submittedDate: "2026-09-01",
        projectCost: 100000,
        history: [
          {
            id: "2",
            at: "2026-09-02T10:00:00Z",
            actor: { name: "Test", role: "applicant" },
            action: "submitted", // Duplicate submitted
            detail: "Submitted again",
          },
          {
            id: "1",
            at: "2026-09-01T10:00:00Z",
            actor: { name: "Test", role: "applicant" },
            action: "submitted",
            detail: "Submitted",
          },
        ],
      };

      const result = validateApplicantHistory(invalidApp);
      expect(result.isValid).toBe(false);
      expect(result.issues.some((i) => i.includes("exactly one \"submitted\" entry"))).toBe(true);
    });

    it("flags error if approved high-risk applicant lacks riskFlagged or officer noteAdded", () => {
      const missingRiskFlag: Applicant = {
        id: "TEST-05",
        name: "Test",
        businessType: "Retail",
        viabilityScore: 50,
        schemeTier: "Individual Loan Scheme",
        status: "approved",
        riskLevel: "high",
        submittedDate: "2026-09-01",
        projectCost: 100000,
        history: [
          {
            id: "3",
            at: "2026-09-03T10:00:00Z",
            actor: { name: "Officer", role: "officer" },
            action: "statusChanged",
            fromStatus: "pending",
            toStatus: "approved",
            detail: "Approved",
          },
          {
            id: "2",
            at: "2026-09-02T10:00:00Z",
            actor: { name: "Officer", role: "officer" },
            action: "noteAdded",
            detail: "Officer note",
          },
          {
            id: "1",
            at: "2026-09-01T10:00:00Z",
            actor: { name: "Test", role: "applicant" },
            action: "submitted",
            detail: "Submitted",
          },
        ],
      };

      const result = validateApplicantHistory(missingRiskFlag);
      expect(result.isValid).toBe(false);
      expect(result.issues.some((i) => i.includes('missing a "riskFlagged"'))).toBe(true);
    });
  });
});
