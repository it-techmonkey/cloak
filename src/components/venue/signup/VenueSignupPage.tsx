import BrandingPreview from "./BrandingPreview";
import PlanPreview from "./PlanPreview";
import VenueDetailsPreview from "./VenueDetailsPreview";
import type { VenueSignupSummary } from "@/lib/venues";

export default function VenueSignupPage({
  error,
  step = 1,
  venue,
}: {
  error?: string;
  step?: 1 | 2 | 3;
  venue?: VenueSignupSummary | null;
}) {
  const titles = {
    1: "Create your venue",
    2: "Select an operating plan",
    3: "Submit for approval",
  };

  const subtitles = {
    1: "Let's start with the basic details.",
    2: "Choose the plan that matches your operation.",
    3: "Confirm the details before platform review.",
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-7 sm:px-6">
        <div className="mx-auto w-full max-w-3xl">
          <div className="flex items-center justify-between text-xs font-medium text-brand">
            <span>Step {step} of 3</span>
            <span>{step === 1 ? "Venue details" : step === 2 ? "Plan" : "Review"}</span>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-brand"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        <div className="flex flex-col items-center text-center">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-linear-to-br from-brand to-brand-dark text-lg font-semibold text-white shadow-lg">
            CL
          </div>
          <h1 className="mt-4 text-3xl font-semibold text-foreground">{titles[step]}</h1>
          <p className="mt-2 text-sm text-muted">{subtitles[step]}</p>
        </div>

        <div className="mx-auto w-full max-w-4xl">
          {step === 1 ? <VenueDetailsPreview error={error} /> : null}
          {step === 2 ? <PlanPreview error={error} venue={venue ?? null} /> : null}
          {step === 3 ? <BrandingPreview error={error} venue={venue ?? null} /> : null}
        </div>
      </main>
    </div>
  );
}
