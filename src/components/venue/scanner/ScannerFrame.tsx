"use client";

import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import { handleScannerAction } from "@/app/venuescanner/actions";
import { initialScannerState, type ScannerState, type ScannerTicket } from "@/app/venuescanner/types";
import CameraScanner from "./CameraScanner";

const ITEM_TYPES = [
  "Bag",
  "Backpack",
  "Coat",
  "Jacket",
  "Helmet",
  "Luggage",
  "Electronics",
  "Sports equipment",
  "Package",
  "Other",
];

const AUTO_RESET_MS = 5000;

// ─── Shared field style (dark context) ────────────────────────────────────────

const fieldClass =
  "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-white/30 focus:bg-white/10";

// ─── Guest info card shown after lookup ───────────────────────────────────────

function GuestCard({ ticket }: { ticket: ScannerTicket }) {
  const statusLabel =
    ticket.status === "pending_activation" ? "Pending" : ticket.status === "active" ? "Stored" : ticket.status;

  const statusColor =
    ticket.status === "active"
      ? "text-emerald-400"
      : ticket.status === "pending_activation"
        ? "text-amber-400"
        : "text-red-400";

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-base font-semibold text-white">{ticket.guestName}</p>
          <p className="mt-0.5 font-mono text-xs text-white/40">{ticket.publicCode}</p>
        </div>
        <span className={`text-xs font-semibold uppercase tracking-wide ${statusColor}`}>
          {statusLabel}
        </span>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-white/50">
        <span>{ticket.guestPhone}</span>
        <span>{ticket.venueName}</span>
        {ticket.itemType ? <span>{ticket.itemType}</span> : null}
        {ticket.storageLocation ? <span>@ {ticket.storageLocation}</span> : null}
      </div>
    </div>
  );
}

// ─── Multi-item activation form ───────────────────────────────────────────────

type ItemLine = { type: string; count: number };

