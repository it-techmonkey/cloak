"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { regenerateVenueQrSlug } from "@/app/venuesettings/actions";
import Panel from "@/components/shared/Panel";

export default function VenueQrCard({
  checkInUrl,
  venueName,
  venueId,
}: {
  checkInUrl: string;
  venueName: string;
  venueId: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [ready, setReady] = useState(false);
  const [locked, setLocked] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [regenError, setRegenError] = useState<string | null>(null);

  useEffect(() => {
    setReady(false);
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

  async function handleRegenerate() {
    setRegenerating(true);
    setRegenError(null);
    const result = await regenerateVenueQrSlug(venueId);
    setRegenerating(false);
    if (!result.ok) {
      setRegenError(result.error ?? "Something went wrong.");
    } else {
      setConfirming(false);
      // Page will revalidate with the new checkInUrl via server revalidation
      window.location.reload();
    }
  }

  return (
    <Panel
      title="Check-in QR code"
      description="Print and display this at your cloakroom desk. Guests scan it to register their items."
    >
      <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
        {/* QR preview */}
        <div className="relative shrink-0 overflow-hidden rounded-xl border border-line bg-white p-3 shadow-sm">
          <canvas ref={canvasRef} className={ready ? "block" : "invisible"} height={256} width={256} />
          {!ready && (
            <div className="absolute inset-3 flex items-center justify-center rounded-lg bg-zinc-50">
              <span className="text-xs text-muted">Generating…</span>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4 sm:pt-1">
          <p className="text-sm text-muted">
            This QR code links directly to your venue's check-in page. Guests scan it with their
            phone camera — no app required.
          </p>

          {/* Download button */}
          <button
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-foreground px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50 sm:w-auto"
            disabled={!ready}
            onClick={handleDownload}
            type="button"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Download PNG
          </button>
          <p className="text-xs text-muted">Recommended: print at A5 or A6 and laminate.</p>

          {/* Regenerate section */}
          <div className="border-t border-line pt-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-foreground">Regenerate QR</p>
                <p className="mt-0.5 text-xs text-muted">
                  Creates a new link — old printed QR codes will stop working.
                </p>
              </div>
              {/* Lock toggle */}
              <button
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition ${
                  locked ? "bg-zinc-200" : "bg-foreground"
                }`}
                onClick={() => {
                  setLocked((v) => !v);
                  setConfirming(false);
                  setRegenError(null);
                }}
                title={locked ? "Unlock to enable regeneration" : "Lock to prevent accidental regeneration"}
                type="button"
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
                    locked ? "translate-x-0.5" : "translate-x-5"
                  }`}
                />
              </button>
            </div>

            {locked ? (
              <p className="flex items-center gap-1.5 text-xs text-muted">
                <svg className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Toggle the lock above to enable regeneration.
              </p>
            ) : confirming ? (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                <p className="mb-3 text-sm font-medium text-red-900">
                  All existing printed QR codes will immediately stop working. This cannot be undone.
                </p>
                {regenError && (
                  <p className="mb-2 text-xs font-medium text-red-700">{regenError}</p>
                )}
                <div className="flex gap-2">
                  <button
                    className="flex-1 rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
                    disabled={regenerating}
                    onClick={() => void handleRegenerate()}
                    type="button"
                  >
                    {regenerating ? "Regenerating…" : "Yes, regenerate"}
                  </button>
                  <button
                    className="flex-1 rounded-lg border border-line bg-white px-3 py-2 text-xs font-semibold text-muted transition hover:text-foreground"
                    disabled={regenerating}
                    onClick={() => { setConfirming(false); setRegenError(null); }}
                    type="button"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-line bg-white px-4 py-2 text-sm font-medium text-muted transition hover:border-red-300 hover:text-red-600"
                onClick={() => setConfirming(true)}
                type="button"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Regenerate QR code
              </button>
            )}
          </div>
        </div>
      </div>
    </Panel>
  );
}
