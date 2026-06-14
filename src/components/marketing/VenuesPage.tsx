import Link from "next/link";

const heroImg = "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&w=1800&q=85";
const dashImg = "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80";
const scanImg = "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=900&q=80";
const crowdImg = "https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=900&q=80";

const features = [
  {
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path d="M13 10V3L4 14h7v7l9-11h-7z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: "Faster counter flow",
    body: "Guests arrive with a QR pass already created. Staff scan and activate in seconds — no paper, no handwriting.",
  },
  {
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: "Zero-dispute handovers",
    body: "Every item is logged at drop-off with type, count, location, and a timestamp. No more he-said-she-said.",
  },
  {
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: "Live capacity view",
    body: "See how many slots are in use in real time. Know when you're approaching full before it becomes a problem.",
  },
  {
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: "Multi-staff access",
    body: "Give each counter staff member their own login. Managers see the full dashboard; staff only see what they need.",
  },
  {
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0a4 4 0 11-8 0 4 4 0 018 0zM6 20h4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: "QR + text fallback",
    body: "Every pass has both a QR code and a plain-text fallback code. Queues keep moving even when cameras struggle.",
  },
  {
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: "Analytics included",
    body: "Hourly ticket volume, item-type breakdown, peak-hour callouts. Export nothing — it's all in the dashboard.",
  },
];

const steps = [
  { num: "01", title: "Register your venue", body: "Fill in your details and select a plan. Takes under five minutes." },
  { num: "02", title: "Get reviewed", body: "Our team reviews submissions within one business day and activates your account." },
  { num: "03", title: "Add your staff", body: "Create logins for counter staff from the settings panel. They only need a phone." },
  { num: "04", title: "Go live", body: "Share your check-in link. Guests create passes before they even queue." },
];

const faqs = [
  {
    q: "Do guests need to download an app?",
    a: "No. Guests access their pass in a browser — any phone, any OS. No account, no download.",
  },
  {
    q: "What if a guest's phone dies?",
    a: "Every pass has a plain-text fallback code printed on the ticket detail page. Staff can look it up manually.",
  },
  {
    q: "How long does setup take?",
    a: "Under five minutes to register. One business day for review. On approval, your dashboard is live immediately.",
  },
  {
    q: "Is there a cost for venues?",
    a: "We offer a trialing period so you can run live events before committing. Contact us if you want to talk numbers.",
  },
];

