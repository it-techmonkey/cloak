"use client";

import { useState, useTransition } from "react";
import {
  activateVenue,
  suspendVenue,
} from "@/app/masterdashboard/actions";
import type { AdminVenueReview } from "@/lib/admin-dashboard";

type StatusFilter = "all" | "pending" | "approved" | "rejected" | "suspended";

const STATUS_TABS: Array<{ label: string; value: StatusFilter }> = [
  { label: "All", value: "all" },
  { label: "Pending review", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
  { label: "Suspended", value: "suspended" },
];

const STATUS_DOT: Record<AdminVenueReview["status"], string> = {
  approved: "bg-zinc-800",
  pending:  "bg-zinc-400",
  rejected: "bg-zinc-300",
  suspended: "bg-zinc-300",
};

const STATUS_LABEL: Record<AdminVenueReview["status"], string> = {
  approved:  "Approved",
  pending:   "Pending",
  rejected:  "Rejected",
  suspended: "Suspended",
};

function formatPlan(plan: string | null) {
  if (!plan) return "—";
  if (plan === "per_event") return "Per event";
  return plan.charAt(0).toUpperCase() + plan.slice(1);
}

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

// A monochrome status badge — just a dot + label, no pastel backgrounds.
function StatusBadge({ venue }: { venue: AdminVenueReview }) {
  const isQueried = venue.status === "pending" && Boolean(venue.queryMessage);
  const label = isQueried ? "Queried" : STATUS_LABEL[venue.status];
  const dot = STATUS_DOT[venue.status];
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${dot}`} />
      <span className="text-sm text-foreground">{label}</span>
    </span>
  );
}

function ChevronDown({ open }: { open: boolean }) {
  return (
    <svg
      className={`h-4 w-4 text-zinc-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
    >
      <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Query thread ─────────────────────────────────────────────────────────────

type ThreadTurn = { from: "admin" | "venue"; text: string };

function parseQueryThread(raw: string | null): ThreadTurn[] {
  if (!raw) return [];
  const turns: ThreadTurn[] = [];
  const parts = raw.split(/\n\n— Venue response:\s*/);
  const adminQuery = parts[0].trim();
  if (adminQuery) turns.push({ from: "admin", text: adminQuery });
  for (let i = 1; i < parts.length; i++) {
    const text = parts[i].trim();
    if (text) turns.push({ from: "venue", text });
  }
  return turns;
}

function QueryThread({ turns }: { turns: ThreadTurn[] }) {
  if (turns.length === 0) return null;
  return (
    <div className="space-y-3">
      {turns.map((turn, i) => (
        <div className={`flex gap-3 ${turn.from === "venue" ? "flex-row-reverse" : ""}`} key={i}>
          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-[9px] font-bold tracking-wider text-zinc-600">
            {turn.from === "admin" ? "AD" : "VN"}
          </span>
          <div
            className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
              turn.from === "admin"
                ? "rounded-tl-none bg-zinc-100 text-foreground"
                : "rounded-tr-none bg-zinc-200/60 text-foreground"
            }`}
          >
            <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted">
              {turn.from === "admin" ? "Platform team" : "Venue"}
            </p>
            {turn.text}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Action button ────────────────────────────────────────────────────────────

function ActionBtn({
  children,
  className,
  disabled,
  onClick,
  pending,
}: {
  children: string;
  className: string;
  disabled?: boolean;
  onClick: () => void;
  pending: boolean;
}) {
  return (
    <button
      className={`${className} disabled:opacity-40`}
      disabled={disabled || pending}
      onClick={onClick}
      type="button"
    >
      {pending ? (
        <span className="flex items-center justify-center gap-2">
          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
          {children}
        </span>
      ) : (
        children
      )}
    </button>
  );
}

// ─── Detail field ─────────────────────────────────────────────────────────────

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-widest text-muted">{label}</p>
      <p className="mt-0.5 text-sm text-foreground">{value || "—"}</p>
    </div>
  );
}

// ─── Expanded detail panel ────────────────────────────────────────────────────

function VenueDetailPanel({ venue, onClose }: { venue: AdminVenueReview; onClose: () => void }) {
  const [newQuery, setNewQuery] = useState("");
  const [suspendReason, setSuspendReason] = useState("");
  const [view, setView] = useState<"actions" | "query" | "suspend">("actions");
  const [isPending, startAction] = useTransition();
  const thread = parseQueryThread(venue.queryMessage);

  function runAction(action: (fd: FormData) => Promise<void>, extraFields?: Record<string, string>) {
    startAction(async () => {
      const fd = new FormData();
      fd.set("venueId", venue.id);
      if (extraFields) Object.entries(extraFields).forEach(([k, v]) => fd.set(k, v));
      await action(fd);
    });
  }

  return (
    <tr>
      <td colSpan={5} className="p-0">
        <div className="border-b border-t border-line bg-zinc-50">
          {/* Panel header */}
          <div className="flex items-center justify-between border-b border-line px-6 py-3.5">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-white text-xs font-bold text-zinc-500">
                {venue.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{venue.name}</p>
                <p className="text-xs text-muted">{venue.contactEmail}</p>
              </div>
            </div>
            <button
              aria-label="Close"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition hover:bg-zinc-200 hover:text-foreground"
              onClick={onClose}
              type="button"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          <div className="grid gap-4 p-6 lg:grid-cols-[1fr_280px]">

            {/* Left — details + thread */}
            <div className="space-y-4">
              <div className="rounded-xl border border-line bg-white p-5">
                <p className="mb-4 text-[11px] font-bold uppercase tracking-widest text-muted">Venue details</p>
                <div className="grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-3">
                  <DetailField
                    label="Address"
                    value={[venue.address, venue.city, venue.postalCode].filter(Boolean).join(", ")}
                  />
                  <DetailField
                    label="Capacity"
                    value={
                      venue.hangerCapacity || venue.bagCapacity
                        ? `${venue.hangerCapacity} hangers · ${venue.bagCapacity} bags`
                        : venue.capacity
                          ? `${venue.capacity} slots`
                          : "—"
                    }
                  />
                  <DetailField label="Devices" value={`${1 + venue.extraDevices} total (${venue.extraDevices} extra)`} />
                  <DetailField label="Plan" value={formatPlan(venue.billingPlan)} />
                  <DetailField label="Billing" value={venue.billingStatus} />
                  <DetailField label="Submitted" value={formatDate(venue.submittedAt)} />
                  {venue.contactPhone && <DetailField label="Phone" value={venue.contactPhone} />}
                </div>
              </div>

            </div>

            {/* Right — actions */}
            <div className="rounded-xl border border-line bg-white p-5">
              <p className="mb-4 text-[11px] font-bold uppercase tracking-widest text-muted">Actions</p>

              <div className="space-y-2">
                {venue.status === "approved" && view !== "suspend" && (
                  <button
                    className="flex w-full items-center justify-center rounded-xl border border-line py-3 text-sm font-medium text-muted transition hover:bg-zinc-50 hover:text-foreground"
                    disabled={isPending}
                    onClick={() => setView("suspend")}
                    type="button"
                  >
                    Suspend venue
                  </button>
                )}

                {view === "suspend" && (
                  <div className="space-y-3">
                    <p className="text-xs text-muted">
                      This deactivates the venue immediately. Optionally provide a reason.
                    </p>
                    <input
                      autoFocus
                      className="w-full rounded-xl border border-line bg-zinc-50 px-4 py-2.5 text-sm text-foreground outline-none focus:border-foreground/30 focus:ring-2 focus:ring-foreground/10"
                      onChange={(e) => setSuspendReason(e.target.value)}
                      placeholder="Reason (optional)"
                      value={suspendReason}
                    />
                    <ActionBtn
                      className="flex w-full items-center justify-center rounded-xl bg-foreground py-3 text-sm font-semibold text-white transition hover:opacity-80"
                      onClick={() => { runAction(suspendVenue, { reason: suspendReason }); setView("actions"); }}
                      pending={isPending}
                    >
                      Confirm
                    </ActionBtn>
                    <button
                      className="w-full text-center text-xs text-muted hover:text-foreground"
                      onClick={() => setView("actions")}
                      type="button"
                    >
                      Cancel
                    </button>
                  </div>
                )}

                {venue.status === "suspended" && view !== "suspend" && (
                  <ActionBtn
                    className="flex w-full items-center justify-center rounded-xl border border-amber-300 bg-amber-100 py-3 text-sm font-semibold text-amber-900 transition hover:bg-amber-200"
                    onClick={() => { runAction(activateVenue); setView("actions"); }}
                    pending={isPending}
                  >
                    Reactivate venue
                  </ActionBtn>
                )}
              </div>

              {/* Current status */}
              <div className="mt-6 border-t border-line pt-4">
                <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-muted">Current status</p>
                <StatusBadge venue={venue} />
              </div>
            </div>
          </div>
        </div>
      </td>
    </tr>
  );
}

// ─── Main table ───────────────────────────────────────────────────────────────

export default function VenueTable({ venues }: { venues: AdminVenueReview[] }) {
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const visible = filter === "all" ? venues : venues.filter((v) => v.status === filter);
  const countFor = (s: StatusFilter) =>
    s === "all" ? venues.length : venues.filter((v) => v.status === s).length;

  const pendingCount = countFor("pending");

  return (
    <div className="rounded-xl border border-line bg-panel shadow-sm">
      {/* Table header */}
      <div className="flex flex-col gap-4 border-b border-line px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground">Venues</h2>
          <p className="mt-0.5 text-xs text-muted">{venues.length} total · click any row to review</p>
        </div>
        {/* Filter tabs */}
        <div className="flex gap-1 overflow-x-auto">
          {STATUS_TABS.map((tab) => {
            const count = countFor(tab.value);
            const active = filter === tab.value;
            const showAlert = tab.value === "pending" && pendingCount > 0 && !active;
            return (
              <button
                className={`relative flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition ${
                  active
                    ? "bg-foreground text-white"
                    : "text-muted hover:bg-zinc-100 hover:text-foreground"
                }`}
                key={tab.value}
                onClick={() => { setFilter(tab.value); setExpandedId(null); }}
                type="button"
              >
                {showAlert && (
                  <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-zinc-500" />
                )}
                {tab.label}
                {count > 0 && (
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums ${
                      active ? "bg-white/20 text-white" : "bg-zinc-100 text-zinc-500"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 px-4 py-16 text-center">
          <svg className="h-8 w-8 text-zinc-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path d="M3 21h18M4 21V8l8-5 8 5v13M9 21v-5h6v5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <p className="text-sm text-muted">No venues in this category</p>
        </div>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line bg-zinc-50/50 text-left">
              <th className="px-6 py-3.5 text-[11px] font-bold uppercase tracking-widest text-muted">Venue</th>
              <th className="hidden px-6 py-3.5 text-[11px] font-bold uppercase tracking-widest text-muted md:table-cell">Plan</th>
              <th className="hidden px-6 py-3.5 text-[11px] font-bold uppercase tracking-widest text-muted lg:table-cell">Submitted</th>
              <th className="px-6 py-3.5 text-[11px] font-bold uppercase tracking-widest text-muted">Status</th>
              <th className="px-6 py-3.5" />
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {visible.map((venue) => {
              const isExpanded = expandedId === venue.id;
              return (
                <>
                  <tr
                    className={`cursor-pointer transition-colors ${isExpanded ? "bg-zinc-50" : "hover:bg-zinc-50/70"}`}
                    key={venue.id}
                    onClick={() => setExpandedId(isExpanded ? null : venue.id)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-line bg-zinc-100 text-xs font-bold text-zinc-500">
                          {venue.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-foreground">{venue.name}</p>
                          <p className="mt-0.5 truncate text-xs text-muted">
                            {[venue.city, venue.contactEmail].filter(Boolean).join(" · ")}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="hidden px-6 py-4 text-sm text-muted md:table-cell">
                      {formatPlan(venue.billingPlan)}
                    </td>
                    <td className="hidden px-6 py-4 text-sm text-muted lg:table-cell">
                      {formatDate(venue.submittedAt)}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge venue={venue} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <ChevronDown open={isExpanded} />
                    </td>
                  </tr>

                  {isExpanded && (
                    <VenueDetailPanel
                      key={`${venue.id}-detail`}
                      onClose={() => setExpandedId(null)}
                      venue={venue}
                    />
                  )}
                </>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
