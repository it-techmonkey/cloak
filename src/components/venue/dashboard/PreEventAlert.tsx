"use client";

import { useEffect, useState } from "react";
import type { ActiveEvent } from "@/lib/venue-dashboard";

export default function PreEventAlert({ event }: { event: ActiveEvent }) {
  const [minutesLeft, setMinutesLeft] = useState<number | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!event.startsAt) return;

    function update() {
      const diff = new Date(event.startsAt!).getTime() - Date.now();
      const mins = Math.round(diff / 60000);
      setMinutesLeft(mins);
    }

    update();
    const id = setInterval(update, 30_000);
    return () => clearInterval(id);
  }, [event.startsAt]);

  // Only show when between 0 and 10 minutes before start (hide once started)
  if (dismissed || minutesLeft === null || minutesLeft > 10 || minutesLeft <= 0) return null;

  const label =
    minutesLeft === 0
      ? "starting now"
      : minutesLeft === 1
        ? "starting in 1 minute"
        : `starting in ${minutesLeft} minutes`;

  return (
    <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3.5">
      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-400 text-xs font-bold text-white">
        !
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-amber-900">
          {event.name} is {label}
        </p>
        <p className="mt-0.5 text-xs text-amber-700">
          Make sure the scanner is open and staff are at the counter.
        </p>
      </div>
      <button
        className="shrink-0 rounded-md p-1 text-amber-600 transition hover:bg-amber-100 hover:text-amber-800"
        onClick={() => setDismissed(true)}
        type="button"
        aria-label="Dismiss"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}
