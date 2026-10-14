"use client";

import React, { useEffect, useRef } from "react";
import { X, Calendar, MapPin, Briefcase, FileText, History } from "lucide-react";
import type { Applicant, AuditAction, AuditActorRole } from "@/types";
import { evaluateEligibility } from "@/lib/eligibility/evaluateEligibility";
import type { SchemeResult } from "@/lib/eligibility/types";
import { planLoan } from "@/lib/loanPlanner/planLoan";
import { formatINR, formatLakh } from "@/lib/format";
import { SchemeResultCard } from "@/components/entrepreneur/SchemeResultCard";
import { SampleDataTag } from "@/components/shared/SampleDataTag";
import { GuideNote } from "@/components/shared/GuideNote";
import { StatusBadge, RiskBadge } from "./ApplicantTable";
import { sortAuditEntries, formatAuditDateTime } from "@/lib/officer/audit";

interface ApplicationDetailsPanelProps {
  applicant: Applicant;
  onClose: () => void;
}

const ACTION_LABELS: Record<AuditAction, string> = {
  submitted: "Application Submitted",
  documentsChecked: "Documents Verified",
  noteAdded: "Officer Note",
  statusChanged: "Status Updated",
  riskFlagged: "Risk Flagged",
};

const ROLE_LABELS: Record<AuditActorRole, string> = {
  applicant: "Applicant",
  officer: "Officer",
  system: "System",
};

const GENDER_LABELS: Record<string, string> = {
  woman: "Woman",
  man: "Man",
  preferNotToSay: "Prefer not to say",
};

const BC_LABELS: Record<string, string> = {
  yes: "Yes, from a backward class",
  no: "No",
  notSure: "Not sure",
};

const INCOME_LABELS: Record<string, string> = {
  upTo3L: "Up to ₹3 lakh a year",
  "3to5L": "₹3 – 5 lakh a year",
  above5L: "Above ₹5 lakh a year",
  notSure: "Not sure",
};

const DISABILITY_LABELS: Record<string, string> = {
  yes: "Yes (40% or more)",
  no: "No",
  preferNotToSay: "Prefer not to say",
};

const MODE_LABELS: Record<string, string> = {
  alone: "Applying alone (Individual)",
  shg: "Applying with a Self-Help Group (SHG)",
};

