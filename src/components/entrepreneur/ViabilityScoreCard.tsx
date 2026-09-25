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
      ? "bg-[var(--status-good-bg)] text-[var(--status-good)] border-[var(--status-good-border)]"
      : category === "Medium"
      ? "bg-[var(--status-warning-bg)] text-[var(--status-warning)] border-[var(--status-warning-border)]"
      : "bg-[var(--status-error-bg)] text-[var(--status-error)] border-[var(--status-error-border)]";

  const glowColor = 
    category === "High"
      ? "var(--status-good-glow)"  // High viability = semantic good — always green, not role-tinted
      : category === "Medium"
      ? "var(--status-warning-glow)"
      : "var(--status-error-glow)";

  return (
    <div 
      className="app-card rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5 border border-border-default shadow-card"
      style={{ boxShadow: `0 10px 40px -10px ${glowColor}` }}
    >
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-main">{businessName}</h2>
        <div className="text-xs text-muted flex items-center space-x-2 mt-1.5">
          <svg className="w-3.5 h-3.5 text-muted shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>{location}</span>
        </div>
      </div>

      <div className={`flex items-center space-x-4 border ${scoreColor} rounded-2xl px-5 py-3.5 shrink-0 self-start sm:self-auto`}>
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
