import React from "react";
import { FeasibilityReport } from "@/types";

interface Props {
  density: FeasibilityReport["competitorDensity"];
}

export function CompetitorDensityCard({ density }: Props) {
  // Derive level dynamically based on count if missing in types
  const level: "Low" | "Medium" | "High" = 
    density.count < 3 ? "Low" : density.count < 8 ? "Medium" : "High";

  const statusColors = {
    Low: "bg-emerald-950/40 text-emerald-400 border-emerald-800/60",
    Medium: "bg-amber-950/40 text-amber-400 border-amber-800/60",
    High: "bg-rose-950/40 text-rose-400 border-rose-800/60",
  };

  return (
    <div className="glass-card rounded-2xl p-6 border-slate-700/80">
      <h3 className="text-sm font-bold text-slate-200 border-b border-slate-700/60 pb-2 mb-4">
        Competitor Density Analysis
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
          <span className="text-xs font-semibold text-slate-400 uppercase">
            Active Competitors
          </span>
          <p className="text-2xl font-bold text-slate-100 mt-1">{density.count}</p>
          <p className="text-[10px] text-slate-500 mt-1">Within search radius</p>
        </div>

        <div className={`rounded-xl p-4 border ${statusColors[level]}`}>
          <span className="text-xs font-semibold uppercase opacity-80">
            Market Saturation
          </span>
          <p className="text-2xl font-bold mt-1">{level}</p>
          <p className="text-[10px] opacity-75 mt-1">Density Level</p>
        </div>

        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
          <span className="text-xs font-semibold text-slate-400 uppercase">
            Average Distance
          </span>
          <p className="text-2xl font-bold text-slate-100 mt-1">{density.avgDistanceKm} km</p>
          <p className="text-[10px] text-slate-500 mt-1">To nearest similar business</p>
        </div>
      </div>
    </div>
  );
}
