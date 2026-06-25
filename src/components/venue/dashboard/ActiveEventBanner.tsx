"use client";

import { useState } from "react";
import type { ActiveEvent } from "@/lib/venue-dashboard";

function formatTime(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

export default function ActiveEventBanner({
  event,
  onEnd,
}: {
  event: ActiveEvent;
  onEnd: (eventId: string) => Promise<void>;
}) {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleEnd() {
    setLoading(true);
    try {
      await onEnd(event.id);
    } finally {
      setLoading(false);
      setConfirming(false);
    }
  }

  const start = formatTime(event.startsAt);
  const end = formatTime(event.endsAt);
  const timeLabel = start && end
    ? `${start}–${end}`
    : start
      ? `from ${start}`
      : null;

  return (
    <div className="flex items-center gap-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3.5">
      {/* Live pulse dot */}
      <span className="relative flex h-2.5 w-2.5 shrink-0">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-emerald-900">
          {event.name}
          <span className="ml-2 text-xs font-normal text-emerald-700">Live now</span>
        </p>
        <p className="mt-0.5 text-xs text-emerald-700">
          {timeLabel ? `${timeLabel} · ` : ""}
          {event.ticketCount} {event.ticketCount === 1 ? "ticket" : "tickets"} this event
        </p>
      </div>

      {confirming ? (
        <div className="flex shrink-0 items-center gap-2">
          <span className="text-xs text-emerald-800">End &ldquo;{event.name}&rdquo;?</span>
          <button
            className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-50"
            disabled={loading}
            onClick={handleEnd}
            type="button"
          >
            {loading ? "Ending…" : "Confirm end"}
          </button>
          <button
            className="rounded-lg border border-emerald-200 px-3 py-1.5 text-xs font-medium text-emerald-800 transition hover:bg-emerald-100"
            onClick={() => setConfirming(false)}
            type="button"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          className="shrink-0 rounded-lg border border-emerald-300 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-800 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
          onClick={() => setConfirming(true)}
          type="button"
        >
          End event
        </button>
      )}
    </div>
  );
}
