"use client";
import React, { useEffect, useState } from "react";
import { FeasibilityReport } from "@/types";

interface Props {
  density: FeasibilityReport["competitorDensity"];
}

export function CompetitorDensityCard({ density }: Props) {
  const [realDensity, setRealDensity] = useState<any>(null);

  useEffect(() => {
    const handleUpdate = (e: any) => {
      if (e.detail) {
        setRealDensity(e.detail);
      }
    };
    window.addEventListener('nearby-data-update', handleUpdate);
    return () => window.removeEventListener('nearby-data-update', handleUpdate);
  }, []);

  const activeDensity = realDensity && !realDensity.isSampleData ? realDensity : density;
  const isSample = !realDensity || realDensity.isSampleData;

  let countNum = 0;
  if (typeof activeDensity.count === 'string' && activeDensity.count.includes('+')) {
    countNum = parseInt(activeDensity.count.replace('+', ''), 10);
  } else {
    countNum = Number(activeDensity.count) || 0;
  }

  const level: "Low" | "Medium" | "High" = activeDensity.level || (countNum < 3 ? "Low" : countNum < 8 ? "Medium" : "High");

  const statusColors = {
    Low: "bg-[var(--status-good-bg)] text-[var(--status-good)] border-[var(--status-good-border)]",
    Medium: "bg-[var(--status-warning-bg)] text-[var(--status-warning)] border-[var(--status-warning-border)]",
    High: "bg-[var(--status-error-bg)] text-[var(--status-error)] border-[var(--status-error-border)]",
  };

  // Sublabel for count:
  // "Within search radius" when effectiveRadiusKm equals the slider radius,
  // and is "Within 10 km" when real data is capped to 10 km.
  let radiusSublabel = "Within search radius";
  if (!isSample && realDensity && realDensity.effectiveRadiusKm !== undefined && realDensity.sliderRadiusKm !== undefined) {
    if (realDensity.effectiveRadiusKm < realDensity.sliderRadiusKm) {
      radiusSublabel = "Within 10 km";
    }
  }

  return (
    <div className="app-card rounded-2xl p-6 border-border-default shadow-card relative">
      {isSample && (
        <div className="absolute top-4 right-4 bg-surface-subtle border border-border-default text-[10px] text-muted px-2 py-0.5 rounded-full">
          Sample data
        </div>
      )}
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted border-b border-border-default/60 pb-3 mb-5">
        Competitor Density Analysis
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface-subtle/50 rounded-xl p-4 border border-border-default flex flex-col justify-between">
          <span className="text-xs font-semibold text-muted uppercase tracking-wider">
            Active Competitors
          </span>
          <p className="text-3xl font-semibold text-main mt-2">{activeDensity.count}</p>
          <p className="text-xs text-muted mt-2">{radiusSublabel}</p>
        </div>

        <div className={`rounded-xl p-4 border ${statusColors[level] || statusColors.Medium} flex flex-col justify-between`}>
          <span className="text-xs font-semibold uppercase tracking-wider opacity-80">
            Market Saturation
          </span>
          <p className="text-3xl font-semibold mt-2">{level}</p>
          <p className="text-xs opacity-75 mt-2">Density Level</p>
        </div>

        <div className="bg-surface-subtle/50 rounded-xl p-4 border border-border-default flex flex-col justify-between">
          <span className="text-xs font-semibold text-muted uppercase tracking-wider">
            Average Distance
          </span>
          <p className="text-3xl font-semibold text-main mt-2">{activeDensity.avgDistanceKm} km</p>
          <p className="text-xs text-muted mt-2">To nearest similar business</p>
        </div>
      </div>
    </div>
  );
}
