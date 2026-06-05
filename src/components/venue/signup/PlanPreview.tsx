import { selectVenuePlan } from "@/app/venuesignup/actions";
import Panel from "@/components/shared/Panel";
import SubmitButton from "@/components/shared/SubmitButton";
import { venuePlans, type VenueSignupSummary } from "@/lib/venues";

export default function PlanPreview({
  error,
  venue,
}: {
  error?: string;
  venue: VenueSignupSummary | null;
}) {
  if (!venue) {
    return (
      <Panel title="Plan selection">
        <p className="text-sm leading-6 text-muted">
          Start with venue details before selecting an operating plan.
        </p>
      </Panel>
    );
  }

  return (
    <div className="grid gap-4">
      {error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
          {error}
        </p>
      ) : null}
      <div className="grid gap-4 md:grid-cols-3">
        {venuePlans.map((plan) => (
          <Panel key={plan.id} title={plan.name}>
            <form action={selectVenuePlan} className="grid h-full gap-4">
              <input name="plan" type="hidden" value={plan.id} />
              <p className="text-2xl font-semibold text-foreground">{plan.price}</p>
              <p className="text-sm leading-6 text-muted">{plan.description}</p>
              <div className="space-y-2 text-sm text-muted">
                {plan.features.map((feature) => (
                  <div className="flex gap-2" key={feature}>
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
              <div className="mt-auto">
                <SubmitButton>Select plan</SubmitButton>
              </div>
            </form>
          </Panel>
        ))}
      </div>
    </div>
  );
}
