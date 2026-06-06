"use client";

import { useState } from "react";
import {
  approveVenue,
  rejectVenue,
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

function RowActions({ venue }: { venue: AdminVenueReview }) {
  const [expanded, setExpanded] = useState(false);

  if (venue.status === "pending") {
    return (
      <div className="flex items-center justify-end gap-2">
        <form action={approveVenue}>
          <input name="venueId" type="hidden" value={venue.id} />
          <button
            className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700"
            type="submit"
          >
            Approve
          </button>
        </form>
        {expanded ? (
          <form action={rejectVenue} className="flex gap-1.5">
            <input name="venueId" type="hidden" value={venue.id} />
            <input
              autoFocus
              className="w-36 rounded-lg border border-line bg-white px-2 py-1.5 text-xs text-foreground outline-none focus:border-brand"
              name="reason"
              placeholder="Reason (optional)"
            />
            <button
              className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100"
              type="submit"
            >
              Reject
            </button>
            <button
              className="text-xs text-muted hover:text-foreground"
              onClick={() => setExpanded(false)}
              type="button"
            >
              Cancel
            </button>
          </form>
        ) : (
          <button
            className="rounded-lg border border-line bg-white px-3 py-1.5 text-xs font-medium text-muted transition hover:text-foreground"
            onClick={() => setExpanded(true)}
            type="button"
          >
            Reject
          </button>
        )}
      </div>
    );
  }

  if (venue.status === "approved") {
    return (
      <div className="flex items-center justify-end gap-2">
        {expanded ? (
          <form action={suspendVenue} className="flex gap-1.5">
            <input name="venueId" type="hidden" value={venue.id} />
            <input
              autoFocus
              className="w-36 rounded-lg border border-line bg-white px-2 py-1.5 text-xs text-foreground outline-none focus:border-brand"
              name="reason"
              placeholder="Reason (optional)"
            />
            <button
              className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100"
              type="submit"
            >
              Suspend
            </button>
            <button
              className="text-xs text-muted hover:text-foreground"
              onClick={() => setExpanded(false)}
              type="button"
            >
              Cancel
            </button>
          </form>
        ) : (
          <button
            className="rounded-lg border border-line bg-white px-3 py-1.5 text-xs font-medium text-muted transition hover:text-foreground"
            onClick={() => setExpanded(true)}
            type="button"
          >
            Suspend
          </button>
        )}
      </div>
    );
  }

  if (venue.status === "suspended" || venue.status === "rejected") {
    return (
      <div className="flex items-center justify-end">
        <form action={approveVenue}>
          <input name="venueId" type="hidden" value={venue.id} />
          <button
            className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700"
            type="submit"
          >
            Reinstate
          </button>
        </form>
      </div>
    );
  }

  return null;
}

export default function VenueTable({ venues }: { venues: AdminVenueReview[] }) {
  const [filter, setFilter] = useState<StatusFilter>("all");

  const visible = filter === "all" ? venues : venues.filter((v) => v.status === filter);

  const countFor = (s: StatusFilter) =>
    s === "all" ? venues.length : venues.filter((v) => v.status === s).length;

  return (
    <Panel title="Venues">
      {/* Filter tabs — scrollable on mobile */}
      <div className="mb-4 flex gap-1 overflow-x-auto border-b border-line pb-3">
        {STATUS_TABS.map((tab) => {
          const count = countFor(tab.value);
          const active = filter === tab.value;
          return (
            <button
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                active
                  ? "bg-foreground text-white"
                  : "text-muted hover:bg-slate-100 hover:text-foreground"
              }`}
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              type="button"
            >
              {tab.label}
              {count > 0 && (
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                    active ? "bg-white/20 text-white" : "bg-slate-100 text-muted"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Table */}
      {visible.length === 0 ? (
        <div className="rounded-lg border border-dashed border-line bg-slate-50 px-4 py-8 text-center text-sm text-muted">
          No venues in this category.
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-line">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                <th className="px-4 py-3">Venue</th>
                <th className="hidden px-4 py-3 md:table-cell">Plan</th>
                <th className="hidden px-4 py-3 lg:table-cell">Submitted</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {visible.map((venue) => (
                <tr className="hover:bg-slate-50" key={venue.id}>
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
                    <StatusPill tone={STATUS_TONE[venue.status]}>
                      {STATUS_LABEL[venue.status]}
                    </StatusPill>
                  </td>
                  <td className="px-4 py-3">
                    <RowActions venue={venue} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
}
