import { selectVenuePlan } from "@/app/venuesignup/actions";
import Panel from "@/components/shared/Panel";
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
              <button
                className="mt-auto rounded-lg bg-gradient-to-r from-brand to-brand-dark px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-95"
                type="submit"
              >
                Select plan
              </button>
            </form>
          </Panel>
        ))}
      </div>
    </div>
  );
}
