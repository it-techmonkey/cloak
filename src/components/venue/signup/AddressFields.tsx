"use client";

import dynamic from "next/dynamic";
import { useRef, useState } from "react";

const LocationPicker = dynamic(() => import("./LocationPicker"), { ssr: false });

const MAPTILER_KEY = process.env.NEXT_PUBLIC_MAPTILER_KEY ?? "";

const inputClass =
  "w-full rounded-lg border border-line bg-white px-3 py-3 text-sm text-foreground outline-none transition placeholder:text-zinc-400 focus:border-foreground/40 focus:ring-2 focus:ring-foreground/8";

// UK postcode regex
const UK_PC_RE = /\b([A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2})\b/i;

// ── MapTiler geocoding ─────────────────────────────────────────────────────────

type MTFeature = {
  place_name: string;
  text: string;
  center: [number, number]; // [lng, lat]
  place_type?: string[];
  context?: Array<{ id: string; text: string }>;
  properties?: { address?: string };
};

type ParsedAddr = {
  line1: string;
  line2: string;
  city: string;
  postcode: string;
  lat: number;
  lng: number;
};

// Forward search — used by the single search box for autocomplete
async function searchAddresses(query: string): Promise<MTFeature[]> {
  if (!MAPTILER_KEY || query.length < 3) return [];
  try {
    const res = await fetch(
      `https://api.maptiler.com/geocoding/${encodeURIComponent(query)}.json?key=${MAPTILER_KEY}&country=gb&limit=6&types=address,poi,street`,
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.features ?? []) as MTFeature[];
  } catch {
    return [];
  }
}

// Reverse geocode — used when a pin is dropped/dragged. MapTiler returns
// street-level features, so we can rebuild a full address (unlike postcodes.io).
async function reverseGeocode(lat: number, lng: number): Promise<ParsedAddr | null> {
  if (!MAPTILER_KEY) return null;
  try {
    const res = await fetch(
      `https://api.maptiler.com/geocoding/${lng},${lat}.json?key=${MAPTILER_KEY}&types=address,poi,street&limit=1`,
    );
    if (!res.ok) return null;
    const data = await res.json();
    const feature = data.features?.[0] as MTFeature | undefined;
    if (!feature) return null;
    // Preserve the actual pin coords (not the feature center) so the marker stays put
    const parsed = parseFeature(feature);
    return { ...parsed, lat, lng };
  } catch {
    return null;
  }
}

function parseFeature(f: MTFeature): ParsedAddr {
  // line1 = house number + street/POI name
  const houseNo = f.properties?.address ? `${f.properties.address} ` : "";
  const line1 = `${houseNo}${f.text}`.trim();

  const ctx = f.context ?? [];

  // Strategy 1 — MapTiler context items
  const ctxPostcode = ctx.find((c) => c.id.startsWith("postcode"))?.text ?? "";
  const ctxLocality =
    ctx.find((c) => c.id.startsWith("locality"))?.text ??
    ctx.find((c) => c.id.startsWith("neighbourhood"))?.text ??
    "";
  const ctxCity =
    ctx.find((c) => c.id.startsWith("place"))?.text ??
    ctx.find((c) => c.id.startsWith("municipality"))?.text ??
    ctx.find((c) => c.id.startsWith("district"))?.text ??
    "";

  // Strategy 2 — parse place_name string as fallback
  // e.g. "10 Downing Street, Westminster, London, SW1A 2AA, United Kingdom"
  const pcMatch = f.place_name.match(UK_PC_RE);
  const namePostcode = pcMatch ? pcMatch[1].toUpperCase() : "";

  const SKIP = new Set(["United Kingdom", "UK", "England", "Scotland", "Wales", "Northern Ireland"]);
  const nameParts = f.place_name
    .split(", ")
    .map((s) => s.trim())
    .filter((p) => p && !UK_PC_RE.test(p) && !SKIP.has(p) && p.toLowerCase() !== line1.toLowerCase());
  const nameCity = nameParts[nameParts.length - 1] ?? "";
  const nameLocality = nameParts.length >= 2 ? nameParts[nameParts.length - 2] : "";

  const resolvedCity = ctxCity || nameCity;
  const resolvedLocality = ctxLocality || nameLocality;
  const line2 = resolvedLocality && resolvedLocality !== resolvedCity ? resolvedLocality : "";

  return {
    line1,
    line2,
    city: resolvedCity,
    postcode: ctxPostcode || namePostcode,
    lat: f.center[1],
    lng: f.center[0],
  };
}

