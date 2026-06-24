import { finishVenueSignup } from "@/app/venuesignup/actions";
import FieldPreview from "@/components/shared/FieldPreview";
import Panel from "@/components/shared/Panel";
import SubmitButton from "@/components/shared/SubmitButton";
import type { VenueSignupSummary } from "@/lib/venues";

function formatPlan(plan: VenueSignupSummary["billingPlan"]) {
  if (plan === "per_event") {
    return "Per event";
  }

  return plan ? plan.charAt(0).toUpperCase() + plan.slice(1) : "Not selected";
}

export default function BrandingPreview({
  error,
  venue,
}: {
  error?: string;
  venue: VenueSignupSummary | null;
}) {
  if (!venue) {
    return (
      <Panel title="Review & submit">
        <p className="text-sm leading-6 text-muted">
          Complete the previous steps before submitting.
        </p>
      </Panel>
    );
  }

  return (
    <Panel
      title="Review & submit"
      description="Confirm your details and create your manager account password to go live."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <FieldPreview label="Contact name" value={venue.contactName ?? ""} />
        <FieldPreview label="Contact email" value={venue.contactEmail} />
        <FieldPreview label="Company" value={venue.companyName ?? ""} />
        <FieldPreview label="Plan" value={formatPlan(venue.billingPlan)} />
        {venue.venueNames && venue.venueNames.length > 0 && (
          <FieldPreview
            label={venue.venueNames.length === 1 ? "Venue" : "Venues"}
            value={venue.venueNames.join(", ")}
          />
        )}
        <FieldPreview label="Status" value="Active on submission" />
      </div>
      {error ? (
        <p className="mt-5 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
          {error}
        </p>
      ) : null}
      <form action={finishVenueSignup} className="mt-5 grid gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium text-foreground">
            Manager password
            <input
              autoComplete="new-password"
              className="w-full rounded-lg border border-line bg-white px-3 py-3 text-sm text-foreground outline-none transition placeholder:text-zinc-400 focus:border-foreground/40 focus:ring-2 focus:ring-foreground/8"
              minLength={8}
              name="password"
              placeholder="Create a password"
              required
              type="password"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-foreground">
            Confirm password
            <input
              autoComplete="new-password"
              className="w-full rounded-lg border border-line bg-white px-3 py-3 text-sm text-foreground outline-none transition placeholder:text-zinc-400 focus:border-foreground/40 focus:ring-2 focus:ring-foreground/8"
              minLength={8}
              name="confirmPassword"
              placeholder="Confirm your password"
              required
              type="password"
            />
          </label>
        </div>
        <SubmitButton>Create account &amp; go live</SubmitButton>
      </form>
    </Panel>
  );
}

