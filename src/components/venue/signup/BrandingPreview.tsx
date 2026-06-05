import { finishVenueSignup } from "@/app/venuesignup/actions";
import FieldPreview from "@/components/shared/FieldPreview";
import Panel from "@/components/shared/Panel";
import type { VenueSignupSummary } from "@/lib/venues";

function formatPlan(plan: VenueSignupSummary["billingPlan"]) {
  if (plan === "per_event") {
    return "Per event";
  }

  return plan ? plan.charAt(0).toUpperCase() + plan.slice(1) : "Not selected";
}

export default function BrandingPreview({ venue }: { venue: VenueSignupSummary | null }) {
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
      description="Review the registration before sending it to the platform admin."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <FieldPreview label="Venue" value={venue.name} />
        <FieldPreview label="Contact email" value={venue.contactEmail} />
        <FieldPreview label="Plan" value={formatPlan(venue.billingPlan)} />
        <FieldPreview label="Billing" value="Dummy billing recorded" />
        <FieldPreview label="Admin status" value="Pending approval" />
        <FieldPreview label="Guest visibility" value="Hidden until approved" />
      </div>
      <form action={finishVenueSignup} className="mt-5">
        <button
          className="w-full rounded-lg bg-gradient-to-r from-brand to-brand-dark px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-95"
          type="submit"
        >
          Submit for approval
        </button>
      </form>
    </Panel>
  );
}
