import Image from "next/image";
import QRCode from "qrcode";
import Panel from "@/components/shared/Panel";
import StatusPill from "@/components/shared/StatusPill";
import type { TicketView } from "./TicketPage";

function statusCopy(status: TicketView["status"]) {
  if (status === "active") {
    return "Scan to check out";
  }

  if (status === "collected") {
    return "Ticket collected";
  }

  if (status === "expired") {
    return "Ticket expired";
  }

  return "Scan to activate";
}

export default async function TicketQrCard({ ticket }: { ticket: TicketView }) {
  const qrDataUrl = await QRCode.toDataURL(ticket.qrValue, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 224,
  });

  return (
    <Panel>
      <div className="rounded-lg bg-amber-50 px-4 py-3 text-sm font-medium text-warning">
        {statusCopy(ticket.status)}
        <span className="mt-1 block font-normal text-slate-700">
          Show this QR code or fallback code to the cloakroom assistant.
        </span>
      </div>
      <div className="mx-auto mt-5 grid aspect-square w-full max-w-64 place-items-center rounded-lg border border-line bg-white shadow-sm">
        <Image
          alt={`Ticket QR code for ${ticket.ticketId}`}
          height={224}
          priority
          src={qrDataUrl}
          unoptimized
          width={224}
        />
      </div>
      <div className="mt-5 rounded-lg border border-line bg-slate-50 px-4 py-3 text-center">
        <p className="text-xs font-medium uppercase tracking-normal text-muted">Fallback code</p>
        <p className="mt-1 font-mono text-lg font-semibold text-foreground">{ticket.ticketId}</p>
      </div>
      <div className="mt-5 flex justify-center text-center">
        <StatusPill tone="warning">{statusCopy(ticket.status)}</StatusPill>
      </div>
    </Panel>
  );
}
