"use client";

import { useState, useTransition } from "react";
import {
  approveVenue,
  queryVenue,
  suspendVenue,
} from "@/app/masterdashboard/actions";
import Panel from "@/components/shared/Panel";
import StatusPill, { type StatusTone } from "@/components/shared/StatusPill";
import type { AdminVenueReview } from "@/lib/admin-dashboard";

type StatusFilter = "all" | "pending" | "approved" | "rejected" | "suspended";

const STATUS_TABS: Array<{ label: string; value: StatusFilter }> = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
  { label: "Suspended", value: "suspended" },
];

const STATUS_TONE: Record<AdminVenueReview["status"], StatusTone> = {
  approved: "green",
  pending: "warning",
  rejected: "danger",
  suspended: "neutral",
};

const STATUS_LABEL: Record<AdminVenueReview["status"], string> = {
  approved: "Approved",
  pending: "Pending",
  rejected: "Rejected",
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

// ─── Query thread parsing ─────────────────────────────────────────────────────

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

// ─── Query thread UI ──────────────────────────────────────────────────────────

function QueryThread({ turns }: { turns: ThreadTurn[] }) {
  if (turns.length === 0) return null;
  return (
    <div className="space-y-2">
      {turns.map((turn, i) => (
        <div
          className={`flex gap-2.5 ${turn.from === "venue" ? "flex-row-reverse" : ""}`}
          key={i}
        >
          {/* Avatar */}
          <span
            className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-white ${
              turn.from === "admin" ? "bg-foreground" : "bg-amber-500"
            }`}
          >
            {turn.from === "admin" ? "AD" : "VN"}
          </span>

          {/* Bubble */}
          <div
            className={`max-w-[80%] rounded-xl px-3 py-2.5 text-xs leading-5 ${
              turn.from === "admin"
                ? "rounded-tl-none bg-zinc-100 text-foreground"
                : "rounded-tr-none bg-amber-50 text-amber-900"
            }`}
          >
            <p className={`mb-1 text-[10px] font-semibold uppercase tracking-wider ${
              turn.from === "admin" ? "text-muted" : "text-amber-600"
            }`}>
              {turn.from === "admin" ? "Platform team" : "Venue"}
            </p>
            {turn.text}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Action buttons ───────────────────────────────────────────────────────────

function ActionButton({
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
      className={`${className} disabled:opacity-50`}
      disabled={disabled || pending}
      onClick={onClick}
      type="button"
    >
      {pending ? (
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
          {children}
        </span>
      ) : (
        children
      )}
    </button>
  );
}

// ─── Expanded venue detail panel ──────────────────────────────────────────────

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
      <td className="bg-zinc-50 px-4 py-5" colSpan={5}>
        <div className="grid gap-5 lg:grid-cols-[1fr_320px]">

          {/* Left — query thread */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                {thread.length > 0 ? "Query thread" : "No queries yet"}
              </p>
              <button
                className="text-xs text-muted hover:text-foreground"
                onClick={onClose}
                type="button"
              >
                Close ✕
              </button>
            </div>

            {thread.length > 0 ? (
              <div className="mb-4 space-y-1 rounded-xl border border-line bg-white p-4">
                <QueryThread turns={thread} />
              </div>
            ) : (
              <div className="mb-4 rounded-xl border border-dashed border-line bg-white px-4 py-6 text-center text-xs text-muted">
                No messages yet. Send a query to request more information from the venue.
              </div>
            )}

            {/* Send new query or follow-up */}
            {view === "query" ? (
              <div className="space-y-2">
                <textarea
                  autoFocus
                  className="w-full rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-foreground outline-none placeholder:text-muted focus:border-amber-400 focus:ring-2 focus:ring-amber-100 resize-none"
                  onChange={(e) => setNewQuery(e.target.value)}
                  placeholder="Describe what information or changes are needed before approval…"
                  rows={3}
                  value={newQuery}
                />
                <div className="flex gap-2">
                  <ActionButton
                    className="rounded-lg bg-amber-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-amber-600"
                    disabled={!newQuery.trim()}
                    onClick={() => { runAction(queryVenue, { message: newQuery }); setView("actions"); setNewQuery(""); }}
                    pending={isPending}
                  >
                    Send query
                  </ActionButton>
                  <button
                    className="text-xs text-muted hover:text-foreground"
                    onClick={() => setView("actions")}
                    type="button"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : null}
          </div>

          {/* Right — venue info + actions */}
          <div className="space-y-4">
            {/* Venue details */}
            <div className="rounded-xl border border-line bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">Details</p>
              <div className="mt-3 space-y-2.5 text-sm">
                {/* Full address block */}
                <div className="rounded-lg bg-zinc-50 px-3 py-2.5">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted mb-1">Address</p>
                  <p className="text-sm font-medium text-foreground leading-5">
                    {[venue.address, venue.city, venue.postalCode].filter(Boolean).join(", ") || "—"}
                  </p>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-muted">Plan</span>
                  <span className="font-medium text-foreground">{formatPlan(venue.billingPlan)}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-muted">Capacity</span>
                  <span className="font-medium text-foreground">{venue.capacity} slots</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-muted">Submitted</span>
                  <span className="font-medium text-foreground">{formatDate(venue.submittedAt)}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="shrink-0 text-muted">Email</span>
                  <span className="truncate font-medium text-foreground">{venue.contactEmail}</span>
                </div>
                {venue.contactPhone && (
                  <div className="flex justify-between gap-2">
                    <span className="text-muted">Phone</span>
                    <span className="font-medium text-foreground">{venue.contactPhone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="rounded-xl border border-line bg-white p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">Actions</p>

              {venue.status === "pending" && view !== "suspend" && (
                <div className="space-y-2">
                  <ActionButton
                    className="w-full rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
                    onClick={() => runAction(approveVenue)}
                    pending={isPending}
                  >
                    Approve venue
                  </ActionButton>
                  {view === "actions" && (
                    <button
                      className="w-full rounded-lg border border-amber-200 bg-amber-50 py-2.5 text-sm font-semibold text-amber-800 transition hover:bg-amber-100"
                      disabled={isPending}
                      onClick={() => setView("query")}
                      type="button"
                    >
                      {thread.length > 0 ? "Send follow-up query" : "Send query"}
                    </button>
                  )}
                </div>
              )}

              {venue.status === "approved" && view !== "suspend" && (
                <button
                  className="w-full rounded-lg border border-red-200 bg-red-50 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-100"
                  disabled={isPending}
                  onClick={() => setView("suspend")}
                  type="button"
                >
                  Suspend venue
                </button>
              )}

              {view === "suspend" && (
                <div className="space-y-2">
                  <input
                    autoFocus
                    className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-foreground outline-none focus:border-foreground/30"
                    onChange={(e) => setSuspendReason(e.target.value)}
                    placeholder="Reason (optional)"
                    value={suspendReason}
                  />
                  <ActionButton
                    className="w-full rounded-lg bg-red-600 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
                    onClick={() => { runAction(suspendVenue, { reason: suspendReason }); setView("actions"); }}
                    pending={isPending}
                  >
                    Confirm suspend
                  </ActionButton>
                  <button
                    className="w-full text-xs text-muted hover:text-foreground"
                    onClick={() => setView("actions")}
                    type="button"
                  >
                    Cancel
                  </button>
                </div>
              )}

              {(venue.status === "suspended" || venue.status === "rejected") && (
                <ActionButton
                  className="w-full rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
                  onClick={() => runAction(approveVenue)}
                  pending={isPending}
                >
                  Reinstate venue
                </ActionButton>
              )}
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

  return (
    <Panel title="Venues">
      {/* Filter tabs */}
      <div className="mb-4 flex gap-1 overflow-x-auto border-b border-line pb-3">
        {STATUS_TABS.map((tab) => {
          const count = countFor(tab.value);
          const active = filter === tab.value;
          return (
            <button
              className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                active
                  ? "bg-foreground text-white"
                  : "text-muted hover:bg-zinc-100 hover:text-foreground"
              }`}
              key={tab.value}
              onClick={() => { setFilter(tab.value); setExpandedId(null); }}
              type="button"
            >
              {tab.label}
              {count > 0 && (
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                    active ? "bg-white/20 text-white" : "bg-zinc-100 text-muted"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {visible.length === 0 ? (
        <div className="rounded-lg border border-dashed border-line bg-zinc-50 px-4 py-8 text-center text-sm text-muted">
          No venues in this category.
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-line">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line bg-zinc-50 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                <th className="px-4 py-3">Venue</th>
                <th className="hidden px-4 py-3 md:table-cell">Plan</th>
                <th className="hidden px-4 py-3 lg:table-cell">Submitted</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {visible.map((venue) => {
                const isExpanded = expandedId === venue.id;
                const hasThread = Boolean(venue.queryMessage);
                const isQueried = venue.status === "pending" && hasThread;

                return (
                  <>
                    <tr
                      className={`cursor-pointer transition ${isExpanded ? "bg-zinc-50" : "hover:bg-zinc-50"}`}
                      key={venue.id}
                      onClick={() => setExpandedId(isExpanded ? null : venue.id)}
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium text-foreground">{venue.name}</p>
                        <p className="mt-0.5 text-xs text-muted">
                          {[venue.city, venue.contactEmail].filter(Boolean).join(" · ")}
                        </p>
                      </td>
                      <td className="hidden px-4 py-3 text-muted md:table-cell">
                        {formatPlan(venue.billingPlan)}
                      </td>
                      <td className="hidden px-4 py-3 text-muted lg:table-cell">
                        {formatDate(venue.submittedAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          <StatusPill tone={STATUS_TONE[venue.status]}>
                            {isQueried ? "Queried" : STATUS_LABEL[venue.status]}
                          </StatusPill>
                          {isQueried && (
                            <span className="text-[10px] text-amber-600">Response pending</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-xs text-muted">
                          {isExpanded ? "▲ Close" : "▼ Open"}
                        </span>
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
        </div>
      )}
    </Panel>
  );
}

