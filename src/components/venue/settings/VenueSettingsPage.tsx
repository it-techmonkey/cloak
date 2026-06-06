import Link from "next/link";
import {
  changeMyPassword,
  createVenueStaffAccount,
  removeStaffMember,
  updateMyProfile,
  updateVenueDetails,
} from "@/app/venuesettings/actions";
import PageShell from "@/components/shared/PageShell";
import Panel from "@/components/shared/Panel";
import StatusPill from "@/components/shared/StatusPill";
import SubmitButton from "@/components/shared/SubmitButton";
import type { UserProfile, VenueInfo, VenueStaffMember } from "@/lib/venue-dashboard";

const input =
  "w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-foreground outline-none transition placeholder:text-slate-400 focus:border-foreground/30 focus:ring-2 focus:ring-foreground/10";

function Label({ children }: { children: React.ReactNode }) {
  return <span className="mb-1.5 block text-sm font-medium text-foreground">{children}</span>;
}

function SectionAlert({ type, message }: { type: "success" | "error"; message: string }) {
  return (
    <div
      className={`rounded-lg border px-4 py-3 text-sm font-medium ${
        type === "success"
          ? "border-emerald-100 bg-emerald-50 text-emerald-700"
          : "border-red-100 bg-red-50 text-red-700"
      }`}
    >
      {message}
    </div>
  );
}

export default function VenueSettingsPage({
  error,
  message,
  profile,
  staff,
  venue,
}: {
  error?: string;
  message?: string;
  profile: UserProfile | null;
  staff: VenueStaffMember[];
  venue: VenueInfo | null;
}) {
  const checkInUrl = venue ? `${process.env.NEXT_PUBLIC_SUPABASE_URL ? "" : ""}/customer-signup?venue=${venue.id}` : null;

  return (
    <PageShell
      activePath="/venuesettings"
      eyebrow="Settings"
      title={venue?.name ?? "Venue settings"}
      venueRole="manager"
    >
      {message ? <SectionAlert type="success" message={message} /> : null}
      {error ? <SectionAlert type="error" message={error} /> : null}

      {/* ── Venue details (editable) ───────────────────────────────────────── */}
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
              <input className={input} defaultValue={venue?.contactPhone ?? ""} name="contactPhone" placeholder="+44 20 0000 0000" type="tel" />
            </label>
          </div>
          <div className="flex justify-end">
            <button
              className="rounded-lg bg-foreground px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
              type="submit"
            >
              Save changes
            </button>
          </div>
        </form>
      </Panel>

      {/* ── Guest check-in link ───────────────────────────────────────────── */}
      <Panel title="Guest check-in link" description="Share this link so guests can create their pass before queuing.">
        {venue ? (
          <div className="overflow-hidden rounded-lg border border-line bg-slate-50">
            <p className="break-all px-4 py-3 font-mono text-xs text-foreground">
              /customer-signup?venue={venue.id}
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted">Link unavailable — save venue details first.</p>
        )}
      </Panel>

      {/* ── My profile ────────────────────────────────────────────────────── */}
      <Panel title="My profile" description="Update your name and phone number.">
        <form action={updateMyProfile} className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label>
              <Label>Full name</Label>
              <input className={input} defaultValue={profile?.fullName ?? ""} name="fullName" placeholder="Your name" required />
            </label>
            <label>
              <Label>Phone</Label>
              <input className={input} defaultValue={profile?.phone ?? ""} name="phone" placeholder="+44 7700 000000" type="tel" />
            </label>
            <label className="sm:col-span-2">
              <Label>Email</Label>
              <input className={input} disabled value={profile?.email ?? ""} />
              <p className="mt-1 text-xs text-muted">Email cannot be changed here.</p>
            </label>
          </div>
          <div className="flex justify-end">
            <button
              className="rounded-lg bg-foreground px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
              type="submit"
            >
              Save profile
            </button>
          </div>
        </form>
      </Panel>

      {/* ── Change password ───────────────────────────────────────────────── */}
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
            <button
              className="rounded-lg bg-foreground px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
              type="submit"
            >
              Update password
            </button>
          </div>
        </form>
      </Panel>

      {/* ── Staff accounts ────────────────────────────────────────────────── */}
      <Panel title="Staff accounts" description="Manage who can access the scanner and ticket dashboard.">
        {staff.length === 0 ? (
          <div className="rounded-lg border border-dashed border-line bg-slate-50 px-4 py-6 text-center text-sm text-muted">
            No staff accounts yet. Add one below.
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-line">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-muted">
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
                      <StatusPill tone={member.role === "manager" ? "neutral" : "neutral"}>
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

      {/* ── Add staff account ─────────────────────────────────────────────── */}
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
    </PageShell>
  );
}
