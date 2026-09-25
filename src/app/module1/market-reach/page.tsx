import Link from "next/link";
import { mockFeasibilityReport } from "@/lib/mockData/mockFeasibilityReport";
import { mockMarketReach } from "@/lib/mockData/mockMarketReach";

export default function MarketReachPage() {
  const report = mockFeasibilityReport;
  const reach = mockMarketReach;

  return (
    <div className="space-y-8 pb-24 md:pb-0">
      {/* Page Header */}
      <div className="pb-6 border-b border-border-default">
        <h1 className="page-title">
          Market Reach
        </h1>
        <p className="page-subtitle">
          Distribution radius and market size estimates for {report.businessName}.
        </p>
      </div>

      {/* 3 Stat cards: 3 columns ≥1024px (lg:grid-cols-3), single column below */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Estimated Reach Radius */}
        <div className="app-card p-6 flex flex-col justify-between gap-4">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
              Estimated Reach Radius
            </h3>
            <div className="flex items-baseline gap-1.5 mt-2">
              <span className="text-4xl font-semibold text-main">
                {reach.estimatedReachRadiusKm}
              </span>
              <span className="text-sm font-normal text-muted">km</span>
            </div>
          </div>
          <p className="text-sm text-muted leading-relaxed">
            Effective service area based on standard local distribution logistics.
          </p>
        </div>

        {/* Population Within Reach */}
        <div className="app-card p-6 flex flex-col justify-between gap-4">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
              Population in Reach
            </h3>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-4xl font-semibold text-main">
                {new Intl.NumberFormat("en-IN").format(reach.populationInReach)}
              </span>
            </div>
          </div>
          <p className="text-sm text-muted leading-relaxed">
            Total addressable population within the estimated {reach.estimatedReachRadiusKm} km radius.
          </p>
        </div>

        {/* Footfall Potential */}
        <div className="app-card p-6 flex flex-col justify-between gap-4">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
              Footfall Potential
            </h3>
            <div className="mt-3 flex items-center">
              <span className="status-pill">
                {reach.footfallPotential}
              </span>
            </div>
          </div>
          <p className="text-sm text-muted leading-relaxed">
            Projected relative to regional averages for this business category.
          </p>
        </div>
      </div>

      {/* Key Reach Drivers: one neutral card, list items with small neutral marker, comfortable line height (1.6), 16px text */}
      <div className="app-card p-6 flex flex-col gap-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
          Key Reach Drivers
        </h3>
        <ul className="space-y-3">
          {reach.drivingFactors.map((factor, idx) => (
            <li key={idx} className="flex items-start gap-3 text-base text-main leading-[1.6]">
              <span className="w-1.5 h-1.5 rounded-full bg-border-strong mt-2.5 shrink-0" aria-hidden="true" />
              <span>{factor}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Prev/Next Navigation */}
      <div className="fixed md:static bottom-0 inset-x-0 z-20 bg-surface/95 md:bg-transparent backdrop-blur-md md:backdrop-blur-none border-t border-border-default p-4 md:p-0 md:pt-6 pb-[max(1rem,env(safe-area-inset-bottom))] md:pb-0 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="hidden md:block flex-1" />
        
        <Link
          href="/module1/opportunity-analysis"
          className="w-full md:w-auto inline-flex items-center justify-center min-h-[44px] px-6 py-2.5 btn-primary font-semibold text-sm rounded-xl gap-2 transition-all"
        >
          Next: Opportunity Analysis →
        </Link>
      </div>
    </div>
  );
}
