import Link from "next/link";

const productImage = "/images/qr-pass-hand.png";
const counterImage = "/images/cloakroom-scan.png";

const venueBenefits = [
  {
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0a4 4 0 11-8 0 4 4 0 018 0zM6 20h4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    heading: "Paperless tickets",
    body: "Replace paper stubs with digital QR passes. No more printing, running out of tickets, or handwriting disputes.",
  },
  {
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    heading: "Data analytics",
    body: "Track footfall, peak hours, and item volumes in real time. Make staffing decisions with actual data.",
  },
  {
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    heading: "Zero-dispute handovers",
    body: "Every item logged at drop-off with type, count, location, and a timestamp. Full audit trail at your fingertips.",
  },
  {
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    heading: "Environmentally friendly",
    body: "Eliminate single-use paper tickets entirely. Every event runs greener without changing your workflow.",
  },
  {
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path d="M12 4v1m6.364 1.636l-.707.707M20 12h-1M17.657 17.657l-.707-.707M12 19v1M6.343 17.657l-.707.707M4 12H3M6.343 6.343l.707.707" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    heading: "Zero setup friction",
    body: "Print a QR code, stick it at the counter. No app, no account, no training required — live in under a day.",
  },
  {
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    heading: "Free to get started",
    body: "No upfront cost, no hardware to buy. Register your venue and go live the same day.",
  },
];

const howItWorksSteps = [
  {
    num: "01",
    title: "Guest creates their QR pass",
    description: "Before arriving, guests visit your Cloak check-in link and generate a venue-bound QR pass in seconds — no app, no account.",
  },
  {
    num: "02",
    title: "Staff scan and log at the counter",
    description: "Your team scans the guest's QR code. Items, count, and storage slot are logged instantly — everything timestamped.",
  },
  {
    num: "03",
    title: "Live dashboard updates in real time",
    description: "Managers see capacity, pending slots, and hourly volume live. No spreadsheets, no end-of-night counting.",
  },
  {
    num: "04",
    title: "Guest scans to collect",
    description: "At collection, guests present their QR code. Staff scan and return items — ticket closes automatically. Zero disputes.",
  },
];

const liveInFourSteps = [
  { num: "01", title: "Register your venue", body: "Fill in your details and select a plan. Takes under five minutes." },
  { num: "02", title: "Get reviewed", body: "Our team reviews submissions within one business day and activates your account." },
  { num: "03", title: "Add your staff", body: "Create logins for counter staff from the settings panel. They only need a phone." },
  { num: "04", title: "Go live", body: "Share your check-in link. Guests create passes before they even queue." },
];

