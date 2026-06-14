"use client";

import { useEffect, useRef, useState } from "react";
import {
  changeMyPassword,
  createVenueStaffAccount,
  removeStaffMember,
  updateMyProfile,
  updateVenueDetails,
  updateVenueExpiry,
} from "@/app/venuesettings/actions";
import PageShell from "@/components/shared/PageShell";
import Panel from "@/components/shared/Panel";
import PhoneInput from "@/components/shared/PhoneInput";
import VenueQrCard from "./VenueQrCard";
import SaveButton from "@/components/shared/SaveButton";
import StatusPill from "@/components/shared/StatusPill";
import SubmitButton from "@/components/shared/SubmitButton";
import type { UserProfile, VenueInfo, VenueStaffMember } from "@/lib/venue-dashboard";

const input =
  "w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-foreground outline-none transition placeholder:text-zinc-400 focus:border-foreground/30 focus:ring-2 focus:ring-foreground/10";

function Label({ children }: { children: React.ReactNode }) {
  return <span className="mb-1.5 block text-sm font-medium text-foreground">{children}</span>;
}

function SectionAlert({ type, message }: { type: "success" | "error"; message: string }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(true);

  // Bring the banner into view and auto-dismiss success after a few seconds so
  // the feedback is obvious even when the user submitted from far down the page.
  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    if (type === "success") {
      const id = setTimeout(() => setVisible(false), 4000);
      return () => clearTimeout(id);
    }
  }, [type]);

  if (!visible) return null;

  return (
    <div
      className={`flex items-center gap-2.5 rounded-lg border px-4 py-3 text-sm font-medium ${
        type === "success"
          ? "border-emerald-100 bg-emerald-50 text-emerald-700"
          : "border-red-100 bg-red-50 text-red-700"
      }`}
      ref={ref}
    >
      {type === "success" ? (
        <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-emerald-500 text-xs text-white">
          ✓
        </span>
      ) : (
        <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-red-500 text-xs text-white">
          !
        </span>
      )}
      {message}
    </div>
  );
}

type Tab = "venue" | "staff" | "profile" | "password";

const TABS: Array<{ id: Tab; label: string }> = [
  { id: "venue", label: "Venue" },
  { id: "staff", label: "Staff" },
  { id: "profile", label: "My profile" },
  { id: "password", label: "Password" },
];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      className="shrink-0 rounded-lg border border-line bg-white px-3 py-2 text-xs font-semibold text-muted transition hover:border-foreground/30 hover:text-foreground"
      onClick={handleCopy}
      type="button"
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

function ExpiryToggleSection({ venue }: { venue: VenueInfo | null }) {
  const initialHours = venue?.ticketExpiryHours ?? null;
  const [enabled, setEnabled] = useState(initialHours !== null);
  const [hours, setHours] = useState(String(initialHours ?? 24));

  return (
    <Panel title="Ticket expiry" description="Control how long an unactivated guest pass remains valid.">
      <form action={updateVenueExpiry} className="grid gap-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-foreground">Enable expiry</p>
            <p className="mt-0.5 text-xs text-muted">
              {enabled
                ? `Passes expire ${hours} hour${hours === "1" ? "" : "s"} after creation.`
                : "Passes never expire — they stay valid until activated or cancelled."}
            </p>
          </div>
          <button
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition ${
              enabled ? "bg-foreground" : "bg-zinc-200"
            }`}
            onClick={() => setEnabled((v) => !v)}
            type="button"
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
                enabled ? "translate-x-5" : "translate-x-0.5"
              }`}
            />
          </button>
        </div>

        {enabled && (
          <div>
            <Label>Expiry duration (hours)</Label>
            <input
              className={input}
              max={720}
              min={1}
              name="expiryHours"
              onChange={(e) => setHours(e.target.value)}
              placeholder="e.g. 24"
              type="number"
              value={hours}
            />
          </div>
        )}

        <input name="expiryEnabled" type="hidden" value={enabled ? "1" : "0"} />

        <div className="flex justify-end">
          <SaveButton>Save expiry settings</SaveButton>
        </div>
      </form>
    </Panel>
  );
}