// ── postcodes.io — enrich missing postcode/city from coords ────────────────────

async function enrichFromCoords(lat: number, lng: number): Promise<{ city: string; postcode: string } | null> {
  try {
    const res = await fetch(`https://api.postcodes.io/postcodes?lon=${lng}&lat=${lat}&limit=1`);
    if (!res.ok) return null;
    const { result } = await res.json();
    const r = result?.[0];
    if (!r) return null;
    return { city: r.post_town ?? r.admin_district ?? "", postcode: r.postcode ?? "" };
  } catch {
    return null;
  }
}

// ── Search dropdown ────────────────────────────────────────────────────────────

function SearchDropdown({
  items,
  onSelect,
}: {
  items: MTFeature[];
  onSelect: (f: MTFeature) => void;
}) {
  if (!items.length) return null;
  return (
    <div className="absolute left-0 right-0 top-full z-30 mt-1 max-h-72 overflow-y-auto rounded-lg border border-line bg-white shadow-lg">
      {items.map((f, i) => {
        const [primary, ...rest] = f.place_name.split(", ");
        return (
          <button
            className="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-zinc-50"
            key={`${i}-${f.place_name}`}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => onSelect(f)}
            type="button"
          >
            <svg className="mt-0.5 h-4 w-4 shrink-0 text-muted" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="12" cy="10" r="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-sm leading-5">
              <span className="font-medium text-foreground">{primary}</span>
              {rest.length > 0 && (
                <span className="block text-xs text-muted">{rest.join(", ")}</span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ── UK address fields ─────────────────────────────────────────────────────────

type AddrState = { line1: string; line2: string; city: string; postcode: string };
type Coords = { lat: number; lng: number };

export function UkAddressFields({ prefix = "" }: { prefix?: string }) {
  const [addr, setAddr] = useState<AddrState>({ line1: "", line2: "", city: "", postcode: "" });
  const [pinCoords, setPinCoords] = useState<Coords | null>(null);

  // Single search box state
  const [search, setSearch] = useState("");
  const [features, setFeatures] = useState<MTFeature[]>([]);
  const [showDrop, setShowDrop] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  const nm = (field: string) => (prefix ? `${prefix}_${field}` : field);

  // Single source of truth — fills every field + moves the pin
  async function applyParsed(parsed: ParsedAddr) {
    // If MapTiler missed postcode or city, backfill from postcodes.io
    let { city, postcode } = parsed;
    if (!postcode || !city) {
      const enriched = await enrichFromCoords(parsed.lat, parsed.lng);
      if (enriched) {
        postcode = postcode || enriched.postcode;
        city = city || enriched.city;
      }
    }
    setAddr({ line1: parsed.line1, line2: parsed.line2, city, postcode });
    setPinCoords({ lat: parsed.lat, lng: parsed.lng });
  }

  // ── Search box ────────────────────────────────────────────────────────────

  function onSearchChange(value: string) {
    setSearch(value);
    if (searchDebounce.current) clearTimeout(searchDebounce.current);
    if (value.length < 3) {
      setFeatures([]);
      setShowDrop(false);
      return;
    }
    setLoading(true);
    searchDebounce.current = setTimeout(async () => {
      const results = await searchAddresses(value);
      setFeatures(results);
      setShowDrop(results.length > 0);
      setLoading(false);
    }, 350);
  }

  function onSearchSelect(f: MTFeature) {
    setSearch(f.place_name);
    setShowDrop(false);
    setLoading(false);
    void applyParsed(parseFeature(f));
  }

  // ── Pin drag/click → reverse geocode → fill everything ──────────────────────

  async function onPinMove(c: Coords) {
    if (!c.lat && !c.lng) return;
    const parsed = await reverseGeocode(c.lat, c.lng);
    if (parsed) {
      void applyParsed(parsed);
    } else {
      // No street feature found — at least fill postcode/city
      const enriched = await enrichFromCoords(c.lat, c.lng);
      if (enriched) {
        setAddr((a) => ({ ...a, postcode: enriched.postcode || a.postcode, city: enriched.city || a.city }));
      }
      setPinCoords(c);
    }
  }

  return (
    <div className="grid gap-4 sm:col-span-2 sm:grid-cols-2">

      {/* App-style single search box */}
      <div className="relative sm:col-span-2">
        <label className="grid gap-2 text-sm font-medium text-foreground">
          Search address
          <div className="relative">
            <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M21 21l-4.35-4.35" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <input
              autoComplete="off"
              className="w-full rounded-lg border border-line bg-white py-3 pl-10 pr-10 text-sm text-foreground outline-none transition placeholder:text-zinc-400 focus:border-foreground/40 focus:ring-2 focus:ring-foreground/8"
              onBlur={() => setTimeout(() => setShowDrop(false), 150)}
              onChange={(e) => onSearchChange(e.target.value)}
              onFocus={() => features.length > 0 && setShowDrop(true)}
              placeholder="Start typing your venue address…"
              value={search}
            />
            {loading && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2">
                <span className="block h-4 w-4 animate-spin rounded-full border-2 border-muted border-t-foreground" />
              </span>
            )}
          </div>
        </label>
        {showDrop && <SearchDropdown items={features} onSelect={onSearchSelect} />}
        <p className="mt-1.5 text-xs text-muted">
          Search and select your address, or drop a pin on the map below. You can edit the fields after.
        </p>
      </div>

      {/* Map — both directions bound to the same address state */}
      <LocationPicker
        externalCoords={pinCoords}
        latName={nm("latitude")}
        lngName={nm("longitude")}
        onCoordsChange={onPinMove}
      />

      {/* Editable fields, auto-filled from search or pin */}
      <label className="grid gap-2 text-sm font-medium text-foreground sm:col-span-2">
        Address line 1
        <input
          className={inputClass}
          name={nm("addressLine1")}
          onChange={(e) => setAddr((a) => ({ ...a, line1: e.target.value }))}
          placeholder="Building and street"
          required
          value={addr.line1}
        />
      </label>
      <label className="grid gap-2 text-sm font-medium text-foreground sm:col-span-2">
        Address line 2
        <input
          className={inputClass}
          name={nm("addressLine2")}
          onChange={(e) => setAddr((a) => ({ ...a, line2: e.target.value }))}
          placeholder="Area, locality (optional)"
          value={addr.line2}
        />
      </label>
      <label className="grid gap-2 text-sm font-medium text-foreground">
        City
        <input
          className={inputClass}
          name={nm("city")}
          onChange={(e) => setAddr((a) => ({ ...a, city: e.target.value }))}
          placeholder="Enter city"
          required
          value={addr.city}
        />
      </label>
      <label className="grid gap-2 text-sm font-medium text-foreground">
        Postcode
        <input
          className={inputClass}
          name={nm("postalCode")}
          onChange={(e) => setAddr((a) => ({ ...a, postcode: e.target.value.toUpperCase() }))}
          placeholder="Enter postcode"
          required
          value={addr.postcode}
        />
      </label>
    </div>
  );
}

// ── UAE geocoding ─────────────────────────────────────────────────────────────

async function searchAddressesUae(query: string): Promise<MTFeature[]> {
  if (!MAPTILER_KEY || query.length < 3) return [];
  try {
    const res = await fetch(
      `https://api.maptiler.com/geocoding/${encodeURIComponent(query)}.json?key=${MAPTILER_KEY}&country=ae&limit=6&types=address,poi,street`,
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.features ?? []) as MTFeature[];
  } catch {
    return [];
  }
}

async function reverseGeocodeUae(lat: number, lng: number): Promise<ParsedAddr | null> {
  if (!MAPTILER_KEY) return null;
  try {
    const res = await fetch(
      `https://api.maptiler.com/geocoding/${lng},${lat}.json?key=${MAPTILER_KEY}&country=ae&types=address,poi,street&limit=1`,
    );
    if (!res.ok) return null;
    const data = await res.json();
    const feature = data.features?.[0] as MTFeature | undefined;
    if (!feature) return null;
    const parsed = parseFeatureUae(feature);
    return { ...parsed, lat, lng };
  } catch {
    return null;
  }
}

const UAE_EMIRATE_ALIASES: Record<string, string> = {
  "abu dhabi": "Abu Dhabi",
  "dubai": "Dubai",
  "sharjah": "Sharjah",
  "ajman": "Ajman",
  "umm al quwain": "Umm Al Quwain",
  "umm al-quwain": "Umm Al Quwain",
  "ras al khaimah": "Ras Al Khaimah",
  "ras al-khaimah": "Ras Al Khaimah",
  "fujairah": "Fujairah",
};

function resolveEmirate(text: string): string {
  return UAE_EMIRATE_ALIASES[text.toLowerCase()] ?? "";
}

function parseFeatureUae(f: MTFeature): ParsedAddr {
  const houseNo = f.properties?.address ? `${f.properties.address} ` : "";
  const line1 = `${houseNo}${f.text}`.trim();

  const ctx = f.context ?? [];

  // Try every context item for a known emirate name — MapTiler places it
  // in region, place, or municipality depending on the result type
  let emirate = "";
  for (const c of ctx) {
    const matched = resolveEmirate(c.text);
    if (matched) { emirate = matched; break; }
  }

  // Area = first context item that isn't the emirate and isn't country
  const ctxArea =
    ctx.find((c) => {
      if (c.id.startsWith("country")) return false;
      if (resolveEmirate(c.text)) return false;
      return c.id.startsWith("locality") || c.id.startsWith("neighbourhood") ||
             c.id.startsWith("place") || c.id.startsWith("municipality");
    })?.text ?? "";

  // Fallback from place_name string
  // e.g. "Burj Khalifa, Downtown Dubai, Dubai, United Arab Emirates"
  const SKIP = new Set(["United Arab Emirates", "UAE"]);
  const nameParts = f.place_name
    .split(", ")
    .map((s) => s.trim())
    .filter((p) => p && !SKIP.has(p) && p.toLowerCase() !== line1.toLowerCase());

  if (!emirate) {
    for (const part of [...nameParts].reverse()) {
      const matched = resolveEmirate(part);
      if (matched) { emirate = matched; break; }
    }
  }

  const nameArea = nameParts.find((p) => !resolveEmirate(p) && p.toLowerCase() !== line1.toLowerCase()) ?? "";
  const resolvedArea = ctxArea || nameArea;
  const line2 = resolvedArea && resolvedArea !== emirate ? resolvedArea : "";

  return {
    line1,
    line2,
    city: emirate,
    postcode: "",
    lat: f.center[1],
    lng: f.center[0],
  };
}

// ── UAE address fields ────────────────────────────────────────────────────────

const UAE_EMIRATES = [
  "Abu Dhabi",
  "Dubai",
  "Sharjah",
  "Ajman",
  "Umm Al Quwain",
  "Ras Al Khaimah",
  "Fujairah",
] as const;

export function UaeAddressFields({ prefix = "" }: { prefix?: string }) {
  // emirate is controlled separately — it's a dropdown, not auto-filled from search
  const [emirate, setEmirate] = useState("");
  // line1 = building name/number, line2 = area/community, postcode = PO Box
  const [addr, setAddr] = useState<AddrState>({ line1: "", line2: "", city: "", postcode: "" });
  const [pinCoords, setPinCoords] = useState<Coords | null>(null);

  const [search, setSearch] = useState("");
  const [features, setFeatures] = useState<MTFeature[]>([]);
  const [showDrop, setShowDrop] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  const nm = (field: string) => (prefix ? `${prefix}_${field}` : field);

  function applyParsedUae(parsed: ParsedAddr) {
    setAddr((a) => ({
      line1: parsed.line1 || a.line1,
      line2: parsed.line2 || a.line2,
      city: a.city,
      postcode: a.postcode,
    }));
    if (parsed.city) setEmirate(parsed.city);
    setPinCoords({ lat: parsed.lat, lng: parsed.lng });
  }

  function onSearchChange(value: string) {
    setSearch(value);
    if (searchDebounce.current) clearTimeout(searchDebounce.current);
    if (value.length < 3) {
      setFeatures([]);
      setShowDrop(false);
      return;
    }
    setLoading(true);
    searchDebounce.current = setTimeout(async () => {
      const results = await searchAddressesUae(value);
      setFeatures(results);
      setShowDrop(results.length > 0);
      setLoading(false);
    }, 350);
  }

  function onSearchSelect(f: MTFeature) {
    setSearch(f.place_name);
    setShowDrop(false);
    setLoading(false);
    applyParsedUae(parseFeatureUae(f));
  }

  async function onPinMove(c: Coords) {
    if (!c.lat && !c.lng) return;
    const parsed = await reverseGeocodeUae(c.lat, c.lng);
    if (parsed) {
      applyParsedUae(parsed);
    } else {
      setPinCoords(c);
    }
  }

  return (
    <div className="grid gap-4 sm:col-span-2 sm:grid-cols-2">

      {/* Search box */}
      <div className="relative sm:col-span-2">
        <label className="grid gap-2 text-sm font-medium text-foreground">
          Search address
          <div className="relative">
            <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M21 21l-4.35-4.35" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <input
              autoComplete="off"
              className="w-full rounded-lg border border-line bg-white py-3 pl-10 pr-10 text-sm text-foreground outline-none transition placeholder:text-zinc-400 focus:border-foreground/40 focus:ring-2 focus:ring-foreground/8"
              onBlur={() => setTimeout(() => setShowDrop(false), 150)}
              onChange={(e) => onSearchChange(e.target.value)}
              onFocus={() => features.length > 0 && setShowDrop(true)}
              placeholder="Start typing your venue address…"
              value={search}
            />
            {loading && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2">
                <span className="block h-4 w-4 animate-spin rounded-full border-2 border-muted border-t-foreground" />
              </span>
            )}
          </div>
        </label>
        {showDrop && <SearchDropdown items={features} onSelect={onSearchSelect} />}
        <p className="mt-1.5 text-xs text-muted">
          Search and select your address, or drop a pin on the map below. You can edit the fields after.
        </p>
      </div>

      {/* Map */}
      <LocationPicker
        externalCoords={pinCoords}
        latName={nm("latitude")}
        lngName={nm("longitude")}
        onCoordsChange={onPinMove}
      />

      {/* Emirate dropdown */}
      <label className="grid gap-2 text-sm font-medium text-foreground sm:col-span-2">
        Emirate
        <select
          className={inputClass}
          name={nm("city")}
          onChange={(e) => setEmirate(e.target.value)}
          required
          value={emirate}
        >
          <option value="" disabled>Select emirate</option>
          {UAE_EMIRATES.map((e) => (
            <option key={e} value={e}>{e}</option>
          ))}
        </select>
      </label>

      {/* Area / Community */}
      <label className="grid gap-2 text-sm font-medium text-foreground sm:col-span-2">
        Area / Community
        <input
          className={inputClass}
          name={nm("addressLine2")}
          onChange={(e) => setAddr((a) => ({ ...a, line2: e.target.value }))}
          placeholder="e.g. Downtown Dubai, Jumeirah, Al Reem Island"
          value={addr.line2}
        />
      </label>

      {/* Building name / Villa number */}
      <label className="grid gap-2 text-sm font-medium text-foreground sm:col-span-2">
        Building name / Villa number
        <input
          className={inputClass}
          name={nm("addressLine1")}
          onChange={(e) => setAddr((a) => ({ ...a, line1: e.target.value }))}
          placeholder="e.g. Burj Khalifa, Villa 12, Al Safa Tower"
          required
          value={addr.line1}
        />
      </label>

      {/* Street (optional — many UAE addresses omit this) */}
      <label className="grid gap-2 text-sm font-medium text-foreground">
        Street
        <input
          className={inputClass}
          name={nm("street")}
          placeholder="Street name (optional)"
        />
      </label>

      {/* PO Box */}
      <label className="grid gap-2 text-sm font-medium text-foreground">
        PO Box
        <input
          className={inputClass}
          name={nm("postalCode")}
          onChange={(e) => setAddr((a) => ({ ...a, postcode: e.target.value }))}
          placeholder="e.g. 12345"
          value={addr.postcode}
        />
      </label>
    </div>
  );
}
