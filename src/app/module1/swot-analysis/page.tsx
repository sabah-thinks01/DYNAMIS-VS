import { mockFeasibilityReport } from "@/lib/mockData/mockFeasibilityReport";
import { SWOTSection } from "@/components/entrepreneur/SWOTSection";
import { GuideNote } from "@/components/shared/GuideNote";
import { SwotSwitch } from "@/components/entrepreneur/SwotPanel";

export default function SWOTAnalysisPage() {
  const report = mockFeasibilityReport;

  const sampleMarkup = (
    <div className="space-y-6">
      <div className="pb-6 border-b border-border-default">
        <h1 className="page-title">
          What helps you / What could hurt you
        </h1>
        <p className="text-xs text-muted mb-2">SWOT Analysis</p>
        <p className="page-subtitle">
          What works for and against {report.businessName}.
        </p>
      </div>

      <SWOTSection swot={report.swot} />

      <GuideNote />
    </div>
  );

  return <SwotSwitch sampleView={sampleMarkup} />;
}
