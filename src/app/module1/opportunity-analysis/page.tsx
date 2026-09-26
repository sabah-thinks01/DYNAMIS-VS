"use client";

import dynamic from "next/dynamic";
import { mockFeasibilityReport } from "@/lib/mockData/mockFeasibilityReport";
import { ViabilityScoreCard } from "@/components/entrepreneur/ViabilityScoreCard";
import { CompetitorDensityCard } from "@/components/entrepreneur/CompetitorDensityCard";
import { RoleModelRealityCheck } from "@/components/entrepreneur/RoleModelRealityCheck";

// Dynamically import map to avoid SSR issues with Leaflet window object
const CompetitorMap = dynamic(() => import("@/components/entrepreneur/CompetitorMap"), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-96 sm:h-[420px] rounded-2xl border border-border-default shadow-card bg-surface flex items-center justify-center">
      <div className="flex flex-col items-center">
        <div className="w-8 h-8 border-4 border-accent/30 border-t-accent-strong rounded-full animate-spin mb-3"></div>
        <span className="text-xs font-medium text-main">Loading map...</span>
      </div>
    </div>
  )
});

export default function OpportunityAnalysisPage() {
  const report = mockFeasibilityReport;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="pb-6 border-b border-border-default">
        <h1 className="page-title">
          Opportunity Analysis
        </h1>
        <p className="page-subtitle">
          Automated location-based viability evaluation and competitor mapping for {report.businessName}.
        </p>
      </div>

      <ViabilityScoreCard
        businessName={report.businessName}
        location={report.location}
        viabilityScore={report.viabilityScore}
      />

      {/* Map and Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="flex flex-col gap-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
            Local Competitor Map
          </h3>
          {report.competitorDensity.centerLat && report.competitorDensity.centerLng && report.competitorDensity.competitors && (
            <CompetitorMap 
              centerLat={report.competitorDensity.centerLat} 
              centerLng={report.competitorDensity.centerLng}
              competitors={report.competitorDensity.competitors}
            />
          )}
        </div>
        
        <div className="flex flex-col gap-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
            Saturation Stats
          </h3>
          <CompetitorDensityCard density={report.competitorDensity} />
        </div>
      </div>

      <div className="border-t border-border-default pt-6">
        <RoleModelRealityCheck data={report.roleModelRealityCheck} />
      </div>
    </div>
  );
}
