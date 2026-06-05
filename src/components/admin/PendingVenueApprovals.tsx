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

function formatDate(value: string | null) {
  if (!value) {
    return "Not recorded";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
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
            Approve
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
            Reject submission
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
          Suspend venue
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
    <Panel
      title="Venue submissions"
      description="Only completed registrations appear here for platform review."
    >
      {venues.length === 0 ? (
        <p className="text-sm leading-6 text-muted">No completed venue submissions are waiting for review.</p>
      ) : (
        <div className="space-y-3">
          {venues.map((venue) => (
            <div
              className="grid gap-4 rounded-lg border border-line bg-white p-4 lg:grid-cols-[1fr_auto]"
              key={venue.id}
            >
              <div>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-base font-semibold text-foreground">{venue.name}</p>
                    <p className="mt-1 text-sm text-muted">
                      Submitted {formatDate(venue.submittedAt ?? venue.createdAt)}
                    </p>
                  </div>
                  <StatusPill tone={statusTone[venue.status]}>{formatStatus(venue.status)}</StatusPill>
                </div>
                <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
                  <ReviewField label="Location" value={venue.city ?? "City not provided"} />
                  <ReviewField label="Manager" value={venue.contactEmail} />
                  <ReviewField label="Phone" value={venue.contactPhone ?? "Not provided"} />
                  <ReviewField label="Capacity" value={`${venue.capacity} slots`} />
                  <ReviewField label="Plan" value={formatPlan(venue.billingPlan)} />
                  <ReviewField label="Billing" value={formatStatus(venue.billingStatus)} />
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

function ReviewField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-50 px-3 py-2">
      <p className="text-xs font-medium uppercase tracking-normal text-muted">{label}</p>
      <p className="mt-1 text-sm text-foreground">{value}</p>
    </div>
  );
}
