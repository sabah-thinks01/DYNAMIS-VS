"use client";

import { useEffect, useState, useMemo } from "react";
import { BUSINESS_TYPE_INFO } from "@/lib/businessTypes";
import type { BusinessType } from "@/lib/profile/types";
import {
  rankAlternatives,
  type AlternativeCountInput,
  type RankedAlternativesResult,
} from "./alternatives";

export const CANDIDATE_BUSINESS_TYPES: BusinessType[] = [
  "farmSupplies",
  "dairyAnimals",
  "foodMaking",
  "tailoring",
  "smallShop",
  "repairServices",
];

export interface UseAlternativesParams {
  currentBusinessType?: BusinessType | null;
  centerLat?: number | null;
  centerLng?: number | null;
  radiusKm?: number | null;
  peopleInReach?: number | null;
  enabled: boolean;
}

export interface UseAlternativesResult {
  status: "idle" | "loading" | "done";
  result: RankedAlternativesResult;
  candidateLabels: string[];
}

export function parseNearbyResponse(
  httpOk: boolean,
  data: unknown
): { count: number | null; capped: boolean; failed: boolean } {
  // If the route specifically returned 404 for zero results (errorType: 'no_results'):
  if (
    !httpOk &&
    typeof data === "object" &&
    data !== null &&
    (data as any).errorType === "no_results"
  ) {
    return { count: 0, capped: false, failed: false };
  }

  // Any non-200 response that isn't confirmed zero-results is a failure
  if (!httpOk) {
    return { count: null, capped: false, failed: true };
  }

  // Data must be a valid JSON object
  if (typeof data !== "object" || data === null) {
    return { count: null, capped: false, failed: true };
  }

  const d = data as Record<string, unknown>;

  // data.ok must not be false
  if (d.ok === false) {
    return { count: null, capped: false, failed: true };
  }

  // results field must be an array
  if (!Array.isArray(d.results)) {
    return { count: null, capped: false, failed: true };
  }

  // Dedupe only on place.eLoc. Places without an eLoc are each counted once.
  const seenELocs = new Set<string>();
  let count = 0;
  for (const place of d.results) {
    if (place && typeof place === "object" && (place as any).eLoc) {
      const eLoc = String((place as any).eLoc);
      if (!seenELocs.has(eLoc)) {
        seenELocs.add(eLoc);
        count++;
      }
    } else {
      // Places without an eLoc are each counted once (no lat/lng fallback key; Mappls nearby results have no lat/lng)
      count++;
    }
  }

  const isCapped = d.capped === true || count >= 30;

  return {
    count,
    capped: isCapped,
    failed: false,
  };
}

function getFromCache(key: string): { count: number; capped: boolean } | null {
  try {
    if (typeof window === "undefined" || !window.sessionStorage) return null;
    const raw = window.sessionStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed?.count === "number" && typeof parsed?.capped === "boolean") {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

function saveToCache(key: string, data: { count: number; capped: boolean }): void {
  try {
    if (typeof window === "undefined" || !window.sessionStorage) return;
    window.sessionStorage.setItem(key, JSON.stringify(data));
  } catch {
    // Ignore storage quota or security errors
  }
}

async function runWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < items.length) {
      const idx = nextIndex++;
      results[idx] = await fn(items[idx]);
    }
  }

  const workers = Array.from(
    { length: Math.min(concurrency, items.length) },
    () => worker()
  );
  await Promise.all(workers);
  return results;
}

export function useAlternatives(params: UseAlternativesParams): UseAlternativesResult {
  const { currentBusinessType, centerLat, centerLng, radiusKm, peopleInReach, enabled } = params;

  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");
  const [counts, setCounts] = useState<AlternativeCountInput[]>([]);

  // Filter candidates: exclude user's own type and "other", take first 6
  const candidateTypes = useMemo(() => {
    return CANDIDATE_BUSINESS_TYPES.filter(
      (type) => type !== currentBusinessType && type !== "other"
    ).slice(0, 6);
  }, [currentBusinessType]);

  const candidateLabels = useMemo(() => {
    return candidateTypes.map((type) => BUSINESS_TYPE_INFO[type]?.label || type);
  }, [candidateTypes]);

  useEffect(() => {
    // Check whether fetching is enabled and inputs are valid
    if (
      !enabled ||
      centerLat == null ||
      centerLng == null ||
      radiusKm == null ||
      peopleInReach == null ||
      peopleInReach <= 0 ||
      isNaN(centerLat) ||
      isNaN(centerLng) ||
      isNaN(radiusKm) ||
      isNaN(peopleInReach) ||
      candidateTypes.length === 0
    ) {
      setStatus("idle");
      setCounts([]);
      return;
    }

    const abortController = new AbortController();
    const { signal } = abortController;
    let isCancelled = false;

    setStatus("loading");

    const radiusMetres = Math.min(Math.round(radiusKm * 1000), 10000);

    const fetchSingleType = async (type: BusinessType): Promise<AlternativeCountInput> => {
      const info = BUSINESS_TYPE_INFO[type];
      const label = info?.label || type;
      const keyword = info?.nearbyKeywords?.[0];

      if (!keyword) {
        return { type, label, count: null, capped: false, failed: true };
      }

      const cacheKey = `alt:v1:${keyword}:${centerLat.toFixed(3)}:${centerLng.toFixed(3)}:${radiusMetres}`;

      // Check sessionStorage cache first
      const cached = getFromCache(cacheKey);
      if (cached) {
        return {
          type,
          label,
          count: cached.count,
          capped: cached.capped,
          failed: false,
        };
      }

      if (signal.aborted) {
        return { type, label, count: null, capped: false, failed: false };
      }

      try {
        const url = `/api/nearby?lat=${centerLat}&lng=${centerLng}&radius=${radiusMetres}&keyword=${encodeURIComponent(keyword)}`;
        const res = await fetch(url, { signal });

        if (signal.aborted) {
          return { type, label, count: null, capped: false, failed: false };
        }

        const data = await res.json().catch(() => null);

        if (signal.aborted) {
          return { type, label, count: null, capped: false, failed: false };
        }

        const parsed = parseNearbyResponse(res.ok, data);

        if (parsed.failed) {
          return { type, label, count: null, capped: false, failed: true };
        }

        saveToCache(cacheKey, { count: parsed.count!, capped: parsed.capped });

        return {
          type,
          label,
          count: parsed.count,
          capped: parsed.capped,
          failed: false,
        };
      } catch (err) {
        if (signal.aborted || (err instanceof DOMException && err.name === "AbortError")) {
          // Aborted: do not cache, do not mark as failed
          return { type, label, count: null, capped: false, failed: false };
        }
        return { type, label, count: null, capped: false, failed: true };
      }
    };

    // Run calls with max 2 concurrent requests
    runWithConcurrency(candidateTypes, 2, fetchSingleType)
      .then((results) => {
        if (!isCancelled && !signal.aborted) {
          setCounts(results);
          setStatus("done");
        }
      })
      .catch(() => {
        if (!isCancelled && !signal.aborted) {
          setStatus("done");
        }
      });

    return () => {
      isCancelled = true;
      abortController.abort();
    };
  }, [
    enabled,
    centerLat,
    centerLng,
    radiusKm,
    peopleInReach,
    candidateTypes,
  ]);

  const result = useMemo(() => {
    return rankAlternatives({ peopleInReach, counts });
  }, [peopleInReach, counts]);

  return {
    status,
    result,
    candidateLabels,
  };
}
