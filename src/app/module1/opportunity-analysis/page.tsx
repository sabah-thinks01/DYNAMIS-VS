import { mockFeasibilityReport } from "@/lib/mockData/mockFeasibilityReport";
import { OpportunityHeader } from "@/components/entrepreneur/OpportunityHeader";
import { CompetitorDensityCard } from "@/components/entrepreneur/CompetitorDensityCard";
import { RoleModelRealityCheck } from "@/components/entrepreneur/RoleModelRealityCheck";
import { OpportunityMapSection } from "@/components/entrepreneur/OpportunityMapSection";
import { GuideNote } from "@/components/shared/GuideNote";

export default function OpportunityAnalysisPage() {
  const report = mockFeasibilityReport;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="pb-6 border-b border-border-default">
        <h1 className="page-title">
          Is this a good business here?
        </h1>
        <p className="text-xs text-muted mb-2">Opportunity Analysis</p>
        <p className="page-subtitle">
          We compare how many people live nearby with how many similar sellers are already there.
        </p>
      </div>

      <OpportunityHeader
        sampleBusinessName={report.businessName}
        sampleLocation={report.location}
        sampleScore={report.viabilityScore}
      />

      {/* Map and Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="flex flex-col gap-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
            Sellers near you
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
            Sellers nearby in numbers
          </h3>
          <CompetitorDensityCard density={report.competitorDensity} />
        </div>
      </div>

      <div className="border-t border-border-default pt-6">
        <RoleModelRealityCheck data={report.roleModelRealityCheck} />
      </div>

      <GuideNote />
    </div>
  );
}
