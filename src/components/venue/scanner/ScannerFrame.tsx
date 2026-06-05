"use client";

import { startTransition, useActionState, useRef } from "react";
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

function formatStatus(status: ScannerTicket["status"]) {
  return status.replace("_", " ");
}

function statusTone(status: ScannerState["status"]): StatusTone {
  if (status === "success") {
    return "green";
  }

  if (status === "error") {
    return "danger";
  }

  if (status === "ready") {
    return "blue";
  }

  return "neutral";
}

function TicketSummary({ ticket }: { ticket: ScannerTicket }) {
  return (
    <div className="rounded-lg border border-line bg-slate-50 p-3 text-sm text-foreground">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-semibold">{ticket.guestName}</p>
          <p className="mt-1 text-muted">{ticket.publicCode}</p>
        </div>
        <StatusPill tone="neutral">{formatStatus(ticket.status)}</StatusPill>
      </div>
      <div className="mt-3 grid gap-2 text-muted sm:grid-cols-2">
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
            className="mt-2 w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-foreground outline-none focus:border-brand"
            defaultValue={state.ticket.itemType ?? ""}
            name="itemType"
            required
          >
            <option value="" disabled>
              Select item type
            </option>
            <option value="Bag">Bag</option>
            <option value="Helmet">Helmet</option>
            <option value="Coat">Coat</option>
            <option value="Package">Package</option>
            <option value="Other">Other</option>
          </select>
        </label>
        <label>
          <span className="text-sm font-medium text-foreground">Item count</span>
          <input
            className="mt-2 w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-foreground outline-none focus:border-brand"
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
          className="mt-2 w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-foreground outline-none focus:border-brand"
          defaultValue={state.ticket.storageLocation ?? ""}
          name="storageLocation"
          placeholder="Counter rack, shelf, or slot"
          required
        />
      </label>
      <label className="block">
        <span className="text-sm font-medium text-foreground">Item notes</span>
        <textarea
          className="mt-2 min-h-24 w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-foreground outline-none focus:border-brand"
          defaultValue={state.ticket.itemDescription ?? ""}
          name="itemDescription"
          placeholder="Optional description for staff reference"
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
        Confirm only after the guest has received the stored item.
      </div>
      <SubmitButton disabled={pending}>Confirm checkout</SubmitButton>
    </form>
  );
}

export default function ScannerFrame() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [state, formAction, pending] = useActionState(
    handleScannerAction,
    initialScannerState,
  );

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
            className="mt-2 w-full rounded-lg border border-line bg-white px-3 py-3 text-sm text-foreground outline-none focus:border-brand"
            name="lookupValue"
            placeholder="Paste QR link or enter CLK code"
            ref={inputRef}
            required
          />
        </label>
        <SubmitButton disabled={pending}>Verify ticket</SubmitButton>
      </form>

      {state.message ? (
        <div className="mt-4 flex flex-col gap-3 rounded-lg border border-line bg-white p-3">
          <StatusPill tone={statusTone(state.status)}>
            {state.status === "ready" ? "Ready for confirmation" : state.status}
          </StatusPill>
          <p className="text-sm text-muted">{state.message}</p>
          {"ticket" in state && state.ticket ? (
            <TicketSummary ticket={state.ticket} />
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
