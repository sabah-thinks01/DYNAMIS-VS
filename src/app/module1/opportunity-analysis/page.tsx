"use client";

import dynamic from "next/dynamic";
import { mockFeasibilityReport } from "@/lib/mockData/mockFeasibilityReport";
import { ViabilityScoreCard } from "@/components/entrepreneur/ViabilityScoreCard";
import { CompetitorDensityCard } from "@/components/entrepreneur/CompetitorDensityCard";
import { RoleModelRealityCheck } from "@/components/entrepreneur/RoleModelRealityCheck";

// Dynamically import map to avoid SSR issues with Leaflet window object
const CompetitorMap = dynamic(() => import("@/components/entrepreneur/CompetitorMap"), { ssr: false });

export default function OpportunityAnalysisPage() {
  const report = mockFeasibilityReport;

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800/80 pb-4">
        <span
          className="text-xs font-semibold px-2.5 py-0.5 rounded-full accent-text"
          style={{
            backgroundColor: "color-mix(in srgb, var(--accent-from) 12%, transparent)",
            borderWidth: "1px", borderStyle: "solid", borderColor: "var(--accent-border)",
          }}
        >
          Module 1
        </span>
        <h1 className="text-2xl font-extrabold text-slate-100 mt-1">
          Opportunity Analysis
        </h1>
        <p className="text-xs text-slate-400">
          Automated location-based viability evaluation and competitor mapping for {report.businessName}.
        </p>
      </div>

      <ViabilityScoreCard
        businessName={report.businessName}
        location={report.location}
        viabilityScore={report.viabilityScore}
      />

      {/* Map and Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="flex flex-col gap-4">
          <h3 className="text-sm font-bold text-slate-200">Local Competitor Map</h3>
          {report.competitorDensity.centerLat && report.competitorDensity.centerLng && report.competitorDensity.competitors && (
            <CompetitorMap 
              centerLat={report.competitorDensity.centerLat} 
              centerLng={report.competitorDensity.centerLng}
              competitors={report.competitorDensity.competitors}
            />
          )}
        </div>
        
        <div className="flex flex-col gap-4">
          <h3 className="text-sm font-bold text-slate-200">Saturation Stats</h3>
          <CompetitorDensityCard density={report.competitorDensity} />
        </div>
      </div>

      <div className="border-t border-slate-800/60 pt-6">
        <RoleModelRealityCheck data={report.roleModelRealityCheck} />
      </div>
    </div>
  );
}
