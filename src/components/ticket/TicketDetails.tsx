import type { TicketView } from "./TicketPage";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-3">
      <span className="text-xs font-medium text-muted">{label}</span>
      <span className="text-right text-sm text-foreground">{value}</span>
    </div>
  );
}

export default function TicketDetails({ ticket }: { ticket: TicketView }) {
  return (
    <div className="divide-y divide-line rounded-xl border border-line bg-panel px-4">
      <Row label="Venue" value={ticket.venueName} />
      <Row label="Guest" value={ticket.guestName} />
      <Row label="Mobile" value={ticket.mobile} />
    </div>
  );
}
