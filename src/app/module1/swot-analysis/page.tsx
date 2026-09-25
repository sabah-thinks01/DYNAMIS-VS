import { mockFeasibilityReport } from "@/lib/mockData/mockFeasibilityReport";
import { SWOTSection } from "@/components/entrepreneur/SWOTSection";

export default function SWOTAnalysisPage() {
  const report = mockFeasibilityReport;

  return (
    <div className="space-y-6">
      <div className="pb-6 border-b border-border-default">
        <h1 className="page-title">
          SWOT Analysis
        </h1>
        <p className="page-subtitle">
          Strengths, Weaknesses, Opportunities, and Threats for {report.businessName}.
        </p>
      </div>

      <SWOTSection swot={report.swot} />
    </div>
  );
}
