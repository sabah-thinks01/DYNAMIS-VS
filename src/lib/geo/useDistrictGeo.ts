"use client";

import { useEffect, useState } from "react";

export interface DistrictGeoData {
  pincode: string;
  districtKey: string;
  districtName: string;
  stateName: string;
  densityPerSqKm: number;
  densityBasis: "rural" | "total";
  populationTotal: number;
  mappedVia: "direct" | "spelling" | "typo" | "postalDivision" | "newDistrict";
  mappingNote?: string;
  ambiguous?: boolean;
  source: "Census 2011 (latest official count)";
}

export type DistrictGeoStatus = "idle" | "loading" | "found" | "notCovered" | "error";

export interface DistrictGeoResult {
  status: DistrictGeoStatus;
  geo?: DistrictGeoData;
}

const geoCache = new Map<string, DistrictGeoData>();

export function useDistrictGeo(pincode?: string): DistrictGeoResult {
  const [state, setState] = useState<{
    pincode: string;
    status: DistrictGeoStatus;
    geo?: DistrictGeoData;
  } | null>(null);

  const cleanPin = pincode?.trim();

  useEffect(() => {
    if (!cleanPin || typeof window === "undefined") return;

    if (geoCache.has(cleanPin)) {
      setState({ pincode: cleanPin, status: "found", geo: geoCache.get(cleanPin) });
      return;
    }

    let active = true;

    fetch(`/api/geo?pincode=${encodeURIComponent(cleanPin)}`)
      .then((res) => res.json())
      .then((data) => {
        if (!active) return;
        if (data.ok) {
          const geoData: DistrictGeoData = {
            pincode: data.pincode,
            districtKey: data.districtKey,
            districtName: data.districtName,
            stateName: data.stateName,
            densityPerSqKm: data.densityPerSqKm,
            densityBasis: data.densityBasis,
            populationTotal: data.populationTotal,
            mappedVia: data.mappedVia,
            mappingNote: data.mappingNote,
            ambiguous: data.ambiguous,
            source: data.source,
          };
          geoCache.set(cleanPin, geoData);
          setState({ pincode: cleanPin, status: "found", geo: geoData });
        } else if (data.reason === "notCovered") {
          setState({ pincode: cleanPin, status: "notCovered" });
        } else {
          setState({ pincode: cleanPin, status: "error" });
        }
      })
      .catch(() => {
        if (!active) return;
        setState({ pincode: cleanPin, status: "error" });
      });

    return () => {
      active = false;
    };
  }, [cleanPin]);

  if (!cleanPin) {
    return { status: "idle" };
  }

  if (state?.pincode === cleanPin) {
    return { status: state.status, geo: state.geo };
  }

  return { status: "loading" };
}
