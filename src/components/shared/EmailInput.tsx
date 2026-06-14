"use client";

import { useId, useState } from "react";
import { isValidEmail } from "@/lib/validation";

/**
 * Email field with inline validation that mirrors the server-side rule in
 * `@/lib/validation`. Shows the error only after blur so users aren't nagged
 * mid-typing.
 */
export default function EmailInput({
  name,
  defaultValue = "",
  required = false,
  placeholder = "you@example.com",
  className = "",
  id,
}: {
  name: string;
  defaultValue?: string;
  required?: boolean;
  placeholder?: string;
  className?: string;
  id?: string;
}) {
  const [value, setValue] = useState(defaultValue);
  const [touched, setTouched] = useState(false);
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;

  const hasInput = value.trim().length > 0;
  const invalid = touched && (required || hasInput) && !isValidEmail(value);

  return (
    <div>
      <input
        aria-describedby={invalid ? errorId : undefined}
        aria-invalid={invalid || undefined}
        autoComplete="email"
        className={`${className} ${
          invalid ? "border-red-300 focus:border-red-400 focus:ring-red-500/10" : ""
        }`}
        id={inputId}
        inputMode="email"
        name={name}
        onBlur={() => setTouched(true)}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        required={required}
        type="email"
        value={value}
      />
      {invalid ? (
        <p className="mt-1.5 text-xs font-medium text-red-600" id={errorId}>
          Please enter a valid email address.
        </p>
      ) : null}
    </div>
  );
}
