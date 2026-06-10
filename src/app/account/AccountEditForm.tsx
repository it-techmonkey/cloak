"use client";

import { useState, useTransition } from "react";
import { updateProfile } from "./actions";

const inputClass =
  "w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-foreground outline-none placeholder:text-slate-400 focus:border-brand focus:ring-2 focus:ring-brand/15";

export default function AccountEditForm({
  fullName,
  phone,
}: {
  fullName: string | null;
  phone: string | null;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(fullName ?? "");
  const [ph, setPh] = useState(phone ?? "");
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    const fd = new FormData();
    fd.set("fullName", name);
    fd.set("phone", ph);
    startTransition(async () => {
      const result = await updateProfile(fd);
      if (result.error) {
        setMessage(result.error);
      } else {
        setMessage("Saved.");
        setEditing(false);
      }
    });
  }

  if (!editing) {
    return (
      <div className="flex items-center justify-between">
        <div className="grid gap-0.5 text-sm text-muted">
          {phone && <span>{phone}</span>}
          {!fullName && !phone && <span>No profile details set.</span>}
        </div>
        <button
          className="rounded-lg border border-line bg-white px-3 py-1.5 text-xs font-medium text-muted transition hover:text-foreground"
          onClick={() => setEditing(true)}
          type="button"
        >
          Edit profile
        </button>
      </div>
    );
  }

  return (
    <form className="grid gap-3" onSubmit={handleSubmit}>
      <div className="grid gap-1.5">
        <label className="text-xs font-medium text-foreground" htmlFor="acc-name">Full name</label>
        <input
          className={inputClass}
          id="acc-name"
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          type="text"
          value={name}
        />
      </div>
      <div className="grid gap-1.5">
        <label className="text-xs font-medium text-foreground" htmlFor="acc-phone">Phone</label>
        <input
          className={inputClass}
          id="acc-phone"
          onChange={(e) => setPh(e.target.value)}
          placeholder="+44 7700 000000"
          type="tel"
          value={ph}
        />
      </div>
      {message && (
        <p className={`text-xs ${message === "Saved." ? "text-emerald-600" : "text-red-600"}`}>
          {message}
        </p>
      )}
      <div className="flex gap-2">
        <button
          className="rounded-lg bg-foreground px-4 py-2 text-xs font-semibold text-white transition hover:bg-zinc-700 disabled:opacity-50"
          disabled={isPending}
          type="submit"
        >
          {isPending ? "Saving…" : "Save"}
        </button>
        <button
          className="rounded-lg border border-line px-4 py-2 text-xs font-medium text-muted transition hover:text-foreground"
          onClick={() => { setEditing(false); setMessage(null); }}
          type="button"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
