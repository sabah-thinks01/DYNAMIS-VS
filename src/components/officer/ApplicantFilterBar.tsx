import React from "react";
import { Applicant } from "@/types";

export interface FilterState {
  searchQuery: string;
  status: Applicant["status"] | "all";
  risk: Applicant["riskLevel"] | "all";
}

interface Props {
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
}

export function ApplicantFilterBar({ filters, onFilterChange }: Props) {
  const statuses: { label: string; value: FilterState["status"] }[] = [
    { label: "All Status", value: "all" },
    { label: "Pending", value: "pending" },
    { label: "Needs Review", value: "needs_review" },
    { label: "Approved", value: "approved" },
  ];

  const risks: { label: string; value: FilterState["risk"] }[] = [
    { label: "All Risks", value: "all" },
    { label: "Low", value: "low" },
    { label: "Medium", value: "medium" },
    { label: "High", value: "high" },
  ];

  return (
    <div className="p-4 bg-surface/40 flex flex-col md:flex-row md:items-center gap-4">
      {/* Search Input */}
      <div className="relative flex-1">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="w-4 h-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Search applicant or business name..."
          value={filters.searchQuery}
          onChange={(e) => onFilterChange({ ...filters, searchQuery: e.target.value })}
          className="w-full min-h-[44px] pl-10 pr-4 py-2 bg-surface border border-border-default/80 rounded-xl text-sm text-main placeholder-muted focus:ring-2 focus:ring-[var(--accent)]/50 focus:border-accent-strong focus:outline-none transition-colors"
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        {/* Status Toggle (Segmented Pill Pattern) */}
        <div className="flex items-center gap-1 bg-surface/90 border border-border-default/80 rounded-xl p-1 overflow-x-auto min-h-[44px]">
          {statuses.map((s) => (
            <button
              key={s.value}
              onClick={() => onFilterChange({ ...filters, status: s.value })}
              className={`px-4 py-2 min-h-[36px] text-xs font-semibold rounded-lg whitespace-nowrap transition-colors flex-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent ${
                filters.status === s.value
                  ? "bg-accent-strong text-white shadow-sm"
                  : "text-muted hover:text-main hover:bg-surface-subtle"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Risk Level Toggle (Segmented Pill Pattern) */}
        <div className="flex items-center gap-1 bg-surface/90 border border-border-default/80 rounded-xl p-1 overflow-x-auto min-h-[44px]">
          {risks.map((r) => (
            <button
              key={r.value}
              onClick={() => onFilterChange({ ...filters, risk: r.value })}
              className={`px-4 py-2 min-h-[36px] text-xs font-semibold rounded-lg whitespace-nowrap transition-colors flex-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent ${
                filters.risk === r.value
                  ? "bg-surface-hover text-main shadow-sm border border-border-strong"
                  : "text-muted hover:text-main hover:bg-surface-subtle"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
