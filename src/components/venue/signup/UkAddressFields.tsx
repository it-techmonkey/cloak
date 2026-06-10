"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

const LocationPicker = dynamic(() => import("./LocationPicker"), { ssr: false });

const inputClass =
  "w-full rounded-lg border border-line bg-white px-3 py-3 text-sm text-foreground outline-none transition placeholder:text-slate-400 focus:border-brand focus:ring-2 focus:ring-brand/15";

const MAPTILER_KEY = process.env.NEXT_PUBLIC_MAPTILER_KEY ?? "";

type Suggestion = {
  id: string;
  place_name: string;
  address: string;
  city: string;
  postcode: string;
  country: string;
};

async function searchAddresses(query: string): Promise<Suggestion[]> {
  if (query.length < 2) return [];
  try {
    const q = encodeURIComponent(query);
    const res = await fetch(
      `https://api.maptiler.com/geocoding/${q}.json?key=${MAPTILER_KEY}&country=gb&types=address,postal_code&limit=6`,
    );
    const data = await res.json();
    return (data?.features ?? []).map((f: Record<string, unknown>) => {
      const ctx = (f.context as Array<{ id: string; text: string }>) ?? [];
      const postcode = ctx.find((c) => c.id.startsWith("postal_code"))?.text ?? "";
      const city =
        ctx.find((c) => c.id.startsWith("place") || c.id.startsWith("locality"))?.text ?? "";
      const country =
        ctx.find((c) => c.id.startsWith("country"))?.text ?? "United Kingdom";
      return {
        id: f.id as string,
        place_name: f.place_name as string,
        address: (f.place_name as string).split(",")[0].trim(),
        city,
        postcode,
        country,
      };
    });
  } catch {
    return [];
  }
}

type AddressState = {
  addressLine1: string;
  addressLine2: string;
  city: string;
  country: string;
  postalCode: string;
};

function empty(): AddressState {
  return { addressLine1: "", addressLine2: "", city: "", country: "United Kingdom", postalCode: "" };
}

export default function UkAddressFields() {
  const [address, setAddress] = useState<AddressState>(empty);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.length < 2) { setSuggestions([]); return; }
    debounceRef.current = setTimeout(async () => {
      const results = await searchAddresses(query);
      setSuggestions(results);
      setShowSuggestions(true);
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query]);

  function apply(s: Suggestion) {
    setAddress({
      addressLine1: s.address,
      addressLine2: "",
      city: s.city,
      country: s.country || "United Kingdom",
      postalCode: s.postcode,
    });
    setQuery(s.place_name);
    setShowSuggestions(false);
  }

  return (
    <div className="grid gap-4 sm:col-span-2 sm:grid-cols-2">
      {/* Autocomplete search */}
      <label className="relative grid gap-2 text-sm font-medium text-foreground sm:col-span-2">
        Find address
        <input
          autoComplete="off"
          className={inputClass}
          onChange={(e) => { setQuery(e.target.value); }}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          placeholder="Start typing venue address or postcode…"
          value={query}
        />
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-lg border border-line bg-white shadow-lg">
            {suggestions.map((s) => (
              <button
                className="block w-full px-4 py-3 text-left text-sm hover:bg-slate-50"
                key={s.id}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => apply(s)}
                type="button"
              >
                <span className="block font-medium text-foreground">{s.address}</span>
                <span className="mt-0.5 block text-xs text-muted">
                  {[s.city, s.postcode, s.country].filter(Boolean).join(", ")}
                </span>
              </button>
            ))}
          </div>
        )}
      </label>

      <label className="grid gap-2 text-sm font-medium text-foreground sm:col-span-2">
        Address line 1
        <input
          autoComplete="address-line1"
          className={inputClass}
          name="addressLine1"
          onChange={(e) => setAddress({ ...address, addressLine1: e.target.value })}
          placeholder="Building and street"
          required
          value={address.addressLine1}
        />
      </label>
      <label className="grid gap-2 text-sm font-medium text-foreground sm:col-span-2">
        Address line 2
        <input
          autoComplete="address-line2"
          className={inputClass}
          name="addressLine2"
          onChange={(e) => setAddress({ ...address, addressLine2: e.target.value })}
          placeholder="Area, floor, or unit"
          value={address.addressLine2}
        />
      </label>
      <label className="grid gap-2 text-sm font-medium text-foreground">
        City
        <input
          autoComplete="address-level2"
          className={inputClass}
          name="city"
          onChange={(e) => setAddress({ ...address, city: e.target.value })}
          placeholder="City"
          required
          value={address.city}
        />
      </label>
      <label className="grid gap-2 text-sm font-medium text-foreground">
        Postcode
        <input
          autoComplete="postal-code"
          className={inputClass}
          name="postalCode"
          onChange={(e) => setAddress({ ...address, postalCode: e.target.value.toUpperCase() })}
          placeholder="SW1A 1AA"
          required
          value={address.postalCode}
        />
      </label>
      <label className="grid gap-2 text-sm font-medium text-foreground sm:col-span-2">
        Country
        <input
          autoComplete="country-name"
          className={inputClass}
          name="country"
          onChange={(e) => setAddress({ ...address, country: e.target.value })}
          placeholder="United Kingdom"
          required
          value={address.country}
        />
      </label>

      {/* Map pin picker — auto-centers when address is selected */}
      <LocationPicker
        address={[address.addressLine1, address.city, address.postalCode].filter(Boolean).join(", ")}
      />
    </div>
  );
}
