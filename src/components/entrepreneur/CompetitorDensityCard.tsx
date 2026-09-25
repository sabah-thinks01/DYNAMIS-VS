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
    Low: "bg-[var(--status-good-bg)] text-[var(--status-good)] border-[var(--status-good-border)]",
    Medium: "bg-[var(--status-warning-bg)] text-[var(--status-warning)] border-[var(--status-warning-border)]",
    High: "bg-[var(--status-error-bg)] text-[var(--status-error)] border-[var(--status-error-border)]",
  };

  return (
    <div className="app-card rounded-2xl p-6 border-border-default shadow-card">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted border-b border-border-default/60 pb-3 mb-5">
        Competitor Density Analysis
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface-subtle/50 rounded-xl p-4 border border-border-default flex flex-col justify-between">
          <span className="text-xs font-semibold text-muted uppercase tracking-wider">
            Active Competitors
          </span>
          <p className="text-3xl font-semibold text-main mt-2">{density.count}</p>
          <p className="text-xs text-muted mt-2">Within search radius</p>
        </div>

        <div className={`rounded-xl p-4 border ${statusColors[level]} flex flex-col justify-between`}>
          <span className="text-xs font-semibold uppercase tracking-wider opacity-80">
            Market Saturation
          </span>
          <p className="text-3xl font-semibold mt-2">{level}</p>
          <p className="text-xs opacity-75 mt-2">Density Level</p>
        </div>

        <div className="bg-surface-subtle/50 rounded-xl p-4 border border-border-default flex flex-col justify-between">
          <span className="text-xs font-semibold text-muted uppercase tracking-wider">
            Average Distance
          </span>
          <p className="text-3xl font-semibold text-main mt-2">{density.avgDistanceKm} km</p>
          <p className="text-xs text-muted mt-2">To nearest similar business</p>
        </div>
      </div>
    </div>
  );
}
