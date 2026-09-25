import React from "react";
import { FeasibilityReport } from "@/types";

interface Props {
  swot: FeasibilityReport["swot"];
}

export function SWOTSection({ swot }: Props) {
  const quadrants = [
    { title: "Strengths", items: swot.strengths, color: "emerald" },
    { title: "Weaknesses", items: swot.weaknesses, color: "amber" },
    { title: "Opportunities", items: swot.opportunities, color: "teal" },
    { title: "Threats", items: swot.threats, color: "rose" },
  ];

  return (
    <div className="app-card rounded-2xl p-6 border-border-default/80">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted border-b border-border-default/60 pb-3 mb-5">
        AI-Generated SWOT Analysis
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {quadrants.map((quad) => {
          // Dark mode friendly color mapping
          const colors = {
            emerald: "bg-[var(--status-good-bg)] border-[var(--status-good-border)] text-[var(--status-good)]",
            amber: "bg-[var(--status-warning-bg)] border-[var(--status-warning-border)] text-[var(--status-warning)]",
            teal: "bg-surface-subtle border-border-default text-main",
            rose: "bg-[var(--status-error-bg)] border-[var(--status-error-border)] text-[var(--status-error)]",
          }[quad.color];

          return (
            <div key={quad.title} className={`p-4 rounded-xl border ${colors}`}>
              <h4 className="text-xs font-bold uppercase tracking-wider mb-2">
                {quad.title}
              </h4>
              <ul className="space-y-1.5">
                {quad.items.map((item, idx) => (
                  <li key={idx} className="text-xs text-main flex items-start">
                    <span className="mr-2 opacity-50">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
