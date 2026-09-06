import React from "react";
import { FeasibilityReport } from "@/types";

interface Props {
  data: FeasibilityReport["roleModelRealityCheck"];
}

export function RoleModelRealityCheck({ data }: Props) {
  return (
    <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 border border-slate-700/80 shadow-lg relative overflow-hidden">
      {/* Decorative background glow matching amber warning theme */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-amber-500/10 blur-3xl rounded-full"></div>
      
      <div className="relative z-10">
        <div className="flex items-center space-x-2 mb-3">
          <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-sm font-bold text-amber-300">
            {data.title}
          </h3>
        </div>
        
        <p className="text-xs text-slate-300 mb-4 leading-relaxed max-w-3xl">
          {data.story}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="bg-slate-950/40 rounded-xl p-4 border border-slate-700/50">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">Key Takeaway</span>
            <p className="text-xs font-medium text-slate-200">
              {data.keyTakeaway}
            </p>
          </div>
          
          <div className="bg-slate-950/40 rounded-xl p-4 border border-slate-700/50">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">Turnover Precedent</span>
            <p className="text-lg font-bold text-emerald-400 mt-1">
              {data.monthlyTurnover}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