export default function VenuesPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* ── Slim header ────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link className="flex items-center gap-2.5" href="/">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-foreground text-xs font-bold text-white">CL</span>
            <span className="text-sm font-semibold tracking-tight text-foreground">Cloak</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link className="hidden text-sm font-medium text-muted transition hover:text-foreground sm:block" href="/">
              ← Back to home
            </Link>
            <Link
              className="rounded-lg bg-foreground px-4 py-2 text-sm font-semibold text-white transition hover:opacity-85"
              href="/venuesignup"
            >
              Register venue
            </Link>
          </div>
        </div>
      </header>

      <main>

        {/* ── Hero ─────────────────────────────────────────────────────────────── */}
        <section
          className="relative overflow-hidden"
          style={{ backgroundImage: `url(${heroImg})`, backgroundPosition: "center 40%", backgroundSize: "cover" }}
        >
          <div className="absolute inset-0 bg-linear-to-r from-zinc-950/95 via-zinc-950/70 to-zinc-950/30" />
          <div className="absolute inset-0 bg-linear-to-t from-zinc-950/60 via-transparent to-transparent" />
          <div className="relative mx-auto flex min-h-[72svh] w-full max-w-7xl flex-col justify-end pb-20 px-4 sm:px-6 lg:justify-center lg:pb-0 lg:py-24 lg:px-8">
            <div className="max-w-lg">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 backdrop-blur-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span className="text-xs font-semibold tracking-wide text-white/75">Built for nightclubs, events &amp; venues</span>
              </span>
              <h1 className="mt-6 text-5xl font-bold leading-[1.08] tracking-tight text-white sm:text-6xl">
                Run a smoother<br />
                cloakroom.
              </h1>
              <p className="mt-5 text-base leading-7 text-white/65">
                Replace paper tickets with a system built for real counter pressure. Guests arrive ready, staff log everything, and you see it all live.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-zinc-900 shadow-lg transition hover:bg-zinc-100 active:scale-95"
                  href="/venuesignup"
                >
                  Register your venue
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
                <Link
                  className="inline-flex items-center rounded-xl border border-white/20 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/15"
                  href="/register-interest"
                >
                  Talk to us first
                </Link>
              </div>
              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2">
                {["Setup in under 5 minutes", "1-day review", "No card to start"].map((t) => (
                  <span className="flex items-center gap-1.5 text-xs text-white/50" key={t}>
                    <svg className="h-3 w-3 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                      <path clipRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" fillRule="evenodd" />
                    </svg>
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Problem / stat strip ──────────────────────────────────────────────── */}
        <div className="border-b border-line bg-white">
          <div className="mx-auto grid w-full max-w-7xl grid-cols-2 divide-x divide-line px-4 sm:px-6 lg:grid-cols-4 lg:px-8">
            {[
              { stat: "30 sec", label: "Average activation time" },
              { stat: "Zero", label: "Paper tickets needed" },
              { stat: "Live", label: "Capacity dashboard" },
              { stat: "1 day", label: "Venue review SLA" },
            ].map((s) => (
              <div className="flex flex-col gap-1 px-6 py-6 first:pl-0" key={s.stat}>
                <span className="text-2xl font-bold tracking-tight text-foreground">{s.stat}</span>
                <span className="text-xs text-muted">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Features grid ────────────────────────────────────────────────────── */}
        <section className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-xl">
            <span className="inline-block rounded-full border border-line bg-background px-3 py-1 text-xs font-semibold uppercase tracking-widest text-muted">
              What you get
            </span>
            <h2 className="mt-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Everything your team needs.<br />
              <span className="text-muted">Nothing they don&apos;t.</span>
            </h2>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div
                className="group rounded-xl border border-line bg-white p-6 shadow-sm transition hover:border-zinc-300 hover:shadow-md"
                key={f.title}
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100 text-foreground transition group-hover:bg-foreground group-hover:text-white">
                  {f.icon}
                </span>
                <h3 className="mt-5 text-base font-semibold text-foreground">{f.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{f.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Scanner spotlight ────────────────────────────────────────────────── */}
        <section className="border-y border-line bg-zinc-50">
          <div className="mx-auto grid w-full max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:items-center lg:gap-20 lg:px-8">
            <div>
              <span className="inline-block rounded-full border border-line bg-white px-3 py-1 text-xs font-semibold uppercase tracking-widest text-muted">
                Staff experience
              </span>
              <h2 className="mt-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                Built for the counter,<br />
                <span className="text-muted">not a spreadsheet.</span>
              </h2>
              <p className="mt-4 text-sm leading-7 text-muted">
                The scanner interface is designed for one-handed use at a busy counter — big tap targets, instant feedback, and a full-screen result flash so staff can keep moving.
              </p>
              <ul className="mt-7 space-y-3">
                {[
                  "Green flash on valid scan, red on any error",
                  "Manual code entry when camera can't read QR",
                  "Activation form captures items, count, and notes",
                  "Works on any phone — no dedicated hardware",
                ].map((item) => (
                  <li className="flex items-start gap-3 text-sm" key={item}>
                    <svg className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                      <path clipRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" fillRule="evenodd" />
                    </svg>
                    <span className="text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative overflow-hidden rounded-2xl shadow-xl">
              <img
                alt="Staff member scanning a QR pass on their phone at a venue counter"
                className="h-72 w-full object-cover sm:h-96 lg:h-[480px]"
                src={scanImg}
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent" />
              <div className="absolute bottom-5 left-5 right-5">
                <div className="rounded-xl border border-white/15 bg-black/60 px-4 py-3 backdrop-blur-md">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500">
                      <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                        <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    <div>
                      <p className="text-xs font-semibold text-white">Ticket activated</p>
                      <p className="text-[11px] text-white/60">Slot 12 · 1× Coat, 1× Bag</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Crowd / Live capacity section ─────────────────────────────────────── */}
        <section className="border-b border-line bg-white">
          <div className="mx-auto grid w-full max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:items-center lg:gap-20 lg:px-8">
            <div className="relative overflow-hidden rounded-2xl shadow-xl lg:order-last">
              <img
                alt="Busy event crowd — the venue environment Cloak is designed for"
                className="h-72 w-full object-cover sm:h-96 lg:h-[460px]"
                src={crowdImg}
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent" />
              <div className="absolute right-4 top-4 rounded-xl border border-white/20 bg-white/90 px-4 py-3 backdrop-blur-md shadow-lg">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">Slots in use</p>
                <p className="mt-0.5 text-2xl font-bold text-foreground">68 / 100</p>
                <div className="mt-2 h-1.5 w-24 overflow-hidden rounded-full bg-zinc-200">
                  <div className="h-full w-[68%] rounded-full bg-amber-400" />
                </div>
              </div>
            </div>
            <div>
              <span className="inline-block rounded-full border border-line bg-background px-3 py-1 text-xs font-semibold uppercase tracking-widest text-muted">
                Live dashboard
              </span>
              <h2 className="mt-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                Know your capacity<br />
                <span className="text-muted">before it&apos;s full.</span>
              </h2>
              <p className="mt-4 text-sm leading-7 text-muted">
                The manager dashboard updates in real time via live data subscriptions. Pending, stored, collected, and capacity — all visible at a glance without refreshing.
              </p>
              <div className="mt-8 grid grid-cols-2 gap-4">
                {[
                  { label: "Today", desc: "Total tickets created" },
                  { label: "Stored", desc: "Currently in slots" },
                  { label: "Collected", desc: "Returned today" },
                  { label: "Capacity %", desc: "Live utilisation" },
                ].map((s) => (
                  <div className="rounded-lg border border-line bg-zinc-50 px-4 py-3" key={s.label}>
                    <p className="text-xs font-semibold text-foreground">{s.label}</p>
                    <p className="mt-0.5 text-xs text-muted">{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── How to get started ────────────────────────────────────────────────── */}
        <section className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="inline-block rounded-full border border-line bg-background px-3 py-1 text-xs font-semibold uppercase tracking-widest text-muted">
              Getting started
            </span>
            <h2 className="mx-auto mt-4 max-w-xl text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Live in four steps.
            </h2>
          </div>
          <div className="mt-12 grid gap-0 divide-y divide-line sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
            {steps.map((s) => (
              <div className="px-6 py-8 first:pl-0 last:pr-0 sm:first:pl-0 sm:last:pr-0" key={s.num}>
                <span className="font-mono text-3xl font-bold text-zinc-200">{s.num}</span>
                <h3 className="mt-4 text-base font-semibold text-foreground">{s.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{s.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── FAQ ──────────────────────────────────────────────────────────────── */}
        <section className="border-t border-line bg-zinc-50">
          <div className="mx-auto w-full max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
            <h2 className="mb-10 text-3xl font-bold tracking-tight text-foreground">
              Common questions
            </h2>
            <div className="grid gap-0 divide-y divide-line">
              {faqs.map((faq) => (
                <div className="py-6" key={faq.q}>
                  <p className="text-base font-semibold text-foreground">{faq.q}</p>
                  <p className="mt-2 text-sm leading-6 text-muted">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Final CTA ────────────────────────────────────────────────────────── */}
        <section className="border-t border-line bg-foreground">
          <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-7 px-4 py-20 text-center sm:px-6 lg:px-8">
            <h2 className="max-w-lg text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Start running a better cloakroom today.
            </h2>
            <p className="max-w-md text-base text-white/55">
              Register in under five minutes. No card needed to get started — we review and activate you within one business day.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-7 py-3.5 text-sm font-semibold text-zinc-900 shadow-lg transition hover:bg-zinc-100 active:scale-95"
                href="/venuesignup"
              >
                Register your venue
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <Link
                className="inline-flex items-center justify-center rounded-xl border border-white/20 px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
                href="/register-interest"
              >
                Talk to us first
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-line bg-white">
        <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <Link className="flex items-center gap-2.5" href="/">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-foreground text-xs font-bold text-white">CL</span>
              <span className="text-sm font-semibold text-foreground">Cloak</span>
            </Link>
            <p className="text-xs text-muted">© {new Date().getFullYear()} Cloak by TechMonkeys.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
