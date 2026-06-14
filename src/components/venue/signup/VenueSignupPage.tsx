import Link from "next/link";
import BrandingPreview from "./BrandingPreview";
import PlanPreview from "./PlanPreview";
import VenueDetailsPreview from "./VenueDetailsPreview";
import type { VenueSignupSummary } from "@/lib/venues";

const STEPS = [
  { label: "Venue details" },
  { label: "Plan" },
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
  error,
  step = 1,
  venue,
}: {
  error?: string;
  step?: 1 | 2 | 3;
  venue?: VenueSignupSummary | null;
}) {
  const titles = {
    1: "Register your venue",
    2: "Select your plan",
    3: "Review & submit",
  };

  const subtitles = {
    1: "Start with the basics — takes under two minutes.",
    2: "Choose the plan that fits your operation.",
    3: "Confirm everything before we review your application.",
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link className="flex items-center gap-2.5" href="/">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-foreground text-xs font-bold text-white">CL</span>
            <span className="text-sm font-semibold text-foreground">Cloak</span>
          </Link>
          <Link
            className="flex items-center gap-1.5 text-sm font-medium text-muted transition hover:text-foreground"
            href="/venues"
          >
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M19 12H5M12 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back
          </Link>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-10 sm:px-6">
        <SignupStepper step={step} />

        <div className="flex flex-col items-center text-center">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-foreground text-sm font-bold text-white shadow">
            CL
          </div>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground">{titles[step]}</h1>
          <p className="mt-2 max-w-sm text-sm leading-6 text-muted">{subtitles[step]}</p>
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
