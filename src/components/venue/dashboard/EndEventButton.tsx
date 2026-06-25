"use client";

import { useState } from "react";
import type { ActiveEvent } from "@/lib/venue-dashboard";

export default function EndEventButton({
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

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted">End "{event.name}"?</span>
        <button
          className="rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-50"
          disabled={loading}
          onClick={handleEnd}
          type="button"
        >
          {loading ? "Ending…" : "Confirm"}
        </button>
        <button
          className="rounded-xl border border-line px-3 py-1.5 text-xs font-medium text-muted transition hover:text-foreground"
          onClick={() => setConfirming(false)}
          type="button"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      className="rounded-xl border border-line bg-white px-3 py-1.5 text-xs font-semibold text-muted transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
      onClick={() => setConfirming(true)}
      title={`End event: ${event.name}`}
      type="button"
    >
      End event
    </button>
  );
}
