import { createGuestTicket } from "@/app/customer-signup/actions";
import Panel from "@/components/shared/Panel";
import SubmitButton from "@/components/shared/SubmitButton";
import type { PublicVenueOption } from "@/lib/tickets";

const inputClass =
  "w-full rounded-lg border border-line bg-white px-3 py-3 text-sm text-foreground outline-none transition placeholder:text-slate-400 focus:border-brand focus:ring-2 focus:ring-brand/15";

export default function GuestFormPreview({
  error,
  venues,
}: {
  error?: string;
  venues: PublicVenueOption[];
}) {
  const hasVenues = venues.length > 0;

  return (
    <Panel
      title="Check in"
      description="Enter your details to get your digital ticket."
    >
      <form action={createGuestTicket} className="grid gap-5">
        <label className="grid gap-2 text-sm font-medium text-foreground">
          Venue
          <select className={inputClass} disabled={!hasVenues} name="venue" required>
            {hasVenues ? (
              venues.map((venue) => (
                <option key={venue.id} value={venue.id}>
                  {venue.label}
                </option>
              ))
            ) : (
              <option value="">No approved venues available</option>
            )}
          </select>
        </label>

        {!hasVenues ? (
          <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm font-medium text-amber-700">
            Guest check-in will be available once an approved venue is active.
          </p>
        ) : null}

        <label className="grid gap-2 text-sm font-medium text-foreground">
          Full name
          <input
            className={inputClass}
            name="fullName"
            placeholder="Enter your full name"
            required
            type="text"
          />
        </label>

        <label className="grid gap-2 text-sm font-medium text-foreground">
          Email
          <input
            className={inputClass}
            name="email"
            placeholder="you@example.com"
            required
            type="email"
          />
        </label>

        <label className="grid gap-2 text-sm font-medium text-foreground">
          Mobile
          <input
            className={inputClass}
            name="mobile"
            placeholder="+44 7700 000000"
            required
            type="tel"
          />
        </label>

        {error ? (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
            {error}
          </p>
        ) : null}

        <SubmitButton disabled={!hasVenues}>Get digital ticket</SubmitButton>

        <p className="text-center text-xs leading-5 text-muted">
          Your details are used to create a cloakroom pass for this visit only.
        </p>
      </form>
    </Panel>
  );
}
