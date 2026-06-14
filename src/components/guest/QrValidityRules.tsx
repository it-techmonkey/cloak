const rules = [
  {
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    heading: "Venue-bound",
    body: "Your pass is tied to the venue you select. It can only be activated and collected there.",
  },
  {
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    heading: "Valid for 24 hours",
    body: "Unused passes expire after 24 hours. Activated passes stay open until you collect.",
  },
  {
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    heading: "Fallback code included",
    body: "Every pass includes a plain-text CLK-… code. Staff can type it manually if the QR can't be scanned.",
  },
  {
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    heading: "One pass per visit",
    body: "Each pass covers a single drop-off. Create a new one if you need to store items again.",
  },
];

export default function QrValidityRules() {
  return (
    <div className="rounded-2xl border border-line bg-white p-6 shadow-sm">
      <p className="mb-5 text-sm font-semibold text-foreground">How your pass works</p>
      <div className="grid gap-4">
        {rules.map((rule) => (
          <div className="flex gap-3.5" key={rule.heading}>
            <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-foreground">
              {rule.icon}
            </span>
            <div>
              <p className="text-sm font-semibold text-foreground">{rule.heading}</p>
              <p className="mt-0.5 text-sm leading-6 text-muted">{rule.body}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
