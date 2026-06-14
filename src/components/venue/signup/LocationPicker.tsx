"use client";

import { useEffect, useRef, useState } from "react";

const MAPTILER_KEY = process.env.NEXT_PUBLIC_MAPTILER_KEY ?? "";
const STYLE_URL = `https://api.maptiler.com/maps/streets-v2/style.json?key=${MAPTILER_KEY}`;

type Coords = { lat: number; lng: number };

async function geocodeAddress(query: string): Promise<Coords | null> {
  if (!query.trim()) return null;
  try {
    const res = await fetch(
      `https://api.maptiler.com/geocoding/${encodeURIComponent(query)}.json?key=${MAPTILER_KEY}&country=gb&limit=1`,
    );
    if (!res.ok) return null;
    const data = await res.json();
    const center = data?.features?.[0]?.center;
    if (Array.isArray(center) && center.length === 2) {
      return { lng: Number(center[0]), lat: Number(center[1]) };
    }
  } catch {
    // silent
  }
  return null;
}

export default function LocationPicker({
  address,
}: {
  address: string; // filled address string — used to auto-center on mount
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<import("maplibre-gl").Map | null>(null);
  const markerRef = useRef<import("maplibre-gl").Marker | null>(null);
  const [coords, setCoords] = useState<Coords | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [locating, setLocating] = useState(false);

  // Init map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    let destroyed = false;

    import("maplibre-gl").then((ml) => {
      if (destroyed || !containerRef.current) return;

      const map = new ml.Map({
        center: [-2.5, 54.0],
        container: containerRef.current,
        style: STYLE_URL,
        zoom: 5,
        attributionControl: false,
      });
      map.addControl(new ml.AttributionControl({ compact: true }));
      mapRef.current = map;

      map.on("load", () => {
        if (destroyed) return;
        setMapReady(true);

        // Click to place/move pin
        map.on("click", (e) => {
          const { lng, lat } = e.lngLat;
          setCoords({ lng, lat });
          placeMarker(ml, map, { lng, lat });
        });
      });
    });

    return () => {
      destroyed = true;
      markerRef.current?.remove();
      markerRef.current = null;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  // Auto-geocode address and fly to it when map is ready
  useEffect(() => {
    if (!mapReady || !address.trim()) return;
    setLocating(true);
    geocodeAddress(address).then((c) => {
      setLocating(false);
      if (!c || !mapRef.current) return;
      setCoords(c);
      mapRef.current.flyTo({ center: [c.lng, c.lat], zoom: 16, duration: 1000 });
      import("maplibre-gl").then((ml) => {
        if (mapRef.current) placeMarker(ml, mapRef.current, c);
      });
    });
  }, [mapReady, address]);

  function placeMarker(ml: typeof import("maplibre-gl"), map: import("maplibre-gl").Map, c: Coords) {
    markerRef.current?.remove();
    const el = document.createElement("div");
    el.style.cssText = "width:32px;height:40px;cursor:grab;filter:drop-shadow(0 3px 6px rgba(0,0,0,0.45))";
    el.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 40" width="32" height="40">
        <path d="M16 0C8.268 0 2 6.268 2 14c0 9.941 14 26 14 26S30 23.941 30 14C30 6.268 23.732 0 16 0z" fill="#18181b" stroke="white" stroke-width="2"/>
        <circle cx="16" cy="14" r="5" fill="white"/>
      </svg>`;

    // anchor:"bottom" makes MapLibre pin the tip (bottom of element) to the coordinate
    const marker = new ml.Marker({ element: el, draggable: true, anchor: "bottom" })
      .setLngLat([c.lng, c.lat])
      .addTo(map);

    marker.on("dragend", () => {
      const pos = marker.getLngLat();
      setCoords({ lng: pos.lng, lat: pos.lat });
    });

    markerRef.current = marker;
  }

  function handleLocateMe() {
    if (!navigator.geolocation || !mapRef.current) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        const c = { lng: pos.coords.longitude, lat: pos.coords.latitude };
        setCoords(c);
        mapRef.current!.flyTo({ center: [c.lng, c.lat], zoom: 17, duration: 800 });
        import("maplibre-gl").then((ml) => {
          if (mapRef.current) placeMarker(ml, mapRef.current, c);
        });
      },
      () => setLocating(false),
    );
  }

  return (
    <div className="sm:col-span-2">
      <p className="mb-2 text-sm font-medium text-foreground">
        Pin venue location
        <span className="ml-1.5 text-xs font-normal text-muted">(click map to place, drag to adjust)</span>
      </p>

      <div className="rounded-xl border border-line">
        {/* Map */}
        <div className="relative h-56 overflow-hidden rounded-t-xl">
          {!mapReady && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-zinc-50 text-sm text-muted">
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-muted border-t-transparent" />
                Loading map…
              </span>
            </div>
          )}
          <style>{`
            .maplibregl-ctrl-logo { display: none !important; }
            .maplibregl-ctrl-attrib { font-size: 10px !important; }
          `}</style>
          <div className="h-full w-full" ref={containerRef} />

          {/* Locate me button */}
          {mapReady && (
            <button
              className="absolute right-2 top-2 z-10 flex items-center gap-1.5 rounded-lg border border-line bg-white px-2.5 py-1.5 text-xs font-medium text-foreground shadow-sm transition hover:bg-zinc-50 disabled:opacity-50"
              disabled={locating}
              onClick={handleLocateMe}
              type="button"
            >
              {locating ? (
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 2v3M12 19v3M2 12h3M19 12h3" strokeLinecap="round" />
                </svg>
              )}
              {locating ? "Locating…" : "Use my location"}
            </button>
          )}
        </div>

        {/* Coordinates readout */}
        <div className="flex items-center justify-between border-t border-line bg-zinc-50 px-4 py-2.5">
          {coords ? (
            <p className="font-mono text-xs text-muted">
              {coords.lat.toFixed(6)}, {coords.lng.toFixed(6)}
            </p>
          ) : (
            <p className="text-xs text-muted">No pin placed — click map to set location</p>
          )}
          {coords && (
            <button
              className="text-xs text-muted hover:text-red-600"
              onClick={() => { setCoords(null); markerRef.current?.remove(); markerRef.current = null; }}
              type="button"
            >
              Clear pin
            </button>
          )}
        </div>
      </div>

      {/* Hidden inputs submitted with the form */}
      <input name="latitude" type="hidden" value={coords?.lat ?? ""} />
      <input name="longitude" type="hidden" value={coords?.lng ?? ""} />
    </div>
  );
}

