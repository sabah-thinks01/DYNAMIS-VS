import React from "react";
import { Applicant } from "@/types";

interface Props {
  applicants: Applicant[];
}

export function ApplicantTable({ applicants }: Props) {
  if (applicants.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 text-sm">
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
          <span
            className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
            style={{
              color:           "var(--status-good)",
              backgroundColor: "var(--status-good-bg)",
              borderWidth:     "1px",
              borderStyle:     "solid",
              borderColor:     "var(--status-good-border)",
            }}
          >
            Approved
          </span>
        );
      case "needs_review":
        return <span className="bg-amber-950/50 text-amber-400 border border-amber-800/50 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">Needs Review</span>;
      case "pending":
        return <span className="bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">Pending</span>;
    }
  };

  // Visual mapping for Risk Level
  const riskBadge = (risk: Applicant["riskLevel"]) => {
    switch (risk) {
      case "low":
        // Low risk is a SEMANTIC status — always green, never role-tinted.
        return (
          <span className="font-semibold text-xs flex items-center gap-1.5" style={{ color: "var(--status-good)" }}>
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: "var(--status-good)", boxShadow: "0 0 4px var(--status-good-glow)" }}
            />
            Low Risk
          </span>
        );
      case "medium":
        return <span className="text-amber-400 font-semibold text-xs flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-amber-500" />Medium</span>;
      case "high":
        return <span className="text-rose-400 font-semibold text-xs flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-rose-500" />High Risk</span>;
    }
  };

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-900/60 border-b border-slate-800 text-[10px] uppercase tracking-widest text-slate-500">
            <th className="p-4 font-bold">Applicant / Business</th>
            <th className="p-4 font-bold">Requested Loan</th>
            <th className="p-4 font-bold">Viability Score</th>
            <th className="p-4 font-bold">Risk Level</th>
            <th className="p-4 font-bold">Status</th>
            <th className="p-4 font-bold text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60">
          {applicants.map((app) => (
            <tr key={app.id} className="hover:bg-slate-800/30 transition-colors">
              <td className="p-4">
                <p className="font-bold text-sm text-slate-200">{app.name}</p>
                <p className="text-xs text-slate-400 mt-0.5">{app.businessType}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">{app.schemeTier}</p>
              </td>
              <td className="p-4">
                <p className="font-semibold text-sm text-slate-200">
                  ₹{(app.projectCost * 0.9).toLocaleString("en-IN")}
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">Project: ₹{app.projectCost.toLocaleString("en-IN")}</p>
              </td>
              <td className="p-4">
                <div className="flex items-center space-x-2">
                  <span className={`text-sm font-extrabold ${
                    app.viabilityScore >= 75 ? "text-emerald-400" :
                    app.viabilityScore >= 50 ? "text-amber-400" : "text-rose-400"
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
                <button className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-lg border border-slate-700 transition-colors whitespace-nowrap">
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
