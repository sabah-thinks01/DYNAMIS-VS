import React from "react";
import { OfficerStats } from "@/types";

interface Props {
  stats: OfficerStats;
}

export function OfficerStatSummary({ stats }: Props) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {/* Pending Review */}
      <div className="glass-card rounded-2xl p-5 border border-slate-700/80 shadow-md">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Pending Review
          </span>
          <span className="w-8 h-8 rounded-full bg-amber-950/40 text-amber-500 flex items-center justify-center border border-amber-800/40">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </span>
        </div>
        <p className="text-2xl font-extrabold text-slate-100 mt-2">{stats.totalPending}</p>
        <p className="text-[10px] text-amber-400 font-medium mt-1">Requires immediate action</p>
      </div>

      {/* Approved This Quarter */}
      <div className="glass-card rounded-2xl p-5 border border-slate-700/80 shadow-md">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Approved (Qtr)
          </span>
          <span className="w-8 h-8 rounded-full bg-emerald-950/40 flex items-center justify-center border border-emerald-800/40 accent-text"
            style={{ boxShadow: "0 0 10px var(--accent-border-subtle)" }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </span>
        </div>
        <p className="text-2xl font-extrabold text-slate-100 mt-2">{stats.approvedThisQuarter}</p>
        <p className="text-[10px] font-medium mt-1 accent-text">+12% vs last quarter</p>
      </div>

      {/* Flagged High Risk */}
      <div className="glass-card rounded-2xl p-5 border border-slate-700/80 shadow-md">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            High Risk Flags
          </span>
          <span className="w-8 h-8 rounded-full bg-rose-950/40 text-rose-500 flex items-center justify-center border border-rose-800/40">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </span>
        </div>
        <p className="text-2xl font-extrabold text-slate-100 mt-2">{stats.highRiskCount}</p>
        <p className="text-[10px] text-slate-500 mt-1">Pending deeper diligence</p>
      </div>

      {/* Funds Disbursed */}
      <div className="glass-card rounded-2xl p-5 border border-slate-700/80 shadow-md">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Funds Disbursed
          </span>
          <span className="w-8 h-8 rounded-full bg-sky-950/40 text-sky-400 flex items-center justify-center border border-sky-800/40">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </span>
        </div>
        <p className="text-2xl font-extrabold text-slate-100 mt-2">
          ₹{(stats.totalDisbursedAmount / 100000).toFixed(1)}L
        </p>
        <p className="text-[10px] text-slate-500 mt-1">Total to Date</p>
      </div>
    </div>
  );
}
