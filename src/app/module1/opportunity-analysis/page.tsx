import { mockFeasibilityReport } from "@/lib/mockData/mockFeasibilityReport";
import { ViabilityScoreCard } from "@/components/entrepreneur/ViabilityScoreCard";
import { CompetitorDensityCard } from "@/components/entrepreneur/CompetitorDensityCard";
import { RoleModelRealityCheck } from "@/components/entrepreneur/RoleModelRealityCheck";
import { OpportunityMapSection } from "@/components/entrepreneur/OpportunityMapSection";

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
            <OpportunityMapSection
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
