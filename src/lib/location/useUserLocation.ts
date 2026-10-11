"use client";

import { useEffect, useState } from "react";
import { useProfile } from "@/lib/profile/useProfile";
import { useActiveRole } from "@/lib/role/RoleContext";
import type { BusinessType } from "@/lib/profile/types";

export interface UserLocationResult {
  ready: boolean;
  isSampleBusiness: boolean;
  pincode?: string;
  businessType?: BusinessType;
  status: "noProfile" | "loading" | "found" | "notFound";
  lat?: number;
  lng?: number;
  label?: string;
}

interface CachedGeo {
  lat: number;
  lng: number;
  label: string;
}

interface StoredGeoState {
  pincode: string;
  geo: CachedGeo | null;
  failed: boolean;
}

const inFlightLookups = new Map<string, Promise<CachedGeo | null>>();

function readCachedGeo(pincode: string): CachedGeo | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(`dynamis-geo:v1:${pincode}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed?.lat === "number" && typeof parsed?.lng === "number" && typeof parsed?.label === "string") {
      return parsed;
    }
  } catch (e) {
    // ignore corrupt storage
  }
  return null;
}

function writeCachedGeo(pincode: string, data: CachedGeo): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`dynamis-geo:v1:${pincode}`, JSON.stringify(data));
  } catch (e) {
    // ignore quota errors
  }
}

async function lookupPincode(pincode: string): Promise<CachedGeo | null> {
  const cached = readCachedGeo(pincode);
  if (cached) return cached;

  if (inFlightLookups.has(pincode)) {
    return inFlightLookups.get(pincode)!;
  }

  const lookupPromise = (async () => {
    try {
      const res = await fetch(`/api/geocode?address=${encodeURIComponent(pincode)}`);
      const data = await res.json();
      if (res.ok && data.ok && typeof data.lat === "number" && typeof data.lng === "number") {
        const item: CachedGeo = {
          lat: data.lat,
          lng: data.lng,
          label: data.formattedAddress || `Pincode ${pincode}`,
        };
        writeCachedGeo(pincode, item);
        return item;
      }
      return null;
    } catch (e) {
      return null;
    } finally {
      inFlightLookups.delete(pincode);
    }
  })();

  inFlightLookups.set(pincode, lookupPromise);
  return lookupPromise;
}

export function useUserLocation(): UserLocationResult {
  const { profile, ready: profileReady } = useProfile();
  const [geoState, setGeoState] = useState<StoredGeoState | null>(null);
  const activeRole = useActiveRole();

  const quickStart = profile?.quickStart;
  const pincode = quickStart?.pincode?.value?.trim();
  const businessType = quickStart?.businessType?.value;
  const isSampleBusiness = quickStart?.pincode?.enteredBy === "sample";

  useEffect(() => {
    if (!profileReady || !pincode || activeRole === "officer") return;

    let active = true;
    const cached = readCachedGeo(pincode);
    if (cached) {
      setGeoState({ pincode, geo: cached, failed: false });
      return;
    }

    lookupPincode(pincode).then((res) => {
      if (!active) return;
      if (res) {
        setGeoState({ pincode, geo: res, failed: false });
      } else {
        setGeoState({ pincode, geo: null, failed: true });
      }
    });

    return () => {
      active = false;
    };
  }, [profileReady, pincode, activeRole]);

  if (activeRole === "officer") {
    return {
      ready: true,
      isSampleBusiness: false,
      status: "noProfile",
    };
  }

  if (!profileReady) {
    return {
      ready: false,
      isSampleBusiness: false,
      status: "loading",
    };
  }

  if (!quickStart || !pincode) {
    return {
      ready: true,
      isSampleBusiness: false,
      status: "noProfile",
    };
  }

  const matchesCurrentPincode = geoState?.pincode === pincode;
  const resolvedGeo = matchesCurrentPincode ? geoState?.geo : null;
  const lookupFailed = matchesCurrentPincode ? geoState?.failed : false;

  let status: "noProfile" | "loading" | "found" | "notFound" = "loading";
  if (resolvedGeo) {
    status = "found";
  } else if (lookupFailed) {
    status = "notFound";
  } else {
    status = "loading";
  }

  return {
    ready: true,
    isSampleBusiness,
    pincode,
    businessType,
    status,
    lat: resolvedGeo?.lat,
    lng: resolvedGeo?.lng,
    label: resolvedGeo?.label,
  };
}
