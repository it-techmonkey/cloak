"use client";

import { useId, useMemo, useState } from "react";

/**
 * Country dialling codes offered in the selector. UK is the default.
 * Ordered with the most common markets first, then alphabetical-ish.
 */
export const COUNTRY_CODES: Array<{ code: string; dial: string; label: string }> = [
  { code: "GB", dial: "+44", label: "United Kingdom" },
  { code: "IE", dial: "+353", label: "Ireland" },
  { code: "US", dial: "+1", label: "United States / Canada" },
  { code: "FR", dial: "+33", label: "France" },
  { code: "DE", dial: "+49", label: "Germany" },
  { code: "ES", dial: "+34", label: "Spain" },
  { code: "IT", dial: "+39", label: "Italy" },
  { code: "NL", dial: "+31", label: "Netherlands" },
  { code: "PT", dial: "+351", label: "Portugal" },
  { code: "PL", dial: "+48", label: "Poland" },
  { code: "AU", dial: "+61", label: "Australia" },
  { code: "AE", dial: "+971", label: "UAE" },
  { code: "IN", dial: "+91", label: "India" },
];

const DEFAULT_DIAL = "+44";

// Longest dial codes first so "+1" doesn't shadow "+44" etc. during a prefix match.
const DIALS_BY_LENGTH = [...COUNTRY_CODES]
  .map((c) => c.dial)
  .sort((a, b) => b.length - a.length);

/**
 * Split a stored phone value (e.g. "+447700900000" or "07700 900000") into a
 * dial code + national part so edit forms reopen with the right country.
 */
function splitPhone(value: string): { dial: string; national: string } {
  const trimmed = value.trim();
  if (!trimmed) return { dial: DEFAULT_DIAL, national: "" };

  if (trimmed.startsWith("+")) {
    const compact = trimmed.replace(/[\s-]/g, "");
    const matched = DIALS_BY_LENGTH.find((d) => compact.startsWith(d));
    if (matched) {
      return { dial: matched, national: compact.slice(matched.length) };
    }
    // Unknown country code — keep the whole thing in the national field.
    return { dial: DEFAULT_DIAL, national: trimmed };
  }

  // No country code stored (legacy). Show it as-is under the default dial.
  return { dial: DEFAULT_DIAL, national: trimmed };
}

function combine(dial: string, national: string): string {
  const digits = national.replace(/[^\d]/g, "").replace(/^0+/, "");
  if (!digits) return "";
  return `${dial}${digits}`;
}

export default function PhoneInput({
  name,
  defaultValue = "",
  required = false,
  placeholder = "7700 900000",
  className = "",
  onChange,
  id,
}: {
  name: string;
  defaultValue?: string;
  required?: boolean;
  placeholder?: string;
  className?: string;
  /** Called with the combined E.164-style value whenever it changes. */
  onChange?: (combined: string) => void;
  id?: string;
}) {
  const initial = useMemo(() => splitPhone(defaultValue), [defaultValue]);
  const [dial, setDial] = useState(initial.dial);
  const [national, setNational] = useState(initial.national);
  const generatedId = useId();
  const inputId = id ?? generatedId;

  const combined = combine(dial, national);

  function update(nextDial: string, nextNational: string) {
    setDial(nextDial);
    setNational(nextNational);
    onChange?.(combine(nextDial, nextNational));
  }

  return (
    <div className={`flex gap-2 ${className}`}>
      {/* Hidden field carries the combined value for native form submissions. */}
      <input name={name} type="hidden" value={combined} />

      <select
        aria-label="Country code"
        className="shrink-0 rounded-lg border border-line bg-white px-2 py-2.5 text-sm text-foreground outline-none transition focus:border-foreground/40 focus:ring-2 focus:ring-foreground/8"
        onChange={(e) => update(e.target.value, national)}
        value={dial}
      >
        {COUNTRY_CODES.map((c) => (
          <option key={c.code} value={c.dial}>
            {c.dial} {c.code}
          </option>
        ))}
      </select>

      <input
        autoComplete="tel-national"
        className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-foreground outline-none transition placeholder:text-zinc-400 focus:border-foreground/40 focus:ring-2 focus:ring-foreground/8"
        id={inputId}
        inputMode="tel"
        onChange={(e) => update(dial, e.target.value)}
        placeholder={placeholder}
        required={required}
        type="tel"
        value={national}
      />
    </div>
  );
}
