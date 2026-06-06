import Link from "next/link";
import { createVenueStaffAccount } from "@/app/venuesettings/actions";
import FieldPreview from "@/components/shared/FieldPreview";
import PageShell from "@/components/shared/PageShell";
import Panel from "@/components/shared/Panel";
import StatusPill from "@/components/shared/StatusPill";
import SubmitButton from "@/components/shared/SubmitButton";
import type { VenueInfo, VenueStaffMember } from "@/lib/venue-dashboard";

const inputClass =
  "w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-foreground outline-none transition placeholder:text-slate-400 focus:border-brand focus:ring-2 focus:ring-brand/15";

export default function VenueSettingsPage({
  error,
  message,
  staff,
  venue,
}: {
  error?: string;
  message?: string;
  staff: VenueStaffMember[];
  venue: VenueInfo | null;
}) {
  const checkInUrl = venue ? `/customer-signup?venue=${venue.id}` : null;

  return (
    <PageShell
      activePath="/venuesettings"
      eyebrow="Settings"
      title={venue?.name ?? "Venue settings"}
      venueRole="manager"
      actions={
        <Link className="text-sm font-medium text-brand hover:underline" href="/venuedashboard">
          ← Dashboard
        </Link>
      }
    >
      {message ? (
        <div className="rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          {message}
        </div>
      ) : null}
      {error ? (
        <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      ) : null}

      <div className="grid gap-5 md:grid-cols-2">
        {/* Venue details */}
        <Panel title="Venue details">
          <div className="grid gap-4 sm:grid-cols-2">
            <FieldPreview label="Name" value={venue?.name ?? "—"} />
            <FieldPreview label="Capacity" value={venue ? `${venue.capacity} slots` : "—"} />
            <FieldPreview label="City" value={venue?.city ?? "—"} />
            <FieldPreview label="Postcode" value={venue?.postalCode ?? "—"} />
            <FieldPreview label="Contact email" value={venue?.contactEmail ?? "—"} />
            <FieldPreview label="Phone" value={venue?.contactPhone ?? "—"} />
          </div>
        </Panel>

        {/* Guest check-in link */}
        <Panel title="Guest check-in link">
          <p className="text-sm text-muted">
            Share this link or display the QR at your cloakroom counter so guests can create their pass before queuing.
          </p>
          {checkInUrl ? (
            <div className="mt-4 overflow-hidden rounded-lg border border-line bg-slate-50">
              <p className="break-all px-4 py-3 font-mono text-xs text-foreground">{checkInUrl}</p>
            </div>
          ) : (
            <div className="mt-4 rounded-lg border border-dashed border-line bg-slate-50 px-4 py-3 text-sm text-muted">
              Link unavailable — venue details are missing.
            </div>
          )}
        </Panel>

        {/* Staff list */}
        <Panel title="Staff accounts">
          {staff.length === 0 ? (
            <div className="rounded-lg border border-dashed border-line bg-slate-50 px-4 py-5 text-center text-sm text-muted">
              No staff accounts have been created yet.
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-line">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-line bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {staff.map((member) => (
                    <tr key={member.id}>
                      <td className="px-4 py-3 font-medium text-foreground">{member.name}</td>
                      <td className="px-4 py-3 text-muted">{member.email}</td>
                      <td className="px-4 py-3">
                        <StatusPill tone={member.role === "manager" ? "blue" : "neutral"}>
                          {member.role === "manager" ? "Manager" : "Staff"}
                        </StatusPill>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>

        {/* Create staff account */}
        <Panel
          title="Add staff account"
          description="Create a login for a counter staff member. They can scan tickets and handle activations and collections."
        >
          <form action={createVenueStaffAccount} className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-1.5 text-sm font-medium text-foreground">
                Full name
                <input className={inputClass} name="fullName" placeholder="Staff member name" required />
              </label>
              <label className="grid gap-1.5 text-sm font-medium text-foreground">
                Email
                <input className={inputClass} name="email" placeholder="staff@example.com" required type="email" />
              </label>
              <label className="grid gap-1.5 text-sm font-medium text-foreground sm:col-span-2">
                Temporary password
                <input
                  autoComplete="new-password"
                  className={inputClass}
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
      </div>
    </PageShell>
  );
}
