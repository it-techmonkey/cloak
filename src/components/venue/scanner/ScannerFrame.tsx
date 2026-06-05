"use client";

import { startTransition, useActionState, useEffect, useRef } from "react";
import Panel from "@/components/shared/Panel";
import StatusPill, { type StatusTone } from "@/components/shared/StatusPill";
import SubmitButton from "@/components/shared/SubmitButton";
import {
  handleScannerAction,
  initialScannerState,
  type ScannerState,
  type ScannerTicket,
} from "@/app/venuescanner/actions";
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

const AUTO_RESET_DELAY_MS = 4000;

const inputClass =
  "mt-2 w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-foreground outline-none focus:border-brand focus:ring-2 focus:ring-brand/10";

function formatStatus(status: ScannerTicket["status"]) {
  if (status === "pending_activation") return "Pending";
  if (status === "active") return "Stored";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function statusTone(status: ScannerState["status"]): StatusTone {
  if (status === "success") return "green";
  if (status === "error") return "danger";
  if (status === "ready") return "blue";
  return "neutral";
}

function TicketSummary({ ticket }: { ticket: ScannerTicket }) {
  return (
    <div className="rounded-lg border border-line bg-slate-50 p-3 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-semibold text-foreground">{ticket.guestName}</p>
          <p className="mt-0.5 font-mono text-xs text-muted">{ticket.publicCode}</p>
        </div>
        <StatusPill tone="neutral">{formatStatus(ticket.status)}</StatusPill>
      </div>
      <div className="mt-3 grid gap-1.5 text-xs text-muted sm:grid-cols-2">
        <p>{ticket.guestPhone}</p>
        <p>{ticket.venueName}</p>
        {ticket.itemType ? <p>{ticket.itemType}</p> : null}
        {ticket.storageLocation ? <p>{ticket.storageLocation}</p> : null}
      </div>
    </div>
  );
}

function ActivationConfirmation({
  formAction,
  pending,
  state,
}: {
  formAction: (payload: FormData) => void;
  pending: boolean;
  state: ScannerState & { intent: "activation"; status: "ready"; ticket: ScannerTicket };
}) {
  return (
    <form action={formAction} className="mt-4 space-y-4">
      <input name="_action" type="hidden" value="activate" />
      <input name="ticketId" type="hidden" value={state.ticket.id} />
      <div className="grid gap-3 sm:grid-cols-2">
        <label>
          <span className="text-sm font-medium text-foreground">Item type</span>
          <select
            className={inputClass}
            defaultValue={state.ticket.itemType ?? ""}
            name="itemType"
            required
          >
            <option value="" disabled>Select item type</option>
            {ITEM_TYPES.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </label>
        <label>
          <span className="text-sm font-medium text-foreground">Item count</span>
          <input
            className={inputClass}
            defaultValue={state.ticket.itemCount}
            max={99}
            min={1}
            name="itemCount"
            required
            type="number"
          />
        </label>
      </div>
      <label className="block">
        <span className="text-sm font-medium text-foreground">Storage location</span>
        <input
          className={inputClass}
          defaultValue={state.ticket.storageLocation ?? ""}
          name="storageLocation"
          placeholder="Shelf, rack, or slot reference"
          required
        />
      </label>
      <label className="block">
        <span className="text-sm font-medium text-foreground">
          Notes{" "}
          <span className="font-normal text-muted">(optional)</span>
        </span>
        <textarea
          className={`${inputClass} min-h-20`}
          defaultValue={state.ticket.itemDescription ?? ""}
          name="itemDescription"
          placeholder="Colour, distinguishing features, or staff notes"
        />
      </label>
      <SubmitButton disabled={pending}>Confirm activation</SubmitButton>
    </form>
  );
}

function CheckoutConfirmation({
  formAction,
  pending,
  state,
}: {
  formAction: (payload: FormData) => void;
  pending: boolean;
  state: ScannerState & { intent: "checkout"; status: "ready"; ticket: ScannerTicket };
}) {
  return (
    <form action={formAction} className="mt-4 space-y-4">
      <input name="_action" type="hidden" value="checkout" />
      <input name="ticketId" type="hidden" value={state.ticket.id} />
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
        Only confirm once the guest has physically received their stored item.
      </div>
      <SubmitButton disabled={pending}>Confirm collection</SubmitButton>
    </form>
  );
}

export default function ScannerFrame() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [state, formAction, pending] = useActionState(
    handleScannerAction,
    initialScannerState,
  );

  useEffect(() => {
    if (state.status === "success") {
      resetTimerRef.current = setTimeout(() => {
        const resetData = new FormData();
        resetData.set("_action", "reset");
        startTransition(() => {
          formAction(resetData);
        });
        if (inputRef.current) {
          inputRef.current.value = "";
        }
      }, AUTO_RESET_DELAY_MS);
    }

    return () => {
      if (resetTimerRef.current) {
        clearTimeout(resetTimerRef.current);
      }
    };
  }, [state.status, formAction]);

  function handleCameraDetection(value: string) {
    if (!inputRef.current) {
      return;
    }

    inputRef.current.value = value;

    const formData = new FormData();
    formData.set("_action", "lookup");
    formData.set("lookupValue", value);

    startTransition(() => {
      formAction(formData);
    });
  }

  return (
    <Panel
      title="Counter verification"
      description="Scan a QR code or enter the matching fallback code to continue."
    >
      <CameraScanner disabled={pending} onDetected={handleCameraDetection} />

      <form action={formAction} className="mt-4 space-y-3">
        <input name="_action" type="hidden" value="lookup" />
        <label className="block">
          <span className="text-sm font-medium text-foreground">
            QR link or fallback code
          </span>
          <input
            autoComplete="off"
            className="mt-2 w-full rounded-lg border border-line bg-white px-3 py-3 text-sm text-foreground outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 placeholder:text-slate-400"
            name="lookupValue"
            placeholder="Paste QR link or enter CLK-… code"
            ref={inputRef}
            required
          />
        </label>
        <SubmitButton disabled={pending}>Verify ticket</SubmitButton>
      </form>

      {state.message ? (
        <div className="mt-4 flex flex-col gap-3 rounded-lg border border-line bg-white p-3">
          <StatusPill tone={statusTone(state.status)}>
            {state.status === "ready"
              ? "Action required"
              : state.status === "success"
                ? "Done"
                : state.status}
          </StatusPill>
          <p className="text-sm text-muted">{state.message}</p>
          {"ticket" in state && state.ticket ? (
            <TicketSummary ticket={state.ticket} />
          ) : null}
          {state.status === "success" ? (
            <p className="text-xs text-muted">Scanner will reset automatically.</p>
          ) : null}
        </div>
      ) : null}

      {state.status === "ready" && state.intent === "activation" ? (
        <ActivationConfirmation formAction={formAction} pending={pending} state={state} />
      ) : null}

      {state.status === "ready" && state.intent === "checkout" ? (
        <CheckoutConfirmation formAction={formAction} pending={pending} state={state} />
      ) : null}
    </Panel>
  );
}
