"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import Panel from "@/components/shared/Panel";

export default function VenueQrCard({
  checkInUrl,
  venueName,
}: {
  checkInUrl: string;
  venueName: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;
    QRCode.toCanvas(canvasRef.current, checkInUrl, {
      width: 256,
      margin: 2,
      color: { dark: "#09090b", light: "#ffffff" },
    }).then(() => setReady(true));
  }, [checkInUrl]);

  function handleDownload() {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Render a padded, labelled version for download
    const pad = 32;
    const labelHeight = 48;
    const size = canvas.width;
    const out = document.createElement("canvas");
    out.width = size + pad * 2;
    out.height = size + pad * 2 + labelHeight;

    const ctx = out.getContext("2d")!;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, out.width, out.height);
    ctx.drawImage(canvas, pad, pad);

    ctx.fillStyle = "#09090b";
    ctx.font = "bold 15px system-ui, -apple-system, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(venueName, out.width / 2, size + pad * 2 + 18);

    ctx.fillStyle = "#71717a";
    ctx.font = "12px system-ui, -apple-system, sans-serif";
    ctx.fillText("Scan to check in your items", out.width / 2, size + pad * 2 + 38);

    const link = document.createElement("a");
    link.download = `${venueName.replace(/\s+/g, "-").toLowerCase()}-checkin-qr.png`;
    link.href = out.toDataURL("image/png");
    link.click();
  }

  return (
    <Panel
      title="Check-in QR code"
      description="Print and display this at your cloakroom desk. Guests scan it to register their items."
    >
      <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
        <div className="relative shrink-0 overflow-hidden rounded-xl border border-line bg-white p-3 shadow-sm">
          <canvas ref={canvasRef} className={ready ? "block" : "invisible"} height={256} width={256} />
          {!ready && (
            <div className="absolute inset-3 flex items-center justify-center rounded-lg bg-zinc-50">
              <span className="text-xs text-muted">Generating…</span>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 sm:pt-1">
          <p className="text-sm text-muted">
            This QR code links directly to your venue's check-in page. Guests scan it with their
            phone camera — no app required.
          </p>
          <button
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-foreground px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 sm:w-auto"
            disabled={!ready}
            onClick={handleDownload}
            type="button"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Download PNG
          </button>
          <p className="text-xs text-muted">
            Recommended: print at A5 or A6 and laminate.
          </p>
        </div>
      </div>
    </Panel>
  );
}
