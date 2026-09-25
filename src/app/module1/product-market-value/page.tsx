import { mockFeasibilityReport } from "@/lib/mockData/mockFeasibilityReport";

export default function ProductMarketValuePage() {
  const report = mockFeasibilityReport;
  const pmv = report.productMarketValue;

  return (
    <div className="space-y-6">
      <div className="pb-6 border-b border-border-default">
        <h1 className="page-title">
          Product Market Value
        </h1>
        <p className="page-subtitle">
          Estimated pricing range and regional purchasing power indicator.
        </p>
      </div>

      {!pmv ? (
        <div className="text-sm text-muted">Data not available.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Suggested Price Range */}
          <div className="app-card p-6 flex flex-col gap-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">Suggested Price Range</h3>
            <p className="text-4xl font-semibold text-main">{pmv.suggestedPriceRange}</p>
            <p className="text-sm text-muted mt-2 leading-relaxed">
              *Estimated range based on local market dynamics.
            </p>
          </div>

          {/* Purchasing Power */}
          <div className="app-card p-6 flex flex-col gap-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">Regional Purchasing Power</h3>
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
              General qualitative band for the requested area.
            </p>
          </div>

          {/* Local Comparison */}
          <div className="md:col-span-2 app-card p-6 flex flex-col gap-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">Local Pricing Comparison</h3>
            <p className="text-sm text-main leading-relaxed">
              {pmv.localComparison}
            </p>
            <p className="text-xs text-muted mt-2 italic">
              Note: This is an estimated comparison. Final pricing strategy should be tailored to specific product variations and distribution models.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