export function ApplicationDetailsPanel({
  applicant,
  onClose,
}: ApplicationDetailsPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // 1. Trap / Focus on open
  useEffect(() => {
    closeButtonRef.current?.focus();
  }, []);

  // 2. Prevent body scrolling while open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  // 3. Escape key to close
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // 4. Scheme check evaluation
  const answers = applicant.eligibilityAnswers || {};
  const eligibilityResult = evaluateEligibility({
    ...answers,
    loanAmount: applicant.projectCost,
  });

  const eligibleSchemes = eligibilityResult.schemes.filter((s) => s.status === "eligible");
  const needsInfoSchemes = eligibilityResult.schemes.filter((s) => s.status === "needsInfo");
  const notEligibleSchemes = eligibilityResult.schemes.filter((s) => s.status === "notEligible");

  // Audit history entries sorted newest first
  const historyEntries = sortAuditEntries(applicant.history || []);

  // 5. Loan Plan calculation (Change 5)
  // Use first eligible scheme. If none, check if any scheme is eligible when evaluated at its maxLoan.
  let loanPlanNode: React.ReactNode = null;

  if (eligibleSchemes.length > 0) {
    const firstEligible = eligibleSchemes[0];
    const plan = planLoan({ scheme: firstEligible, totalCost: applicant.projectCost });

    if (plan.status === "ok") {
      loanPlanNode = (
        <div className="p-4 sm:p-5 rounded-2xl bg-surface-subtle border border-border-default space-y-3">
          <div className="flex items-center justify-between border-b border-border-default/60 pb-2.5">
            <span className="text-xs font-bold text-main">{firstEligible.schemeName}</span>
            <span className="text-xs font-semibold text-accent">
              {plan.annualRate}% a year
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-2.5 rounded-lg bg-surface border border-border-default">
              <span className="text-muted block">Loan amount ({plan.nbcfdcPercent}%)</span>
              <span className="font-bold text-main text-sm">{formatINR(plan.loanPart)}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-surface border border-border-default">
              <span className="text-muted block">Own share ({plan.otherPercent}%)</span>
              <span className="font-bold text-main text-sm">Up to {formatINR(plan.ownShare)}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-accent-subtle/30 border border-accent/20 space-y-1">
            <span className="text-xs text-muted block">Quarterly payment</span>
            <span className="text-xl font-black text-accent tracking-tight">
              About {formatINR(plan.quarterly)} every 3 months
            </span>
            <span className="text-xs text-muted block pt-0.5">
              For about {plan.years} years. (No repayment for the first {plan.moratoriumMonths} months).
            </span>
          </div>

          <p className="text-xs text-muted pt-1">
            Total repayment: <strong className="text-main">{formatINR(plan.totalRepaid)}</strong> (includes {formatINR(plan.totalInterest)} interest).
          </p>
        </div>
      );
    } else if (plan.status === "overLimit") {
      loanPlanNode = (
        <div className="p-4 rounded-xl bg-status-warning-bg border border-status-warning-border text-xs sm:text-sm text-main">
          This is more than this loan allows ({formatLakh(plan.maxLoan)}).
        </div>
      );
    }
  } else {
    // Check if any scheme is eligible when re-evaluated at its maxLoan
    let overLimitScheme: SchemeResult | null = null;
    for (const s of eligibilityResult.schemes) {
      if (applicant.projectCost > s.maxLoan) {
        const resAtCap = evaluateEligibility({
          ...answers,
          loanAmount: s.maxLoan,
        });
        const atCap = resAtCap.schemes.find((item) => item.schemeId === s.schemeId);
        if (atCap && atCap.status === "eligible") {
          overLimitScheme = s;
          break;
        }
      }
    }

    if (overLimitScheme) {
      loanPlanNode = (
        <div className="p-4 rounded-xl bg-status-warning-bg border border-status-warning-border text-xs sm:text-sm text-main">
          This is more than this loan allows ({formatLakh(overLimitScheme.maxLoan)}).
        </div>
      );
    } else {
      loanPlanNode = (
        <div className="p-4 rounded-xl bg-surface-subtle border border-border-default text-xs sm:text-sm text-muted">
          No loan plan for this application.
        </div>
      );
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      {/* Dark backdrop overlay */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer / Full-screen Sheet */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="applicant-panel-title"
        className="relative z-[70] w-full md:max-w-2xl bg-surface border-l border-border-default shadow-2xl flex flex-col h-full overflow-hidden animate-in slide-in-from-right duration-200"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-border-default flex items-center justify-between gap-3 bg-surface sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <div>
              <div className="flex items-center gap-2">
                <h2 id="applicant-panel-title" className="text-base sm:text-lg font-bold text-main">
                  Application Details
                </h2>
                <SampleDataTag variant="sample" />
              </div>
              <p className="text-xs text-muted">ID: {applicant.id}</p>
            </div>
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close application details"
            className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-muted hover:text-main hover:bg-surface-subtle transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* 1. Applicant Overview */}
          <div className="p-4 sm:p-5 rounded-2xl bg-surface-subtle border border-border-default space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border-default/60 pb-3">
              <div>
                <h3 className="text-lg font-black text-main">{applicant.name}</h3>
                <div className="flex items-center gap-2 text-xs text-muted mt-0.5">
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>{applicant.businessType}</span>
                </div>
              </div>
              <div className="text-left sm:text-right">
                <span className="text-xs text-muted block">Project Cost</span>
                <span className="text-base font-extrabold text-main">
                  {formatINR(applicant.projectCost)}
                </span>
              </div>
            </div>

            <div className="space-y-3 pt-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <StatusBadge status={applicant.status} />
                <RiskBadge risk={applicant.riskLevel} />
              </div>

              {applicant.status === "approved" && applicant.riskLevel === "high" && applicant.approvedRiskReason && (
                <p className="text-xs text-muted leading-relaxed">
                  {applicant.approvedRiskReason}
                </p>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs pt-1 border-t border-border-default/40">
                <div>
                  <span className="text-muted block">Viability Score</span>
                  <span className="font-semibold text-main">{applicant.viabilityScore} / 100</span>
                </div>
                {applicant.pincode && (
                  <div className="flex items-center gap-1.5 text-muted">
                    <MapPin className="w-3.5 h-3.5 text-muted shrink-0" />
                    <span>Pincode: <strong className="text-main">{applicant.pincode}</strong></span>
                  </div>
                )}
                <div className="flex items-center gap-1.5 text-muted">
                  <Calendar className="w-3.5 h-3.5 text-muted shrink-0" />
                  <span>Submitted: <strong className="text-main">{applicant.submittedDate}</strong></span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Their Answers */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-main uppercase tracking-wider text-muted flex items-center gap-1.5">
              <FileText className="w-4 h-4" />
              <span>Their Answers</span>
            </h3>

            <div className="p-4 rounded-xl border border-border-default bg-surface space-y-2.5 text-xs">
              <div className="flex flex-col sm:flex-row sm:justify-between py-1 border-b border-border-default/40 gap-1">
                <span className="text-muted">Applicant Gender:</span>
                <span className="font-semibold text-main">
                  {applicant.eligibilityAnswers?.gender ? GENDER_LABELS[applicant.eligibilityAnswers.gender] || applicant.eligibilityAnswers.gender : "Not answered"}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between py-1 border-b border-border-default/40 gap-1">
                <span className="text-muted">Backward Class (OBC):</span>
                <span className="font-semibold text-main">
                  {applicant.eligibilityAnswers?.backwardClass ? BC_LABELS[applicant.eligibilityAnswers.backwardClass] || applicant.eligibilityAnswers.backwardClass : "Not answered"}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between py-1 border-b border-border-default/40 gap-1">
                <span className="text-muted">Family Annual Income:</span>
                <span className="font-semibold text-main">
                  {applicant.eligibilityAnswers?.incomeBand ? INCOME_LABELS[applicant.eligibilityAnswers.incomeBand] || applicant.eligibilityAnswers.incomeBand : "Not answered"}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between py-1 border-b border-border-default/40 gap-1">
                <span className="text-muted">Disability (40% or more):</span>
                <span className="font-semibold text-main">
                  {applicant.eligibilityAnswers?.disability40 ? DISABILITY_LABELS[applicant.eligibilityAnswers.disability40] || applicant.eligibilityAnswers.disability40 : "Not answered"}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between py-1 gap-1">
                <span className="text-muted">How they apply:</span>
                <span className="font-semibold text-main">
                  {applicant.eligibilityAnswers?.applyMode ? MODE_LABELS[applicant.eligibilityAnswers.applyMode] || applicant.eligibilityAnswers.applyMode : "Not answered"}
                </span>
              </div>
            </div>
          </div>

          {/* 3. Scheme Check */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-main uppercase tracking-wider text-muted">
              Scheme Check
            </h3>

            {eligibleSchemes.length > 0 && (
              <div className="space-y-3">
                {eligibleSchemes.map((s) => (
                  <SchemeResultCard key={s.schemeId} scheme={s} variant="eligible" />
                ))}
              </div>
            )}

            {needsInfoSchemes.length > 0 && (
              <div className="space-y-3">
                {needsInfoSchemes.map((s) => (
                  <SchemeResultCard key={s.schemeId} scheme={s} variant="needsInfo" />
                ))}
              </div>
            )}

            {notEligibleSchemes.length > 0 && (
              <div className="p-4 rounded-xl border border-border-default bg-surface space-y-3">
                <span className="text-xs font-bold text-muted uppercase tracking-wider">
                  Schemes that do not match
                </span>
                <div className="space-y-3">
                  {notEligibleSchemes.map((s) => (
                    <div key={s.schemeId} className="space-y-1">
                      <h4 className="text-xs font-bold text-main">{s.schemeName}</h4>
                      <ul className="space-y-0.5">
                        {s.reasons.map((r, i) => (
                          <li key={i} className="text-xs text-muted list-disc list-inside leading-relaxed">
                            {r.text}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 4. Loan Plan */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-main uppercase tracking-wider text-muted">
              Loan Plan
            </h3>
            {loanPlanNode}
          </div>

          {/* 5. History */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-main uppercase tracking-wider text-muted flex items-center gap-1.5">
              <History className="w-4 h-4" />
              <span>History</span>
            </h3>

            <div className="p-4 sm:p-5 rounded-2xl border border-border-default bg-surface space-y-4">
              {historyEntries.length === 0 ? (
                <p className="text-xs text-muted">No history recorded.</p>
              ) : (
                <ol className="relative border-l border-border-default ml-2 sm:ml-3 space-y-4">
                  {historyEntries.map((entry) => (
                    <li key={entry.id} className="ml-4 space-y-1">
                      <span className="absolute -left-1.5 mt-1.5 w-3 h-3 rounded-full border border-border-default bg-surface-subtle" />
                      <div className="flex flex-wrap items-center justify-between gap-1 text-xs">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-main">
                            {ACTION_LABELS[entry.action] || entry.action}
                          </span>
                          <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-surface-subtle text-muted border border-border-default">
                            {entry.actor.name} ({ROLE_LABELS[entry.actor.role] || entry.actor.role})
                          </span>
                        </div>
                        <time className="text-[11px] text-muted">
                          {formatAuditDateTime(entry.at)}
                        </time>
                      </div>

                      {entry.action === "statusChanged" && entry.fromStatus && entry.toStatus && (
                        <p className="text-xs font-semibold text-main">
                          Status: <span className="capitalize">{entry.fromStatus.replace("_", " ")}</span> → <span className="capitalize">{entry.toStatus.replace("_", " ")}</span>
                        </p>
                      )}

                      <p className="text-xs text-muted leading-relaxed">
                        {entry.detail}
                      </p>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </div>

          {/* 6. Guide Note */}
          <GuideNote />
        </div>
      </div>
    </div>
  );
}
