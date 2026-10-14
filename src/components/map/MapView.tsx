"use client";

import React, { useEffect, useState, useRef, useId } from "react";

export interface MapMarker {
  lat: number;
  lng: number;
  label?: string;
}

export interface MapViewProps {
  center: { lat: number; lng: number };
  radiusKm?: number;
  markers?: MapMarker[];
  height?: string;
  ariaLabel: string;
}

function safelyBindEvent(instance: any, eventName: string, callback: Function) {
  if (!instance) return;
  if (typeof instance.addListener === "function") {
    instance.addListener(eventName, callback);
  } else if (typeof instance.on === "function") {
    instance.on(eventName, callback);
  } else if (typeof instance.addEventListener === "function") {
    instance.addEventListener(eventName, callback);
  } else if (instance.getElement && typeof instance.getElement === "function") {
    const el = instance.getElement();
    if (el) el.addEventListener(eventName, callback);
  }
}

function getZoomForRadius(radiusKm: number): number {
  if (radiusKm <= 3) return 13;
  if (radiusKm <= 6) return 12;
  if (radiusKm <= 12) return 11;
  if (radiusKm <= 20) return 10;
  return 9;
}

function generateCircleCoordinates(lat: number, lng: number, radiusMeters: number, points = 64): { lat: number; lng: number }[] {
  const coords: { lat: number; lng: number }[] = [];
  const R = 6371000;
  const dByR = radiusMeters / R;
  const latRad = (lat * Math.PI) / 180;
  const lngRad = (lng * Math.PI) / 180;

  for (let i = 0; i <= points; i++) {
    const bearing = (i * 2 * Math.PI) / points;
    const pLat = Math.asin(Math.sin(latRad) * Math.cos(dByR) + Math.cos(latRad) * Math.sin(dByR) * Math.cos(bearing));
    const pLng = lngRad + Math.atan2(Math.sin(bearing) * Math.sin(dByR) * Math.cos(latRad), Math.cos(dByR) - Math.sin(latRad) * Math.sin(pLat));
    coords.push({ lat: (pLat * 180) / Math.PI, lng: (pLng * 180) / Math.PI });
  }
  return coords;
}

