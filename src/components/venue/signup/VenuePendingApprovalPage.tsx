import { PrimaryLink, SecondaryLink } from "@/components/shared/ButtonLink";
import FieldPreview from "@/components/shared/FieldPreview";
import Panel from "@/components/shared/Panel";
import StatusPill from "@/components/shared/StatusPill";
import type { VenueSignupSummary } from "@/lib/venues";

function formatPlan(plan: VenueSignupSummary["billingPlan"] | undefined) {
  if (plan === "per_event") {
    return "Per event";
  }

  return plan ? plan.charAt(0).toUpperCase() + plan.slice(1) : "Pending";
}

export default function VenuePendingApprovalPage({
  venue,
}: {
  venue: VenueSignupSummary | null;
}) {
  return (
    <div className="min-h-screen bg-[#eef3fa] text-foreground">
      <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center gap-5 px-4 py-7 sm:px-6">
        <div className="flex flex-col items-center text-center">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-linear-to-br from-brand to-brand-dark text-lg font-semibold text-white shadow-lg">
            CL
          </div>
          <StatusPill tone="warning">Pending platform approval</StatusPill>
          <h1 className="mt-4 text-3xl font-semibold text-foreground">Venue submitted</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
            Your venue registration and manager account are ready. The platform team will review
            your submission — approvals typically complete within one business day.
          </p>
        </div>

        <Panel title="What happens next">
          <div className="grid gap-4 sm:grid-cols-2">
            <FieldPreview label="Venue" value={venue?.name ?? "Submitted venue"} />
            <FieldPreview label="Plan" value={formatPlan(venue?.billingPlan)} />
            <FieldPreview label="Billing" value="Plan selected — not charged until approved" />
            <FieldPreview label="Visibility" value="Hidden until approved" />
            <FieldPreview label="Review status" value="Awaiting platform review" />
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <SecondaryLink href="/">Back home</SecondaryLink>
            <PrimaryLink href="/register-interest">Contact support</PrimaryLink>
          </div>
        </Panel>
      </main>
    </div>
  );
}
