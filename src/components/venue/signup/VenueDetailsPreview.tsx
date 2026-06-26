"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createVenueSignup } from "@/app/venuesignup/actions";
import SubmitButton from "@/components/shared/SubmitButton";
import PhoneInput from "@/components/shared/PhoneInput";
import { UkAddressFields, UaeAddressFields } from "./AddressFields";

const inputClass =
  "w-full rounded-lg border border-line bg-white px-3 py-3 text-sm text-foreground outline-none transition placeholder:text-zinc-400 focus:border-foreground/40 focus:ring-2 focus:ring-foreground/8";

const COUNTRIES = ["United Kingdom", "United Arab Emirates"] as const;
type Country = (typeof COUNTRIES)[number];

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="col-span-full text-sm font-semibold uppercase tracking-widest text-muted">
      {children}
    </h3>
  );
}

function VenueBlock({ index, defaultCountry }: { index: number; defaultCountry: Country }) {
  const prefix = `venue_${index}`;
  const label = index === 0 ? "Primary venue" : `Venue ${index + 1}`;
  const [country, setCountry] = useState<Country>(defaultCountry);

  return (
    <div className="col-span-full rounded-xl border border-line bg-zinc-50 p-5">
      <p className="mb-4 text-sm font-semibold text-foreground">{label}</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm font-medium text-foreground">
          Venue name
          <input className={inputClass} name={`${prefix}_venueName`} placeholder="Enter venue name" required />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-2 text-sm font-medium text-foreground">
            Hanger capacity
            <input className={inputClass} min={0} name={`${prefix}_hangerCapacity`} placeholder="150" required type="number" />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium text-foreground">
            Bag capacity
            <input className={inputClass} min={0} name={`${prefix}_bagCapacity`} placeholder="80" required type="number" />
          </label>
        </div>

        <label className="col-span-full flex flex-col gap-2 text-sm font-medium text-foreground">
          Country
          <select
            className={`${inputClass} max-w-xs`}
            onChange={(e) => setCountry(e.target.value as Country)}
            value={country}
          >
            {COUNTRIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>
        <input name={`${prefix}_country`} type="hidden" value={country} />

        {country === "United Kingdom" ? (
          <UkAddressFields prefix={prefix} />
        ) : (
          <UaeAddressFields prefix={prefix} />
        )}

        {/* Extra devices */}
        <div className="col-span-full flex items-start gap-4 rounded-lg border border-line bg-white p-4">
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">Additional devices</p>
            <p className="mt-0.5 text-xs text-muted">
              1 device is included per venue. Add more at £99 per device/month.
            </p>
          </div>
          <label className="flex items-center gap-2 text-sm font-medium text-foreground">
            Extra devices
            <input
              className="w-20 rounded-lg border border-line bg-white px-3 py-2 text-sm text-foreground outline-none focus:border-foreground/40 focus:ring-2 focus:ring-foreground/8"
              defaultValue={0}
              min={0}
              max={10}
              name={`${prefix}_extraDevices`}
              type="number"
            />
          </label>
        </div>
      </div>
    </div>
  );
}

export default function VenueDetailsPreview({
  billingPlan,
  error,
}: {
  billingPlan?: string | null;
  error?: string;
}) {
  const singleVenueOnly = billingPlan === "starter" || billingPlan === "per_event";
  const [venueCount, setVenueCount] = useState<"single" | "multiple">("single");
  const [venueQuantity, setVenueQuantity] = useState(2);
  const [detectedCountry, setDetectedCountry] = useState<Country>("United Kingdom");
  const [countryDetected, setCountryDetected] = useState(false);

  // Auto-detect country via IP on mount to set default for venue blocks
  useEffect(() => {
    if (countryDetected) return;
    fetch("https://ipapi.co/json/")
      .then((r) => r.json())
      .then((d) => {
        if (d?.country_name === "United Arab Emirates") setDetectedCountry("United Arab Emirates");
        setCountryDetected(true);
      })
      .catch(() => setCountryDetected(true));
  }, [countryDetected]);

  const numVenues = venueCount === "single" ? 1 : Math.min(Math.max(venueQuantity, 2), 3);
  const isOverEnterprise = venueCount === "multiple" && venueQuantity > 3;

  return (
    <form action={createVenueSignup} className="grid gap-6">
      {/* Hidden fields */}
      <input name="venueCount" type="hidden" value={venueCount} />
      <input name="venueQuantity" type="hidden" value={venueQuantity} />

      <div className="rounded-2xl border border-line bg-white p-6 shadow-sm">
        <div className="grid gap-5 sm:grid-cols-2">

          {/* ── Contact details ─────────────────────────────────────── */}
          <SectionHeading>Contact details</SectionHeading>
          <label className="flex flex-col gap-2 text-sm font-medium text-foreground">
            Full name
            <input className={inputClass} name="contactName" placeholder="Enter your full name" required />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium text-foreground">
            Company name
            <input className={inputClass} name="companyName" placeholder="Enter your company name" required />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium text-foreground">
            Email address
            <input className={inputClass} name="contactEmail" placeholder="Enter your email address" required type="email" />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium text-foreground">
            Phone number
            <PhoneInput name="contactPhone" placeholder="Enter your phone number" required />
          </label>

          {/* ── Venue type ──────────────────────────────────────────── */}
          <SectionHeading>Venue type</SectionHeading>
          <div className="col-span-full grid gap-3 sm:grid-cols-2">
            <label
              className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition ${
                venueCount === "single" ? "border-foreground bg-zinc-50" : "border-line bg-white hover:bg-zinc-50"
              }`}
            >
              <input
                checked={venueCount === "single"}
                className="accent-foreground"
                name="venueCountDisplay"
                onChange={() => setVenueCount("single")}
                type="radio"
                value="single"
              />
              <div>
                <p className="text-sm font-semibold text-foreground">Single venue</p>
                <p className="text-xs text-muted">One cloakroom location</p>
              </div>
            </label>

            <label
              className={`flex items-center gap-3 rounded-xl border p-4 transition ${
                singleVenueOnly
                  ? "cursor-not-allowed border-line bg-zinc-50 opacity-60"
                  : venueCount === "multiple"
                    ? "cursor-pointer border-foreground bg-zinc-50"
                    : "cursor-pointer border-line bg-white hover:bg-zinc-50"
              }`}
            >
              <input
                checked={venueCount === "multiple"}
                className="accent-foreground"
                disabled={singleVenueOnly}
                name="venueCountDisplay"
                onChange={() => !singleVenueOnly && setVenueCount("multiple")}
                type="radio"
                value="multiple"
              />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">Multiple venues</p>
                {singleVenueOnly ? (
                  <p className="text-xs text-amber-600">
                    Upgrade to Professional to add multiple venues.
                  </p>
                ) : (
                  <p className="text-xs text-muted">Two or more locations</p>
                )}
              </div>
            </label>
          </div>

          {venueCount === "multiple" && (
            <div className="col-span-full">
              <label className="flex flex-col gap-2 text-sm font-medium text-foreground">
                How many venues?
                <input
                  className={`${inputClass} max-w-30`}
                  min={2}
                  onChange={(e) => {
                    const raw = e.target.value;
                    if (raw === "" || raw === "-") return;
                    setVenueQuantity(Number(raw));
                  }}
                  onBlur={(e) => {
                    const val = Number(e.target.value);
                    if (!val || val < 2) setVenueQuantity(2);
                  }}
                  placeholder="2"
                  type="number"
                  defaultValue={venueQuantity}
                  key={venueCount}
                />
              </label>
              {isOverEnterprise && (
                <div className="mt-3 flex items-start gap-3 rounded-xl border border-foreground/20 bg-zinc-950 px-4 py-3">
                  <svg className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                    <path clipRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" fillRule="evenodd" />
                  </svg>
                  <div>
                    <p className="text-sm font-semibold text-white">Looks like you need Enterprise</p>
                    <p className="mt-0.5 text-xs text-white/60">
                      For more than 3 venues, our Enterprise plan is the right fit — custom pricing and a dedicated account manager.
                    </p>
                    <Link className="mt-2 inline-block text-xs font-semibold text-emerald-400 hover:underline" href="/book-a-demo">
                      Book a call with us →
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Venue blocks ────────────────────────────────────────── */}
          <SectionHeading>Venue information</SectionHeading>
          {!isOverEnterprise && Array.from({ length: numVenues }).map((_, i) => (
            <VenueBlock defaultCountry={detectedCountry} index={i} key={i} />
          ))}
        </div>
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{error}</p>
      )}

      {!isOverEnterprise && <SubmitButton>Continue to review</SubmitButton>}
    </form>
  );
}
