"use client";

import { startTransition, useActionState, useState } from "react";
import { handleBackupAction } from "@/app/smsbackup/actions";
import { initialBackupState } from "@/app/smsbackup/types";
import PhoneInput from "@/components/shared/PhoneInput";
import Panel from "@/components/shared/Panel";
import { isValidEmail, isValidPhone } from "@/lib/validation";
import { ActivationForm, CheckoutForm, GuestCard } from "@/components/venue/scanner/TicketActionForms";
import type { ScannerTicket } from "@/app/venuescanner/types";

const inputClass =
  "w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-zinc-400 focus:border-foreground/40 focus:ring-2 focus:ring-foreground/8";

export default function BackupConsole() {
  const [state, formAction, pending] = useActionState(handleBackupAction, initialBackupState);
  const [activeTicket, setActiveTicket] = useState<ScannerTicket | null>(null);

  // New walk-in check-in form
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);

  function submitCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!isValidPhone(newPhone)) {
      setCreateError("Please enter a valid phone number.");
      return;
    }
    if (newEmail.trim() && !isValidEmail(newEmail)) {
      setCreateError("Please enter a valid email address.");
      return;
    }
    setCreateError(null);
    const fd = new FormData();
    fd.set("_action", "create");
    fd.set("fullName", newName);
    fd.set("phone", newPhone);
    fd.set("email", newEmail);
    setActiveTicket(null);
    startTransition(() => formAction(fd));
  }

  function reset() {
    setActiveTicket(null);
    setNewName("");
    setNewPhone("");
    setNewEmail("");
    const fd = new FormData();
    fd.set("_action", "reset");
    startTransition(() => formAction(fd));
  }

  const actionTicket = state.status === "action" ? state.ticket : undefined;
  const shownTicket = actionTicket ?? activeTicket;

  // After successfully creating + activating a ticket, show it
  return (
    <div className="grid gap-5">
      {/* New walk-in check-in — always shown unless a ticket is being acted on */}
      {!shownTicket && (
        <Panel title="Check in a guest">
          <form className="grid gap-4" onSubmit={submitCreate}>
            <div className="grid gap-1.5">
              <label className="text-sm font-medium text-foreground">Guest name</label>
              <input
                className={inputClass}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Full name"
                required
                value={newName}
              />
            </div>
            <div className="grid gap-1.5">
              <label className="text-sm font-medium text-foreground">Phone number</label>
              <PhoneInput name="newPhone" onChange={setNewPhone} placeholder="7700 900000" required />
            </div>
            <div className="grid gap-1.5">
              <label className="text-sm font-medium text-foreground">
                Email <span className="font-normal text-muted">(optional)</span>
              </label>
              <input
                className={inputClass}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="guest@example.com"
                type="email"
                value={newEmail}
              />
            </div>
            {createError ? (
              <p className="text-xs font-medium text-red-600">{createError}</p>
            ) : null}
            <button
              className="rounded-xl bg-foreground px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
              disabled={pending}
              type="submit"
            >
              {pending ? "Creating…" : "Create ticket & check in"}
            </button>
          </form>
        </Panel>
      )}

      {state.status === "error" ? (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.message}
        </div>
      ) : null}

      {state.status === "action" && state.message ? (
        <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {state.message}
        </div>
      ) : null}

      {/* Selected ticket — act on it */}
      {shownTicket ? (
        <Panel
          title={
            shownTicket.status === "pending_activation" ? "Activate ticket" : "Return or add items"
          }
        >
          <div className="grid gap-4">
            <GuestCard ticket={shownTicket} />

            {shownTicket.status === "collected" ? (
              <p className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                All items returned. This ticket is now closed.
              </p>
            ) : shownTicket.status === "pending_activation" ? (
              <ActivationForm formAction={formAction} pending={pending} ticket={shownTicket} />
            ) : (
              <CheckoutForm formAction={formAction} pending={pending} ticket={shownTicket} />
            )}

            <button
              className="text-xs font-medium text-muted transition hover:text-foreground"
              onClick={reset}
              type="button"
            >
              ← New check-in
            </button>
          </div>
        </Panel>
      ) : null}
    </div>
  );
}
