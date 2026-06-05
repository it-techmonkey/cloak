import { createVenueStaffAccount } from "@/app/venuesettings/actions";
import FieldPreview from "@/components/shared/FieldPreview";
import PageShell from "@/components/shared/PageShell";
import Panel from "@/components/shared/Panel";
import SubmitButton from "@/components/shared/SubmitButton";

const inputClass =
  "w-full rounded-lg border border-line bg-white px-3 py-3 text-sm text-foreground outline-none transition placeholder:text-slate-400 focus:border-brand focus:ring-2 focus:ring-brand/15";

export default function VenueSettingsPage({
  error,
  message,
}: {
  error?: string;
  message?: string;
}) {
  return (
    <PageShell
      activePath="/venuesettings"
      eyebrow="Venue"
      title="Venue settings"
      description="Manage your venue QR entry link, review venue details, and create staff accounts for counter operations."
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
      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <Panel title="Venue QR link">
          <div className="grid aspect-square max-w-56 place-items-center rounded-lg border border-line bg-slate-950 text-white">
            QR
          </div>
          <p className="mt-4 break-all rounded-md bg-slate-50 p-3 text-sm text-muted">
            /customer-signup?venue=techmonkey-space
          </p>
        </Panel>
        <Panel title="Venue details">
          <div className="grid gap-4 sm:grid-cols-2">
            <FieldPreview label="Venue name" value="TechMonkey Space" />
            <FieldPreview label="Capacity" value="100 slots" />
            <FieldPreview label="Contact email" value="ops@example.com" />
            <FieldPreview label="Billing status" value="Plan active" />
          </div>
        </Panel>
        <Panel
          title="Staff accounts"
          description="Create a login for each counter staff member. Staff can scan tickets and handle activation and collection."
        >
          <form action={createVenueStaffAccount} className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium text-foreground">
                Staff name
                <input className={inputClass} name="fullName" placeholder="Staff member name" required />
              </label>
              <label className="grid gap-2 text-sm font-medium text-foreground">
                Staff email
                <input className={inputClass} name="email" placeholder="staff@example.com" required type="email" />
              </label>
              <label className="grid gap-2 text-sm font-medium text-foreground sm:col-span-2">
                Temporary password
                <input
                  autoComplete="new-password"
                  className={inputClass}
                  minLength={8}
                  name="password"
                  placeholder="Minimum 8 characters"
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
