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

  // 1. Normalize query
  const normalizedAddress = rawAddress.trim().toLowerCase().replace(/\s+/g, ' ');

  if (!normalizedAddress || normalizedAddress.length > 100) {
    return NextResponse.json({ ok: false, errorType: 'no_results' }, { status: 400 });
  }

  // 2. Check cache
  const now = Date.now();
  if (cache.has(normalizedAddress)) {
    const cachedItem = cache.get(normalizedAddress)!;
    if (now < cachedItem.expiry) {
      // Re-insert to update insertion order for LRU behavior if we implemented it,
      // but simple delete and set works well enough to push it to the end of keys.
      cache.delete(normalizedAddress);
      cache.set(normalizedAddress, cachedItem);
      return NextResponse.json({ ...cachedItem.data, source: 'cache' });
    } else {
      cache.delete(normalizedAddress);
    }
  }

  // Ensure cache doesn't grow unbounded
  if (cache.size >= MAX_CACHE_SIZE) {
    const firstKey = cache.keys().next().value;
    if (firstKey) cache.delete(firstKey);
  }

  const setCache = (data: any, ttlMs: number = CACHE_TTL_MS) => {
    cache.set(normalizedAddress, { data, expiry: Date.now() + ttlMs });
  };

  try {
    // 4. Enforce 1 request/second globally
    await enqueueNominatimRequest();

    // 3. Call Nominatim
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(normalizedAddress)}&format=jsonv2&countrycodes=in&limit=1&addressdetails=0`;
    
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

    const place = data[0];
    const lat = parseFloat(place.lat);
    const lng = parseFloat(place.lon);

    if (isNaN(lat) || isNaN(lng)) {
      const errorResult = { ok: false, errorType: 'no_results' };
      setCache(errorResult, 1000 * 60 * 5);
      return NextResponse.json(errorResult, { status: 404 });
    }

    // 5. Parse and return success
    const successResult = {
      ok: true,
      lat,
      lng,
      formattedAddress: place.display_name,
      source: 'nominatim'
    };
    
    setCache(successResult);
    return NextResponse.json(successResult);

  } catch (error: any) {
    console.error('Server-side geocoding error:', error);
    if (error.name === 'AbortError') {
      return NextResponse.json({ ok: false, errorType: 'network' }, { status: 504 });
    }
    return NextResponse.json({ ok: false, errorType: 'network' }, { status: 500 });
  }
}
