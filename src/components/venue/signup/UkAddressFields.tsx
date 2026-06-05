"use client";

import { useMemo, useState } from "react";

const inputClass =
  "w-full rounded-lg border border-line bg-white px-3 py-3 text-sm text-foreground outline-none transition placeholder:text-slate-400 focus:border-brand focus:ring-2 focus:ring-brand/15";

const ukAddresses = [
  {
    addressLine1: "Somerset House, Strand",
    addressLine2: "",
    city: "London",
    country: "United Kingdom",
    postalCode: "WC2R 1LA",
  },
  {
    addressLine1: "The Custard Factory, Gibb Street",
    addressLine2: "Digbeth",
    city: "Birmingham",
    country: "United Kingdom",
    postalCode: "B9 4AA",
  },
  {
    addressLine1: "Old Granada Studios, Quay Street",
    addressLine2: "",
    city: "Manchester",
    country: "United Kingdom",
    postalCode: "M3 4PR",
  },
  {
    addressLine1: "Engine Shed, Station Approach",
    addressLine2: "Temple Meads",
    city: "Bristol",
    country: "United Kingdom",
    postalCode: "BS1 6QH",
  },
  {
    addressLine1: "The Biscuit Factory, Stoddart Street",
    addressLine2: "",
    city: "Newcastle upon Tyne",
    country: "United Kingdom",
    postalCode: "NE2 1AN",
  },
];

type Address = (typeof ukAddresses)[number];

function emptyAddress(): Address {
  return {
    addressLine1: "",
    addressLine2: "",
    city: "",
    country: "United Kingdom",
    postalCode: "",
  };
}

function addressLabel(address: Address) {
  return `${address.addressLine1}, ${address.city}, ${address.postalCode}`;
}

export default function UkAddressFields() {
  const [address, setAddress] = useState<Address>(emptyAddress);
  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const suggestions = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    if (normalized.length < 2) {
      return [];
    }

    return ukAddresses.filter((item) =>
      addressLabel(item).toLowerCase().includes(normalized),
    );
  }, [query]);

  function applyAddress(selectedAddress: Address) {
    setAddress(selectedAddress);
    setQuery(addressLabel(selectedAddress));
    setShowSuggestions(false);
  }

  return (
    <div className="grid gap-4 sm:col-span-2 sm:grid-cols-2">
      <label className="relative grid gap-2 text-sm font-medium text-foreground sm:col-span-2">
        Find UK address
        <input
          autoComplete="street-address"
          className={inputClass}
          onChange={(event) => {
            setQuery(event.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          placeholder="Start typing venue address or postcode"
          value={query}
        />
        {showSuggestions && suggestions.length > 0 ? (
          <div className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-lg border border-line bg-white shadow-lg">
            {suggestions.map((item) => (
              <button
                className="block w-full px-3 py-3 text-left text-sm text-foreground hover:bg-slate-50"
                key={`${item.addressLine1}-${item.postalCode}`}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => applyAddress(item)}
                type="button"
              >
                <span className="block font-medium">{item.addressLine1}</span>
                <span className="mt-1 block text-xs text-muted">
                  {item.city}, {item.postalCode}
                </span>
              </button>
            ))}
          </div>
        ) : null}
      </label>

      <label className="grid gap-2 text-sm font-medium text-foreground sm:col-span-2">
        Address line 1
        <input
          autoComplete="address-line1"
          className={inputClass}
          name="addressLine1"
          onChange={(event) => setAddress({ ...address, addressLine1: event.target.value })}
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
          onChange={(event) => setAddress({ ...address, addressLine2: event.target.value })}
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
          onChange={(event) => setAddress({ ...address, city: event.target.value })}
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
          onChange={(event) => setAddress({ ...address, postalCode: event.target.value.toUpperCase() })}
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
          onChange={(event) => setAddress({ ...address, country: event.target.value })}
          placeholder="United Kingdom"
          required
          value={address.country}
        />
      </label>
    </div>
  );
}
