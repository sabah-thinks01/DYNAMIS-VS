"use client";

import dynamic from "next/dynamic";

interface Competitor {
  id: string;
  name: string;
  lat: number;
  lng: number;
  distanceKm: number;
  typeMatch: string;
}

interface OpportunityMapSectionProps {
  centerLat: number;
  centerLng: number;
  competitors: Competitor[];
}

const CompetitorMap = dynamic(
  () => import("@/components/entrepreneur/CompetitorMap"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-96 sm:h-[420px] rounded-2xl border border-border-default shadow-card bg-surface flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 border-4 border-accent/30 border-t-accent-strong rounded-full animate-spin mb-3"></div>
          <span className="text-xs font-medium text-main">Loading map...</span>
        </div>
      </div>
    ),
  }
);

export function OpportunityMapSection({
  centerLat,
  centerLng,
  competitors,
}: OpportunityMapSectionProps) {
  return (
    <CompetitorMap
      centerLat={centerLat}
      centerLng={centerLng}
      competitors={competitors}
    />
  );
}
