"use client";

/**
 * Mappls Web Maps JS SDK v3.0 Usage Notes:
 * - Marker Creation: `new window.mappls.Marker({ map, position: {lat, lng} })`
 * - Marker Removal: `marker.remove()` (Iterating over a ref array)
 * - Map Pan/Center: `map.panTo({lat, lng})` or `map.setCenter({lat, lng})`
 * - Geocoding: REST call to `/api/geocode` (using OpenStreetMap Nominatim server-side)
 * Confirmed from Mappls JS SDK v3.0 documentation and Mappls Search API docs.
 */

import { useEffect, useState, useRef, useMemo, useId } from "react";
import Script from "next/script";
import { filterBusinesses } from "@/lib/filterBusinesses";
import { MATCH_TIERS, DENSITY_THRESHOLDS, NEARBY_CAP, NEARBY_MAX_RADIUS_KM } from "@/lib/competitorConfig";

declare global {
  interface Window {
    mappls: any;
  }
}

// Helper to safely bind events regardless of whether Mappls exposes .addListener or .on
function safelyBindEvent(instance: any, eventName: string, callback: Function) {
  if (!instance) return;
  if (typeof instance.addListener === "function") {
    instance.addListener(eventName, callback);
  } else if (typeof instance.on === "function") {
    instance.on(eventName, callback);
  } else if (typeof instance.addEventListener === "function") {
    instance.addEventListener(eventName, callback);
  } else if (instance.getElement && typeof instance.getElement === "function") {
    // Mapbox GL JS marker fallback
    const el = instance.getElement();
    if (el) el.addEventListener(eventName, callback);
  } else {
    console.warn(`Could not find event binding method for ${eventName} on`, instance);
  }
}

interface CompetitorMapProps {
  centerLat: number;
  centerLng: number;
  competitors: {
    id: string;
    name: string;
    lat: number;
    lng: number;
    distanceKm: number;
    typeMatch: string;
  }[];
}

