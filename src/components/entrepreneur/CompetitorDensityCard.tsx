"use client";
import React, { useEffect, useState } from "react";
import { FeasibilityReport } from "@/types";
import { SampleDataTag } from "@/components/shared/SampleDataTag";
import { useUserLocation } from "@/lib/location/useUserLocation";

interface Props {
  density: FeasibilityReport["competitorDensity"];
}

export function CompetitorDensityCard({ density }: Props) {
  const { ready, isSampleBusiness, status } = useUserLocation();
  const [realDensity, setRealDensity] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const handleUpdate = (e: any) => {
      if (!e.detail) return;
      if (e.detail.loading) {
        setIsLoading(true);
        setIsError(false);
      } else if (e.detail.error) {
        setIsError(true);
        setIsLoading(false);
      } else {
        setRealDensity(e.detail);
        setIsLoading(false);
        setIsError(false);
      }
    };
    window.addEventListener('nearby-data-update', handleUpdate);
    return () => window.removeEventListener('nearby-data-update', handleUpdate);
  }, []);

  const cardHeader = (
    <div className="border-b border-border-default/60 pb-3 mb-5">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
        Similar sellers nearby
      </h3>
      <p className="text-[10px] text-muted">Competitor density</p>
    </div>
  );

  // 1. Profile loading state: never flash sample data while profile is resolving
  if (!ready) {
    return (
      <div className="app-card rounded-2xl p-6 border-border-default shadow-card relative">
        {cardHeader}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-pulse">
          <div className="bg-surface-subtle/50 rounded-xl p-4 border border-border-default min-h-[110px] flex flex-col justify-between">
            <div className="h-3 w-32 bg-surface-subtle rounded" />
            <div className="h-8 w-16 bg-surface-subtle rounded mt-2" />
            <div className="h-3 w-28 bg-surface-subtle rounded mt-2" />
          </div>
          <div className="bg-surface-subtle/50 rounded-xl p-4 border border-border-default min-h-[110px] flex flex-col justify-between">
            <div className="h-3 w-28 bg-surface-subtle rounded" />
            <div className="h-8 w-16 bg-surface-subtle rounded mt-2" />
            <div className="h-3 w-36 bg-surface-subtle rounded mt-2" />
          </div>
        </div>
      </div>
    );
  }

  // 2. Sample business or SCA Officer (no profile): render today's sample view unchanged
  if (isSampleBusiness || status === "noProfile") {
    const rawCount = (density as any)?.count;
    let countNum = 0;
    if (typeof rawCount === 'string' && rawCount.includes('+')) {
      countNum = parseInt(rawCount.replace('+', ''), 10);
    } else {
      countNum = Number(rawCount) || 0;
    }

    const sampleLevel: "Low" | "Medium" | "High" =
      (density as any)?.level || (countNum < 3 ? "Low" : countNum < 8 ? "Medium" : "High");

    const statusColors = {
      Low: "bg-[var(--status-good-bg)] text-[var(--status-good)] border-[var(--status-good-border)]",
      Medium: "bg-[var(--status-warning-bg)] text-[var(--status-warning)] border-[var(--status-warning-border)]",
      High: "bg-[var(--status-error-bg)] text-[var(--status-error)] border-[var(--status-error-border)]",
    };

    return (
      <div className="app-card rounded-2xl p-6 border-border-default shadow-card relative">
        <SampleDataTag variant="sample" className="absolute top-4 right-4" />
        {cardHeader}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-surface-subtle/50 rounded-xl p-4 border border-border-default flex flex-col justify-between">
            <span className="text-xs font-semibold text-muted uppercase tracking-wider">
              Sellers found on the map
            </span>
            <p className="text-3xl font-semibold text-main mt-2">{density.count}</p>
            <p className="text-xs text-muted mt-2">Within search radius</p>
          </div>

          <div className={`rounded-xl p-4 border ${statusColors[sampleLevel] || statusColors.Medium} flex flex-col justify-between`}>
            <span className="text-xs font-semibold uppercase tracking-wider opacity-80">
              How crowded
            </span>
            <p className="text-3xl font-semibold mt-2">{sampleLevel}</p>
            <p className="text-xs opacity-75 mt-2">Market saturation</p>
          </div>

          <div className="bg-surface-subtle/50 rounded-xl p-4 border border-border-default flex flex-col justify-between">
            <span className="text-xs font-semibold text-muted uppercase tracking-wider">
              Nearest seller
            </span>
            <p className="text-3xl font-semibold text-main mt-2">{density.avgDistanceKm} km</p>
            <p className="text-xs text-muted mt-2">Distance to the closest one</p>
          </div>
        </div>
      </div>
    );
  }

  // 3. Real user: error state
  if (isError) {
    return (
      <div className="app-card rounded-2xl p-6 border-border-default shadow-card relative">
        {cardHeader}
        <div className="rounded-xl border border-border-default bg-surface-subtle/50 p-4 text-xs text-muted">
          Couldn&apos;t check sellers right now — try again later.
        </div>
      </div>
    );
  }

  // 4. Real user: map search loading placeholder
  if (isLoading || !realDensity) {
    return (
      <div className="app-card rounded-2xl p-6 border-border-default shadow-card relative">
        {cardHeader}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-pulse">
          <div className="bg-surface-subtle/50 rounded-xl p-4 border border-border-default min-h-[110px] flex flex-col justify-between">
            <div className="h-3 w-32 bg-surface-subtle rounded" />
            <div className="h-8 w-16 bg-surface-subtle rounded mt-2" />
            <div className="h-3 w-28 bg-surface-subtle rounded mt-2" />
          </div>
          <div className="bg-surface-subtle/50 rounded-xl p-4 border border-border-default min-h-[110px] flex flex-col justify-between">
            <div className="h-3 w-28 bg-surface-subtle rounded" />
            <div className="h-8 w-16 bg-surface-subtle rounded mt-2" />
            <div className="h-3 w-36 bg-surface-subtle rounded mt-2" />
          </div>
        </div>
      </div>
    );
  }

  // 5. Real user: live 2-column view (never "How crowded", never SampleDataTag)
  let radiusSublabel = "Within search radius";
  if (realDensity.effectiveRadiusKm !== undefined && realDensity.sliderRadiusKm !== undefined) {
    if (realDensity.effectiveRadiusKm < realDensity.sliderRadiusKm) {
      radiusSublabel = "Within 10 km";
    }
  }

  const distanceText =
    realDensity.avgDistanceKm === "None found nearby"
      ? "None found nearby"
      : `${realDensity.avgDistanceKm} km`;

  return (
    <div className="app-card rounded-2xl p-6 border-border-default shadow-card relative">
      {cardHeader}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-surface-subtle/50 rounded-xl p-4 border border-border-default flex flex-col justify-between">
          <span className="text-xs font-semibold text-muted uppercase tracking-wider">
            Sellers found on the map
          </span>
          <p className="text-3xl font-semibold text-main mt-2">{realDensity.count}</p>
          <p className="text-xs text-muted mt-2">{radiusSublabel}</p>
        </div>

        <div className="bg-surface-subtle/50 rounded-xl p-4 border border-border-default flex flex-col justify-between">
          <span className="text-xs font-semibold text-muted uppercase tracking-wider">
            Nearest seller
          </span>
          <p className="text-3xl font-semibold text-main mt-2">{distanceText}</p>
          <p className="text-xs text-muted mt-2">Distance to the closest one</p>
        </div>
      </div>
    </div>
  );
}
