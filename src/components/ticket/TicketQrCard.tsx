import Image from "next/image";
import QRCode from "qrcode";
import type { TicketView } from "./TicketPage";

export default async function TicketQrCard({ ticket }: { ticket: TicketView }) {
  const isUsable = ticket.status === "pending_activation" || ticket.status === "active";

  const qrDataUrl = await QRCode.toDataURL(ticket.qrValue, {
    color: { dark: "#09090b", light: "#ffffff" },
    errorCorrectionLevel: "M",
    margin: 2,
    width: 280,
  });

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-panel">
      {/* QR */}
      <div className="flex justify-center bg-white p-6">
        <Image
          alt={`QR code for ticket ${ticket.ticketId}`}
          className={isUsable ? "" : "opacity-25 grayscale"}
          height={280}
          priority
          src={qrDataUrl}
          unoptimized
          width={280}
        />
      </div>

      {/* Status banner */}
      {!isUsable && (
        <div className="border-t border-line bg-slate-50 px-4 py-2 text-center text-xs font-medium text-muted">
          {ticket.status === "collected" ? "This ticket has been collected" : "This ticket is no longer active"}
        </div>
      )}

      {/* Fallback code */}
      <div className="border-t border-line px-4 py-4 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted">Fallback code</p>
        <p className="mt-1.5 font-mono text-xl font-semibold tracking-wider text-foreground">
          {ticket.ticketId}
        </p>
      </div>
    </div>
  );
}
