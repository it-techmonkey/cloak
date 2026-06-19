import Link from "next/link";

const qrImage = "/images/qr-pass-hand.png";
const counterImage = "/images/cloakroom-scan.png";

const steps = [
  {
    num: "01",
    title: "Choose your venue",
    description: "Select the approved cloakroom location where your belongings will be stored. Takes five seconds.",
  },
  {
    num: "02",
    title: "Create your QR pass",
    description: "Enter your name and contact details. You get a venue-bound QR code instantly — no account, no app.",
  },
  {
    num: "03",
    title: "Hand over at the counter",
    description: "Staff scan your pass, log your items, and assign a storage slot. Everything is recorded.",
  },
  {
    num: "04",
    title: "Scan to collect",
    description: "Come back, present your QR or fallback code, and staff return your items. Ticket closes automatically.",
  },
];

const trustItems = [
  {
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    heading: "Venue-bound passes",
    body: "Each pass is cryptographically tied to one venue, preventing collection at the wrong location.",
  },
  {
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    heading: "A record at every step",
    body: "Staff log item type, count, and storage location at drop-off. Every handover is timestamped.",
  },
  {
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    heading: "Text fallback always works",
    body: "Every QR pass has a plain-text code. Staff can enter it manually when a camera can't read the QR.",
  },
];

const venueFeatures = [
  {
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path d="M12 4v1m6.364 1.636l-.707.707M20 12h-1M17.657 17.657l-.707-.707M12 19v1M6.343 17.657l-.707.707M4 12H3M6.343 6.343l.707.707" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    heading: "Zero setup friction",
    body: "Print your QR code, stick it at the counter. Guests scan and check in — no app, no account, no training required.",
  },
  {
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    heading: "Live analytics dashboard",
    body: "Track footfall, peak hours, and item volumes in real time. Make staffing decisions with actual data.",
  },
  {
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    heading: "Dispute protection built in",
    body: "Every handover is timestamped and logged against a named guest. No more he-said-she-said on the floor.",
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

export default function WorkflowHighlights() {
  return (
    <div className="bg-background">

      {/* ── How it works ──────────────────────────────────────────────────────── */}
      <section id="how-it-works" className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-lg">
            <span className="inline-block rounded-full border border-line bg-white px-3 py-1 text-xs font-semibold uppercase tracking-widest text-muted">
              For guests
            </span>
            <h2 className="mt-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Drop-off to pick-up.<br />
              <span className="text-muted">Four steps.</span>
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-7 text-muted lg:text-right">
            A paper-free flow built around real venue counter operations — from your phone to the hook and back.
          </p>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          {/* Step list */}
          <div className="grid gap-0 divide-y divide-line">
            {steps.map((step) => (
              <div className="flex gap-6 py-6 first:pt-0 last:pb-0" key={step.num}>
                <span className="mt-0.5 shrink-0 font-mono text-sm font-bold text-zinc-300">{step.num}</span>
                <div>
                  <p className="text-base font-semibold text-foreground">{step.title}</p>
                  <p className="mt-1.5 text-sm leading-6 text-muted">{step.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Visual: phone mockup with QR pass */}
          <div className="relative overflow-hidden rounded-2xl lg:sticky lg:top-24">
            <img
              alt="Guest checking in using a QR pass on their phone"
              className="h-80 w-full object-cover lg:h-[420px]"
              src={qrImage}
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
      </section>

      {/* ── Trust section ──────────────────────────────────────────────────────── */}
      <section className="border-y border-line bg-white">
        <div className="mx-auto grid w-full max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:items-center lg:gap-20 lg:px-8">
          {/* Image */}
          <div className="relative overflow-hidden rounded-2xl">
            <img
              alt="Cloakroom counter staff scanning a ticket"
              className="h-72 w-full object-cover sm:h-96 lg:h-[480px]"
              src={counterImage}
            />
            {/* Floating stat card */}
            <div className="absolute right-4 top-4 rounded-xl border border-white/20 bg-white/90 px-4 py-3 backdrop-blur-md shadow-lg">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">Disputes</p>
              <p className="mt-0.5 text-3xl font-bold text-foreground">Zero.</p>
            </div>
          </div>

          {/* Copy + trust items */}
          <div>
            <span className="inline-block rounded-full border border-line bg-background px-3 py-1 text-xs font-semibold uppercase tracking-widest text-muted">
              Built for busy counters
            </span>
            <h2 className="mt-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Fewer disputes.<br />
              <span className="text-muted">No lost tickets.</span>
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              Every design decision in Cloak starts with one question: what makes a cloakroom counter run smoothly under real pressure?
            </p>

            <div className="mt-8 grid gap-5">
              {trustItems.map((item) => (
                <div className="flex gap-4" key={item.heading}>
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-foreground">
                    {item.icon}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{item.heading}</p>
                    <p className="mt-1 text-sm leading-6 text-muted">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── For venues section ─────────────────────────────────────────────────── */}
      <section id="for-venues" className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-lg">
            <span className="inline-block rounded-full border border-line bg-white px-3 py-1 text-xs font-semibold uppercase tracking-widest text-muted">
              For venues
            </span>
            <h2 className="mt-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Your counter.<br />
              <span className="text-muted">Upgraded in a day.</span>
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-7 text-muted lg:text-right">
            No hardware, no long contracts. Print a QR code and your guests check themselves in.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {venueFeatures.map((feature) => (
            <div
              className="flex flex-col gap-4 rounded-2xl border border-line bg-white p-6"
              key={feature.heading}
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-foreground">
                {feature.icon}
              </span>
              <div>
                <p className="text-sm font-semibold text-foreground">{feature.heading}</p>
                <p className="mt-1.5 text-sm leading-6 text-muted">{feature.body}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            className="inline-flex items-center gap-2 rounded-xl bg-foreground px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-85 active:scale-95"
            href="/venuesignup"
          >
            Register your venue — free
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <Link
            className="inline-flex items-center gap-2 rounded-xl border border-line px-6 py-3.5 text-sm font-semibold text-foreground transition hover:bg-zinc-50"
            href="/register-interest"
          >
            Talk to us first
          </Link>
        </div>
      </section>
    </div>
  );
}
