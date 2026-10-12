"use client";

import { useEffect, useState } from "react";

export interface NearbyStats {
  hasLiveData: boolean;
  sellerCount: number;
  capped: boolean;
  effectiveRadiusKm: number;
  sliderRadiusKm: number;
  avgDistanceKm?: string;
  centerLat?: number;
  centerLng?: number;
}

let latestNearbyStats: NearbyStats | null = null;

function parseNearbyDetail(detail: any): NearbyStats {
  if (!detail || detail.isSampleData) {
    return {
      hasLiveData: false,
      sellerCount: 0,
      capped: false,
      effectiveRadiusKm: detail?.effectiveRadiusKm ?? 10,
      sliderRadiusKm: detail?.sliderRadiusKm ?? 10,
      centerLat: detail?.centerLat,
      centerLng: detail?.centerLng,
    };
  }

  const rawCount = detail.count;
  let sellerCount = 0;
  let capped = false;

  if (typeof rawCount === "string" && rawCount.includes("+")) {
    sellerCount = 30;
    capped = true;
  } else if (typeof rawCount === "number") {
    sellerCount = rawCount;
    capped = false;
  } else {
    sellerCount = parseInt(String(rawCount), 10) || 0;
    capped = false;
  }

  return {
    hasLiveData: true,
    sellerCount,
    capped,
    effectiveRadiusKm: typeof detail.effectiveRadiusKm === "number" ? detail.effectiveRadiusKm : 10,
    sliderRadiusKm: typeof detail.sliderRadiusKm === "number" ? detail.sliderRadiusKm : 10,
    avgDistanceKm: detail.avgDistanceKm,
    centerLat: detail.centerLat,
    centerLng: detail.centerLng,
  };
}

export function useNearbyStats(): NearbyStats | null {
  const [stats, setStats] = useState<NearbyStats | null>(latestNearbyStats);

  useEffect(() => {
    const handleUpdate = (e: any) => {
      const parsed = parseNearbyDetail(e.detail);
      latestNearbyStats = parsed;
      setStats(parsed);
    };

    window.addEventListener("nearby-data-update", handleUpdate);
    return () => {
      window.removeEventListener("nearby-data-update", handleUpdate);
    };
  }, []);

  return stats;
}
