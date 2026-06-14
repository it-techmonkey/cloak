"use client";

import { useEffect, useRef, useState } from "react";
import jsQR from "jsqr";

// BarcodeDetector is only available in Chrome/Edge/Android Chrome.
// Safari (including all iOS browsers) does NOT support it — we fall back to jsQR.
type BarcodeResult = { rawValue: string };
type BarcodeDetectorInstance = { detect(source: HTMLVideoElement): Promise<BarcodeResult[]> };
type BarcodeDetectorCtor = new (opts: { formats: string[] }) => BarcodeDetectorInstance;
type BarcodeWindow = Window & typeof globalThis & { BarcodeDetector?: BarcodeDetectorCtor };

type CameraStatus = "idle" | "starting" | "scanning" | "unsupported" | "error";

function hasBarcodeDetector(): boolean {
  return typeof window !== "undefined" && !!(window as BarcodeWindow).BarcodeDetector;
}

function cameraErrorMessage(error: unknown): string {
  if (error instanceof DOMException) {
    if (error.name === "NotAllowedError")
      return "Camera permission denied. Allow camera access in your browser settings, then try again.";
    if (error.name === "NotFoundError")
      return "No camera found on this device.";
    if (error.name === "NotReadableError")
      return "Camera is already in use by another app.";
    if (error.name === "OverconstrainedError")
      return "Could not access the rear camera. Trying front camera…";
  }
  return "Camera unavailable. Use the fallback code below.";
}

