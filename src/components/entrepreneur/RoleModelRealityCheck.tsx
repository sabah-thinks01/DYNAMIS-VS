import React from "react";
import { FeasibilityReport } from "@/types";

interface Props {
  data: FeasibilityReport["roleModelRealityCheck"];
}

export function RoleModelRealityCheck({ data }: Props) {
  return (
    <div className="app-card rounded-2xl p-6 border border-border-default border-l-[3px] border-l-border-strong shadow-card relative overflow-hidden bg-surface">
      <div className="relative z-10">
        <div className="flex items-center space-x-2.5 mb-3">
          <svg className="w-5 h-5 text-muted shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-sm font-semibold text-main">
            {data.title}
          </h3>
        </div>
        
        <p className="text-sm text-main mb-4 leading-relaxed max-w-3xl">
          {data.story}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-surface-subtle rounded-xl p-4 border border-border-default">
            <span className="text-[10px] text-muted uppercase tracking-wider block mb-1">Key Takeaway</span>
            <p className="text-xs font-medium text-main leading-normal">
              {data.keyTakeaway}
            </p>
          </div>
          
          <div className="bg-surface-subtle rounded-xl p-4 border border-border-default">
            <span className="text-[10px] text-muted uppercase tracking-wider block mb-1">Turnover Precedent</span>
            <p className="text-lg font-bold text-main mt-1">
              {data.monthlyTurnover}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