export default function VenueSettingsPage({
  checkInUrl,
  error,
  message,
  profile,
  staff,
  venue,
}: {
  checkInUrl: string | null;
  error?: string;
  message?: string;
  profile: UserProfile | null;
  staff: VenueStaffMember[];
  venue: VenueInfo | null;
}) {
  const [activeTab, setActiveTab] = useState<Tab>("venue");

  return (
    <PageShell
      activePath="/venuesettings"
      eyebrow="Settings"
      title={venue?.name ?? "Venue settings"}
      venueRole="manager"
    >
      {message ? <SectionAlert type="success" message={message} /> : null}
      {error ? <SectionAlert type="error" message={error} /> : null}

      {/* Tab nav */}
      <div className="flex gap-1 overflow-x-auto border-b border-line pb-px">
        {TABS.map((tab) => (
          <button
            className={`shrink-0 rounded-t-lg px-4 py-2.5 text-sm font-medium transition ${
              activeTab === tab.id
                ? "border-b-2 border-foreground text-foreground"
                : "text-muted hover:text-foreground"
            }`}
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Venue tab */}
      {activeTab === "venue" && (
        <>
          <Panel title="Venue details" description="Update your venue information.">
            <form action={updateVenueDetails} className="grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label>
                  <Label>Venue name</Label>
                  <input className={input} defaultValue={venue?.name ?? ""} name="name" placeholder="Venue name" required />
                </label>
                <label>
                  <Label>Capacity (total cloak slots)</Label>
                  <input
                    className={input}
                    defaultValue={venue?.capacity ?? ""}
                    min={1}
                    name="capacity"
                    placeholder="e.g. 50"
                    required
                    type="number"
                  />
                </label>
                <label>
                  <Label>City</Label>
                  <input className={input} defaultValue={venue?.city ?? ""} name="city" placeholder="London" />
                </label>
                <label>
                  <Label>Postcode</Label>
                  <input className={input} defaultValue={venue?.postalCode ?? ""} name="postalCode" placeholder="EC1A 1BB" />
                </label>
                <label className="sm:col-span-2">
                  <Label>Contact phone</Label>
                  <PhoneInput defaultValue={venue?.contactPhone ?? ""} name="contactPhone" placeholder="20 0000 0000" />
                </label>
              </div>
              <div className="flex justify-end">
                <SaveButton>Save changes</SaveButton>
              </div>
            </form>
          </Panel>

          {/* Guest check-in link */}
          <Panel title="Guest check-in link" description="Share this link so guests can create their pass before queuing.">
            {checkInUrl ? (
              <div className="flex items-center gap-2 overflow-hidden rounded-lg border border-line bg-zinc-50">
                <p className="min-w-0 flex-1 truncate px-4 py-3 font-mono text-xs text-foreground">
                  {checkInUrl}
                </p>
                <div className="shrink-0 pr-3">
                  <CopyButton text={checkInUrl} />
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted">Link unavailable — save venue details first.</p>
            )}
          </Panel>

          {checkInUrl && venue && (
            <VenueQrCard checkInUrl={checkInUrl} venueName={venue.name} />
          )}

          <ExpiryToggleSection venue={venue} />
        </>
      )}

      {/* Staff tab */}
      {activeTab === "staff" && (
        <>
          <Panel title="Staff accounts" description="Manage who can access the scanner and ticket dashboard.">
            {staff.length === 0 ? (
              <div className="rounded-lg border border-dashed border-line bg-zinc-50 px-4 py-6 text-center text-sm text-muted">
                No staff accounts yet. Add one below.
              </div>
            ) : (
              <div className="overflow-hidden rounded-lg border border-line">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-line bg-zinc-50 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                      <th className="px-4 py-3">Name</th>
                      <th className="hidden px-4 py-3 sm:table-cell">Email</th>
                      <th className="px-4 py-3">Role</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {staff.map((member) => (
                      <tr key={member.id}>
                        <td className="px-4 py-3">
                          <p className="font-medium text-foreground">{member.name}</p>
                          <p className="mt-0.5 text-xs text-muted sm:hidden">{member.email}</p>
                        </td>
                        <td className="hidden px-4 py-3 text-muted sm:table-cell">{member.email}</td>
                        <td className="px-4 py-3">
                          <StatusPill tone="neutral">
                            {member.role === "manager" ? "Manager" : "Staff"}
                          </StatusPill>
                        </td>
                        <td className="px-4 py-3 text-right">
                          {member.role !== "manager" && (
                            <form action={removeStaffMember}>
                              <input name="staffId" type="hidden" value={member.id} />
                              <button
                                className="rounded-lg px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50"
                                type="submit"
                              >
                                Remove
                              </button>
                            </form>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>

          <Panel title="Add staff account" description="Create a login for a counter staff member.">
            <form action={createVenueStaffAccount} className="grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label>
                  <Label>Full name</Label>
                  <input className={input} name="fullName" placeholder="Staff member name" required />
                </label>
                <label>
                  <Label>Email</Label>
                  <input className={input} name="email" placeholder="staff@example.com" required type="email" />
                </label>
                <label className="sm:col-span-2">
                  <Label>Temporary password</Label>
                  <input
                    autoComplete="new-password"
                    className={input}
                    minLength={8}
                    name="password"
                    placeholder="Min. 8 characters"
                    required
                    type="password"
                  />
                </label>
              </div>
              <SubmitButton>Create staff account</SubmitButton>
            </form>
          </Panel>
        </>
      )}

      {/* Profile tab */}
      {activeTab === "profile" && (
        <Panel title="My profile" description="Update your name and phone number.">
          <form action={updateMyProfile} className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label>
                <Label>Full name</Label>
                <input className={input} defaultValue={profile?.fullName ?? ""} name="fullName" placeholder="Your name" required />
              </label>
              <label>
                <Label>Phone</Label>
                <PhoneInput defaultValue={profile?.phone ?? ""} name="phone" placeholder="7700 900000" />
              </label>
              <label className="sm:col-span-2">
                <Label>Email</Label>
                <input className={input} disabled value={profile?.email ?? ""} />
                <p className="mt-1 text-xs text-muted">Email cannot be changed here.</p>
              </label>
            </div>
            <div className="flex justify-end">
              <SaveButton>Save profile</SaveButton>
            </div>
          </form>
        </Panel>
      )}

      {/* Password tab */}
      {activeTab === "password" && (
        <Panel title="Change password">
          <form action={changeMyPassword} className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label>
                <Label>New password</Label>
                <input
                  autoComplete="new-password"
                  className={input}
                  minLength={8}
                  name="newPassword"
                  placeholder="Min. 8 characters"
                  required
                  type="password"
                />
              </label>
              <label>
                <Label>Confirm new password</Label>
                <input
                  autoComplete="new-password"
                  className={input}
                  minLength={8}
                  name="confirmPassword"
                  placeholder="Re-enter password"
                  required
                  type="password"
                />
              </label>
            </div>
            <div className="flex justify-end">
              <SaveButton>Update password</SaveButton>
            </div>
          </form>
        </Panel>
      )}
    </PageShell>
  );
}

