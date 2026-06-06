"use client";

import { useEffect, useRef, useState } from "react";

type BarcodeResult = {
  rawValue: string;
};

type BarcodeDetectorConstructor = new (options: {
  formats: string[];
}) => {
  detect(source: HTMLVideoElement): Promise<BarcodeResult[]>;
};

type CameraStatus = "idle" | "starting" | "scanning" | "unsupported" | "error";

type BarcodeWindow = Window &
  typeof globalThis & {
    BarcodeDetector?: BarcodeDetectorConstructor;
  };

function cameraErrorMessage(error: unknown) {
  if (error instanceof DOMException && error.name === "NotAllowedError") {
    return "Camera permission denied. Use the fallback code below.";
  }
  if (error instanceof DOMException && error.name === "NotFoundError") {
    return "No camera found on this device. Use the fallback code below.";
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

  function stopCamera() {
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }

  useEffect(() => stopCamera, []);

  async function startCamera() {
    if (disabled || status === "starting" || status === "scanning") return;

    const BarcodeDetector = (window as BarcodeWindow).BarcodeDetector;
    if (!navigator.mediaDevices?.getUserMedia || !BarcodeDetector) {
      setStatus("unsupported");
      setMessage("QR camera scanning is not supported in this browser.");
      return;
    }

    setStatus("starting");
    setMessage(null);
    detectedRef.current = false;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: { ideal: "environment" } },
      });
      const detector = new BarcodeDetector({ formats: ["qr_code"] });
      const video = videoRef.current;
      if (!video) { stopCamera(); return; }

      streamRef.current = stream;
      video.srcObject = stream;
      await video.play();
      setStatus("scanning");
      setMessage(null);

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
            setMessage("Camera error. Use the fallback code below.");
            stopCamera();
            return;
          }
        }
        frameRef.current = requestAnimationFrame(scanFrame);
      };
      frameRef.current = requestAnimationFrame(scanFrame);
    } catch (error) {
      setStatus("error");
      setMessage(cameraErrorMessage(error));
      stopCamera();
    }
  }

  const isActive = status === "scanning" || status === "starting";

  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-black">
      {/* Camera viewport */}
      <div className="relative aspect-video w-full bg-black">
        <video
          aria-label="QR camera preview"
          className="h-full w-full object-cover"
          muted
          playsInline
          ref={videoRef}
        />

        {/* Overlay when not scanning */}
        {!isActive && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black">
            <div className="relative h-36 w-36">
              {/* Corner marks */}
              {[
                "top-0 left-0 border-t-2 border-l-2 rounded-tl-lg",
                "top-0 right-0 border-t-2 border-r-2 rounded-tr-lg",
                "bottom-0 left-0 border-b-2 border-l-2 rounded-bl-lg",
                "bottom-0 right-0 border-b-2 border-r-2 rounded-br-lg",
              ].map((cls) => (
                <span
                  key={cls}
                  className={`absolute h-6 w-6 border-white/30 ${cls}`}
                />
              ))}
              <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold tracking-widest text-white/20 uppercase">
                QR
              </span>
            </div>
            {message ? (
              <p className="text-center text-xs text-white/40 px-6">{message}</p>
            ) : (
              <p className="text-center text-xs text-white/25 px-6">
                Camera inactive
              </p>
            )}
          </div>
        )}

        {/* Scanning crosshair overlay */}
        {status === "scanning" && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="relative h-48 w-48">
              {[
                "top-0 left-0 border-t-2 border-l-2 rounded-tl-lg",
                "top-0 right-0 border-t-2 border-r-2 rounded-tr-lg",
                "bottom-0 left-0 border-b-2 border-l-2 rounded-bl-lg",
                "bottom-0 right-0 border-b-2 border-r-2 rounded-br-lg",
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
            <span className="flex items-center gap-2 text-xs text-white/50">
              <span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse" />
              Scanning…
            </span>
            <button
              className="ml-auto rounded-lg border border-white/10 px-4 py-1.5 text-xs font-medium text-white/50 hover:border-white/20 hover:text-white/80"
              onClick={() => { stopCamera(); setStatus("idle"); setMessage(null); }}
              type="button"
            >
              Stop
            </button>
          </>
        ) : (
          <button
            className="w-full rounded-lg bg-white/10 py-2 text-sm font-semibold text-white transition hover:bg-white/15 disabled:opacity-40"
            disabled={disabled}
            onClick={startCamera}
            type="button"
          >
            Start camera
          </button>
        )}
      </div>
    </div>
  );
}
