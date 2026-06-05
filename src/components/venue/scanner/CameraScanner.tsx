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
    return "Camera permission was denied. Enter the fallback code instead.";
  }

  if (error instanceof DOMException && error.name === "NotFoundError") {
    return "No camera was found on this device. Enter the fallback code instead.";
  }

  return "Camera scanning is unavailable. Enter the fallback code instead.";
}

export default function CameraScanner({
  disabled,
  onDetected,
}: {
  disabled: boolean;
  onDetected: (value: string) => void;
}) {
  const [message, setMessage] = useState("Start camera scanning when the guest is at the counter.");
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

    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }

  useEffect(() => stopCamera, []);

  async function startCamera() {
    if (disabled || status === "starting" || status === "scanning") {
      return;
    }

    const BarcodeDetector = (window as BarcodeWindow).BarcodeDetector;

    if (!navigator.mediaDevices?.getUserMedia || !BarcodeDetector) {
      setStatus("unsupported");
      setMessage("Camera QR scanning is not supported in this browser. Enter the fallback code instead.");
      return;
    }

    setStatus("starting");
    setMessage("Starting camera...");
    detectedRef.current = false;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: { ideal: "environment" } },
      });
      const detector = new BarcodeDetector({ formats: ["qr_code"] });
      const video = videoRef.current;

      if (!video) {
        stopCamera();
        return;
      }

      streamRef.current = stream;
      video.srcObject = stream;
      await video.play();

      setStatus("scanning");
      setMessage("Point the camera at the guest QR code.");

      const scanFrame = async () => {
        if (!videoRef.current || detectedRef.current) {
          return;
        }

        if (videoRef.current.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
          try {
            const results = await detector.detect(videoRef.current);
            const value = results[0]?.rawValue?.trim();

            if (value) {
              detectedRef.current = true;
              setMessage("QR detected. Verifying ticket...");
              stopCamera();
              onDetected(value);
              return;
            }
          } catch {
            setStatus("error");
            setMessage("Camera scanning stopped. Enter the fallback code instead.");
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

  return (
    <div className="rounded-lg border border-slate-700 bg-[#101a2c] p-4">
      <div className="relative grid min-h-56 place-items-center overflow-hidden rounded-lg bg-[#1c2b43]">
        <video
          aria-label="QR camera preview"
          className="h-full min-h-56 w-full object-cover"
          muted
          playsInline
          ref={videoRef}
        />
        {status !== "scanning" ? (
          <div className="absolute inset-0 grid place-items-center bg-[#1c2b43]">
            <div className="grid h-40 w-40 place-items-center rounded-lg border-2 border-brand shadow-inner">
              <span className="text-xs font-semibold uppercase tracking-normal text-white/60">
                QR
              </span>
            </div>
          </div>
        ) : (
          <div className="pointer-events-none absolute inset-0 grid place-items-center">
            <div className="h-40 w-40 rounded-lg border-2 border-brand shadow-[0_0_0_999px_rgba(0,0,0,0.28)]" />
          </div>
        )}
      </div>
      <p className="mt-3 text-center text-sm text-slate-300">{message}</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <button
          className="rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          disabled={disabled || status === "starting" || status === "scanning"}
          onClick={startCamera}
          type="button"
        >
          Start camera
        </button>
        <button
          className="rounded-lg border border-slate-600 bg-transparent px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          disabled={status !== "scanning" && status !== "starting"}
          onClick={() => {
            stopCamera();
            setStatus("idle");
            setMessage("Camera stopped. Enter the fallback code or start scanning again.");
          }}
          type="button"
        >
          Stop camera
        </button>
      </div>
    </div>
  );
}
