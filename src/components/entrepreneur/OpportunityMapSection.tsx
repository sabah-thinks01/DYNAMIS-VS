"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useUserLocation } from "@/lib/location/useUserLocation";
import { BUSINESS_TYPE_INFO } from "@/lib/businessTypes";

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
  const { status, isSampleBusiness, lat, lng, pincode, label, businessType } = useUserLocation();
  const [noteDismissed, setNoteDismissed] = useState(false);

  const focus =
    status === "found" && !isSampleBusiness && typeof lat === "number" && typeof lng === "number" && pincode
      ? { lat, lng, key: pincode }
      : undefined;

  const keywords =
    businessType && !isSampleBusiness
      ? BUSINESS_TYPE_INFO[businessType]?.nearbyKeywords
      : undefined;

  let noteMessage: string | null = null;
  if (!isSampleBusiness && status !== "noProfile" && !noteDismissed && pincode) {
    if (status === "loading") {
      noteMessage = `Finding pincode ${pincode} on the map…`;
    } else if (status === "found") {
      noteMessage = `Showing your area: ${label || `Pincode ${pincode}`}. Wrong place? Search for your village or use GPS.`;
    } else if (status === "notFound") {
      noteMessage = `We couldn't find pincode ${pincode} on the map, so this shows the sample area (Baramati). Search for your village or use GPS.`;
    }
  }

  return (
    <div className="space-y-3">
      {noteMessage && (
        <div
          role="status"
          aria-live="polite"
          className="rounded-xl border border-border-default bg-surface-subtle p-3 text-xs text-main flex items-start gap-2.5 leading-relaxed"
        >
          <svg
            className="w-4 h-4 text-muted shrink-0 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="flex-1">{noteMessage}</span>
        </div>
      )}
      <CompetitorMap
        centerLat={centerLat}
        centerLng={centerLng}
        competitors={competitors}
        focus={focus}
        keywords={keywords}
        onUserLocate={() => setNoteDismissed(true)}
      />
    </div>
  );
}
