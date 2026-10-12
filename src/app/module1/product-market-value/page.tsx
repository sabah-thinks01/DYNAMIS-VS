import { mockFeasibilityReport } from "@/lib/mockData/mockFeasibilityReport";
import { SampleDataTag } from "@/components/shared/SampleDataTag";
import { GuideNote } from "@/components/shared/GuideNote";

export default function ProductMarketValuePage() {
  const report = mockFeasibilityReport;
  const pmv = report.productMarketValue;

  return (
    <div className="space-y-6">
      <div className="pb-6 border-b border-border-default">
        <h1 className="page-title">
          What price can you sell at?
        </h1>
        <p className="text-xs text-muted mb-2">Product Market Value</p>
        <p className="page-subtitle">
          A price range for your product, and how much people here can spend.
        </p>
      </div>

      {!pmv ? (
        <div className="text-sm text-muted">Not available yet.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Suggested Price Range */}
          <div className="app-card p-6 flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">Price you could ask</h3>
              <SampleDataTag variant="sample" />
            </div>
            <p className="text-4xl font-semibold text-main">{pmv.suggestedPriceRange}</p>
            <p className="text-sm text-muted mt-2 leading-relaxed">
              A rough range, based on prices nearby.
            </p>
          </div>

          {/* Purchasing Power */}
          <div className="app-card p-6 flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">How much people here can spend</h3>
              <SampleDataTag variant="sample" />
            </div>
            <div className="flex items-center gap-3">
              <span className={`status-pill ${
                pmv.purchasingPowerIndicator === "High" ? "" : 
                pmv.purchasingPowerIndicator === "Medium" ? "warning" : 
                "error"}`}
              >
                {pmv.purchasingPowerIndicator}
              </span>
            </div>
            <p className="text-sm text-muted mt-2 leading-relaxed">
              A rough level for this area: low, medium or high.
            </p>
          </div>

          {/* Local Comparison */}
          <div className="md:col-span-2 app-card p-6 flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">Prices nearby</h3>
              <SampleDataTag variant="sample" />
            </div>
            <p className="text-sm text-main leading-relaxed">
              {pmv.localComparison}
            </p>
            <p className="text-xs text-muted mt-2 italic">
              This is a rough comparison. Work out your own costs before you set your price.
            </p>
          </div>
        </div>
      )}

      <GuideNote />
    </div>
  );
}
