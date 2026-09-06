import React from "react";
import { FeasibilityReport } from "@/types";

interface Props {
  businessName: string;
  location: string;
  viabilityScore: FeasibilityReport["viabilityScore"];
}

export function ViabilityScoreCard({ businessName, location, viabilityScore }: Props) {
  // Derive category from numeric score
  const category = viabilityScore >= 75 ? "High" : viabilityScore >= 50 ? "Medium" : "Low";

  // Simple functional class mapping preserved, but adapted to dark theme semantics
  const scoreColor =
    category === "High"
      ? "bg-emerald-950/40 text-emerald-400 border-emerald-800/60"
      : category === "Medium"
      ? "bg-amber-950/40 text-amber-400 border-amber-800/60"
      : "bg-rose-950/40 text-rose-400 border-rose-800/60";

  const glowColor = 
    category === "High"
      ? "var(--status-good-glow)"  // High viability = semantic good — always green, not role-tinted
      : category === "Medium"
      ? "rgba(251,191,36,0.15)"    // amber — semantic, stays fixed
      : "rgba(244,63,94,0.15)";    // rose  — semantic, stays fixed

  return (
    <div 
      className="glass-card rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4"
      style={{ boxShadow: `0 10px 40px -10px ${glowColor}` }}
    >
      <div>
        <h2 className="text-xl font-bold text-slate-100">{businessName}</h2>
        <div className="text-xs text-slate-400 flex items-center space-x-2 mt-1">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>{location}</span>
        </div>
      </div>

      <div className={`flex items-center space-x-4 border ${scoreColor} rounded-2xl px-5 py-3`}>
        <div className="flex flex-col text-right">
          <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">
            Viability Score
          </span>
          <span className="text-xs font-semibold mt-0.5">{category} Potential</span>
        </div>
        <div className="text-3xl font-extrabold border-l border-current/20 pl-4">
          {viabilityScore}/100
        </div>
      </div>
    </div>
  );
}
