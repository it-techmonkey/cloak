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
  const title = ticket.status === "active" ? "Item stored" : ticket.status === "collected" ? "Collected" : "Awaiting activation";
  const description =
    ticket.status === "collected"
      ? "This ticket has already been checked out."
      : "Show this QR or fallback code at the selected venue counter.";

  return (
    <div className="min-h-screen bg-night text-white">
      <main className="mx-auto flex w-full max-w-md flex-col gap-5 px-4 py-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-white/70">Cloak</p>
            <h1 className="mt-1 text-2xl font-semibold">{title}</h1>
            <p className="mt-2 text-sm leading-6 text-white/70">
              {description}
            </p>
          </div>
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-sm font-semibold">
            CL
          </div>
        </div>
        <TicketQrCard ticket={ticket} />
        <TicketDetails ticket={ticket} />
        <div className="grid gap-3">
          <button className="rounded-lg bg-black px-4 py-3 text-sm font-semibold text-white">
            Add to Apple Wallet
          </button>
          <button className="rounded-lg bg-white px-4 py-3 text-sm font-semibold text-foreground">
            Add to Google Wallet
          </button>
        </div>
        <p className="text-center text-xs text-white/40">
          Your pass updates automatically after each venue scan.
        </p>
      </main>
    </div>
  );
}
