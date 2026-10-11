"use client";

import React from "react";
import { ViabilityScoreCard } from "@/components/entrepreneur/ViabilityScoreCard";
import { useUserLocation } from "@/lib/location/useUserLocation";
import { BUSINESS_TYPE_INFO } from "@/lib/businessTypes";

interface OpportunityHeaderProps {
  sampleBusinessName: string;
  sampleLocation: string;
  sampleScore: number;
}

export function OpportunityHeader({
  sampleBusinessName,
  sampleLocation,
  sampleScore,
}: OpportunityHeaderProps) {
  const { ready, isSampleBusiness, pincode, businessType, status, label } = useUserLocation();

  if (!ready || isSampleBusiness || status === "noProfile") {
    return (
      <ViabilityScoreCard
        businessName={sampleBusinessName}
        location={sampleLocation}
        viabilityScore={sampleScore}
      />
    );
  }

  // Real user with Quick Start answers
  const typeLabel = businessType ? BUSINESS_TYPE_INFO[businessType]?.label : undefined;
  const businessName =
    businessType === "other" || !typeLabel
      ? "Your business"
      : `Your ${typeLabel.toLowerCase()} business`;

  let location = "Your area";
  if (status === "found" && label) {
    location = label;
  } else if (status === "loading" && pincode) {
    location = `Pincode ${pincode}`;
  } else if (status === "notFound" && pincode) {
    location = `Pincode ${pincode} (not found on the map)`;
  }

  return (
    <ViabilityScoreCard
      businessName={businessName}
      location={location}
      viabilityScore={null}
    />
  );
}
