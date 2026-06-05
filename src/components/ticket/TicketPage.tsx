import TicketDetails from "./TicketDetails";
import TicketQrCard from "./TicketQrCard";

export type TicketView = {
  email: string;
  expiresAt: string;
  guestName: string;
  mobile: string;
  qrValue: string;
  status?: "pending_activation" | "active" | "collected" | "cancelled" | "expired";
  ticketId: string;
  venueId: string;
  venueName: string;
};

export default function TicketPage({ ticket }: { ticket: TicketView }) {
  const title =
    ticket.status === "active"
      ? "Item stored"
      : ticket.status === "collected"
        ? "Collection complete"
        : ticket.status === "expired"
          ? "Ticket expired"
          : ticket.status === "cancelled"
            ? "Ticket cancelled"
            : "Awaiting activation";

  const description =
    ticket.status === "collected"
      ? "Your items have been returned. This ticket is now closed."
      : ticket.status === "expired"
        ? "This ticket expired before it was activated at the cloakroom counter."
        : ticket.status === "cancelled"
          ? "This ticket has been cancelled and is no longer valid."
          : ticket.status === "active"
            ? "Your items are stored. Show this QR code or fallback code at the counter to collect."
            : "Show this QR code or fallback code at the selected venue counter to activate storage.";

  const isClosed =
    ticket.status === "collected" ||
    ticket.status === "expired" ||
    ticket.status === "cancelled";

  return (
    <div className="min-h-screen bg-night text-white">
      <main className="mx-auto flex w-full max-w-md flex-col gap-5 px-4 py-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-white/50">Cloak</p>
            <h1 className="mt-1 text-2xl font-semibold">{title}</h1>
            <p className="mt-2 text-sm leading-6 text-white/60">{description}</p>
          </div>
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-linear-to-br from-brand to-brand-dark text-sm font-semibold">
            CL
          </div>
        </div>
        <TicketQrCard ticket={ticket} />
        <TicketDetails ticket={ticket} />
        {!isClosed ? (
          <div className="grid gap-3">
            <button
              className="flex cursor-not-allowed items-center justify-between rounded-lg bg-black px-4 py-3 text-sm font-semibold text-white/50"
              disabled
              type="button"
            >
              <span>Add to Apple Wallet</span>
              <span className="rounded bg-white/10 px-2 py-0.5 text-xs font-medium text-white/40">
                Coming soon
              </span>
            </button>
            <button
              className="flex cursor-not-allowed items-center justify-between rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white/50"
              disabled
              type="button"
            >
              <span>Add to Google Wallet</span>
              <span className="rounded bg-white/10 px-2 py-0.5 text-xs font-medium text-white/40">
                Coming soon
              </span>
            </button>
          </div>
        ) : null}
        <p className="text-center text-xs text-white/30">
          Refresh this page to see the latest ticket status.
        </p>
      </main>
    </div>
  );
}