export default function CameraScanner({
  disabled,
  onDetected,
}: {
  disabled: boolean;
  onDetected: (value: string) => void;
}) {
  const [message, setMessage] = useState<string | null>(null);
  const [status, setStatus] = useState<CameraStatus>("idle");
  const detectedRef = useRef(false);
  const frameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  // Hidden canvas for jsQR frame capture on browsers without BarcodeDetector
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  function stopCamera() {
    if (frameRef.current) { cancelAnimationFrame(frameRef.current); frameRef.current = null; }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }

  useEffect(() => stopCamera, []);

  async function startCamera() {
    if (disabled || status === "starting" || status === "scanning") return;

    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus("unsupported");
      setMessage("Camera access is not available. Make sure you're on HTTPS and using a supported browser.");
      return;
    }

    setStatus("starting");
    setMessage(null);
    detectedRef.current = false;

    try {
      // Try rear camera first, fall back to any available camera
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: { facingMode: { ideal: "environment" } },
        });
      } catch {
        // OverconstrainedError on some devices — retry without facing mode constraint
        stream = await navigator.mediaDevices.getUserMedia({ audio: false, video: true });
      }

      const video = videoRef.current;
      if (!video) { stopCamera(); return; }

      streamRef.current = stream;
      video.srcObject = stream;

      // iOS Safari requires the video to be muted+playsInline (set in JSX) and
      // play() must be called after srcObject is set. We wait for loadedmetadata
      // before playing to avoid AbortError on iOS. Guard against the metadata
      // having already loaded (fast cameras / cached permission), in which case
      // the event would never fire again, and add a timeout so a missed event
      // can never wedge the camera in "starting".
      await new Promise<void>((resolve) => {
        if (video.readyState >= HTMLMediaElement.HAVE_METADATA) {
          resolve();
          return;
        }
        const done = () => {
          video.onloadedmetadata = null;
          clearTimeout(timer);
          resolve();
        };
        const timer = setTimeout(done, 3000);
        video.onloadedmetadata = done;
      });
      await video.play();

      setStatus("scanning");
      setMessage(null);

      if (hasBarcodeDetector()) {
        // Fast path: native BarcodeDetector (Chrome, Edge, Android)
        const BarcodeDetectorCtor = (window as BarcodeWindow).BarcodeDetector!;
        const detector = new BarcodeDetectorCtor({ formats: ["qr_code"] });

        const scanFrame = async () => {
          if (!videoRef.current || detectedRef.current) return;
          if (videoRef.current.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
            try {
              const results = await detector.detect(videoRef.current);
              const value = results[0]?.rawValue?.trim();
              if (value) {
                detectedRef.current = true;
                stopCamera();
                setStatus("idle");
                onDetected(value);
                return;
              }
            } catch {
              setStatus("error");
              setMessage("Camera scanning stopped. Use the fallback code below.");
              stopCamera();
              return;
            }
          }
          frameRef.current = requestAnimationFrame(scanFrame);
        };
        frameRef.current = requestAnimationFrame(scanFrame);
      } else {
        // Fallback path: jsQR + canvas (Safari, Firefox, iOS all browsers)
        const canvas = canvasRef.current ?? document.createElement("canvas");

        const scanFrame = () => {
          const vid = videoRef.current;
          if (!vid || detectedRef.current) return;

          if (vid.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA && vid.videoWidth > 0) {
            canvas.width = vid.videoWidth;
            canvas.height = vid.videoHeight;
            const ctx = canvas.getContext("2d", { willReadFrequently: true });
            if (ctx) {
              ctx.drawImage(vid, 0, 0, canvas.width, canvas.height);
              try {
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const code = jsQR(imageData.data, imageData.width, imageData.height, {
                  inversionAttempts: "dontInvert",
                });
                if (code?.data?.trim()) {
                  detectedRef.current = true;
                  stopCamera();
                  setStatus("idle");
                  onDetected(code.data.trim());
                  return;
                }
              } catch {
                // Frame decode error — skip this frame and continue
              }
            }
          }
          frameRef.current = requestAnimationFrame(scanFrame);
        };
        frameRef.current = requestAnimationFrame(scanFrame);
      }
    } catch (error) {
      setStatus("error");
      setMessage(cameraErrorMessage(error));
      stopCamera();
    }
  }

  const isActive = status === "scanning" || status === "starting";

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-white">
      {/* Hidden canvas used by jsQR fallback */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Camera viewport */}
      <div className="relative aspect-video w-full bg-zinc-900">
        <video
          aria-label="QR camera preview"
          className="h-full w-full object-cover"
          muted
          playsInline
          ref={videoRef}
        />

        {/* Idle / error overlay */}
        {!isActive && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-zinc-900 px-6">
            <div className="relative h-32 w-32">
              {[
                "top-0 left-0 border-t-2 border-l-2 rounded-tl",
                "top-0 right-0 border-t-2 border-r-2 rounded-tr",
                "bottom-0 left-0 border-b-2 border-l-2 rounded-bl",
                "bottom-0 right-0 border-b-2 border-r-2 rounded-br",
              ].map((cls) => (
                <span key={cls} className={`absolute h-6 w-6 border-white/30 ${cls}`} />
              ))}
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-semibold tracking-widest text-white/20 uppercase">
                QR
              </span>
            </div>
            {message ? (
              <p className="text-center text-xs leading-5 text-white/50">{message}</p>
            ) : (
              <p className="text-xs text-white/25">Camera inactive</p>
            )}
          </div>
        )}

        {/* Scanning crosshair */}
        {status === "scanning" && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="relative h-48 w-48">
              {[
                "top-0 left-0 border-t-2 border-l-2 rounded-tl",
                "top-0 right-0 border-t-2 border-r-2 rounded-tr",
                "bottom-0 left-0 border-b-2 border-l-2 rounded-bl",
                "bottom-0 right-0 border-b-2 border-r-2 rounded-br",
              ].map((cls) => (
                <span key={cls} className={`absolute h-8 w-8 border-white ${cls}`} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3 px-4 py-3">
        {isActive ? (
          <>
            <span className="flex items-center gap-2 text-xs text-muted">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
              Scanning…
            </span>
            <button
              className="ml-auto rounded-lg border border-line px-4 py-1.5 text-xs font-medium text-muted transition hover:border-foreground/20 hover:text-foreground"
              onClick={() => { stopCamera(); setStatus("idle"); setMessage(null); }}
              type="button"
            >
              Stop
            </button>
          </>
        ) : (
          <button
            className="w-full rounded-lg border border-line py-2.5 text-sm font-medium text-foreground transition hover:bg-zinc-50 disabled:opacity-40"
            disabled={disabled}
            onClick={startCamera}
            type="button"
          >
            Start camera scan
          </button>
        )}
      </div>
    </div>
  );
}

