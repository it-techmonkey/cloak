import FieldPreview from "@/components/shared/FieldPreview";
import PageShell from "@/components/shared/PageShell";
import Panel from "@/components/shared/Panel";
import StatusPill, { type StatusTone } from "@/components/shared/StatusPill";
import { PrimaryLink, SecondaryLink } from "@/components/shared/ButtonLink";
import type { VenueTicketDetail } from "@/lib/venue-dashboard";

function formatStatus(status: VenueTicketDetail["status"]) {
  if (status === "pending_activation") {
    return "Pending activation";
  }

  return status.charAt(0).toUpperCase() + status.slice(1);
}

function statusTone(status: VenueTicketDetail["status"]): StatusTone {
  if (status === "active") {
    return "green";
  }

  if (status === "pending_activation") {
    return "warning";
  }

  if (status === "collected") {
    return "blue";
  }

  return "danger";
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

export default function VenueTicketDetailPage({ ticket }: { ticket: VenueTicketDetail | null }) {
  if (!ticket) {
    return (
      <PageShell
        activePath="/venueticketdetail"
        eyebrow="Ticket detail"
        title="Ticket not found"
        venueRole="manager"
        description="The ticket may not exist, or it may belong to another venue."
        actions={<SecondaryLink href="/venuedashboard">Back to dashboard</SecondaryLink>}
      >
        <Panel>
          <p className="text-sm text-muted">
            Select a ticket from the venue dashboard to view its operational details.
          </p>
        </Panel>
      </PageShell>
    );
  }

  return (
    <PageShell
      activePath="/venueticketdetail"
      eyebrow="Ticket detail"
      title={ticket.publicCode}
      venueRole="manager"
      description="Inspect guest details, storage information, and scan history."
      actions={
        <>
          <PrimaryLink href="/venuescanner">Open scanner</PrimaryLink>
          <SecondaryLink href="/venuedashboard">Back</SecondaryLink>
        </>
      }
    >
      <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <Panel title="Guest">
          <div className="grid gap-4 sm:grid-cols-2">
            <FieldPreview label="Name" value={ticket.guestName} />
            <FieldPreview label="Mobile" value={ticket.guestPhone} />
            <FieldPreview label="Email" value={ticket.guestEmail} />
            <FieldPreview label="Venue" value={ticket.venueName} />
          </div>
        </Panel>

        <Panel title="Ticket state">
          <div className="space-y-4 text-sm text-muted">
            <StatusPill tone={statusTone(ticket.status)}>{formatStatus(ticket.status)}</StatusPill>
            <div className="grid gap-4 sm:grid-cols-2">
              <FieldPreview label="Created" value={formatDate(ticket.createdAt)} />
              <FieldPreview label="Expires" value={formatDate(ticket.expiresAt)} />
              <FieldPreview label="Activated" value={formatDate(ticket.activatedAt)} />
              <FieldPreview label="Collected" value={formatDate(ticket.collectedAt)} />
            </div>
          </div>
        </Panel>

        <Panel title="Item details">
          <div className="grid gap-4 sm:grid-cols-2">
            <FieldPreview label="Item type" value={ticket.itemType ?? "Pending"} />
            <FieldPreview label="Item count" value={String(ticket.itemCount)} />
            <FieldPreview label="Storage location" value={ticket.storageLocation ?? "Pending"} />
            <FieldPreview
              label="Notes"
              value={ticket.itemDescription ?? "No notes recorded"}
              wide
            />
          </div>
        </Panel>

        <Panel title="Timeline">
          <div className="space-y-4">
            <TimelineItem
              label="Ticket created"
              tone="blue"
              value={formatDate(ticket.createdAt)}
            />
            {ticket.scans.length === 0 ? (
              <TimelineItem
                label="Awaiting scan"
                tone="neutral"
                value="No counter scan has been recorded yet."
              />
            ) : (
              ticket.scans.map((scan) => (
                <TimelineItem
                  key={scan.id}
                  label={`${scan.scanType} ${scan.result}`}
                  tone={scan.result === "accepted" ? "green" : "danger"}
                  value={scan.reason ? `${formatDate(scan.createdAt)} - ${scan.reason}` : formatDate(scan.createdAt)}
                />
              ))
            )}
          </div>
        </Panel>
      </div>
    </PageShell>
  );
}

function TimelineItem({
  label,
  tone,
  value,
}: {
  label: string;
  tone: StatusTone;
  value: string;
}) {
  const dotClass =
    tone === "green"
      ? "bg-emerald-500"
      : tone === "danger"
        ? "bg-red-500"
        : tone === "blue"
          ? "bg-blue-500"
          : "border border-line bg-white";

  return (
    <div className="flex gap-3">
      <span className={`mt-1 h-3 w-3 shrink-0 rounded-full ${dotClass}`} />
      <div>
        <p className="text-sm font-semibold capitalize text-foreground">{label.replace("_", " ")}</p>
        <p className="mt-1 text-sm text-muted">{value}</p>
      </div>
    </div>
  );
}
