import React from "react";
import { OfficerStats } from "@/types";

interface Props {
  stats: OfficerStats;
}

export function OfficerStatSummary({ stats }: Props) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {/* Pending Review */}
      <div className="app-card rounded-2xl p-5 border border-border-default/80 shadow-md">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted uppercase tracking-wider">
            Pending Review
          </span>
          <span className="w-8 h-8 rounded-full bg-[var(--status-warning-bg)] text-[var(--status-warning)] flex items-center justify-center border border-[var(--status-warning-border)]">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </span>
        </div>
        <p className="text-3xl font-semibold text-main mt-2">{stats.totalPending}</p>
        <p className="text-xs text-[var(--status-warning)] font-medium mt-1">Requires immediate action</p>
      </div>

      {/* Approved This Quarter */}
      <div className="app-card rounded-2xl p-5 border border-border-default/80 shadow-md">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted uppercase tracking-wider">
            Approved (Qtr)
          </span>
          <span className="w-8 h-8 rounded-full bg-[var(--status-good-bg)] text-[var(--status-good)] flex items-center justify-center border border-[var(--status-good-border)]">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </span>
        </div>
        <p className="text-3xl font-semibold text-main mt-2">{stats.approvedThisQuarter}</p>
        <p className="text-xs font-medium mt-1 text-[var(--status-good)]">+12% vs last quarter</p>
      </div>

      {/* Flagged High Risk */}
      <div className="app-card rounded-2xl p-5 border border-border-default/80 shadow-md">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted uppercase tracking-wider">
            High Risk Flags
          </span>
          <span className="w-8 h-8 rounded-full bg-[var(--status-error-bg)] text-[var(--status-error)] flex items-center justify-center border border-[var(--status-error-border)]">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </span>
        </div>
        <p className="text-3xl font-semibold text-main mt-2">{stats.highRiskCount}</p>
        <p className="text-xs text-muted mt-1">Pending deeper diligence</p>
      </div>

      {/* Funds Disbursed */}
      <div className="app-card rounded-2xl p-5 border border-border-default/80 shadow-md">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted uppercase tracking-wider">
            Funds Disbursed
          </span>
          <span className="w-8 h-8 rounded-full bg-surface-subtle text-muted flex items-center justify-center border border-border-default">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </span>
        </div>
        <p className="text-3xl font-semibold text-main mt-2">
          ₹{(stats.totalDisbursedAmount / 100000).toFixed(1)}L
        </p>
        <p className="text-xs text-muted mt-1">Total to Date</p>
      </div>
    </div>
  );
}
