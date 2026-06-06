"use client";

import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import { handleScannerAction } from "@/app/venuescanner/actions";
import { initialScannerState, type ScannerState, type ScannerTicket } from "@/app/venuescanner/types";
import CameraScanner from "./CameraScanner";

const PRESET_ITEM_TYPES = [
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

const CUSTOM_SENTINEL = "__custom__";

const AUTO_RESET_MS = 5000;

const fieldClass =
  "rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-foreground outline-none placeholder:text-muted focus:border-foreground/30 focus:ring-2 focus:ring-foreground/10 transition";

// ─── Guest info card ──────────────────────────────────────────────────────────

function GuestCard({ ticket }: { ticket: ScannerTicket }) {
  const isPending = ticket.status === "pending_activation";
  const isStored = ticket.status === "active";

  return (
    <div className="rounded-xl border border-line bg-panel p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-base font-semibold text-foreground">{ticket.guestName}</p>
          <p className="mt-0.5 font-mono text-xs text-muted">{ticket.publicCode}</p>
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
            isStored
              ? "bg-emerald-50 text-emerald-700"
              : isPending
                ? "bg-amber-50 text-amber-700"
                : "bg-red-50 text-red-700"
          }`}
        >
          {isStored ? "Stored" : isPending ? "Pending" : ticket.status}
        </span>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted">
        <span>{ticket.guestPhone}</span>
        <span>{ticket.venueName}</span>
        {ticket.itemType ? (
          <span>
            {ticket.itemCount > 1 ? `${ticket.itemCount}× ` : ""}
            {ticket.itemType}
          </span>
        ) : null}
        {ticket.storageLocation ? (
          <span className="font-semibold text-foreground">Cloak {ticket.storageLocation}</span>
        ) : null}
      </div>
    </div>
  );
}

// ─── Multi-item activation form ───────────────────────────────────────────────

type ItemLine = { type: string; count: string; custom: string };

function ActivationForm({
  formAction,
  pending,
  ticket,
}: {
  formAction: (fd: FormData) => void;
  pending: boolean;
  ticket: ScannerTicket;
}) {
  const [items, setItems] = useState<ItemLine[]>([{ type: "", count: "1", custom: "" }]);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  function addLine() {
    setItems((prev) => [...prev, { type: "", count: "1", custom: "" }]);
  }

  function removeLine(i: number) {
    setItems((prev) => prev.filter((_, idx) => idx !== i));
  }

  function updateLine(i: number, field: "type" | "count" | "custom", value: string) {
    setItems((prev) =>
      prev.map((item, idx) => (idx === i ? { ...item, [field]: value } : item)),
    );
  }

  // Resolve the display label for an item — custom text takes over when selected
  function resolvedType(item: ItemLine): string {
    return item.type === CUSTOM_SENTINEL ? item.custom.trim() : item.type;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const valid = items.filter((item) => {
      const label = resolvedType(item);
      return label && parseInt(item.count, 10) > 0;
    });

    if (valid.length === 0) {
      setError("Select at least one item type.");
      return;
    }

    // Check any "Custom" rows have actual text filled in
    const missingCustom = valid.some(
      (item) => item.type === CUSTOM_SENTINEL && !item.custom.trim(),
    );
    if (missingCustom) {
      setError("Enter a name for the custom item.");
      return;
    }

    const totalCount = valid.reduce((sum, item) => sum + parseInt(item.count, 10), 0);
    const itemSummary = valid.map((item) => `${item.count}× ${resolvedType(item)}`).join(", ");
    const description = notes.trim() ? `${itemSummary}\n${notes.trim()}` : itemSummary;

    const fd = new FormData();
    fd.set("_action", "activate");
    fd.set("ticketId", ticket.id);
    fd.set("itemType", resolvedType(valid[0]));
    fd.set("itemCount", String(totalCount));
    fd.set("itemDescription", description);

    startTransition(() => formAction(fd));
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {/* Item rows */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
          Items to store
        </p>
        <div className="space-y-2">
          {items.map((item, i) => (
            <div className="flex flex-col gap-1.5" key={i}>
              <div className="flex items-center gap-2">
                {/* Type dropdown */}
                <select
                  className={`${fieldClass} min-w-0 flex-1`}
                  onChange={(e) => updateLine(i, "type", e.target.value)}
                  required
                  value={item.type}
                >
                  <option value="" disabled>Item type</option>
                  {PRESET_ITEM_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                  <option value={CUSTOM_SENTINEL}>Custom…</option>
                </select>

                {/* Qty — digits only, 1-99 */}
                <input
                  className={`${fieldClass} w-14 shrink-0 text-center`}
                  inputMode="numeric"
                  maxLength={2}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, "");
                    if (digits === "") { updateLine(i, "count", ""); return; }
                    const n = Math.min(Math.max(parseInt(digits, 10), 1), 99);
                    updateLine(i, "count", String(n));
                  }}
                  placeholder="1"
                  type="text"
                  value={item.count}
                />

                {items.length > 1 && (
                  <button
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-line text-muted transition hover:border-foreground/30 hover:text-foreground"
                    onClick={() => removeLine(i)}
                    type="button"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* Custom label — appears below the row when "Custom…" is chosen */}
              {item.type === CUSTOM_SENTINEL && (
                <input
                  autoFocus
                  className={`${fieldClass} w-full`}
                  onChange={(e) => updateLine(i, "custom", e.target.value)}
                  placeholder="Describe the item (e.g. Pushchair, Scooter…)"
                  type="text"
                  value={item.custom}
                />
              )}
            </div>
          ))}
        </div>
        <button
          className="mt-2 text-xs font-medium text-muted hover:text-foreground"
          onClick={addLine}
          type="button"
        >
          + Add another item
        </button>
      </div>

      {/* Notes */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted">
          Notes <span className="normal-case font-normal">(optional)</span>
        </label>
        <textarea
          className={`${fieldClass} w-full min-h-16 resize-none`}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Colour, brand, or distinguishing features…"
          value={notes}
        />
      </div>

      {error ? <p className="text-xs font-medium text-red-600">{error}</p> : null}

      <p className="text-xs text-muted">
        A cloak number will be automatically assigned on activation.
      </p>

      <button
        className="w-full rounded-xl bg-foreground py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
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
        <div className="rounded-xl border border-line bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">
            Items to return
          </p>
          <p className="mt-2 text-sm font-medium text-foreground">
            {ticket.itemCount > 1 ? `${ticket.itemCount}× ` : ""}
            {ticket.itemType}
          </p>
          {ticket.storageLocation ? (
            <p className="mt-1 text-xs text-muted">
              Cloak <span className="font-semibold text-foreground">{ticket.storageLocation}</span>
            </p>
          ) : null}
          {ticket.itemDescription ? (
            <p className="mt-1 text-xs text-muted">{ticket.itemDescription}</p>
          ) : null}
        </div>
      ) : null}
      <p className="text-xs text-muted">
        Only confirm once the guest has physically received their item.
      </p>
      <button
        className="w-full rounded-xl bg-foreground py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
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

  const ticketReady = (isActivation || isCheckout) && ticket;

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {/* Left — camera + code input (hidden on mobile once ticket is ready) */}
      <div className={`space-y-4 ${ticketReady ? "hidden lg:block" : ""}`}>
        <CameraScanner disabled={pending} onDetected={handleCameraDetection} />

        <form action={formAction} className="flex gap-2">
          <input name="_action" type="hidden" value="lookup" />
          <input
            autoComplete="off"
            className="min-w-0 flex-1 rounded-xl border border-line bg-white px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted focus:border-foreground/30 transition"
            name="lookupValue"
            placeholder="Paste QR link or enter CLK-… code"
            ref={inputRef}
          />
          <button
            className="shrink-0 rounded-xl bg-foreground px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
            disabled={pending}
            type="submit"
          >
            Verify
          </button>
        </form>

        {isError && state.message ? (
          <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            {state.message}
          </div>
        ) : null}

        {isSuccess && state.message ? (
          <div className="space-y-3">
            <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {state.message}
            </div>
            {ticket ? <GuestCard ticket={ticket} /> : null}
            <p className="text-center text-xs text-muted">Scanner resets automatically…</p>
          </div>
        ) : null}
      </div>

      {/* Right — action form (full-width on mobile when ticket is ready) */}
      <div className={ticketReady ? "lg:col-start-2" : ""}>
        {ticketReady ? (
          <div className="space-y-4">
            {/* On mobile: show a "← Scan again" link so staff can go back */}
            <div className="flex items-center justify-between lg:hidden">
              <GuestCard ticket={ticket} />
            </div>
            <button
              className="flex items-center gap-1 text-xs font-medium text-muted hover:text-foreground lg:hidden"
              onClick={() => {
                const fd = new FormData();
                fd.set("_action", "reset");
                startTransition(() => formAction(fd));
                if (inputRef.current) inputRef.current.value = "";
              }}
              type="button"
            >
              ← Scan again
            </button>

            <div className="hidden lg:block">
              <GuestCard ticket={ticket} />
            </div>

            <div className="rounded-xl border border-line bg-slate-50 p-4 sm:p-5">
              <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted">
                {isActivation ? "Record items" : "Confirm collection"}
              </p>
              {isActivation ? (
                <ActivationForm formAction={formAction} pending={pending} ticket={ticket} />
              ) : (
                <CheckoutForm formAction={formAction} pending={pending} ticket={ticket} />
              )}
            </div>
          </div>
        ) : (
          <div className="hidden rounded-xl border border-line bg-slate-50 p-6 lg:block">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">
              Waiting for scan
            </p>
            <div className="mt-5 space-y-4">
              {[
                { desc: "Record items and confirm activation.", label: "Pending pass" },
                { desc: "Confirm guest has received their item.", label: "Active pass" },
                { desc: "Wrong venue, expired, or already collected.", label: "Blocked" },
              ].map((item) => (
                <div key={item.label}>
                  <p className="text-sm font-medium text-foreground">{item.label}</p>
                  <p className="mt-0.5 text-xs leading-5 text-muted">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
