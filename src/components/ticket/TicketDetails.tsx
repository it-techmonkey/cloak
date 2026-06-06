import type { TicketView } from "./TicketPage";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <span className="text-xs font-medium text-white/40">{label}</span>
      <span className="text-right text-sm text-white/80">{value}</span>
    </div>
  );
}

function formatStatus(status: TicketView["status"]) {
  if (!status) return "Pending activation";
  if (status === "pending_activation") return "Pending activation";
  if (status === "active") return "Stored";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function formatExpiry(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
  }).format(new Date(value));
}

export default function TicketDetails({ ticket }: { ticket: TicketView }) {
  return (
    <div className="divide-y divide-white/10 rounded-xl border border-white/10 bg-white/5 px-4">
      <Row label="Venue" value={ticket.venueName} />
      <Row label="Guest" value={ticket.guestName} />
      <Row label="Mobile" value={ticket.mobile} />
      <Row label="Status" value={formatStatus(ticket.status)} />
      <Row label="Expires" value={formatExpiry(ticket.expiresAt)} />
    </div>
  );
}