export default function MapView({
  center,
  radiusKm,
  markers,
  height = "h-80 sm:h-96",
  ariaLabel,
}: MapViewProps) {
  const uniqueId = useId();
  const mapContainerId = `mappls-mapview-${uniqueId.replace(/[^a-zA-Z0-9]/g, "")}`;

  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [isDark, setIsDark] = useState(false);

  const mapInstanceRef = useRef<any>(null);
  const circleRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const popupsRef = useRef<any[]>([]);
  const prevRadiusRef = useRef<number | undefined>(undefined);
  const loggedPathRef = useRef<boolean>(false);

  // 1. Dynamic theme detection & observation
  useEffect(() => {
    if (typeof window === "undefined") return;

    const updateTheme = () => {
      const themeAttr = document.documentElement.getAttribute("data-theme");
      setIsDark(themeAttr === "dark");
    };

    updateTheme();

    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === "attributes" && m.attributeName === "data-theme") {
          updateTheme();
        }
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => observer.disconnect();
  }, []);

  // 2. Polling for window.mappls
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

  // 3. 15s Timeout protection
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isMapReady) {
        setTimedOut(true);
      }
    }, 15000);
    return () => clearTimeout(timer);
  }, [isMapReady]);

  // 4. Map Initialization (Runs ONCE when script is ready)
  useEffect(() => {
    if (!isScriptLoaded || mapInstanceRef.current || typeof window === "undefined" || !window.mappls) return;
    const container = document.getElementById(mapContainerId);
    if (!container) return;

    const lat = Number(center.lat);
    const lng = Number(center.lng);
    if (isNaN(lat) || isNaN(lng)) return;

    try {
      const initialZoom = radiusKm ? getZoomForRadius(radiusKm) : 11;
      const map = new window.mappls.Map(mapContainerId, {
        center: { lng, lat },
        zoom: initialZoom,
        zoomControl: true,
        location: false,
      });

      mapInstanceRef.current = map;

      safelyBindEvent(map, "load", () => {
        setIsMapReady(true);
      });
    } catch (err) {
      console.error("MapView initialization error:", err);
    }

    return () => {
      if (mapInstanceRef.current) {
        if (circleRef.current) {
          try {
            if (typeof circleRef.current.remove === "function") circleRef.current.remove();
            else if (window.mappls && typeof window.mappls.remove === "function") {
              window.mappls.remove({ map: mapInstanceRef.current, layer: circleRef.current });
            }
          } catch (e) {}
          circleRef.current = null;
        }

        popupsRef.current.forEach((p) => {
          try {
            if (typeof p.close === "function") p.close();
            else if (typeof p.remove === "function") p.remove();
          } catch (e) {}
        });
        popupsRef.current = [];

        markersRef.current.forEach((m) => {
          try {
            if (typeof m.remove === "function") m.remove();
          } catch (e) {}
        });
        markersRef.current = [];

        try {
          if (typeof mapInstanceRef.current.remove === "function") {
            mapInstanceRef.current.remove();
          }
        } catch (e) {}
        mapInstanceRef.current = null;
        setIsMapReady(false);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- center and radiusKm only set initial map state; updates are handled by the overlay effect below without destroying the map
  }, [isScriptLoaded, mapContainerId]);

  // 5. Overlays & Radius / Center update effect (does NOT recreate the map)
  useEffect(() => {
    if (!isMapReady || !mapInstanceRef.current || !window.mappls) return;
    const map = mapInstanceRef.current;

    const lat = Number(center.lat);
    const lng = Number(center.lng);
    if (isNaN(lat) || isNaN(lng)) return;

    // Pan map to center
    if (typeof map.panTo === "function") {
      map.panTo({ lat, lng });
    }

    // Only update zoom if radiusKm actually changed
    if (radiusKm && radiusKm !== prevRadiusRef.current) {
      prevRadiusRef.current = radiusKm;
      if (typeof map.setZoom === "function") {
        map.setZoom(getZoomForRadius(radiusKm));
      }
    }

    // Resolve accent color
    let accent = "#10b981";
    if (typeof window !== "undefined") {
      const computed = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim();
      if (computed) accent = computed;
    }

    // Draw / update circle if radiusKm is provided
    if (radiusKm && radiusKm > 0) {
      const targetRadiusMeters = radiusKm * 1000;
      let updatedInPlace = false;

      if (circleRef.current && typeof circleRef.current.setRadius === "function") {
        try {
          circleRef.current.setRadius(targetRadiusMeters);
          if (typeof circleRef.current.setCenter === "function") {
            circleRef.current.setCenter({ lat, lng });
          }
          updatedInPlace = true;
        } catch (e) {
          updatedInPlace = false;
        }
      }

      if (!updatedInPlace) {
        if (circleRef.current) {
          try {
            if (typeof circleRef.current.remove === "function") {
              circleRef.current.remove();
            } else if (window.mappls && typeof window.mappls.remove === "function") {
              window.mappls.remove({ map, layer: circleRef.current });
            }
          } catch (e) {}
          circleRef.current = null;
        }

        let created = false;
        if (typeof window.mappls.Circle === "function") {
          try {
            const circle = new window.mappls.Circle({
              map,
              center: { lat, lng },
              radius: targetRadiusMeters,
              fillColor: accent,
              fillOpacity: 0.15,
              strokeColor: accent,
              strokeOpacity: 0.8,
              strokeWeight: 2,
            });
            circleRef.current = circle;
            created = true;
            if (!loggedPathRef.current) {
              console.info("[MapView] Using native window.mappls.Circle overlay");
              loggedPathRef.current = true;
            }
          } catch (err) {
            created = false;
          }
        }

        if (!created && typeof window.mappls.Polygon === "function") {
          try {
            const coords = generateCircleCoordinates(lat, lng, targetRadiusMeters, 64);
            const polygon = new window.mappls.Polygon({
              map,
              paths: coords,
              fillColor: accent,
              fillOpacity: 0.15,
              strokeColor: accent,
              strokeOpacity: 0.8,
              strokeWeight: 2,
            });
            circleRef.current = polygon;
            if (!loggedPathRef.current) {
              console.info("[MapView] window.mappls.Circle unavailable; using 64-point Polygon fallback");
              loggedPathRef.current = true;
            }
          } catch (err) {
            console.warn("[MapView] Polygon fallback also failed:", err);
          }
        }
      }
    } else {
      if (circleRef.current) {
        try {
          if (typeof circleRef.current.remove === "function") circleRef.current.remove();
          else if (window.mappls && typeof window.mappls.remove === "function") {
            window.mappls.remove({ map, layer: circleRef.current });
          }
        } catch (e) {}
        circleRef.current = null;
      }
    }

    // Clean previous popups
    popupsRef.current.forEach((p) => {
      try {
        if (typeof p.close === "function") p.close();
        else if (typeof p.remove === "function") p.remove();
      } catch (e) {}
    });
    popupsRef.current = [];

    // Clean previous markers
    markersRef.current.forEach((m) => {
      try {
        if (typeof m.remove === "function") m.remove();
      } catch (e) {}
    });
    markersRef.current = [];

    // Draw markers
    const markerList = markers && markers.length > 0 ? markers : [{ lat, lng, label: "Your area" }];
    markerList.forEach((m) => {
      try {
        const marker = new window.mappls.Marker({
          map,
          position: { lat: m.lat, lng: m.lng },
          width: 18,
          height: 18,
          html: `<div style="background-color: var(--status-good, #10b981); width: 14px; height: 14px; border-radius: 50%; border: 2px solid var(--bg-surface); box-shadow: 0 0 8px var(--status-good-glow, rgba(16, 185, 129, 0.8));"></div>`,
        });

        markersRef.current.push(marker);

        if (m.label) {
          const popup = new window.mappls.InfoWindow({
            map,
            position: { lat: m.lat, lng: m.lng },
            content: `<div style="padding: 6px 10px; font-size: 11px; font-weight: 600; color: var(--text-main);">${m.label}</div>`,
          });
          popupsRef.current.push(popup);

          safelyBindEvent(marker, "click", () => {
            if (typeof popup.open === "function") {
              popup.open(map, marker);
            }
          });
        }
      } catch (e) {}
    });
  }, [isMapReady, center.lat, center.lng, radiusKm, markers]);

  if (timedOut && !isMapReady) {
    return (
      <div
        className={`w-full ${height} rounded-2xl border border-border-default bg-surface-subtle flex items-center justify-center p-6 text-center`}
        role="img"
        aria-label={ariaLabel}
      >
        <span className="text-sm font-medium text-muted">
          Map couldn&apos;t load. The numbers below still work.
        </span>
      </div>
    );
  }

  return (
    <div
      className={`w-full ${height} rounded-2xl overflow-hidden border border-border-default shadow-card relative bg-surface`}
      role="img"
      aria-label={ariaLabel}
    >
      {!isMapReady && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-surface/90 backdrop-blur-sm animate-pulse">
          <div className="w-8 h-8 border-4 border-accent/30 border-t-accent-strong rounded-full animate-spin mb-3"></div>
          <span className="text-xs font-medium text-main">Loading map…</span>
        </div>
      )}
      <div id={mapContainerId} className={`w-full h-full dynamis-map ${isDark ? "mappls-dark-mode" : ""}`} />
      <style jsx global>{`
        .mappls-dark-mode canvas {
          filter: brightness(0.6) invert(1) contrast(3) hue-rotate(200deg) saturate(0.3) brightness(0.7);
        }
        .dynamis-map .mapboxgl-popup-content, 
        .dynamis-map .mappls-popup-content {
          padding: 0;
          background: transparent;
          border-radius: 8px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
        .dynamis-map .mapboxgl-popup-tip,
        .dynamis-map .mappls-popup-tip {
          display: none;
        }
      `}</style>
    </div>
  );
}