export default function CompetitorMap({ centerLat, centerLng, competitors }: CompetitorMapProps) {
  const uniqueId = useId();
  const mapContainerId = `mappls-map-${uniqueId.replace(/[^a-zA-Z0-9]/g, "")}`;
  
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);
  const [isPluginLoaded, setIsPluginLoaded] = useState(false);
  
  // Real Data States
  const [realDataState, setRealDataState] = useState<'idle' | 'loading' | 'success' | 'empty' | 'error'>('idle');
  const [realNearbyData, setRealNearbyData] = useState<any[]>([]);
  
  // Filter States
  const [categories, setCategories] = useState<string[]>([]);
  const [radiusKm, setRadiusKm] = useState<number>(50);
  const [searchCenter, setSearchCenter] = useState<[number, number] | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const centerInfoWindowRef = useRef<any>(null);
  const realPinsRef = useRef<any[]>([]);
  const pluginInjectedRef = useRef(false);

  const mapplsKey = process.env.NEXT_PUBLIC_MAPPLS_MAP_KEY || "";

  // Derive unique categories for the filter UI
  const uniqueCategories = useMemo(() => {
    return Array.from(new Set(competitors.map(c => c.typeMatch).filter(Boolean))).sort();
  }, [competitors]);

  // Client-side filtering logic
  const filteredCompetitors = useMemo(() => {
    const activeCenter: [number, number] = searchCenter || [Number(centerLat), Number(centerLng)];
    return filterBusinesses(competitors, categories, radiusKm, activeCenter);
  }, [competitors, categories, radiusKm, searchCenter, centerLat, centerLng]);

  // Script load effect
  useEffect(() => {
    if (typeof window !== "undefined" && window.mappls) {
      setIsScriptLoaded(true);
      return;
    }
    const interval = setInterval(() => {
      if (typeof window !== "undefined" && window.mappls) {
        setIsScriptLoaded(true);
        clearInterval(interval);
      }
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // Plugin injection effect (independent of map)
  useEffect(() => {
    if (typeof window !== "undefined" && window.mappls && typeof window.mappls.pinMarker === "function") {
      setIsPluginLoaded(true);
      return;
    }
    if (isScriptLoaded && !isPluginLoaded && !pluginInjectedRef.current && mapplsKey) {
      pluginInjectedRef.current = true;
      const script = document.createElement("script");
      script.src = `https://sdk.mappls.com/map/sdk/plugins?v=3.0&libraries=getPinDetails&access_token=${mapplsKey}`;
      script.onload = () => {
        setIsPluginLoaded(true);
      };
      script.onerror = () => {
        console.error("Mappls plugin failed to load");
        setIsPluginLoaded(false);
      };
      document.head.appendChild(script);
    }
  }, [isScriptLoaded, isPluginLoaded, mapplsKey]);

  // Map Initialization Effect (runs once when isScriptLoaded is ready)
  useEffect(() => {
    const containerEl = document.getElementById(mapContainerId);
    if (centerLat == null || centerLng == null || String(centerLat).trim() === "" || String(centerLng).trim() === "") return;

    const validCenterLat = Number(centerLat);
    const validCenterLng = Number(centerLng);

    if (isScriptLoaded && !mapInstanceRef.current && containerEl && window.mappls && !isNaN(validCenterLat) && !isNaN(validCenterLng)) {
      try {
        const map = new window.mappls.Map(mapContainerId, {
          center: { lng: validCenterLng, lat: validCenterLat },
          zoom: 11,
          zoomControl: true,
          location: true,
        });

        mapInstanceRef.current = map;

        safelyBindEvent(map, "load", () => {
          setIsMapReady(true);
        });
      } catch (err) {
        console.error("Mappls initialization failed:", err);
      }
    }

    return () => {
      if (mapInstanceRef.current) {
        if (centerInfoWindowRef.current) {
          try {
            if (typeof centerInfoWindowRef.current.close === "function") centerInfoWindowRef.current.close();
            else if (typeof centerInfoWindowRef.current.remove === "function") centerInfoWindowRef.current.remove();
          } catch (e) {}
          centerInfoWindowRef.current = null;
        }

        markersRef.current.forEach(m => {
          try {
            if (m && typeof m.remove === "function") m.remove();
          } catch (e) {
            console.warn("Failed to remove marker on cleanup:", e);
          }
        });
        markersRef.current = [];

        realPinsRef.current.forEach(p => {
          try {
            if (p && typeof p.remove === "function") p.remove();
          } catch (e) {}
        });
        realPinsRef.current = [];
        
        try {
          if (typeof mapInstanceRef.current.remove === "function") {
            mapInstanceRef.current.remove();
          }
        } catch (e) {
          console.warn("Failed to remove map on cleanup:", e);
        }
        mapInstanceRef.current = null;
        setIsMapReady(false);
      }
    };
  }, [isScriptLoaded, centerLat, centerLng, mapContainerId]);

  // Real Data Fetching Effect
  useEffect(() => {
    if (!isMapReady) return;

    // If plugin is not loaded, we do not fetch real data; fallback to sample data
    if (!isPluginLoaded) {
      setRealDataState('error');
      setRealNearbyData([]);
      window.dispatchEvent(new CustomEvent('nearby-data-update', { detail: { isSampleData: true } }));
      return;
    }

    const activeCenter = searchCenter || [Number(centerLat), Number(centerLng)];
    if (isNaN(activeCenter[0]) || isNaN(activeCenter[1])) return;

    let active = true;
    setRealDataState('loading');

    const timeout = setTimeout(async () => {
      const distinctKeywords = Array.from(new Set([
        ...MATCH_TIERS.exact,
        ...MATCH_TIERS.partial,
        ...MATCH_TIERS.similar
      ]));

      const effectiveRadiusKm = Math.min(radiusKm, NEARBY_MAX_RADIUS_KM);
      const requestRadiusM = effectiveRadiusKm * 1000;

      try {
        const fetchPromises = distinctKeywords.map(kw => 
          fetch(`/api/nearby?lat=${activeCenter[0]}&lng=${activeCenter[1]}&radius=${requestRadiusM}&keyword=${encodeURIComponent(kw)}`)
            .then(res => res.json())
            .then(data => ({ kw, data }))
            .catch(() => ({ kw, data: { ok: false, errorType: 'network' } }))
        );

        const results = await Promise.all(fetchPromises);
        if (!active) return;

        let hasError = false;
        const mergedByELoc = new Map<string, any>();
        let totalCapped = false;
        
        for (const res of results) {
          if (!res.data.ok) {
            if (res.data.errorType !== 'no_results') hasError = true;
            continue;
          }
          if (res.data.capped) totalCapped = true;

          for (const item of (res.data.results || [])) {
            let assignedTier = 'similar';
            if (MATCH_TIERS.exact.includes(res.kw)) assignedTier = 'exact';
            else if (MATCH_TIERS.partial.includes(res.kw)) assignedTier = 'partial';
            
            const existing = mergedByELoc.get(item.eLoc);
            const tierScore = (t: string) => t === 'exact' ? 3 : t === 'partial' ? 2 : 1;
            
            if (existing) {
              if (tierScore(assignedTier) > tierScore(existing.tier)) {
                existing.tier = assignedTier;
              }
            } else {
              mergedByELoc.set(item.eLoc, { ...item, tier: assignedTier });
            }
          }
        }

        const finalResults = Array.from(mergedByELoc.values());
        
        if (finalResults.length === 0) {
          setRealDataState(hasError ? 'error' : 'empty');
          setRealNearbyData([]);
          window.dispatchEvent(new CustomEvent('nearby-data-update', { detail: { isSampleData: true } }));
        } else {
          setRealDataState('success');
          finalResults.sort((a, b) => a.distance - b.distance);
          const cappedResults = finalResults.slice(0, NEARBY_CAP);
          setRealNearbyData(cappedResults);

          const withinRadius = cappedResults.filter(r => r.distance <= effectiveRadiusKm * 1000);
          const countStr = (totalCapped || cappedResults.length >= NEARBY_CAP) ? "30+" : withinRadius.length;
          
          let countNum = typeof countStr === 'string' ? parseInt(countStr) : countStr;
          const level = countNum < DENSITY_THRESHOLDS.low ? "Low" : countNum < DENSITY_THRESHOLDS.medium ? "Medium" : "High";

          const tierRank = (t: string) => t === 'exact' ? 3 : t === 'partial' ? 2 : 1;
          let bestTier = 0;
          for (const r of cappedResults) bestTier = Math.max(bestTier, tierRank(r.tier));
          
          let minDistance = 0;
          const bestTierResults = cappedResults.filter(r => tierRank(r.tier) === bestTier);
          if (bestTierResults.length > 0) {
            minDistance = Math.min(...bestTierResults.map(r => r.distance));
          }
          const minDistanceKm = (minDistance / 1000).toFixed(1);

          window.dispatchEvent(new CustomEvent('nearby-data-update', {
            detail: {
              count: countStr,
              level,
              avgDistanceKm: minDistanceKm,
              effectiveRadiusKm,
              sliderRadiusKm: radiusKm,
              isSampleData: false
            }
          }));
        }
      } catch (err) {
        if (active) {
          setRealDataState('error');
          setRealNearbyData([]);
          window.dispatchEvent(new CustomEvent('nearby-data-update', { detail: { isSampleData: true } }));
        }
      }
    }, 500);

    return () => {
      active = false;
      clearTimeout(timeout);
    };
  }, [searchCenter, centerLat, centerLng, radiusKm, isPluginLoaded, isMapReady]);

  // Marker Lifecycle Effect (runs on filter/center change)
  useEffect(() => {
    if (!isMapReady || !mapInstanceRef.current || !window.mappls) return;
    const map = mapInstanceRef.current;

    // 0. Close and clean up previous center info window
    if (centerInfoWindowRef.current) {
      try {
        if (typeof centerInfoWindowRef.current.close === "function") centerInfoWindowRef.current.close();
        else if (typeof centerInfoWindowRef.current.remove === "function") centerInfoWindowRef.current.remove();
      } catch (e) {}
      centerInfoWindowRef.current = null;
    }

    // 1. Remove existing markers (Mappls Web SDK v3.0 standard pattern)
    // Diffing/updating isn't inherently faster in Mapbox-style frameworks than a clean remove/add cycle 
    // for small datasets (<1000 items), and re-adding ensures popup bounds and memory are clean.
    markersRef.current.forEach(m => {
      try {
        if (m && typeof m.remove === "function") m.remove();
      } catch (e) {
        console.warn("Failed to remove marker during update:", e);
      }
    });
    markersRef.current = [];

    // Remove existing real pins
    realPinsRef.current.forEach(p => {
      try {
        if (p && typeof p.remove === "function") p.remove();
      } catch (e) {}
    });
    realPinsRef.current = [];

    const activeCenter: [number, number] = searchCenter || [Number(centerLat), Number(centerLng)];

    // 2. Add Active Center Marker
    if (!isNaN(activeCenter[0]) && !isNaN(activeCenter[1])) {
      const centerMarker = new window.mappls.Marker({
        map: map,
        position: { lng: activeCenter[1], lat: activeCenter[0] },
        width: 18,
        height: 18,
        html: `<div style="background-color: var(--status-good, #10b981); width: 14px; height: 14px; border-radius: 50%; border: 2px solid var(--surface); box-shadow: 0 0 8px var(--status-good-glow, rgba(16, 185, 129, 0.8));"></div>`,
      });
      
      const centerPopupHTML = `
        <div style="padding: 10px 12px; font-family: sans-serif; background: var(--surface); border-radius: 8px;">
          <div style="font-size: 12px; font-weight: 600; color: var(--text-main);">Proposed Location</div>
          <div style="font-size: 10px; color: var(--text-muted); margin-top: 2px;">Your planned business site</div>
        </div>
      `;
      
      const centerInfoWindow = new window.mappls.InfoWindow({
        map: map,
        position: { lng: activeCenter[1], lat: activeCenter[0] },
        content: centerPopupHTML,
      });

      centerInfoWindowRef.current = centerInfoWindow;

      safelyBindEvent(centerMarker, "click", () => {
        centerInfoWindow.setPosition({ lng: activeCenter[1], lat: activeCenter[0] });
        centerInfoWindow.open(map, centerMarker);
      });

      markersRef.current.push(centerMarker);
    }

    // 3. Add Competitor Markers / Real Data Pins
    const showMockData = !isPluginLoaded || realDataState === 'empty' || realDataState === 'error';

    if (showMockData) {
      filteredCompetitors.forEach((comp) => {
        if (comp.lat == null || comp.lng == null || String(comp.lat).trim() === "" || String(comp.lng).trim() === "") return;
        
        const compLat = Number(comp.lat);
        const compLng = Number(comp.lng);
        if (isNaN(compLat) || isNaN(compLng)) return;

        const compMarker = new window.mappls.Marker({
          map: map,
          position: { lng: compLng, lat: compLat },
        });

        const compPopupHTML = `
          <div style="padding: 10px 12px; font-family: sans-serif; background: var(--surface); border-radius: 8px;">
            <div style="font-size: 12px; font-weight: 700; color: var(--text-main);">${comp.name}</div>
            <div style="font-size: 10px; color: var(--text-muted); margin-top: 2px; font-weight: 500;">${comp.typeMatch}</div>
            <div style="font-size: 10px; color: var(--text-muted); margin-top: 4px;">${comp.distanceKm} km away</div>
          </div>
        `;

        const compInfoWindow = new window.mappls.InfoWindow({
          map: map,
          position: { lng: compLng, lat: compLat },
          content: compPopupHTML,
        });

        safelyBindEvent(compMarker, "click", () => {
          compInfoWindow.setPosition({ lng: compLng, lat: compLat });
          compInfoWindow.open(map, compMarker);
        });

        markersRef.current.push(compMarker);
      });
    } else if (realDataState === 'success' && isPluginLoaded) {
      const effectiveRadiusKm = Math.min(radiusKm, NEARBY_MAX_RADIUS_KM);
      realNearbyData.forEach((comp) => {
        if (comp.distance > effectiveRadiusKm * 1000) return;
        try {
          const pinObj = window.mappls.pinMarker({
            map: map,
            pin: comp.eLoc,
            popupHtml: `<div style="padding: 10px 12px; font-family: sans-serif; background: var(--surface); border-radius: 8px;">
                          <div style="font-size: 12px; font-weight: 700; color: var(--text-main);">${comp.placeName}</div>
                          <div style="font-size: 10px; color: var(--text-muted); margin-top: 2px; font-weight: 500;">${comp.type || 'Business'} (${comp.tier} match)</div>
                          <div style="font-size: 10px; color: var(--text-muted); margin-top: 4px;">${(comp.distance / 1000).toFixed(1)} km away</div>
                        </div>`
          });
          if (pinObj) {
            realPinsRef.current.push(pinObj);
          }
        } catch (e) {
          console.warn("pinMarker failed for eLoc", comp.eLoc, e);
        }
      });
    }

  }, [isMapReady, filteredCompetitors, realNearbyData, realDataState, searchCenter, centerLat, centerLng, radiusKm, isPluginLoaded]);

  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showPickList, setShowPickList] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  // Geocoding Handler
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || !mapplsKey || isSearching) return;
    
    setIsSearching(true);
    try {
      const url = `/api/geocode?address=${encodeURIComponent(searchQuery)}&multi=1`;
      const res = await fetch(url);
      const data = await res.json();
      
      if (res.ok && data.ok && data.results && data.results.length > 0) {
        if (data.results.length === 1) {
          handleSelectResult(data.results[0]);
        } else {
          setSearchResults(data.results.slice(0, 5));
          setShowPickList(true);
          setActiveIndex(-1);
        }
      } else {
        setShowPickList(false);
        if (data.errorType === 'no_results') {
          alert("Location not found. Please try a different search term.");
        } else if (data.errorType === 'rate_limited') {
          alert("Too many searches right now. Please wait a few seconds and try again.");
        } else {
          alert("Search failed due to a network error. Please try again.");
        }
      }
    } catch (err) {
      console.error("Geocoding failed", err);
      setShowPickList(false);
      alert("Search failed due to a network error. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectResult = (item: any) => {
    const numLat = Number(item.lat);
    const numLng = Number(item.lng);
    setSearchCenter([numLat, numLng]);
    setShowPickList(false);
    
    if (mapInstanceRef.current && typeof mapInstanceRef.current.panTo === 'function') {
      mapInstanceRef.current.panTo({ lng: numLng, lat: numLat });
    } else if (mapInstanceRef.current && typeof mapInstanceRef.current.setCenter === 'function') {
      mapInstanceRef.current.setCenter({ lng: numLng, lat: numLat });
    }
  };

  const handleGpsLocation = () => {
    if (!("geolocation" in navigator) || window.isSecureContext === false) {
      alert("Location is not available on this device or connection. Please type your place name instead.");
      return;
    }

    setIsSearching(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsSearching(false);
        const { latitude, longitude } = position.coords;
        handleSelectResult({ lat: latitude, lng: longitude });
      },
      (error) => {
        setIsSearching(false);
        if (error.code === error.PERMISSION_DENIED) {
          alert("Location access was blocked. Please allow location access in your browser, or type your place name instead.");
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          alert("Could not detect your location. Please type your place name instead.");
        } else if (error.code === error.TIMEOUT) {
          alert("Finding your location took too long. Please try again or type your place name instead.");
        } else {
          alert("Location is not available on this device or connection. Please type your place name instead.");
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showPickList || searchResults.length === 0) return;
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => (prev < searchResults.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      handleSelectResult(searchResults[activeIndex]);
    } else if (e.key === 'Escape') {
      setShowPickList(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = () => setShowPickList(false);
    if (showPickList) {
      document.addEventListener('click', handleClickOutside);
    }
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showPickList]);

  if (!mapplsKey) {
    return (
      <div className="w-full h-80 rounded-2xl border border-border-default bg-surface-subtle flex items-center justify-center">
        <span className="text-sm text-muted font-medium px-4 text-center">
          Map configuration missing. Please provide a valid Mappls API Key.
        </span>
      </div>
    );
  }

  // Derive status text
  let statusMessage = "";
  if (realDataState === 'loading') {
    statusMessage = "Loading nearby businesses...";
  } else if (realDataState === 'success') {
    if (radiusKm > NEARBY_MAX_RADIUS_KM) {
      statusMessage = "Showing businesses from Mappls (up to 10 km)";
    } else {
      statusMessage = "Showing businesses from Mappls";
    }
  } else if (realDataState === 'empty') {
    statusMessage = "No businesses found by Mappls for this search. Showing sample data.";
  } else if (realDataState === 'error' || (!isPluginLoaded && isScriptLoaded)) {
    statusMessage = "Could not load nearby businesses. Showing sample data.";
  }

  return (
    <div className="w-full space-y-4">
      {/* UI Controls */}
      <div className="app-card w-full p-4 sm:p-5 rounded-2xl border border-border-default shadow-card relative z-10 bg-surface">
        <div className="flex flex-col sm:flex-row gap-5 items-end">
          <div className="w-full sm:flex-1 space-y-2 relative">
            <label className="text-xs font-semibold text-muted uppercase tracking-wider block">Search Location</label>
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={e => { setSearchQuery(e.target.value); setShowPickList(false); }}
                  onKeyDown={handleKeyDown}
                  placeholder="Search district, city..."
                  role="combobox"
                  aria-autocomplete="list"
                  aria-expanded={showPickList && searchResults.length > 0}
                  aria-controls="location-picklist"
                  aria-activedescendant={showPickList && searchResults.length > 0 && activeIndex >= 0 ? `location-option-${activeIndex}` : undefined}
                  className="w-full min-h-[44px] bg-surface-subtle border border-border-default rounded-xl px-3.5 py-2 text-sm text-main placeholder-muted focus:bg-surface focus:outline-none focus:border-accent-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent transition-colors"
                />
                {showPickList && searchResults.length > 0 && (
                  <div 
                    id="location-picklist"
                    role="listbox"
                    className="absolute top-full left-0 right-0 mt-2 bg-surface border border-border-default rounded-xl shadow-lg z-50 overflow-hidden"
                  >
                    {searchResults.map((res, idx) => (
                      <div 
                        key={idx} 
                        id={`location-option-${idx}`}
                        role="option"
                        aria-selected={activeIndex === idx}
                        onClick={() => handleSelectResult(res)}
                        className={`px-4 py-3 cursor-pointer text-sm text-main hover:bg-surface-subtle transition-colors ${activeIndex === idx ? 'bg-surface-subtle font-medium text-accent-strong' : ''}`}
                      >
                        {res.formattedAddress}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <button type="submit" disabled={isSearching} className="min-h-[44px] px-5 py-2.5 btn-primary font-semibold text-sm rounded-xl shrink-0 disabled:opacity-50">
                Search
              </button>
            </form>
            <button
              type="button"
              onClick={handleGpsLocation}
              disabled={isSearching}
              aria-label="Use my current location"
              className="w-full min-h-[44px] px-3 flex items-center justify-center gap-2 bg-surface-subtle border border-border-default rounded-xl text-xs font-medium text-main hover:bg-surface focus:outline-none focus:border-accent-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent transition-colors disabled:opacity-50"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                <circle cx="12" cy="12" r="10"></circle>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
              <span>Use my current location</span>
            </button>
          </div>
          
          <div className="w-full sm:flex-1 space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-muted uppercase tracking-wider">Search Radius</label>
              <span className="text-xs font-semibold text-main">{radiusKm} km</span>
            </div>
            <div className="flex items-center min-h-[44px]">
              <input 
                type="range" 
                min="1" max="100" 
                value={radiusKm}
                onChange={e => setRadiusKm(Number(e.target.value))}
                className="w-full h-2 bg-border-default rounded-lg appearance-none cursor-pointer accent-accent"
              />
            </div>
          </div>
        </div>

        <div className="w-full mt-4 pt-4 border-t border-border-default space-y-2.5">
          <div className="flex justify-between items-center">
            <label className="text-xs font-semibold text-muted uppercase tracking-wider block">Business Categories</label>
            {statusMessage && (
              <span className="text-xs font-medium text-main">{statusMessage}</span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {uniqueCategories.map(cat => {
              const isSelected = categories.includes(cat);
              return (
                <button
                  key={cat}
                  onClick={() => {
                    if (isSelected) {
                      setCategories(categories.filter(c => c !== cat));
                    } else {
                      setCategories([...categories, cat]);
                    }
                  }}
                  className={`min-h-[44px] px-4 py-2.5 rounded-full text-xs font-medium transition-colors inline-flex items-center justify-center ${
                    isSelected 
                      ? 'bg-accent-subtle text-accent-strong border border-accent-strong/40' 
                      : 'bg-surface-subtle border border-border-default text-muted hover:text-main hover:border-border-strong'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
            {uniqueCategories.length > 0 && categories.length > 0 && (
              <button 
                onClick={() => setCategories([])}
                className="min-h-[44px] px-4 py-2.5 rounded-full text-xs font-medium bg-transparent border border-transparent text-[var(--status-error)] hover:bg-[var(--status-error-bg)] transition-colors inline-flex items-center justify-center ml-auto sm:ml-0"
              >
                Clear Filters
              </button>
            )}
            {uniqueCategories.length === 0 && (
              <span className="text-xs text-muted italic">No categories available to filter.</span>
            )}
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="w-full h-96 sm:h-[420px] rounded-2xl overflow-hidden border border-border-default shadow-card relative z-0 bg-surface">
        {!isMapReady && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-surface/90 backdrop-blur-sm animate-pulse">
            <div className="w-8 h-8 border-4 border-accent/30 border-t-accent-strong rounded-full animate-spin mb-3"></div>
            <span className="text-xs font-medium text-main">Initializing Mappls Framework...</span>
          </div>
        )}
        
        <div id={mapContainerId} className="w-full h-full mappls-dark-mode" />
        
        <style jsx global>{`
          .mappls-dark-mode canvas {
            filter: brightness(0.6) invert(1) contrast(3) hue-rotate(200deg) saturate(0.3) brightness(0.7);
          }
          
          .mappls-dark-mode .mapboxgl-popup-content, 
          .mappls-dark-mode .mappls-popup-content {
            padding: 0;
            background: transparent;
            border-radius: 8px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          }
          .mappls-dark-mode .mapboxgl-popup-tip,
          .mappls-dark-mode .mappls-popup-tip {
            display: none;
          }
        `}</style>
      </div>
    </div>
  );
}
