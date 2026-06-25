import Link from "next/link";
import BrandingPreview from "./BrandingPreview";
import PlanPreview from "./PlanPreview";
import VenueDetailsPreview from "./VenueDetailsPreview";
import { clearPlanFromDraft } from "@/app/venuesignup/actions";
import type { VenueSignupSummary } from "@/lib/venues";

const STEPS = [
  { label: "Choose plan" },
  { label: "Venue details" },
  { label: "Review & submit" },
];

function SignupStepper({ step }: { step: 1 | 2 | 3 }) {
  return (
    <nav aria-label="Progress" className="mx-auto w-full max-w-sm">
      <ol className="flex items-center">
        {STEPS.map((s, i) => {
          const num = i + 1;
          const isDone = num < step;
          const isCurrent = num === step;
          const isUpcoming = num > step;
          const isLast = i === STEPS.length - 1;

          return (
            <li className={`flex items-center ${isLast ? "" : "flex-1"}`} key={s.label}>
              <div className="flex flex-col items-center gap-1.5">
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition
                    ${isDone ? "bg-emerald-500 text-white" : ""}
                    ${isCurrent ? "bg-foreground text-white ring-4 ring-foreground/20" : ""}
                    ${isUpcoming ? "border-2 border-line bg-white text-muted" : ""}
                  `}
                >
                  {isDone ? (
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    num
                  )}
                </span>
                <span className={`text-xs font-medium ${isCurrent ? "text-foreground" : "text-muted"}`}>
                  {s.label}
                </span>
              </div>
              {!isLast && (
                <div className={`mx-2 mb-5 h-0.5 flex-1 rounded ${isDone ? "bg-emerald-400" : "bg-line"}`} />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default function VenueSignupPage({
  billingPlan,
  error,
  step = 1,
  venue,
}: {
  billingPlan?: string | null;
  error?: string;
  step?: 1 | 2 | 3;
  venue?: VenueSignupSummary | null;
}) {
  const titles = {
    1: "Choose your plan",
    2: "Venue details",
    3: "Review & submit",
  };

  const subtitles = {
    1: "Pick the plan that fits your operation. You can change later.",
    2: "Tell us about your venue and contact details.",
    3: "Confirm everything and create your manager account.",
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link className="flex items-center gap-2.5" href="/">
            <img alt="Cloak" className="h-8 w-8 rounded-lg object-cover" src="/images/cloak-logo.png" />
            <span className="text-sm font-semibold text-foreground">Cloak</span>
          </Link>
          {/* Back navigation — context-aware per step */}
          {step === 1 && (
            <Link
              className="flex items-center gap-1.5 text-sm font-medium text-muted transition hover:text-foreground"
              href="/"
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path d="M19 12H5M12 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Back
            </Link>
          )}
          {step === 2 && (
            <form action={clearPlanFromDraft}>
              <button
                className="flex items-center gap-1.5 text-sm font-medium text-muted transition hover:text-foreground"
                type="submit"
              >
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path d="M19 12H5M12 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Back to plan
              </button>
            </form>
          )}
          {step === 3 && (
            <form action={clearPlanFromDraft}>
              <input name="keepPlan" type="hidden" value="1" />
              <button
                className="flex items-center gap-1.5 text-sm font-medium text-muted transition hover:text-foreground"
                type="submit"
              >
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path d="M19 12H5M12 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Back to details
              </button>
            </form>
          )}
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
        <SignupStepper step={step} />

        <div className="flex flex-col items-center text-center">
          <img alt="Cloak" className="h-12 w-12 rounded-xl object-cover shadow" src="/images/cloak-logo.png" />
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground">{titles[step]}</h1>
          <p className="mt-2 max-w-sm text-sm leading-6 text-muted">{subtitles[step]}</p>
        </div>

        <div className="w-full">
          {step === 1 ? <PlanPreview error={error} /> : null}
          {step === 2 ? <VenueDetailsPreview billingPlan={billingPlan ?? null} error={error} /> : null}
          {step === 3 ? <BrandingPreview error={error} venue={venue ?? null} /> : null}
        </div>
      </main>
    </div>
  );
}
