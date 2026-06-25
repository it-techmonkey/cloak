"use client";

import { useRouter } from "next/navigation";
import { type ReactNode, useState } from "react";
import FieldPreview from "@/components/shared/FieldPreview";
import PageShell from "@/components/shared/PageShell";
import Panel from "@/components/shared/Panel";
import StatusPill, { type StatusTone } from "@/components/shared/StatusPill";
import { PrimaryLink, SecondaryLink } from "@/components/shared/ButtonLink";
import type { VenueTicketDetail } from "@/lib/venue-dashboard";
import { collectItemsFromDetail } from "@/app/venueticketdetail/actions";

function formatStatus(status: VenueTicketDetail["status"]) {
  if (status === "pending_activation") return "Pending activation";
  if (status === "partially_collected") return "Partially collected";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function statusTone(status: VenueTicketDetail["status"]): StatusTone {
  if (status === "active" || status === "partially_collected") return "green";
  if (status === "pending_activation") return "warning";
  if (status === "collected") return "neutral";
  return "danger";
}

function formatDate(value: string | null) {
  if (!value) return "Not recorded";
  return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export default function VenueTicketDetailPage({ ticket }: { ticket: VenueTicketDetail | null }) {
  const router = useRouter();

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
      <div className="grid gap-5 md:grid-cols-2">
        <Panel title="Guest">
          <div className="grid gap-4 sm:grid-cols-2">
            <FieldPreview label="Name" value={ticket.guestName} />
            <FieldPreview label="Mobile" value={ticket.guestPhone} />
            <FieldPreview label="Email" value={ticket.guestEmail || "Not provided"} />
            <FieldPreview label="Venue" value={ticket.venueName} />
            <FieldPreview label="Event" value={ticket.eventName ?? "No event"} />
            <div>
              <span className="text-sm font-medium text-foreground">Status</span>
              <div className="mt-2">
                <StatusPill tone={statusTone(ticket.status)}>{formatStatus(ticket.status)}</StatusPill>
              </div>
            </div>
          </div>
        </Panel>

        <ItemsPanel ticket={ticket} onFullCheckout={() => router.push("/venuedashboard")} />

        <Panel title="Timeline">
          <div className="space-y-4">
            <TimelineItem label="Ticket created" tone="blue" value={formatDate(ticket.createdAt)} />
            {ticket.activatedAt && (
              <TimelineItem label="Activated" tone="green" value={formatDate(ticket.activatedAt)} />
            )}
            {ticket.scans.length === 0 && !ticket.activatedAt ? (
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
            {ticket.collectedAt && (
              <TimelineItem label="Collected" tone="green" value={formatDate(ticket.collectedAt)} />
            )}
          </div>
        </Panel>
      </div>
    </PageShell>
  );
}

function ItemsPanel({
  ticket,
  onFullCheckout,
}: {
  ticket: VenueTicketDetail;
  onFullCheckout: () => void;
}) {
  const openItems = ticket.items.filter((i) => !i.collectedAt);
  const collectedItems = ticket.items.filter((i) => i.collectedAt);
  const canCollect =
    ticket.status === "active" || ticket.status === "partially_collected";

  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(openItems.map((i) => i.id)),
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleCollect() {
    if (selected.size === 0) { setError("Select at least one item."); return; }
    setError("");
    setLoading(true);
    try {
      const result = await collectItemsFromDetail(ticket.id, [...selected]);
      if (result.ok && result.allCollected) {
        onFullCheckout();
      } else if (result.ok) {
        // Partial — reload page to refresh item states
        window.location.reload();
      } else {
        setError("Could not collect items. Try scanning in the scanner.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Panel title="Items in storage">
      {ticket.items.length === 0 ? (
        <p className="text-sm text-muted">No items recorded yet — added at activation.</p>
      ) : (
        <>
          {openItems.length > 0 && (
            <div className="mb-3 space-y-2">
              {openItems.map((item) => (
                <label
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 transition ${
                    canCollect
                      ? selected.has(item.id)
                        ? "border-foreground/30 bg-zinc-50"
                        : "border-line"
                      : "cursor-default border-line"
                  }`}
                  key={item.id}
                >
                  {canCollect && (
                    <input
                      checked={selected.has(item.id)}
                      className="h-4 w-4 shrink-0 accent-foreground"
                      onChange={() => toggle(item.id)}
                      type="checkbox"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {item.quantity > 1 ? `${item.quantity}× ` : ""}{item.label}
                    </p>
                    {item.notes ? <p className="mt-0.5 text-xs text-muted">{item.notes}</p> : null}
                  </div>
                  {item.storageLocation ? (
                    <span className="shrink-0 rounded bg-foreground px-1.5 py-0.5 font-mono text-xs font-bold text-white">
                      {item.storageLocation}
                    </span>
                  ) : (
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold bg-emerald-50 text-emerald-700`}
                    >
                      Stored
                    </span>
                  )}
                </label>
              ))}
            </div>
          )}

          {collectedItems.length > 0 && (
            <div className="mb-3 space-y-1.5">
              {collectedItems.map((item) => (
                <div className="flex items-center gap-2 text-sm text-muted line-through" key={item.id}>
                  <span className="text-emerald-500">✓</span>
                  {item.quantity > 1 ? `${item.quantity}× ` : ""}{item.label}
                  {item.storageLocation ? (
                    <span className="font-mono text-xs">{item.storageLocation}</span>
                  ) : null}
                </div>
              ))}
            </div>
          )}

          {error ? <p className="mb-2 text-xs font-medium text-red-600">{error}</p> : null}

          {canCollect && openItems.length > 0 && (
            <button
              className="w-full rounded-xl bg-foreground py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
              disabled={loading || selected.size === 0}
              onClick={handleCollect}
              type="button"
            >
              {loading
                ? "Collecting…"
                : selected.size === openItems.length
                  ? "Return all & close ticket"
                  : `Return ${selected.size} item${selected.size === 1 ? "" : "s"}`}
            </button>
          )}
        </>
      )}

      {ticket.itemDescription ? (
        <p className="mt-4 border-t border-line pt-4 text-xs leading-5 text-muted">
          {ticket.itemDescription}
        </p>
      ) : null}
    </Panel>
  );
}

function TimelineItem({
  label,
  tone,
  value,
}: {
  label: string;
  tone: StatusTone;
  value: string | ReactNode;
}) {
  const dotClass =
    tone === "green"
      ? "bg-emerald-500"
      : tone === "danger"
        ? "bg-red-500"
        : tone === "blue"
          ? "bg-foreground"
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
