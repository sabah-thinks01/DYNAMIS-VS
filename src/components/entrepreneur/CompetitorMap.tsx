"use client";

/**
 * Mappls Web Maps JS SDK v3.0 Usage Notes:
 * - Marker Creation: `new window.mappls.Marker({ map, position: {lat, lng} })`
 * - Marker Removal: `marker.remove()` (Iterating over a ref array)
 * - Map Pan/Center: `map.panTo({lat, lng})` or `map.setCenter({lat, lng})`
 * - Geocoding: REST call to `https://search.mappls.com/search/address/geocode`
 * Confirmed from Mappls JS SDK v3.0 documentation and Mappls Search API docs.
 */

import { useEffect, useState, useRef, useMemo, useId } from "react";
import Script from "next/script";
import { filterBusinesses } from "@/lib/filterBusinesses";

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
  
  // Filter States
  const [categories, setCategories] = useState<string[]>([]);
  const [radiusKm, setRadiusKm] = useState<number>(50);
  const [searchCenter, setSearchCenter] = useState<[number, number] | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

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
    }
  }, []);

  // Map Initialization Effect (runs once)
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
        markersRef.current.forEach(m => {
          try {
            if (m && typeof m.remove === "function") m.remove();
          } catch (e) {
            console.warn("Failed to remove marker on cleanup:", e);
          }
        });
        markersRef.current = [];
        
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

  // Marker Lifecycle Effect (runs on filter/center change)
  useEffect(() => {
    if (!isMapReady || !mapInstanceRef.current || !window.mappls) return;
    const map = mapInstanceRef.current;

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

      safelyBindEvent(centerMarker, "click", () => {
        centerInfoWindow.setPosition({ lng: activeCenter[1], lat: activeCenter[0] });
        centerInfoWindow.open(map, centerMarker);
      });

      markersRef.current.push(centerMarker);
    }

    // 3. Add Competitor Markers (Filtered)
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

  }, [isMapReady, filteredCompetitors, searchCenter, centerLat, centerLng]);

  // Geocoding Handler
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || !mapplsKey) return;
    
    try {
      const url = `/api/geocode?address=${encodeURIComponent(searchQuery)}`;
      const res = await fetch(url);
      const data = await res.json();
      
      const results = Array.isArray(data.copResults) ? data.copResults : (data.copResults ? [data.copResults] : []);
      
      if (results.length > 0) {
        const first = results[0];
        const lat = first.latitude ?? first.lat;
        const lng = first.longitude ?? first.lng;

        if (lat != null && lng != null) {
          const numLat = Number(lat);
          const numLng = Number(lng);
          setSearchCenter([numLat, numLng]);
          
          if (mapInstanceRef.current && typeof mapInstanceRef.current.panTo === 'function') {
            mapInstanceRef.current.panTo({ lng: numLng, lat: numLat });
          } else if (mapInstanceRef.current && typeof mapInstanceRef.current.setCenter === 'function') {
            mapInstanceRef.current.setCenter({ lng: numLng, lat: numLat });
          }
        } else {
          alert("Location found, but Mappls did not return coordinates directly or via the Place Details fallback. Please check your API key tier.");
        }
      } else {
        alert("Location not found.");
      }
    } catch (err) {
      console.error("Mappls Geocoding failed", err);
      alert("Search failed. Check console for details.");
    }
  };

  if (!mapplsKey) {
    return (
      <div className="w-full h-80 rounded-2xl border border-border-default bg-surface-subtle flex items-center justify-center">
        <span className="text-sm text-muted font-medium px-4 text-center">
          Map configuration missing. Please provide a valid Mappls API Key.
        </span>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* UI Controls */}
      <div className="app-card w-full p-4 sm:p-5 rounded-2xl border border-border-default shadow-card relative z-10 bg-surface">
        <div className="flex flex-col sm:flex-row gap-5 items-end">
          <div className="w-full sm:flex-1 space-y-2">
            <label className="text-xs font-semibold text-muted uppercase tracking-wider block">Search Location</label>
            <form onSubmit={handleSearch} className="flex gap-2">
              <input 
                type="text" 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search district, city..."
                className="w-full min-h-[44px] bg-surface-subtle border border-border-default rounded-xl px-3.5 py-2 text-sm text-main placeholder-muted focus:bg-surface focus:outline-none focus:border-accent-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent transition-colors"
              />
              <button type="submit" className="min-h-[44px] px-5 py-2.5 btn-primary font-semibold text-sm rounded-xl shrink-0">
                Search
              </button>
            </form>
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
          <label className="text-xs font-semibold text-muted uppercase tracking-wider block">Business Categories</label>
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
        <Script 
          src={`https://sdk.mappls.com/map/sdk/web?v=3.0&access_token=${mapplsKey}`} 
          strategy="afterInteractive"
          onLoad={() => setIsScriptLoaded(true)}
          onReady={() => setIsScriptLoaded(true)}
        />
        
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
