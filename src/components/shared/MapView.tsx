"use client";

import { useEffect, useRef } from "react";

// Lazy-load maplibre-gl to avoid SSR issues
let maplibrePromise: Promise<typeof import("maplibre-gl")> | null = null;
function getMaplibre() {
  if (!maplibrePromise) maplibrePromise = import("maplibre-gl");
  return maplibrePromise;
}

const MAPTILER_KEY = process.env.NEXT_PUBLIC_MAPTILER_KEY ?? "";
const STYLE_URL = `https://api.maptiler.com/maps/streets-v2/style.json?key=${MAPTILER_KEY}`;

export type MapMarker = {
  id: string;
  lat: number;
  lng: number;
  label: string;
  sublabel?: string;
  color?: string;
};

export default function MapView({
  center,
  className = "",
  markers = [],
  zoom = 12,
}: {
  center: [lng: number, lat: number];
  className?: string;
  markers?: MapMarker[];
  zoom?: number;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<import("maplibre-gl").Map | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    let map: import("maplibre-gl").Map;
    let destroyed = false;

    getMaplibre().then((ml) => {
      if (destroyed || !containerRef.current) return;

      map = new ml.Map({
        center,
        container: containerRef.current,
        style: STYLE_URL,
        zoom,
      });

      mapRef.current = map;

      // Add markers after map loads
      map.on("load", () => {
        markers.forEach((m) => {
          const el = document.createElement("div");
          el.className = "map-marker";
          el.style.cssText = `
            width: 14px; height: 14px;
            background: ${m.color ?? "#18181b"};
            border: 2.5px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 6px rgba(0,0,0,0.35);
            cursor: pointer;
          `;

          const popup = new ml.Popup({ offset: 12, closeButton: false })
            .setHTML(
              `<div style="font-family:system-ui;padding:2px 0">
                <p style="font-weight:600;font-size:13px;margin:0">${m.label}</p>
                ${m.sublabel ? `<p style="font-size:11px;color:#71717a;margin:4px 0 0">${m.sublabel}</p>` : ""}
              </div>`,
            );

          new ml.Marker({ element: el })
            .setLngLat([m.lng, m.lat])
            .setPopup(popup)
            .addTo(map);
        });
      });
    });

    return () => {
      destroyed = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <style>{`
        .maplibregl-ctrl-logo { display: none !important; }
        .maplibregl-ctrl-attrib { font-size: 10px !important; }
      `}</style>
      <div className={className} ref={containerRef} />
    </>
  );
}
