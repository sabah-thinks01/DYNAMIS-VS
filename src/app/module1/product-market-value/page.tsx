import { mockFeasibilityReport } from "@/lib/mockData/mockFeasibilityReport";

export default function ProductMarketValuePage() {
  const report = mockFeasibilityReport;
  const pmv = report.productMarketValue;

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
          Product Market Value
        </h1>
        <p className="text-xs text-slate-400">
          Estimated pricing range and regional purchasing power indicator.
        </p>
      </div>

      {!pmv ? (
        <div className="text-sm text-slate-500">Data not available.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Suggested Price Range */}
          <div className="glass-card rounded-2xl p-6 border border-slate-700/50 shadow-sm flex flex-col gap-2">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wide">Suggested Price Range</h3>
            <p className="text-3xl font-extrabold text-slate-100">{pmv.suggestedPriceRange}</p>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              *Estimated range based on local market dynamics.
            </p>
          </div>

          {/* Purchasing Power */}
          <div className="glass-card rounded-2xl p-6 border border-slate-700/50 shadow-sm flex flex-col gap-2">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wide">Regional Purchasing Power</h3>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                ${pmv.purchasingPowerIndicator === "High" ? "bg-emerald-950/50 text-emerald-400 border border-emerald-800/50" : 
                  pmv.purchasingPowerIndicator === "Medium" ? "bg-amber-950/50 text-amber-400 border border-amber-800/50" : 
                  "bg-rose-950/50 text-rose-400 border border-rose-800/50"}`}
              >
                {pmv.purchasingPowerIndicator}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              General qualitative band for the requested area.
            </p>
          </div>

          {/* Local Comparison */}
          <div className="md:col-span-2 glass-card rounded-2xl p-6 border border-slate-700/50 shadow-sm flex flex-col gap-2">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wide">Local Pricing Comparison</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              {pmv.localComparison}
            </p>
            <p className="text-xs text-slate-500 mt-2 italic">
              Note: This is an estimated comparison. Final pricing strategy should be tailored to specific product variations and distribution models.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
