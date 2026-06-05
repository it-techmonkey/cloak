import FieldPreview from "@/components/shared/FieldPreview";
import Panel from "@/components/shared/Panel";
import type { TicketView } from "./TicketPage";

function formatStatus(status: TicketView["status"]) {
  return status?.replace("_", " ") ?? "pending activation";
}

function formatExpiry(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function TicketDetails({ ticket }: { ticket: TicketView }) {
  return (
    <Panel title="Ticket details">
      <div className="grid gap-4 sm:grid-cols-2">
        <FieldPreview label="Fallback code" value={ticket.ticketId} />
        <FieldPreview label="Venue" value={ticket.venueName} />
        <FieldPreview label="Guest" value={ticket.guestName} />
        <FieldPreview label="Mobile" value={ticket.mobile} />
        <FieldPreview label="Status" value={formatStatus(ticket.status)} />
        <FieldPreview label="Expires" value={formatExpiry(ticket.expiresAt)} />
      </div>
    </Panel>
  );
}
