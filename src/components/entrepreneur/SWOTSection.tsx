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
    <div className="glass-card rounded-2xl p-6 border-slate-700/80">
      <h3 className="text-sm font-bold text-slate-200 border-b border-slate-700/60 pb-2 mb-4">
        AI-Generated SWOT Analysis
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {quadrants.map((quad) => {
          // Dark mode friendly color mapping
          const colors = {
            emerald: "bg-emerald-950/20 border-emerald-800/40 text-emerald-400",
            amber: "bg-amber-950/20 border-amber-800/40 text-amber-400",
            teal: "bg-teal-950/20 border-teal-800/40 text-teal-400",
            rose: "bg-rose-950/20 border-rose-800/40 text-rose-400",
          }[quad.color];

          return (
            <div key={quad.title} className={`p-4 rounded-xl border ${colors}`}>
              <h4 className="text-xs font-bold uppercase tracking-wider mb-2">
                {quad.title}
              </h4>
              <ul className="space-y-1.5">
                {quad.items.map((item, idx) => (
                  <li key={idx} className="text-xs text-slate-300 flex items-start">
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
