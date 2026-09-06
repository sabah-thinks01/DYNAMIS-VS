import { mockFeasibilityReport } from "@/lib/mockData/mockFeasibilityReport";
import { SWOTSection } from "@/components/entrepreneur/SWOTSection";

export default function SWOTAnalysisPage() {
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
          SWOT Analysis
        </h1>
        <p className="text-xs text-slate-400">
          Strengths, Weaknesses, Opportunities, and Threats for {report.businessName}.
        </p>
      </div>

      <SWOTSection swot={report.swot} />
    </div>
  );
}
