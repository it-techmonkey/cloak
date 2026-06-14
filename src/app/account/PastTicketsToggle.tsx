"use client";

import { useState } from "react";
import type { CustomerTicket } from "./actions";
import { TicketCard } from "./page";

export default function PastTicketsToggle({ past }: { past: CustomerTicket[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        className="mb-3 flex w-full items-center justify-between rounded-lg px-0 py-0 text-xs font-semibold uppercase tracking-widest text-muted hover:text-foreground transition"
        onClick={() => setOpen((v) => !v)}
        type="button"
      >
        <span>Past tickets ({past.length})</span>
        <svg
          className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <div className="grid gap-3">
          {past.map((t) => (
            <TicketCard key={t.ticketId} ticket={t} />
          ))}
        </div>
      )}
    </div>
  );
}