function ActivationForm({
  formAction,
  pending,
  ticket,
}: {
  formAction: (fd: FormData) => void;
  pending: boolean;
  ticket: ScannerTicket;
}) {
  const [items, setItems] = useState<ItemLine[]>([{ type: "", count: 1 }]);
  const [location, setLocation] = useState(ticket.storageLocation ?? "");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  function addLine() {
    setItems((prev) => [...prev, { type: "", count: 1 }]);
  }

  function removeLine(i: number) {
    setItems((prev) => prev.filter((_, idx) => idx !== i));
  }

  function updateLine(i: number, field: "type" | "count", value: string | number) {
    setItems((prev) =>
      prev.map((item, idx) => (idx === i ? { ...item, [field]: value } : item)),
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const valid = items.filter((item) => item.type && item.count > 0);
    if (valid.length === 0) {
      setError("Select at least one item type.");
      return;
    }
    if (!location.trim()) {
      setError("Storage location is required.");
      return;
    }

    const totalCount = valid.reduce((sum, item) => sum + Number(item.count), 0);
    const itemSummary = valid.map((item) => `${item.count}× ${item.type}`).join(", ");
    const description = notes.trim() ? `${itemSummary}\n${notes.trim()}` : itemSummary;

    const fd = new FormData();
    fd.set("_action", "activate");
    fd.set("ticketId", ticket.id);
    fd.set("itemType", valid[0].type);
    fd.set("itemCount", String(totalCount));
    fd.set("storageLocation", location.trim());
    fd.set("itemDescription", description);

    startTransition(() => formAction(fd));
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      {/* Items */}
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/40">
          Items to store
        </p>
        <div className="space-y-2">
          {items.map((item, i) => (
            <div className="flex items-center gap-2" key={i}>
              <select
                className={`${fieldClass} flex-1`}
                onChange={(e) => updateLine(i, "type", e.target.value)}
                required
                value={item.type}
              >
                <option className="bg-zinc-900" value="" disabled>
                  Item type
                </option>
                {ITEM_TYPES.map((t) => (
                  <option className="bg-zinc-900" key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <input
                className={`${fieldClass} w-20 text-center`}
                min={1}
                max={99}
                onChange={(e) => updateLine(i, "count", Number(e.target.value))}
                type="number"
                value={item.count}
              />
              {items.length > 1 && (
                <button
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 text-white/40 hover:border-white/20 hover:text-white/70"
                  onClick={() => removeLine(i)}
                  type="button"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          className="mt-2 text-xs font-medium text-white/40 hover:text-white/70"
          onClick={addLine}
          type="button"
        >
          + Add another item
        </button>
      </div>

      {/* Location */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/40">
          Storage location
        </label>
        <input
          className={fieldClass}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="e.g. Rack A3, Shelf 2, Hook 7"
          type="text"
          value={location}
        />
      </div>

      {/* Notes */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/40">
          Notes{" "}
          <span className="normal-case font-normal text-white/25">(optional)</span>
        </label>
        <textarea
          className={`${fieldClass} min-h-16 resize-none`}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Colour, brand, distinguishing features…"
          value={notes}
        />
      </div>

      {error ? (
        <p className="text-xs font-medium text-red-400">{error}</p>
      ) : null}

      <button
        className="w-full rounded-xl bg-white py-3 text-sm font-semibold text-zinc-900 transition hover:bg-white/90 disabled:opacity-50"
        disabled={pending}
        type="submit"
      >
        {pending ? "Confirming…" : "Confirm activation"}
      </button>
    </form>
  );
}

// ─── Checkout confirmation ────────────────────────────────────────────────────

function CheckoutForm({
  formAction,
  pending,
  ticket,
}: {
  formAction: (fd: FormData) => void;
  pending: boolean;
  ticket: ScannerTicket;
}) {
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const fd = new FormData();
    fd.set("_action", "checkout");
    fd.set("ticketId", ticket.id);
    startTransition(() => formAction(fd));
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {ticket.itemType ? (
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-white/40">
            Items to return
          </p>
          <p className="mt-2 text-sm text-white">
            {ticket.itemCount > 1 ? `${ticket.itemCount}× ` : ""}
            {ticket.itemType}
          </p>
          {ticket.storageLocation ? (
            <p className="mt-1 text-xs text-white/40">Location: {ticket.storageLocation}</p>
          ) : null}
          {ticket.itemDescription ? (
            <p className="mt-1 text-xs text-white/40">{ticket.itemDescription}</p>
          ) : null}
        </div>
      ) : null}
      <p className="text-xs text-white/40">
        Only confirm once the guest has physically received their item.
      </p>
      <button
        className="w-full rounded-xl bg-white py-3 text-sm font-semibold text-zinc-900 transition hover:bg-white/90 disabled:opacity-50"
        disabled={pending}
        type="submit"
      >
        {pending ? "Confirming…" : "Confirm collection"}
      </button>
    </form>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ScannerFrame() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [state, formAction, pending] = useActionState(handleScannerAction, initialScannerState);

  // Auto-reset after success
  useEffect(() => {
    if (state.status !== "success") return;
    resetTimerRef.current = setTimeout(() => {
      const fd = new FormData();
      fd.set("_action", "reset");
      startTransition(() => formAction(fd));
      if (inputRef.current) inputRef.current.value = "";
    }, AUTO_RESET_MS);
    return () => {
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    };
  }, [state.status, formAction]);

  function handleCameraDetection(value: string) {
    if (inputRef.current) inputRef.current.value = value;
    const fd = new FormData();
    fd.set("_action", "lookup");
    fd.set("lookupValue", value);
    startTransition(() => formAction(fd));
  }

  const ticket = "ticket" in state ? state.ticket : undefined;
  const isActivation = state.status === "ready" && state.intent === "activation";
  const isCheckout = state.status === "ready" && state.intent === "checkout";
  const isSuccess = state.status === "success";
  const isError = state.status === "error";

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {/* Left — camera + code input */}
      <div className="space-y-4">
        <CameraScanner disabled={pending} onDetected={handleCameraDetection} />

        <form
          action={formAction}
          className="flex gap-2"
        >
          <input name="_action" type="hidden" value="lookup" />
          <input
            autoComplete="off"
            className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-white/25 focus:bg-white/10"
            name="lookupValue"
            placeholder="Paste QR link or enter CLK-… code"
            ref={inputRef}
          />
          <button
            className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-zinc-900 transition hover:bg-white/90 disabled:opacity-50"
            disabled={pending}
            type="submit"
          >
            Verify
          </button>
        </form>

        {/* Status feedback */}
        {isError && state.message ? (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {state.message}
          </div>
        ) : null}

        {isSuccess && state.message ? (
          <div className="space-y-3">
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
              {state.message}
            </div>
            {ticket ? <GuestCard ticket={ticket} /> : null}
            <p className="text-center text-xs text-white/25">Resetting in a moment…</p>
          </div>
        ) : null}

        {/* Guest card on ready state (shown only on mobile, col 1) */}
        {(isActivation || isCheckout) && ticket ? (
          <div className="lg:hidden">
            <GuestCard ticket={ticket} />
          </div>
        ) : null}
      </div>

      {/* Right — action form or guest card */}
      <div>
        {(isActivation || isCheckout) && ticket ? (
          <div className="space-y-4">
            <div className="hidden lg:block">
              <GuestCard ticket={ticket} />
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-5">
              <p className="mb-5 text-xs font-semibold uppercase tracking-wider text-white/40">
                {isActivation ? "Record stored items" : "Confirm collection"}
              </p>
              {isActivation ? (
                <ActivationForm formAction={formAction} pending={pending} ticket={ticket} />
              ) : (
                <CheckoutForm formAction={formAction} pending={pending} ticket={ticket} />
              )}
            </div>
          </div>
        ) : (
          <div className="hidden rounded-xl border border-white/5 bg-white/[0.02] p-6 lg:block">
            <p className="text-xs font-semibold uppercase tracking-wider text-white/20">
              Waiting for scan
            </p>
            <div className="mt-6 space-y-4">
              {[
                { label: "Pending pass", desc: "Record items and confirm activation." },
                { label: "Active pass", desc: "Confirm the guest has received their item." },
                { label: "Blocked", desc: "Wrong venue, expired, or already collected." },
              ].map((item) => (
                <div key={item.label}>
                  <p className="text-sm font-medium text-white/50">{item.label}</p>
                  <p className="mt-0.5 text-xs leading-5 text-white/25">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
