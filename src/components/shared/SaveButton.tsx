"use client";

import { useFormStatus } from "react-dom";

/**
 * Inline save button for settings-style forms. Shows a spinner and disables
 * itself while the server action is in flight. Success is surfaced separately
 * by the page-level alert after the action redirects back with ?message=.
 */
export default function SaveButton({
  children = "Save changes",
  disabled = false,
}: {
  children?: string;
  disabled?: boolean;
}) {
  const { pending } = useFormStatus();
  const isDisabled = disabled || pending;

  return (
    <button
      aria-busy={pending}
      className={`inline-flex items-center justify-center gap-2 rounded-lg bg-foreground px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60 ${
        pending ? "cursor-wait" : ""
      }`}
      disabled={isDisabled}
      type="submit"
    >
      {pending ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/35 border-t-white" />
      ) : null}
      <span>{pending ? "Saving…" : children}</span>
    </button>
  );
}
