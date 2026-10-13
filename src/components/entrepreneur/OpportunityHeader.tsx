"use client";

import React, { useState, useEffect } from "react";
import { ViabilityScoreCard } from "@/components/entrepreneur/ViabilityScoreCard";
import { MarketRoomCard, type MarketRoomCardState } from "@/components/entrepreneur/MarketRoomCard";
import { useUserLocation } from "@/lib/location/useUserLocation";
import { useDistrictGeo } from "@/lib/geo/useDistrictGeo";
import { useNearbyStats } from "@/lib/score/useNearbyStats";
import { computeMarketRoom } from "@/lib/score/marketRoom";
import { saveMarketRoom } from "@/lib/score/marketRoomCache";
import { peopleInReach } from "@/lib/score/reach";
import { BUSINESS_TYPE_INFO } from "@/lib/businessTypes";
import { haversineDistance } from "@/lib/filterBusinesses";

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
  const { ready, isSampleBusiness, pincode, businessType, status, label, lat, lng } = useUserLocation();
  const geoResult = useDistrictGeo(pincode);
  const nearbyStats = useNearbyStats();
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimedOut(true);
    }, 15000);
    return () => clearTimeout(timer);
  }, []);

  const isRealUser = ready && !isSampleBusiness && status !== "noProfile";

  // Decide card state in priority order
  let cardState: MarketRoomCardState | null = null;

  if (isRealUser) {
    if (geoResult.status === "notCovered") {
      cardState = { kind: "notCovered" };
    } else if (status === "loading" || geoResult.status === "loading" || geoResult.status === "idle") {
      cardState = { kind: "loading" };
    } else if (status === "notFound") {
      cardState = { kind: "notOnMap" };
    } else if (geoResult.status === "error" || !geoResult.geo) {
      cardState = { kind: "notCovered" };
    } else {
      const hasCoords =
        lat != null &&
        lng != null &&
        nearbyStats?.centerLat != null &&
        nearbyStats?.centerLng != null;
      const isCenterFar =
        hasCoords &&
        haversineDistance(lat, lng, nearbyStats!.centerLat!, nearbyStats!.centerLng!) > 2;

      if (!nearbyStats || nearbyStats.centerLat == null || nearbyStats.centerLng == null || isCenterFar) {
        if (isCenterFar && nearbyStats?.hasLiveData) {
          cardState = { kind: "mapMoved" };
        } else if (timedOut) {
          cardState = { kind: "noLiveData" };
        } else {
          cardState = { kind: "loading" };
        }
      } else if (!nearbyStats.hasLiveData) {
        cardState = { kind: "noLiveData" };
      } else if (businessType === "other") {
        cardState = { kind: "otherBusiness" };
      } else {
        const result = computeMarketRoom({
          densityPerSqKm: geoResult.geo.densityPerSqKm,
          radiusKm: nearbyStats.effectiveRadiusKm || 10,
          sellerCount: nearbyStats.sellerCount,
          sellerCountIsCapped: nearbyStats.capped,
        });

        cardState = {
          kind: "verdict",
          verdict: result.verdict,
          peoplePerSeller: result.peoplePerSeller,
          sellerCount: nearbyStats.sellerCount,
          sellerCountIsCapped: result.sellerCountIsCapped,
        };
      }
    }
  }

  const radius = nearbyStats?.effectiveRadiusKm || 10;
  const cardKind = cardState?.kind;
  const verdict = cardState?.kind === "verdict" ? cardState.verdict : undefined;
  const sellerCount = cardState?.kind === "verdict" ? cardState.sellerCount : undefined;
  const sellerCountIsCapped = cardState?.kind === "verdict" ? cardState.sellerCountIsCapped : undefined;
  const densityPerSqKm = geoResult.geo?.densityPerSqKm;

  useEffect(() => {
    if (
      cardKind === "verdict" &&
      verdict &&
      sellerCount !== undefined &&
      sellerCountIsCapped !== undefined &&
      pincode &&
      businessType &&
      densityPerSqKm !== undefined
    ) {
      saveMarketRoom({
        pincode,
        businessType,
        verdict,
        sellerCount,
        sellerCountIsCapped,
        peopleInReach: peopleInReach(densityPerSqKm, radius),
        radiusKm: radius,
        savedAt: new Date().toISOString(),
      });
    }
  }, [cardKind, verdict, sellerCount, sellerCountIsCapped, pincode, businessType, densityPerSqKm, radius]);

  if (!isRealUser || !cardState) {
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

  const keyword = businessType
    ? BUSINESS_TYPE_INFO[businessType]?.nearbyKeywords?.[0] || "similar business"
    : "similar business";

  return (
    <MarketRoomCard
      businessName={businessName}
      location={location}
      state={cardState}
      geo={geoResult.geo}
      radiusKm={radius}
      keyword={keyword}
    />
  );
}
