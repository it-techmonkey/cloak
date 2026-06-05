import {
  approveVenue,
  rejectVenue,
  suspendVenue,
} from "@/app/masterdashboard/actions";
import Panel from "@/components/shared/Panel";
import StatusPill, { type StatusTone } from "@/components/shared/StatusPill";
import type { AdminVenueReview } from "@/lib/admin-dashboard";

const statusTone: Record<AdminVenueReview["status"], StatusTone> = {
  approved: "green",
  pending: "warning",
  rejected: "danger",
  suspended: "neutral",
};

function formatPlan(plan: string | null) {
  if (plan === "per_event") {
    return "Per event";
  }

  return plan ? plan.charAt(0).toUpperCase() + plan.slice(1) : "Not selected";
}

function formatStatus(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function VenueActions({ venue }: { venue: AdminVenueReview }) {
  if (venue.status === "pending") {
    return (
      <div className="grid gap-2 sm:min-w-56">
        <form action={approveVenue}>
          <input name="venueId" type="hidden" value={venue.id} />
          <button
            className="w-full rounded-lg bg-success px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-95"
            type="submit"
          >
            Approve venue
          </button>
        </form>
        <form action={rejectVenue} className="grid gap-2">
          <input name="venueId" type="hidden" value={venue.id} />
          <input
            className="rounded-lg border border-line bg-white px-3 py-2 text-sm text-foreground outline-none"
            name="reason"
            placeholder="Reason for rejection"
          />
          <button
            className="w-full rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-100"
            type="submit"
          >
            Reject
          </button>
        </form>
      </div>
    );
  }

  if (venue.status === "approved") {
    return (
      <form action={suspendVenue} className="grid gap-2 sm:min-w-56">
        <input name="venueId" type="hidden" value={venue.id} />
        <input
          className="rounded-lg border border-line bg-white px-3 py-2 text-sm text-foreground outline-none"
          name="reason"
          placeholder="Reason for suspension"
        />
        <button
          className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-slate-50"
          type="submit"
        >
          Suspend
        </button>
      </form>
    );
  }

  return null;
}

export default function PendingVenueApprovals({
  venues,
}: {
  venues: AdminVenueReview[];
}) {
  return (
    <Panel title="Venue review queue">
      {venues.length === 0 ? (
        <p className="text-sm leading-6 text-muted">No venue registrations found.</p>
      ) : (
        <div className="space-y-3">
          {venues.map((venue) => (
            <div
              className="grid gap-4 rounded-md border border-line p-4 lg:grid-cols-[1fr_auto]"
              key={venue.id}
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold text-foreground">{venue.name}</p>
                  <StatusPill tone={statusTone[venue.status]}>{formatStatus(venue.status)}</StatusPill>
                </div>
                <div className="mt-3 grid gap-2 text-sm text-muted sm:grid-cols-2">
                  <p>{venue.city ?? "City not provided"}</p>
                  <p>{venue.contactEmail}</p>
                  <p>Capacity: {venue.capacity} slots</p>
                  <p>Plan: {formatPlan(venue.billingPlan)}</p>
                  <p>Billing: {formatStatus(venue.billingStatus)}</p>
                  {venue.contactPhone ? <p>{venue.contactPhone}</p> : null}
                </div>
              </div>
              <VenueActions venue={venue} />
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}
