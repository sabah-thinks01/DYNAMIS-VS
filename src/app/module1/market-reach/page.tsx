import Link from "next/link";
import { mockFeasibilityReport } from "@/lib/mockData/mockFeasibilityReport";
import { mockMarketReach } from "@/lib/mockData/mockMarketReach";

export default function MarketReachPage() {
  const report = mockFeasibilityReport;
  const reach = mockMarketReach;

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
          Market Reach
        </h1>
        <p className="text-xs text-slate-400">
          Distribution radius and market size estimates for {report.businessName}.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Estimated Reach Radius */}
        <div className="glass-card rounded-2xl p-6 border border-slate-700/50 shadow-sm flex flex-col gap-2">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wide">Estimated Reach Radius</h3>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-4xl font-extrabold text-slate-100">{reach.estimatedReachRadiusKm}</span>
            <span className="text-base font-semibold text-slate-400">km</span>
          </div>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            Effective service area based on standard local distribution logistics.
          </p>
        </div>

        {/* Population Within Reach */}
        <div className="glass-card rounded-2xl p-6 border border-slate-700/50 shadow-sm flex flex-col gap-2">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wide">Population in Reach</h3>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-4xl font-extrabold text-slate-100">
              {new Intl.NumberFormat("en-IN").format(reach.populationInReach)}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            Total addressable population within the estimated {reach.estimatedReachRadiusKm} km radius.
          </p>
        </div>

        {/* Footfall Potential */}
        <div className="glass-card rounded-2xl p-6 border border-slate-700/50 shadow-sm flex flex-col gap-2">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wide">Footfall Potential</h3>
          <div className="mt-2 flex items-center">
            <span className={`px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider
              ${reach.footfallPotential === "High" ? "bg-emerald-950/50 text-[var(--status-good)] border border-[var(--status-good-border)]" : 
                reach.footfallPotential === "Medium" ? "bg-amber-950/50 text-amber-400 border border-amber-800/50" : 
                "bg-rose-950/50 text-rose-400 border border-rose-800/50"}`}
            >
              {reach.footfallPotential}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-3 leading-relaxed">
            Projected relative to regional averages for this business category.
          </p>
        </div>

        {/* Driving Factors */}
        <div className="md:col-span-2 lg:col-span-3 glass-card rounded-2xl p-6 border border-slate-700/50 shadow-sm flex flex-col gap-3">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wide">Key Reach Drivers</h3>
          <ul className="space-y-2 mt-1">
            {reach.drivingFactors.map((factor, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-300">
                <span className="text-slate-500 mt-0.5">•</span>
                <span>{factor}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Prev/Next Navigation */}
      <div className="pt-6 border-t border-slate-800/60 flex flex-col sm:flex-row justify-between items-center gap-4">
        {/* Placeholder for "Previous" if we want to expand later */}
        <div className="flex-1" />
        
        <Link
          href="/module1/opportunity-analysis"
          className="inline-flex items-center gap-2 px-5 py-2.5 accent-gradient hover:opacity-90 transition-opacity text-white text-sm font-bold rounded-xl shadow-md"
        >
          Next: Opportunity Analysis →
        </Link>
      </div>
    </div>
  );
}