export default function WorkflowHighlights() {
  return (
    <div className="bg-background">

      {/* ── Venue Benefits ─────────────────────────────────────────────────────── */}
      <section className="mx-auto w-full max-w-7xl px-4 py-14 sm:py-20 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-lg">
            <span className="inline-block rounded-full border border-line bg-white px-3 py-1 text-xs font-semibold uppercase tracking-widest text-muted">
              Why venues choose Cloak
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
              Your counter.<br />
              <span className="text-muted">Upgraded in a day.</span>
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-7 text-muted lg:text-right">
            No hardware, no long contracts. Print a QR code and your guests check themselves in.
          </p>
        </div>

        <div className="mt-10 grid gap-10 lg:mt-14 lg:grid-cols-[1fr_1.1fr] lg:items-start lg:gap-16">
          {/* Benefit list */}
          <div className="grid gap-5 sm:gap-6">
            {venueBenefits.map((b) => (
              <div className="flex gap-4" key={b.heading}>
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-foreground">
                  {b.icon}
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">{b.heading}</p>
                  <p className="mt-1 text-sm leading-6 text-muted">{b.body}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Product image */}
          <div className="relative hidden overflow-hidden rounded-2xl lg:block lg:sticky lg:top-24">
            <img
              alt="Cloak product in action at a cloakroom counter"
              className="h-130 w-full object-cover"
              src={counterImage}
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-5 left-5 right-5">
              <div className="rounded-xl border border-white/15 bg-black/60 px-4 py-3 backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500 text-xs font-bold text-white">✓</span>
                  <div>
                    <p className="text-xs font-semibold text-white">Zero disputes logged</p>
                    <p className="text-[11px] text-white/60">All handovers timestamped &amp; logged</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-foreground px-6 py-3.5 text-sm font-semibold text-white transition hover:opacity-85 active:scale-95"
            href="/venuesignup"
          >
            Register your venue — free
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <Link
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-line px-6 py-3.5 text-sm font-semibold text-foreground transition hover:bg-zinc-50"
            href="/book-a-demo"
          >
            Book a Demo
          </Link>
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────────────────────────── */}
      <section id="how-it-works" className="border-y border-line bg-white">
        <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:py-20 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-lg">
              <span className="inline-block rounded-full border border-line bg-background px-3 py-1 text-xs font-semibold uppercase tracking-widest text-muted">
                How it works
              </span>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
                From check-in to<br />
                <span className="text-muted">collection — seamless.</span>
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-7 text-muted lg:text-right">
              A paper-free flow built around real venue counter operations — from your phone to the hook and back.
            </p>
          </div>

          <div className="mt-10 grid gap-6 lg:mt-14 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
            {/* Step list */}
            <div className="grid gap-0 divide-y divide-line">
              {howItWorksSteps.map((step) => (
                <div className="flex gap-5 py-5 first:pt-0 last:pb-0 sm:gap-6 sm:py-6" key={step.num}>
                  <span className="mt-0.5 shrink-0 font-mono text-sm font-bold text-zinc-300">{step.num}</span>
                  <div>
                    <p className="text-sm font-semibold text-foreground sm:text-base">{step.title}</p>
                    <p className="mt-1 text-sm leading-6 text-muted">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Visual: product screenshot */}
            <div className="relative hidden overflow-hidden rounded-2xl lg:block lg:sticky lg:top-24">
              <img
                alt="Staff scanning a guest QR pass at a cloakroom counter"
                className="h-80 w-full object-cover lg:h-105"
                src={productImage}
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-5 left-5 right-5">
                <div className="rounded-xl border border-white/15 bg-black/60 px-4 py-3 backdrop-blur-md">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500 text-xs font-bold text-white">✓</span>
                    <div>
                      <p className="text-xs font-semibold text-white">Pass activated</p>
                      <p className="text-[11px] text-white/60">Slot 42 · 2 items logged</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Live in Four Steps ────────────────────────────────────────────────── */}
      <section className="mx-auto w-full max-w-7xl px-4 py-14 sm:py-20 sm:px-6 lg:px-8">
        <div className="text-center">
          <span className="inline-block rounded-full border border-line bg-background px-3 py-1 text-xs font-semibold uppercase tracking-widest text-muted">
            Getting started
          </span>
          <h2 className="mx-auto mt-4 max-w-xl text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Live in four steps.
          </h2>
          <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-muted">
            From registration to your first live event — in under a day.
          </p>
        </div>
        <div className="mt-12 grid gap-0 divide-y divide-line sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
          {liveInFourSteps.map((s) => (
            <div className="px-6 py-8 first:pl-0 last:pr-0 sm:first:pl-0 sm:last:pr-0" key={s.num}>
              <span className="font-mono text-3xl font-bold text-zinc-200">{s.num}</span>
              <h3 className="mt-4 text-base font-semibold text-foreground">{s.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{s.body}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-foreground px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-85 active:scale-95"
            href="/venuesignup"
          >
            Register your venue — free
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <Link
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-line px-6 py-3.5 text-sm font-semibold text-foreground transition hover:bg-zinc-50"
            href="/book-a-demo"
          >
            Book a Demo
          </Link>
        </div>
      </section>

      {/* ── Cloak Mission ─────────────────────────────────────────────────────── */}
      <section className="border-t border-line bg-zinc-950">
        <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-8 px-4 py-20 text-center sm:py-28 sm:px-6 lg:px-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-3.5 py-1.5 text-xs font-semibold tracking-wide text-white/60">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Our mission
          </span>
          <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            We&apos;re building the future<br />
            <span className="text-white/50">of venue operations.</span>
          </h2>
          <p className="max-w-2xl text-base leading-8 text-white/55">
            Cloak was born from a simple observation: cloakrooms at live events still run on paper tickets torn from a roll — the same way they did fifty years ago. Lost tickets cause disputes. Paper creates waste. And venue managers have no visibility into what&apos;s happening at the counter.
          </p>
          <p className="max-w-2xl text-base leading-8 text-white/55">
            Our aim is to give every venue — from a 200-capacity club to a festival site — the tools to run a frictionless, data-driven cloakroom operation. Paperless. Dispute-free. And live from day one.
          </p>
          <div className="mt-2 flex flex-wrap justify-center gap-x-10 gap-y-3">
            {["Paperless operations", "Zero disputes", "Real-time visibility", "Sustainable events"].map((v) => (
              <span className="flex items-center gap-2 text-sm text-white/40" key={v}>
                <svg className="h-3.5 w-3.5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                  <path clipRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" fillRule="evenodd" />
                </svg>
                {v}
              </span>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
