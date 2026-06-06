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
    <div className="min-h-screen bg-night text-white">
      <main className="mx-auto flex w-full max-w-md flex-col gap-4 px-4 py-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-white/30">Cloak</p>
            <h1 className="mt-1 text-2xl font-semibold">{title}</h1>
            <p className="mt-1.5 text-sm leading-6 text-white/50">{description}</p>
          </div>
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/10 text-xs font-bold text-white">
            CL
          </span>
        </div>

        {/* Stored items — only when active or collected */}
        {(isActive || isCollected) && ticket.itemType ? (
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-white/30">
              {isCollected ? "Items returned" : "Stored items"}
            </p>
            <div className="mt-3 space-y-2">
              {parseItemLines(ticket.itemDescription, ticket.itemType, ticket.itemCount).map(
                (line, i) => (
                  <div className="flex items-center justify-between" key={i}>
                    <span className="text-sm text-white">{line.label}</span>
                    <span className="tabular-nums text-sm font-medium text-white/60">
                      ×{line.count}
                    </span>
                  </div>
                ),
              )}
            </div>
            {ticket.storageLocation && !isCollected ? (
              <p className="mt-3 border-t border-white/10 pt-3 text-xs text-white/40">
                Location: {ticket.storageLocation}
              </p>
            ) : null}
          </div>
        ) : null}

        <TicketQrCard ticket={ticket} />
        <TicketDetails ticket={ticket} />

        {!isClosed ? (
          <div className="grid gap-2">
            <button
              className="flex cursor-not-allowed items-center justify-between rounded-xl bg-white/5 px-4 py-3 text-sm font-medium text-white/30"
              disabled
              type="button"
            >
              <span>Add to Apple Wallet</span>
              <span className="text-xs text-white/20">Coming soon</span>
            </button>
            <button
              className="flex cursor-not-allowed items-center justify-between rounded-xl bg-white/5 px-4 py-3 text-sm font-medium text-white/30"
              disabled
              type="button"
            >
              <span>Add to Google Wallet</span>
              <span className="text-xs text-white/20">Coming soon</span>
            </button>
          </div>
        ) : null}

        <p className="text-center text-xs text-white/20">
          Refresh this page to see the latest status.
        </p>
      </main>
    </div>
  );
}

// Parse item description like "2× Coat, 1× Bag\nExtra notes" into lines
function parseItemLines(
  description: string | null,
  fallbackType: string,
  fallbackCount: number,
): Array<{ label: string; count: number }> {
  if (!description) {
    return [{ label: fallbackType, count: fallbackCount }];
  }

  // First line may be "2× Coat, 1× Bag" format
  const firstLine = description.split("\n")[0];
  const parts = firstLine.split(",").map((s) => s.trim());

  const parsed: Array<{ label: string; count: number }> = [];
  for (const part of parts) {
    const match = part.match(/^(\d+)[×x]\s*(.+)$/i);
    if (match) {
      parsed.push({ count: parseInt(match[1], 10), label: match[2].trim() });
    }
  }

  return parsed.length > 0 ? parsed : [{ label: fallbackType, count: fallbackCount }];
}
