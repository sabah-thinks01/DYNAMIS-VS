"use client";

import React from "react";
import { formatApprox } from "@/lib/format";
import type { DistrictGeoData } from "@/lib/geo/useDistrictGeo";
import type { MarketRoomVerdict } from "@/lib/score/marketRoom";

export type MarketRoomCardState =
  | { kind: "loading" }
  | { kind: "notCovered" }
  | { kind: "notOnMap" }
  | { kind: "mapMoved" }
  | { kind: "otherBusiness" }
  | { kind: "noLiveData" }
  | {
      kind: "verdict";
      verdict: MarketRoomVerdict;
      peoplePerSeller: number | null;
      sellerCount: number;
      sellerCountIsCapped: boolean;
    };

export interface MarketRoomCardProps {
  businessName: string;
  location: string;
  state: MarketRoomCardState;
  geo?: DistrictGeoData;
  radiusKm?: number;
  keyword?: string;
}

export function MarketRoomCard({
  businessName,
  location,
  state,
  geo,
  radiusKm = 10,
  keyword = "similar business",
}: MarketRoomCardProps) {
  // Pre-calculate reach population if geo is available
  const areaSqKm = Math.PI * radiusKm * radiusKm;
  const peopleInReach = geo ? Math.round(geo.densityPerSqKm * areaSqKm) : 0;

  // Render 1: Loading
  if (state.kind === "loading") {
    return (
      <div className="app-card rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5 border border-border-default shadow-card">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-main">{businessName}</h2>
          <div className="text-xs text-muted flex items-center space-x-2 mt-1.5">
            <svg className="w-3.5 h-3.5 text-muted shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{location}</span>
          </div>
        </div>
        <div className="flex flex-col text-left sm:text-right border border-border-default bg-surface-subtle/50 rounded-2xl px-5 py-3.5 shrink-0 self-start sm:self-auto min-w-[200px]">
          <span className="text-sm font-semibold text-main">Checking your area…</span>
          <span className="text-[11px] text-muted mt-0.5">Room in your market · Market saturation</span>
        </div>
      </div>
    );
  }

  // Render 2: State not covered
  if (state.kind === "notCovered") {
    return (
      <div className="app-card rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5 border border-border-default shadow-card">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-main">{businessName}</h2>
          <div className="text-xs text-muted flex items-center space-x-2 mt-1.5">
            <svg className="w-3.5 h-3.5 text-muted shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{location}</span>
          </div>
          <p className="text-xs text-muted mt-3 max-w-xl leading-relaxed">
            Your state isn&apos;t covered yet in this prototype.
          </p>
        </div>
        <div className="flex flex-col text-left sm:text-right border border-border-default bg-surface-subtle/50 rounded-2xl px-5 py-3.5 shrink-0 self-start sm:self-auto min-w-[200px]">
          <span className="text-sm font-semibold text-main">Not checked for your area yet</span>
          <span className="text-[11px] text-muted mt-0.5">Chance of success · Viability Score</span>
        </div>
      </div>
    );
  }

  // Common collapsible explanation
  const detailsAccordion = geo ? (
    <details className="mt-2 pt-3 border-t border-border-default/60 text-xs text-muted">
      <summary className="cursor-pointer font-medium hover:text-main transition-colors select-none">
        How we worked this out
      </summary>
      <div className="mt-2.5 space-y-1.5 leading-relaxed">
        <p>
          People = {geo.districtName} district population density ({geo.densityBasis} population, Census 2011 — the latest official count) × area within {radiusKm} km.
        </p>
        <p>
          Sellers = businesses listed on Mappls for &lsquo;{keyword}&rsquo;. Small shops are often missing, so the real number may be higher.
        </p>
        <p>
          Good room: 5,000+ people per seller · Some room: 2,000–5,000 · Crowded: under 2,000. If the map shows 30 or more sellers, we don&apos;t give a verdict. Prototype thresholds, to be tuned with SCA data.
        </p>
        {geo.mappingNote && <p>{geo.mappingNote}</p>}
        {geo.ambiguous && <p>Your pincode spans more than one district; we used {geo.districtName}.</p>}
      </div>
    </details>
  ) : null;

  // Render 3: Not on map
  if (state.kind === "notOnMap") {
    return (
      <div className="app-card rounded-2xl p-6 flex flex-col justify-between gap-5 border border-border-default shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-main">{businessName}</h2>
            <div className="text-xs text-muted flex items-center space-x-2 mt-1.5">
              <svg className="w-3.5 h-3.5 text-muted shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{location}</span>
            </div>
            <p className="text-xs text-muted mt-3 max-w-xl leading-relaxed">
              So we can&apos;t count sellers there. Search for your village on the map below to try.
            </p>
          </div>
          <div className="flex flex-col text-left sm:text-right border border-border-default bg-surface-subtle/50 rounded-2xl px-5 py-3.5 shrink-0 self-start sm:self-auto min-w-[200px]">
            <span className="text-sm font-semibold text-main">Couldn&apos;t place your pincode on the map</span>
            <span className="text-[11px] text-muted mt-0.5">Room in your market · Market saturation</span>
          </div>
        </div>
        {geo && (
          <div className="text-xs text-muted space-y-1 pt-1 border-t border-border-default/40">
            <p>People you can sell to: {formatApprox(peopleInReach)} within {radiusKm} km</p>
          </div>
        )}
        {detailsAccordion}
      </div>
    );
  }

  // Render 4: Map moved
  if (state.kind === "mapMoved") {
    return (
      <div className="app-card rounded-2xl p-6 flex flex-col justify-between gap-5 border border-border-default shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-main">{businessName}</h2>
            <div className="text-xs text-muted flex items-center space-x-2 mt-1.5">
              <svg className="w-3.5 h-3.5 text-muted shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{location}</span>
            </div>
            <p className="text-xs text-muted mt-3 max-w-xl leading-relaxed">
              The map has moved away from your pincode area. Clear your search or use &apos;My answers&apos; to see your area&apos;s result.
            </p>
          </div>
          <div className="flex flex-col text-left sm:text-right border border-border-default bg-surface-subtle/50 rounded-2xl px-5 py-3.5 shrink-0 self-start sm:self-auto min-w-[200px]">
            <span className="text-sm font-semibold text-main">Map moved</span>
            <span className="text-[11px] text-muted mt-0.5">Room in your market · Market saturation</span>
          </div>
        </div>
        {detailsAccordion}
      </div>
    );
  }

  // Render 5: Other Business Type
  if (state.kind === "otherBusiness") {
    return (
      <div className="app-card rounded-2xl p-6 flex flex-col justify-between gap-5 border border-border-default shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-main">{businessName}</h2>
            <div className="text-xs text-muted flex items-center space-x-2 mt-1.5">
              <svg className="w-3.5 h-3.5 text-muted shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{location}</span>
            </div>
          </div>
          <div className="flex flex-col text-left sm:text-right border border-border-default bg-surface-subtle/50 rounded-2xl px-5 py-3.5 shrink-0 self-start sm:self-auto min-w-[200px]">
            <span className="text-sm font-semibold text-main">Demand check only</span>
            <span className="text-[11px] text-muted mt-0.5">Room in your market · Market saturation</span>
          </div>
        </div>
        <div className="text-xs text-muted space-y-1 pt-1 border-t border-border-default/40">
          <p>People you can sell to: {formatApprox(peopleInReach)} within {radiusKm} km</p>
          <p>We can&apos;t count similar sellers for &apos;Something else&apos; yet.</p>
        </div>
        {detailsAccordion}
      </div>
    );
  }

  // Render 6: No live data (fallback or timeout)
  if (state.kind === "noLiveData") {
    return (
      <div className="app-card rounded-2xl p-6 flex flex-col justify-between gap-5 border border-border-default shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-main">{businessName}</h2>
            <div className="text-xs text-muted flex items-center space-x-2 mt-1.5">
              <svg className="w-3.5 h-3.5 text-muted shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{location}</span>
            </div>
          </div>
          <div className="flex flex-col text-left sm:text-right border border-border-default bg-surface-subtle/50 rounded-2xl px-5 py-3.5 shrink-0 self-start sm:self-auto min-w-[200px]">
            <span className="text-sm font-semibold text-main">Showing population only</span>
            <span className="text-[11px] text-muted mt-0.5">Room in your market · Market saturation</span>
          </div>
        </div>
        <div className="text-xs text-muted space-y-1 pt-1 border-t border-border-default/40">
          <p>We couldn&apos;t load sellers nearby right now. Showing population only.</p>
          <p>People you can sell to: {formatApprox(peopleInReach)} within {radiusKm} km</p>
        </div>
        {detailsAccordion}
      </div>
    );
  }

  // Render 7: Verdict
  const { verdict, peoplePerSeller, sellerCount, sellerCountIsCapped } = state;

  let badgeStyle = "bg-surface-subtle/50 text-main border-border-default";
  let glowColor: string | undefined;

  if (verdict === "goodRoom") {
    badgeStyle = "bg-[var(--status-good-bg)] text-[var(--status-good)] border-[var(--status-good-border)]";
    glowColor = "var(--status-good-glow)";
  } else if (verdict === "someRoom" || verdict === "manySellers") {
    badgeStyle = "bg-[var(--status-warning-bg)] text-[var(--status-warning)] border-[var(--status-warning-border)]";
    glowColor = "var(--status-warning-glow)";
  } else if (verdict === "crowded") {
    badgeStyle = "bg-[var(--status-error-bg)] text-[var(--status-error)] border-[var(--status-error-border)]";
    glowColor = "var(--status-error-glow)";
  }

  const verdictTitles: Record<MarketRoomVerdict, string> = {
    goodRoom: "Good room for one more",
    someRoom: "Some room — think it through",
    crowded: "Crowded — many sellers already",
    noSellersFound: "No similar sellers found on the map nearby",
    manySellers: "Many sellers already",
  };

  const sellerCountDisplay = sellerCountIsCapped ? "30 or more" : `${sellerCount}`;

  return (
    <div
      className="app-card rounded-2xl p-6 flex flex-col justify-between gap-5 border border-border-default shadow-card"
      style={glowColor ? { boxShadow: `0 10px 40px -10px ${glowColor}` } : undefined}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-main">{businessName}</h2>
          <div className="text-xs text-muted flex items-center space-x-2 mt-1.5">
            <svg className="w-3.5 h-3.5 text-muted shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{location}</span>
          </div>
        </div>

        <div className={`flex flex-col text-left sm:text-right border rounded-2xl px-5 py-3.5 shrink-0 self-start sm:self-auto min-w-[200px] ${badgeStyle}`}>
          <span className="text-sm font-semibold">{verdictTitles[verdict]}</span>
          <span className="text-[11px] opacity-80 mt-0.5">Room in your market · Market saturation</span>
        </div>
      </div>

      {verdict === "noSellersFound" && (
        <p className="text-xs text-muted leading-relaxed">
          Many small village shops are not on online maps, so check by visiting before you invest.
        </p>
      )}

      {verdict === "manySellers" && (
        <p className="text-xs text-muted leading-relaxed">
          30 or more similar sellers are on the map within {radiusKm} km — too many for us to count exactly, so we can&apos;t tell how much room is left. Visit the area and count the shops yourself before you invest.
        </p>
      )}

      {/* Under the verdict metrics */}
      <div className="text-xs text-muted space-y-1 pt-1 border-t border-border-default/40">
        {peoplePerSeller !== null && (
          <p className="text-main font-medium">
            {formatApprox(peoplePerSeller).replace(/^about /, "About ")} people per similar seller nearby
          </p>
        )}
        <p>People you can sell to: {formatApprox(peopleInReach)} within {radiusKm} km</p>
        <p>Similar sellers on the map: {sellerCountDisplay}</p>
      </div>

      {detailsAccordion}
    </div>
  );
}
