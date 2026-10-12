import Link from "next/link";
import { mockFeasibilityReport } from "@/lib/mockData/mockFeasibilityReport";
import { mockMarketReach } from "@/lib/mockData/mockMarketReach";
import { SampleDataTag } from "@/components/shared/SampleDataTag";
import { GuideNote } from "@/components/shared/GuideNote";
import { MarketReachSwitch } from "@/components/entrepreneur/MarketReachPanel";

export default function MarketReachPage() {
  const report = mockFeasibilityReport;
  const reach = mockMarketReach;

  const sampleMarkup = (
    <div className="space-y-8 pb-24 md:pb-0">
      {/* Page Header */}
      <div className="pb-6 border-b border-border-default">
        <h1 className="page-title">
          Who will buy from you?
        </h1>
        <p className="text-xs text-muted mb-2">Market Reach</p>
        <p className="page-subtitle">
          Sample business: {report.businessName}.
        </p>
      </div>

      {/* 3 Stat cards: 3 columns ≥1024px (lg:grid-cols-3), single column below */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Estimated Reach Radius */}
        <div className="app-card p-6 flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
                  How far your customers live
                </h3>
                <p className="text-[10px] text-muted">Estimated reach radius</p>
              </div>
              <SampleDataTag variant="sample" />
            </div>
            <div className="flex items-baseline gap-1.5 mt-2">
              <span className="text-4xl font-semibold text-main">
                {reach.estimatedReachRadiusKm}
              </span>
              <span className="text-sm font-normal text-muted">km</span>
            </div>
          </div>
          <p className="text-sm text-muted leading-relaxed">
            Most buyers will come from inside this distance.
          </p>
        </div>

        {/* Population Within Reach */}
        <div className="app-card p-6 flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
                  People you can sell to
                </h3>
                <p className="text-[10px] text-muted">Population in reach</p>
              </div>
              <SampleDataTag variant="sample" />
            </div>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-4xl font-semibold text-main">
                {new Intl.NumberFormat("en-IN").format(reach.populationInReach)}
              </span>
            </div>
          </div>
          <p className="text-sm text-muted leading-relaxed">
            People living within {reach.estimatedReachRadiusKm} km.
          </p>
        </div>

        {/* Footfall Potential */}
        <div className="app-card p-6 flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
                  How many people pass by
                </h3>
                <p className="text-[10px] text-muted">Footfall potential</p>
              </div>
              <SampleDataTag variant="sample" />
            </div>
            <div className="mt-3 flex items-center">
              <span className="status-pill">
                {reach.footfallPotential}
              </span>
            </div>
          </div>
          <p className="text-sm text-muted leading-relaxed">
            Compared with similar places nearby.
          </p>
        </div>
      </div>

      {/* Key Reach Drivers: one neutral card, list items with small neutral marker, comfortable line height (1.6), 16px text */}
      <div className="app-card p-6 flex flex-col gap-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
          Why this spot works
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

      <GuideNote />

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

  return <MarketReachSwitch sampleView={sampleMarkup} />;
}
