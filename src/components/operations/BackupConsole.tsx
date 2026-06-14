"use client";

import { startTransition, useActionState, useState } from "react";
import { handleBackupAction } from "@/app/smsbackup/actions";
import { initialBackupState } from "@/app/smsbackup/types";
import PhoneInput from "@/components/shared/PhoneInput";
import Panel from "@/components/shared/Panel";
import { ActivationForm, CheckoutForm, GuestCard } from "@/components/venue/scanner/TicketActionForms";
import type { ScannerTicket } from "@/app/venuescanner/types";

const inputClass =
  "w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-zinc-400 focus:border-foreground/40 focus:ring-2 focus:ring-foreground/8";

export default function BackupConsole() {
  const [state, formAction, pending] = useActionState(handleBackupAction, initialBackupState);
  const [phone, setPhone] = useState("");
  const [activeTicket, setActiveTicket] = useState<ScannerTicket | null>(null);

  // New walk-in check-in form
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newEmail, setNewEmail] = useState("");

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    const fd = new FormData();
    fd.set("_action", "search");
    fd.set("phone", phone);
    setActiveTicket(null);
    setCreating(false);
    startTransition(() => formAction(fd));
  }

  function submitCreate(e: React.FormEvent) {
    e.preventDefault();
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
    setCreating(false);
    setNewName("");
    setNewPhone("");
    setNewEmail("");
    const fd = new FormData();
    fd.set("_action", "reset");
    startTransition(() => formAction(fd));
  }

  // After an action completes, the server returns the refreshed single ticket.
  const actionTicket = state.status === "action" ? state.ticket : undefined;
  const shownTicket = actionTicket ?? activeTicket;

  return (
    <div className="grid gap-5">
      {/* Search */}
      <Panel title="Find a ticket by phone">
        <form className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end" onSubmit={submitSearch}>
          <div className="grid gap-1.5">
            <label className="text-sm font-medium text-foreground">Guest phone number</label>
            <PhoneInput name="phone" onChange={setPhone} placeholder="7700 900000" />
          </div>
          <button
            className="rounded-xl bg-foreground px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
            disabled={pending}
            type="submit"
          >
            {pending ? "Searching…" : "Search"}
          </button>
        </form>
        <p className="mt-2 text-xs text-muted">
          Matches open tickets at your venue. The last digits are enough if the country code differs.
        </p>
      </Panel>

      {/* New walk-in check-in — for a guest who never created a pass */}
      {!shownTicket && (
        <Panel title="Check in a new guest">
          {!creating ? (
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm text-muted">
                No ticket yet? Create one and check the guest in here.
              </p>
              <button
                className="shrink-0 rounded-xl border border-line bg-white px-4 py-2.5 text-sm font-semibold text-foreground transition hover:border-foreground/30"
                onClick={() => setCreating(true)}
                type="button"
              >
                New check-in
              </button>
            </div>
          ) : (
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
              <div className="flex gap-2">
                <button
                  className="rounded-xl bg-foreground px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
                  disabled={pending}
                  type="submit"
                >
                  {pending ? "Creating…" : "Create & check in"}
                </button>
                <button
                  className="rounded-xl border border-line px-4 py-2.5 text-sm font-medium text-muted transition hover:text-foreground"
                  onClick={() => setCreating(false)}
                  type="button"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
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

      {/* Results list — pick a ticket to act on */}
      {state.status === "results" && !activeTicket ? (
        <Panel title={state.message}>
          <div className="grid gap-2">
            {state.tickets.map((ticket) => (
              <button
                className="flex items-center justify-between gap-3 rounded-xl border border-line bg-white p-4 text-left transition hover:border-foreground/30 hover:shadow-sm"
                key={ticket.id}
                onClick={() => setActiveTicket(ticket)}
                type="button"
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold text-foreground">{ticket.guestName}</p>
                  <p className="mt-0.5 font-mono text-xs text-muted">
                    {ticket.publicCode} · {ticket.guestPhone}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                    ticket.status === "pending_activation"
                      ? "bg-amber-50 text-amber-700"
                      : "bg-emerald-50 text-emerald-700"
                  }`}
                >
                  {ticket.status === "pending_activation" ? "Pending" : "Stored"}
                </span>
              </button>
            ))}
          </div>
        </Panel>
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
              ← New search
            </button>
          </div>
        </Panel>
      ) : null}
    </div>
  );
}
