"use client";

import { useEffect, useRef, useState, useId } from "react";
import Script from "next/script";

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

export default function CompetitorMap({ centerLat, centerLng, competitors }: CompetitorMapProps) {
  // Use a unique ID to prevent Mappls from caching an old, unmounted DOM node across route transitions
  const uniqueId = useId();
  const mapContainerId = `mappls-map-${uniqueId.replace(/[^a-zA-Z0-9]/g, "")}`;
  
  // Track script load robustly. If window.mappls already exists (e.g. remount), start as true.
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);
  
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  const mapplsKey = process.env.NEXT_PUBLIC_MAPPLS_MAP_KEY || "";

  // Update script status on mount if it's already cached globally
  useEffect(() => {
    if (typeof window !== "undefined" && window.mappls) {
      setIsScriptLoaded(true);
    }
  }, []);

  useEffect(() => {
    const containerEl = document.getElementById(mapContainerId);
    
    // Skip initialization if coordinates are missing/empty
    if (centerLat == null || centerLng == null || String(centerLat).trim() === "" || String(centerLng).trim() === "") return;

    const validCenterLat = Number(centerLat);
    const validCenterLng = Number(centerLng);

    // We only initialize if script loaded, map isn't initialized yet, and the DOM node exists
    if (isScriptLoaded && !mapInstanceRef.current && containerEl && window.mappls && !isNaN(validCenterLat) && !isNaN(validCenterLng)) {
      
      try {
        const map = new window.mappls.Map(mapContainerId, {
          center: { lat: validCenterLat, lng: validCenterLng },
          zoom: 11,
          zoomControl: true,
          location: true,
        });

        mapInstanceRef.current = map;

        // Safe event binding checking for .addListener vs .on at runtime
        safelyBindEvent(map, "load", () => {
          setIsMapReady(true);
          
          // 1. Add Proposed Location (Center) Marker
          const centerMarker = new window.mappls.Marker({
            map: map,
            position: { lat: validCenterLat, lng: validCenterLng },
            width: 18,
            height: 18,
            html: `<div style="background-color: #10b981; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 8px rgba(16, 185, 129, 0.8);"></div>`,
          });
          
          const centerPopupHTML = `
            <div style="padding: 10px 12px; font-family: sans-serif; background: white; border-radius: 8px;">
              <div style="font-size: 12px; font-weight: 600; color: #1e293b;">Proposed Location</div>
              <div style="font-size: 10px; color: #64748b; margin-top: 2px;">Your planned business site</div>
            </div>
          `;
          
          const centerInfoWindow = new window.mappls.InfoWindow({
            map: map,
            content: centerPopupHTML,
          });

          safelyBindEvent(centerMarker, "click", () => {
            centerInfoWindow.setPosition({ lat: validCenterLat, lng: validCenterLng });
            centerInfoWindow.open(map, centerMarker);
          });

          markersRef.current.push(centerMarker);

          // 2. Add Competitor Markers
          competitors.forEach((comp) => {
            if (comp.lat == null || comp.lng == null || String(comp.lat).trim() === "" || String(comp.lng).trim() === "") return;
            
            const compLat = Number(comp.lat);
            const compLng = Number(comp.lng);
            
            if (isNaN(compLat) || isNaN(compLng)) return;

            const compMarker = new window.mappls.Marker({
              map: map,
              position: { lat: compLat, lng: compLng },
            });

            const compPopupHTML = `
              <div style="padding: 10px 12px; font-family: sans-serif; background: white; border-radius: 8px;">
                <div style="font-size: 12px; font-weight: 700; color: #1e293b;">${comp.name}</div>
                <div style="font-size: 10px; color: #475569; margin-top: 2px; font-weight: 500;">${comp.typeMatch}</div>
                <div style="font-size: 10px; color: #64748b; margin-top: 4px;">${comp.distanceKm} km away</div>
              </div>
            `;

            const compInfoWindow = new window.mappls.InfoWindow({
              map: map,
              content: compPopupHTML,
            });

            safelyBindEvent(compMarker, "click", () => {
              compInfoWindow.setPosition({ lat: compLat, lng: compLng });
              compInfoWindow.open(map, compMarker);
            });

            markersRef.current.push(compMarker);
          });
        });
      } catch (err) {
        console.error("Mappls initialization failed:", err);
      }
    }

    // Cleanup on unmount
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
  }, [isScriptLoaded, centerLat, centerLng, competitors, mapContainerId]);

  if (!mapplsKey) {
    return (
      <div className="w-full h-80 rounded-2xl border border-slate-700/50 bg-slate-800/40 flex items-center justify-center">
        <span className="text-sm text-slate-400 font-medium px-4 text-center">
          Map configuration missing. Please provide a valid Mappls API Key.
        </span>
      </div>
    );
  }

  return (
    <div className="w-full h-80 rounded-2xl overflow-hidden border border-slate-700/50 shadow-md relative z-0 bg-slate-900">
      <Script 
        src={`https://sdk.mappls.com/map/sdk/web?v=3.0&access_token=${mapplsKey}`} 
        strategy="afterInteractive"
        onLoad={() => setIsScriptLoaded(true)}
        onReady={() => setIsScriptLoaded(true)}
      />
      
      {/* Loading Skeleton */}
      {!isMapReady && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-800/90 backdrop-blur-sm animate-pulse">
          <div className="w-8 h-8 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mb-3"></div>
          <span className="text-xs font-medium text-slate-300">Initializing Mappls Framework...</span>
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
  );
}
