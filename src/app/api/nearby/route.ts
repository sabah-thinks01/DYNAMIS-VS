import { NextRequest, NextResponse } from "next/server";
import { NEARBY_MAX_RADIUS_KM } from "@/lib/competitorConfig";

interface CacheEntry {
  total: number;
  capped: boolean;
  partial?: boolean;
  results: any[];
  errorType?: 'no_results' | 'network' | 'auth' | 'rate_limited';
  expires: number;
}
const cache = new Map<string, CacheEntry>();
const CACHE_TTL = 30 * 60 * 1000;
const EMPTY_CACHE_TTL = 5 * 60 * 1000;
const MAX_CACHE = 500;

let callsThisSecond = 0;
let currentSecond = Math.floor(Date.now() / 1000);
const MAX_CALLS_PER_SEC = 5;

const M_RADIUS_MAX = NEARBY_MAX_RADIUS_KM * 1000;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const rawLat = searchParams.get("lat");
  const rawLng = searchParams.get("lng");
  const rawRadius = searchParams.get("radius");
  const rawKeyword = searchParams.get("keyword");

  if (!rawLat || !rawLng || !rawRadius || !rawKeyword) {
    return NextResponse.json({ ok: false, errorType: 'network' }, { status: 400 });
  }

  const lat = parseFloat(rawLat);
  const lng = parseFloat(rawLng);
  if (isNaN(lat) || isNaN(lng) || lat < 6 || lat > 38 || lng < 68 || lng > 98) {
    return NextResponse.json({ ok: false, errorType: 'network' }, { status: 400 });
  }

  let radius = parseInt(rawRadius, 10);
  if (isNaN(radius) || radius <= 0) radius = 1000;
  if (radius > M_RADIUS_MAX) radius = M_RADIUS_MAX;

  const keyword = rawKeyword.trim().substring(0, 40);
  if (!keyword) {
    return NextResponse.json({ ok: false, errorType: 'network' }, { status: 400 });
  }

  const cacheKey = lat.toFixed(3) + "," + lng.toFixed(3) + "|" + radius + "|" + keyword.toLowerCase();
  const now = Date.now();
  
  if (cache.has(cacheKey)) {
    const entry = cache.get(cacheKey)!;
    if (now < entry.expires) {
      if (entry.errorType === 'no_results') {
        return NextResponse.json({ ok: false, errorType: 'no_results', source: 'cache' }, { status: 404 });
      }
      return NextResponse.json({
        ok: true,
        total: entry.total,
        capped: entry.capped,
        partial: entry.partial,
        results: entry.results,
        source: 'cache'
      }, { status: 200 });
    } else {
      cache.delete(cacheKey);
    }
  }

  const apiKey = process.env.NEXT_PUBLIC_MAPPLS_MAP_KEY;
  if (!apiKey) {
    return NextResponse.json({ ok: false, errorType: 'auth' }, { status: 401 });
  }

  const results: any[] = [];
  let total = 0;
  let capped = false;
  let isPartial = false;
  let hasAuthError = false;
  let rateLimited = false;
  let firstPageFailed = false;

  for (let page = 1; page <= 3; page++) {
    const sec = Math.floor(Date.now() / 1000);
    if (sec !== currentSecond) {
      currentSecond = sec;
      callsThisSecond = 0;
    }
    if (callsThisSecond >= MAX_CALLS_PER_SEC) {
      await new Promise(r => setTimeout(r, 1000));
      callsThisSecond = 0;
      currentSecond = Math.floor(Date.now() / 1000);
    }
    callsThisSecond++;

    const url = "https://search.mappls.com/search/places/nearby/json?keywords=" + encodeURIComponent(keyword) + "&refLocation=" + lat + "," + lng + "&radius=" + radius + "&page=" + page + "&access_token=" + apiKey;
    try {
      const res = await fetch(url);
      if (res.status === 204) {
        break;
      }
      if (res.status === 401 || res.status === 403) {
        hasAuthError = true;
        break;
      }
      if (res.status === 429) {
        rateLimited = true;
        break;
      }
      if (!res.ok) {
        if (page === 1) {
          firstPageFailed = true;
        } else {
          isPartial = true;
        }
        break;
      }

      const data = await res.json();
      if (!data.suggestedLocations || data.suggestedLocations.length === 0) {
        break;
      }

      total = data.pageInfo?.totalHits || total;
      for (const loc of data.suggestedLocations) {
        if (loc.eLoc && !results.find(r => r.eLoc === loc.eLoc)) {
          results.push({
            eLoc: loc.eLoc,
            placeName: loc.placeName,
            distance: loc.distance,
            type: loc.type
          });
        }
      }

      const totalPages = data.pageInfo?.totalPages || 1;
      if (page >= totalPages) break;
      if (results.length >= 30) {
        capped = true;
        break;
      }
    } catch (err) {
      if (page === 1) {
        firstPageFailed = true;
      } else {
        isPartial = true;
      }
      break;
    }
  }

  if (hasAuthError) {
    return NextResponse.json({ ok: false, errorType: 'auth' }, { status: 401 });
  }
  if (rateLimited) {
    return NextResponse.json({ ok: false, errorType: 'rate_limited' }, { status: 429 });
  }
  if (firstPageFailed) {
    return NextResponse.json({ ok: false, errorType: 'network' }, { status: 502 });
  }

  if (cache.size >= MAX_CACHE) {
    const oldestKey = Array.from(cache.keys())[0];
    cache.delete(oldestKey);
  }

  if (results.length === 0) {
    cache.set(cacheKey, { total: 0, capped: false, results: [], errorType: 'no_results', expires: now + EMPTY_CACHE_TTL });
    return NextResponse.json({ ok: false, errorType: 'no_results', source: 'mappls' }, { status: 404 });
  }

  const responseData: any = { ok: true, total: total || results.length, capped, results, source: 'mappls' };
  if (isPartial) {
    responseData.partial = true;
  }
  cache.set(cacheKey, { total: total || results.length, capped, partial: isPartial, results, expires: now + CACHE_TTL });

  return NextResponse.json(responseData, { status: 200 });
}
