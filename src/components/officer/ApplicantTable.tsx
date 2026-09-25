import React from "react";
import { Applicant } from "@/types";

interface Props {
  applicants: Applicant[];
}

export function ApplicantTable({ applicants }: Props) {
  if (applicants.length === 0) {
    return (
      <div className="p-8 text-center text-muted text-sm">
        No applications match the current filters.
      </div>
    );
  }

  // Visual mapping for Status
  const statusBadge = (status: Applicant["status"]) => {
    switch (status) {
      case "approved":
        // Approved is a SEMANTIC status — always green, never role-tinted.
        // See globals.css: --status-good-* vs --accent-* distinction.
        return (
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-[var(--status-good-bg)] text-[var(--status-good)] border border-[var(--status-good-border)]">
            Approved
          </span>
        );
      case "needs_review":
        return <span className="status-pill warning px-2 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider">Needs Review</span>;
      case "pending":
        return <span className="bg-surface-subtle text-main border border-border-default px-2 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider">Pending</span>;
    }
  };

  // Visual mapping for Risk Level
  const riskBadge = (risk: Applicant["riskLevel"]) => {
    switch (risk) {
      case "low":
        // Low risk is a SEMANTIC status — always green, never role-tinted.
        return (
          <span className="font-semibold text-xs flex items-center gap-1.5 text-[var(--status-good)]">
            <span
              className="w-1.5 h-1.5 rounded-full bg-[var(--status-good)] shadow-[0_0_4px_var(--status-good-glow)]"
            />
            Low Risk
          </span>
        );
      case "medium":
        return <span className="text-[var(--status-warning)] font-semibold text-xs flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-[var(--status-warning)]" />Medium</span>;
      case "high":
        return <span className="text-[var(--status-error)] font-semibold text-xs flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-[var(--status-error)]" />High Risk</span>;
    }
  };

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-surface/60 border-b border-border-default text-xs uppercase tracking-widest text-muted">
            <th className="p-4 font-semibold">Applicant / Business</th>
            <th className="p-4 font-semibold">Requested Loan</th>
            <th className="p-4 font-semibold">Viability Score</th>
            <th className="p-4 font-semibold">Risk Level</th>
            <th className="p-4 font-semibold">Status</th>
            <th className="p-4 font-semibold text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border-default/60">
          {applicants.map((app) => (
            <tr key={app.id} className="hover:bg-surface-subtle/30 transition-colors">
              <td className="p-4">
                <p className="font-bold text-sm text-main">{app.name}</p>
                <p className="text-xs text-muted mt-0.5">{app.businessType}</p>
                <p className="text-xs text-muted mt-0.5">{app.schemeTier}</p>
              </td>
              <td className="p-4">
                <p className="font-semibold text-sm text-main">
                  ₹{(app.projectCost * 0.9).toLocaleString("en-IN")}
                </p>
                <p className="text-xs text-muted mt-0.5">Project: ₹{app.projectCost.toLocaleString("en-IN")}</p>
              </td>
              <td className="p-4">
                <div className="flex items-center space-x-2">
                  <span className={`text-sm font-bold ${
                    app.viabilityScore >= 75 ? "text-[var(--status-good)]" :
                    app.viabilityScore >= 50 ? "text-[var(--status-warning)]" : "text-[var(--status-error)]"
                  }`}>
                    {app.viabilityScore}/100
                  </span>
                </div>
              </td>
              <td className="p-4">
                {riskBadge(app.riskLevel)}
              </td>
              <td className="p-4">
                {statusBadge(app.status)}
              </td>
              <td className="p-4 text-right">
                <button className="min-h-[44px] px-4 py-2 bg-surface-subtle hover:bg-surface-hover text-main text-xs font-bold rounded-xl border border-border-default transition-colors whitespace-nowrap focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent">
                  Review Details
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
