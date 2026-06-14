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
    </div>
  );
}
