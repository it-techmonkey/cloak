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
      <Panel title="Submission review">
        <p className="text-sm leading-6 text-muted">
          Complete the previous steps before submitting the venue for approval.
        </p>
      </Panel>
    );
  }

  return (
    <Panel
      title="Submission review"
      description="Review the registration and create the venue manager login before platform review."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <FieldPreview label="Venue" value={venue.name} />
        <FieldPreview label="Contact email" value={venue.contactEmail} />
        <FieldPreview label="Plan" value={formatPlan(venue.billingPlan)} />
        <FieldPreview label="Billing" value="Plan selected" />
        <FieldPreview label="Platform status" value="Pending approval" />
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
              className="w-full rounded-lg border border-line bg-white px-3 py-3 text-sm text-foreground outline-none transition placeholder:text-slate-400 focus:border-brand focus:ring-2 focus:ring-brand/15"
              minLength={8}
              name="password"
              placeholder="Minimum 8 characters"
              required
              type="password"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-foreground">
            Confirm password
            <input
              autoComplete="new-password"
              className="w-full rounded-lg border border-line bg-white px-3 py-3 text-sm text-foreground outline-none transition placeholder:text-slate-400 focus:border-brand focus:ring-2 focus:ring-brand/15"
              minLength={8}
              name="confirmPassword"
              placeholder="Re-enter password"
              required
              type="password"
            />
          </label>
        </div>
        <SubmitButton>Submit for approval</SubmitButton>
      </form>
    </Panel>
  );
}
