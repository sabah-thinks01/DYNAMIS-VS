"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useUserLocation } from "@/lib/location/useUserLocation";
import { useDistrictGeo } from "@/lib/geo/useDistrictGeo";
import { useActiveRole } from "@/lib/role/RoleContext";
import { peopleInReach } from "@/lib/score/reach";
import { formatApprox } from "@/lib/format";
import { GuideNote } from "@/components/shared/GuideNote";

const MapView = dynamic(() => import("@/components/map/MapView"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-80 sm:h-96 rounded-2xl bg-surface-subtle border border-border-default animate-pulse flex items-center justify-center">
      <span className="text-xs font-medium text-main">Loading map…</span>
    </div>
  ),
});

export function MarketReachPanel() {
  const { ready, pincode, status: locationStatus, lat, lng } = useUserLocation();
  const geoResult = useDistrictGeo(pincode);
  const [radiusKm, setRadiusKm] = useState<number>(10);

  const isGeoLoading = geoResult.status === "loading" || geoResult.status === "idle";
  const isLocationLoading = !ready || locationStatus === "loading";

  // State: Loading
  if (isLocationLoading || isGeoLoading) {
    return (
      <div className="space-y-6 animate-pulse" aria-busy="true" aria-label="Loading area market reach">
        <div className="h-6 w-72 bg-surface-subtle rounded-lg" />
        <div className="w-full h-80 sm:h-96 bg-surface-subtle rounded-2xl border border-border-default flex items-center justify-center">
          <span className="text-sm font-medium text-muted">Checking your area…</span>
        </div>
      </div>
    );
  }

  // State: State not covered in Census prototype
  if (geoResult.status === "notCovered" || !geoResult.geo) {
    return (
      <div className="space-y-6">
        <p className="text-base sm:text-lg font-medium text-main">
          Your state isn&apos;t covered yet in this prototype.
        </p>
        {lat != null && lng != null && (
          <MapView
            center={{ lat, lng }}
            radiusKm={radiusKm}
            ariaLabel="Map of your selected service area"
          />
        )}
      </div>
    );
  }

  const geo = geoResult.geo;
  const count = peopleInReach(geo.densityPerSqKm, radiusKm);
  const approxCount = formatApprox(count);

  return (
    <div className="space-y-6">
      {/* Summary line */}
      <p className="text-lg sm:text-xl font-semibold text-main">
        About {approxCount.replace(/^about /, "")} people live within {radiusKm} km of your area.
      </p>

      {/* Two-column layout on desktop: Map & Slider on left, Cards on right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left Column: Map & Slider */}
        <div className="space-y-5">
          {locationStatus === "notFound" || lat == null || lng == null ? (
            <div className="w-full h-80 sm:h-96 rounded-2xl border border-border-default bg-surface-subtle flex items-center justify-center p-6 text-center">
              <p className="text-sm font-medium text-muted">
                We couldn&apos;t place your pincode on the map.
              </p>
            </div>
          ) : (
            <MapView
              center={{ lat, lng }}
              radiusKm={radiusKm}
              ariaLabel={`Map of ${radiusKm} km radius service area`}
            />
          )}

          {/* Slider */}
          <div className="app-card p-5 rounded-2xl border border-border-default bg-surface space-y-3">
            <div className="flex justify-between items-center">
              <label htmlFor="reach-radius-slider" className="text-xs font-semibold text-muted uppercase tracking-wider">
                How far will you deliver?
              </label>
              <span className="text-sm font-bold text-main">{radiusKm} km</span>
            </div>
            <div className="flex items-center min-h-[44px]">
              <input
                id="reach-radius-slider"
                type="range"
                min="2"
                max="25"
                step="1"
                value={radiusKm}
                onChange={(e) => setRadiusKm(Number(e.target.value))}
                aria-label="Delivery reach radius in kilometers"
                className="w-full h-2 bg-border-default rounded-lg appearance-none cursor-pointer accent-accent"
              />
            </div>
          </div>
        </div>

        {/* Right Column: 3 Stat Cards & Collapsible Details */}
        <div className="space-y-4">
          {/* Card A: Reach Radius */}
          <div className="app-card p-5 rounded-2xl border border-border-default flex flex-col justify-between gap-3">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                How far your customers live
              </span>
              <p className="text-3xl font-bold text-main mt-1.5">{radiusKm} km</p>
              <p className="text-[11px] text-muted mt-0.5">Estimated reach radius</p>
            </div>
            <p className="text-xs text-muted">Change this with the slider above.</p>
          </div>

          {/* Card B: Population in Reach */}
          <div className="app-card p-5 rounded-2xl border border-border-default flex flex-col justify-between gap-3">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                People you can sell to
              </span>
              <p className="text-3xl font-bold text-main mt-1.5">{approxCount}</p>
              <p className="text-[11px] text-muted mt-0.5">Population in reach</p>
            </div>
            <p className="text-xs text-muted">
              {geo.districtName} district, {geo.densityBasis} population density, Census 2011 (latest official count).
            </p>
          </div>

          {/* Card C: Footfall Potential */}
          <div className="app-card p-5 rounded-2xl border border-border-default flex flex-col justify-between gap-3">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                How many people pass by
              </span>
              <p className="text-2xl font-bold text-main mt-1.5">Not available yet</p>
              <p className="text-[11px] text-muted mt-0.5">Footfall potential</p>
            </div>
            <p className="text-xs text-muted">We need local footfall data for this. Coming later.</p>
          </div>

          {/* How we worked this out collapsible */}
          <details className="mt-4 pt-3 border-t border-border-default/60 text-xs text-muted">
            <summary className="cursor-pointer font-medium hover:text-main transition-colors select-none">
              How we worked this out
            </summary>
            <div className="mt-2.5 space-y-1.5 leading-relaxed">
              <p>
                People = {geo.districtName} district population density ({geo.densityBasis} population, Census 2011 — latest official count) × area of a circle {radiusKm} km wide around your area. Census 2011 is the latest official count; real numbers today are likely higher.
              </p>
              {geo.mappingNote && <p>{geo.mappingNote}</p>}
              {geo.ambiguous && <p>Your pincode spans more than one district; we used {geo.districtName}.</p>}
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}

export function MarketReachSwitch({ sampleView }: { sampleView: React.ReactNode }) {
  const { ready, isSampleBusiness, status } = useUserLocation();
  const activeRole = useActiveRole();

  if (!ready) {
    return (
      <div className="space-y-8 pb-24 md:pb-0 animate-pulse" aria-busy="true" aria-label="Loading market reach">
        <div className="pb-6 border-b border-border-default">
          <div className="h-8 w-64 bg-surface-subtle rounded-lg" />
          <div className="h-4 w-96 bg-surface-subtle rounded-lg mt-2" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-44 bg-surface-subtle rounded-2xl border border-border-default" />
          <div className="h-44 bg-surface-subtle rounded-2xl border border-border-default" />
          <div className="h-44 bg-surface-subtle rounded-2xl border border-border-default" />
        </div>
      </div>
    );
  }

  if (isSampleBusiness || status === "noProfile" || activeRole === "officer") {
    return <>{sampleView}</>;
  }

  return (
    <div className="space-y-8 pb-24 md:pb-0">
      {/* Real User Header */}
      <div className="pb-6 border-b border-border-default">
        <h1 className="page-title">Who will buy from you?</h1>
        <p className="page-subtitle text-xs text-muted mt-1 uppercase tracking-wider font-semibold">
          Market Reach
        </p>
      </div>

      <MarketReachPanel />

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
}
