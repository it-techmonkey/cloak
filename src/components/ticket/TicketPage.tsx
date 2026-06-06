import TicketDetails from "./TicketDetails";
import TicketQrCard from "./TicketQrCard";

export type TicketView = {
  email: string;
  expiresAt: string;
  guestName: string;
  itemCount: number;
  itemDescription: string | null;
  itemType: string | null;
  mobile: string;
  qrValue: string;
  status?: "pending_activation" | "active" | "collected" | "cancelled" | "expired";
  storageLocation: string | null;
  ticketId: string;
  venueId: string;
  venueName: string;
};

export default function TicketPage({ ticket }: { ticket: TicketView }) {
  const isActive = ticket.status === "active";
  const isCollected = ticket.status === "collected";
  const isExpired = ticket.status === "expired";
  const isCancelled = ticket.status === "cancelled";
  const isClosed = isCollected || isExpired || isCancelled;

  const title = isActive
    ? "Items stored"
    : isCollected
      ? "Collection complete"
      : isExpired
        ? "Ticket expired"
        : isCancelled
          ? "Ticket cancelled"
          : "Awaiting activation";

  const description = isCollected
    ? "Your items have been returned. This ticket is now closed."
    : isExpired
      ? "This ticket expired before it was activated at the counter."
      : isCancelled
        ? "This ticket has been cancelled and is no longer valid."
        : isActive
          ? "Your items are stored. Show this QR code or fallback code at the counter to collect."
          : "Show this QR code or fallback code at the selected venue counter to activate storage.";

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto flex w-full max-w-sm flex-col gap-4 px-4 py-6 sm:max-w-md">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted">Cloak</p>
            <h1 className="mt-1 text-2xl font-semibold text-foreground">{title}</h1>
            <p className="mt-1.5 text-sm leading-6 text-muted">{description}</p>
          </div>
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-foreground text-xs font-bold text-white">
            CL
          </span>
        </div>

        {/* Cloak number + items — when active or collected */}
        {(isActive || isCollected) && ticket.itemType ? (
          <div className="rounded-xl border border-line bg-panel p-4">
            {ticket.storageLocation ? (
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                  {isCollected ? "Was stored at" : "Cloak number"}
                </p>
                <span className="rounded-lg bg-foreground px-3 py-1 font-mono text-sm font-bold text-white">
                  {ticket.storageLocation}
                </span>
              </div>
            ) : null}
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">
              {isCollected ? "Items returned" : "Stored items"}
            </p>
            <div className="mt-2 space-y-1.5">
              {parseItemLines(ticket.itemDescription, ticket.itemType, ticket.itemCount).map(
                (line, i) => (
                  <div className="flex items-center justify-between" key={i}>
                    <span className="text-sm text-foreground">{line.label}</span>
                    <span className="tabular-nums text-sm text-muted">×{line.count}</span>
                  </div>
                ),
              )}
            </div>
            {extractNotes(ticket.itemDescription) ? (
              <p className="mt-3 border-t border-line pt-3 text-xs leading-5 text-muted">
                {extractNotes(ticket.itemDescription)}
              </p>
            ) : null}
          </div>
        ) : null}

        <TicketQrCard ticket={ticket} />
        <TicketDetails ticket={ticket} />

        {!isClosed ? (
          <div className="grid gap-2">
            <button
              className="flex cursor-not-allowed items-center justify-between rounded-xl border border-line bg-white px-4 py-3 text-sm font-medium text-muted"
              disabled
              type="button"
            >
              <span>Add to Apple Wallet</span>
              <span className="text-xs text-muted/60">Coming soon</span>
            </button>
            <button
              className="flex cursor-not-allowed items-center justify-between rounded-xl border border-line bg-white px-4 py-3 text-sm font-medium text-muted"
              disabled
              type="button"
            >
              <span>Add to Google Wallet</span>
              <span className="text-xs text-muted/60">Coming soon</span>
            </button>
          </div>
        ) : null}

        <p className="text-center text-xs text-muted">
          Refresh this page to see the latest status.
        </p>
      </main>
    </div>
  );
}

function extractNotes(description: string | null): string | null {
  if (!description) return null;
  const idx = description.indexOf("\n");
  if (idx === -1) return null;
  const notes = description.slice(idx + 1).trim();
  return notes || null;
}

function parseItemLines(
  description: string | null,
  fallbackType: string,
  fallbackCount: number,
): Array<{ label: string; count: number }> {
  if (!description) return [{ label: fallbackType, count: fallbackCount }];
  const firstLine = description.split("\n")[0];
  const parts = firstLine.split(",").map((s) => s.trim());
  const parsed: Array<{ label: string; count: number }> = [];
  for (const part of parts) {
    const match = part.match(/^(\d+)[×x]\s*(.+)$/i);
    if (match) parsed.push({ count: parseInt(match[1], 10), label: match[2].trim() });
  }
  return parsed.length > 0 ? parsed : [{ label: fallbackType, count: fallbackCount }];
}
