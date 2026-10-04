import { NextResponse } from 'next/server';

// Global cache and rate limiting state
const cache = new Map<string, { data: any; expiry: number }>();
const MAX_CACHE_SIZE = 1000;
const CACHE_TTL_MS = 1000 * 60 * 60; // 1 hour

let lastNominatimRequestTime = 0;
let requestQueue: Promise<void> = Promise.resolve();

async function enqueueNominatimRequest(): Promise<void> {
  const waitPromise = requestQueue.then(() => {
    return new Promise<void>(resolve => {
      const now = Date.now();
      const timeSinceLast = now - lastNominatimRequestTime;
      const delay = Math.max(0, 1000 - timeSinceLast);
      setTimeout(() => {
        lastNominatimRequestTime = Date.now();
        resolve();
      }, delay);
    });
  });
  requestQueue = waitPromise;
  return waitPromise;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawAddress = searchParams.get('address') || '';
  const isMulti = searchParams.get('multi') === '1';

  // 1. Normalize query
  const normalizedAddress = rawAddress.trim().toLowerCase().replace(/\s+/g, ' ');

  if (!normalizedAddress || normalizedAddress.length > 100) {
    return NextResponse.json({ ok: false, errorType: 'no_results' }, { status: 400 });
  }

  // 2. Check cache
  const cacheKey = `${normalizedAddress}_multi:${isMulti}`;
  const now = Date.now();
  if (cache.has(cacheKey)) {
    const cachedItem = cache.get(cacheKey)!;
    if (now < cachedItem.expiry) {
      cache.delete(cacheKey);
      cache.set(cacheKey, cachedItem);
      return NextResponse.json({ ...cachedItem.data, source: 'cache' });
    } else {
      cache.delete(cacheKey);
    }
  }

  // Ensure cache doesn't grow unbounded
  if (cache.size >= MAX_CACHE_SIZE) {
    const firstKey = cache.keys().next().value;
    if (firstKey) cache.delete(firstKey);
  }

  const setCache = (data: any, ttlMs: number = CACHE_TTL_MS) => {
    cache.set(cacheKey, { data, expiry: Date.now() + ttlMs });
  };

  try {
    // 4. Enforce 1 request/second globally
    await enqueueNominatimRequest();

    // 3. Call Nominatim
    const limit = isMulti ? 5 : 1;
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(normalizedAddress)}&format=jsonv2&countrycodes=in&limit=${limit}&addressdetails=1`;
    
    let userAgent = "DYNAMIS-SIH26091/0.1";
    if (process.env.NOMINATIM_CONTACT_EMAIL) {
      userAgent += ` (${process.env.NOMINATIM_CONTACT_EMAIL})`;
    }

    const abortController = new AbortController();
    const timeout = setTimeout(() => abortController.abort(), 6000);

    const res = await fetch(url, {
      headers: { 'User-Agent': userAgent },
      signal: abortController.signal
    });

    clearTimeout(timeout);

    if (res.status === 429 || res.status === 403) {
      return NextResponse.json({ ok: false, errorType: 'rate_limited' }, { status: 429 });
    }

    if (!res.ok) {
      return NextResponse.json({ ok: false, errorType: 'network' }, { status: 500 });
    }

    const data = await res.json();

    if (!Array.isArray(data) || data.length === 0) {
      const errorResult = { ok: false, errorType: 'no_results' };
      setCache(errorResult, 1000 * 60 * 5); // cache negative results for 5 mins
      return NextResponse.json(errorResult, { status: 404 });
    }

    if (isMulti) {
      const settlementTypes = new Set(['village', 'hamlet', 'town', 'city', 'suburb', 'locality']);
      const isSettlement = (p: any) => {
        const t = (p.type || '').toLowerCase();
        const at = (p.addresstype || '').toLowerCase();
        return settlementTypes.has(t) || settlementTypes.has(at);
      };

      // Sort so settlements come before administrative/boundary results, preserving relative order within each group
      const settlements: any[] = [];
      const nonSettlements: any[] = [];
      for (const item of data) {
        if (isSettlement(item)) {
          settlements.push(item);
        } else {
          nonSettlements.push(item);
        }
      }
      const sortedData = [...settlements, ...nonSettlements];

      const formatMultiLabel = (place: any) => {
        const placeName = (place.name || (place.display_name ? place.display_name.split(',')[0].trim() : '')).trim();
        const a = place.address || {};
        
        const secondaryCandidates = [
          a.subdistrict || a.taluk || a.county,
          a.state_district || a.district,
          a.state
        ].filter(Boolean);

        const parts = [placeName];
        for (const candidate of secondaryCandidates) {
          const trimmed = String(candidate).trim();
          if (!parts.some(p => p.toLowerCase() === trimmed.toLowerCase())) {
            parts.push(trimmed);
          }
        }
        return parts.length > 0 ? parts.join(', ') : place.display_name;
      };

      const results: any[] = [];
      for (const place of sortedData) {
        const lat = parseFloat(place.lat);
        const lng = parseFloat(place.lon);
        if (isNaN(lat) || isNaN(lng)) continue;

        const label = formatMultiLabel(place);
        const item = { lat, lng, formattedAddress: label, type: place.type };

        // De-duplicate (same label or within ~1km / 0.009 degrees)
        const isDup = results.some(d => 
          d.formattedAddress.toLowerCase() === item.formattedAddress.toLowerCase() || 
          (Math.abs(d.lat - item.lat) < 0.009 && Math.abs(d.lng - item.lng) < 0.009)
        );
        if (!isDup) results.push(item);
      }

      if (results.length === 0) {
        const errorResult = { ok: false, errorType: 'no_results' };
        setCache(errorResult, 1000 * 60 * 5);
        return NextResponse.json(errorResult, { status: 404 });
      }

      const successResult = { ok: true, results, source: 'nominatim' };
      setCache(successResult);
      return NextResponse.json(successResult);
    } else {
      const place = data[0];
      const lat = parseFloat(place.lat);
      const lng = parseFloat(place.lon);
      if (isNaN(lat) || isNaN(lng)) {
        const errorResult = { ok: false, errorType: 'no_results' };
        setCache(errorResult, 1000 * 60 * 5);
        return NextResponse.json(errorResult, { status: 404 });
      }

      const successResult = {
        ok: true,
        lat,
        lng,
        formattedAddress: place.display_name, // keep backward compat for single
        source: 'nominatim'
      };
      setCache(successResult);
      return NextResponse.json(successResult);
    }

  } catch (error: any) {
    console.error('Server-side geocoding error:', error);
    if (error.name === 'AbortError') {
      return NextResponse.json({ ok: false, errorType: 'network' }, { status: 504 });
    }
    return NextResponse.json({ ok: false, errorType: 'network' }, { status: 500 });
  }
}
