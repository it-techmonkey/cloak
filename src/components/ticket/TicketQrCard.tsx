import Image from "next/image";
import QRCode from "qrcode";
import type { TicketView } from "./TicketPage";

export default async function TicketQrCard({ ticket }: { ticket: TicketView }) {
  const qrDataUrl = await QRCode.toDataURL(ticket.qrValue, {
    color: { dark: "#000000", light: "#ffffff" },
    errorCorrectionLevel: "M",
    margin: 1,
    width: 240,
  });

  const isUsable = ticket.status === "pending_activation" || ticket.status === "active";

  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5">
      {/* QR */}
      <div className="flex justify-center bg-white p-6">
        <Image
          alt={`QR code for ticket ${ticket.ticketId}`}
          className={isUsable ? "" : "opacity-30 grayscale"}
          height={240}
          priority
          src={qrDataUrl}
          unoptimized
          width={240}
        />
      </div>

      {/* Fallback code */}
      <div className="px-4 py-4 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-white/30">
          Fallback code
        </p>
        <p className="mt-1.5 font-mono text-xl font-semibold tracking-wider text-white">
          {ticket.ticketId}
        </p>
      </div>
    </div>
  );
}
