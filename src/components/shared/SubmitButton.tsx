"use client";

import { useFormStatus } from "react-dom";

export default function SubmitButton({
  children,
  disabled = false,
}: {
  children: string;
  disabled?: boolean;
}) {
  const { pending } = useFormStatus();
  const isDisabled = disabled || pending;

  return (
    <button
      aria-busy={pending}
      className={`inline-flex w-full items-center justify-center gap-2 rounded-lg bg-foreground px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60 ${
        pending ? "cursor-wait" : "disabled:cursor-not-allowed"
      }`}
      disabled={isDisabled}
      type="submit"
    >
      {pending ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/35 border-t-white" />
      ) : null}
      <span>{children}</span>
    </button>
  );
}
