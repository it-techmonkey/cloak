import Link from "next/link";
import type { VenueSignupSummary } from "@/lib/venues";

function formatPlan(plan: VenueSignupSummary["billingPlan"] | undefined) {
  if (plan === "per_event") return "Per event";
  return plan ? plan.charAt(0).toUpperCase() + plan.slice(1) : "Pending";
}

const timelineSteps = [
  {
    key: "submitted",
    label: "Submitted",
    detail: "Your venue details and plan have been received.",
  },
  {
    key: "review",
    label: "Under review",
    detail: "The platform team is checking your submission. Typically within one business day.",
  },
  {
    key: "approved",
    label: "Approved & live",
    detail: "You will be able to log in and start accepting check-ins immediately.",
  },
];

export default function VenuePendingApprovalPage({
  venue,
}: {
  venue: VenueSignupSummary | null;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto flex min-h-screen w-full max-w-xl flex-col justify-center gap-8 px-4 py-12 sm:px-6">
        {/* Hero */}
        <div className="flex flex-col items-center text-center">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-foreground text-lg font-semibold text-white shadow-lg">
            CL
          </div>
          <span className="mt-4 inline-flex items-center rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 border border-amber-200">
            Pending review
          </span>
          <h1 className="mt-3 text-3xl font-semibold text-foreground">
            {venue?.name ?? "Venue"} submitted
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted">
            Your venue registration is complete. We will review it and get you live.
          </p>
        </div>

        {/* Timeline */}
        <div className="rounded-xl border border-line bg-panel p-6">
          <ol className="space-y-0">
            {timelineSteps.map((s, i) => {
              const isDone = i === 0;
              const isCurrent = i === 1;
              const isLast = i === timelineSteps.length - 1;

              return (
                <li className="flex gap-4" key={s.key}>
                  {/* Node + line */}
                  <div className="flex flex-col items-center">
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold
                        ${isDone ? "bg-emerald-500 text-white" : ""}
                        ${isCurrent ? "bg-amber-400 text-white" : ""}
                        ${!isDone && !isCurrent ? "border-2 border-line bg-white text-muted" : ""}
                      `}
                    >
                      {isDone ? (
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                          <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      ) : isCurrent ? (
                        <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 8 8">
                          <circle cx="4" cy="4" r="3" />
                        </svg>
                      ) : (
                        i + 1
                      )}
                    </span>
                    {!isLast && (
                      <div className={`mt-1 w-0.5 flex-1 ${isDone ? "bg-emerald-300" : "bg-line"}`} style={{ minHeight: "2rem" }} />
                    )}
                  </div>

                  {/* Text */}
                  <div className={`pb-6 ${isLast ? "pb-0" : ""}`}>
                    <p className={`text-sm font-semibold ${isCurrent ? "text-amber-700" : isDone ? "text-emerald-700" : "text-muted"}`}>
                      {s.label}
                    </p>
                    <p className="mt-0.5 text-xs leading-5 text-muted">{s.detail}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>

        {/* Summary strip */}
        {venue && (
          <div className="grid grid-cols-2 gap-3 rounded-xl border border-line bg-panel p-5 sm:grid-cols-4">
            {[
              { label: "Venue", value: venue.name },
              { label: "Plan", value: formatPlan(venue.billingPlan) },
              { label: "Billing", value: "Not charged yet" },
              { label: "Visibility", value: "Hidden until approved" },
            ].map((f) => (
              <div key={f.label}>
                <p className="text-xs text-muted">{f.label}</p>
                <p className="mt-0.5 text-sm font-semibold text-foreground">{f.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="grid gap-3 sm:grid-cols-2">
          <Link
            className="flex items-center justify-center rounded-xl border border-line bg-white px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-zinc-50"
            href="/"
          >
            Back home
          </Link>
          <Link
            className="flex items-center justify-center rounded-xl bg-foreground px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
            href="/register-interest"
          >
            Contact support
          </Link>
        </div>
      </main>
    </div>
  );
}

