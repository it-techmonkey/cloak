import Link from "next/link";

const heroImage =
  "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=2000&q=85";

export default function Hero() {
  return (
    <>
      <section
        className="relative min-h-[88svh] overflow-hidden bg-zinc-950"
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundPosition: "center 30%",
          backgroundSize: "cover",
        }}
      >
        {/* Layered overlays for depth */}
        <div className="absolute inset-0 bg-linear-to-r from-black/90 via-black/60 to-black/20" />
        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent" />

        <div className="relative mx-auto flex min-h-[88svh] w-full max-w-7xl flex-col justify-end pb-20 px-4 sm:px-6 lg:justify-center lg:pb-0 lg:py-24 lg:px-8">
          <div className="max-w-xl">
            {/* Eyebrow pill */}
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span className="text-xs font-semibold tracking-wide text-white/80">
                Digital cloakroom — no app needed
              </span>
            </div>

            <h1 className="mt-6 text-5xl font-bold leading-[1.08] tracking-tight text-white sm:text-6xl lg:text-7xl">
              Leave your&nbsp;stuff.<br />
              <span className="text-white/60">Not your&nbsp;worry.</span>
            </h1>

            <p className="mt-6 max-w-md text-base leading-7 text-white/70">
              Cloak turns your phone into a digital cloakroom ticket — venue-bound, staff-verified, and gone when you're done.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-zinc-900 shadow-lg transition hover:bg-zinc-100 active:scale-95"
                href="/customer-signup"
              >
                Get your free pass
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <Link
                className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/15"
                href="#how-it-works"
              >
                See how it works
              </Link>
            </div>

            {/* Inline trust badges */}
            <div className="mt-10 flex flex-wrap gap-x-6 gap-y-2">
              {[
                "No account required",
                "Works on any phone",
                "QR + text fallback",
              ].map((t) => (
                <div className="flex items-center gap-1.5 text-xs text-white/55" key={t}>
                  <svg className="h-3.5 w-3.5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                    <path clipRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" fillRule="evenodd" />
                  </svg>
                  {t}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom scroll cue */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden lg:flex flex-col items-center gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-white/30">Scroll</span>
          <div className="h-8 w-px bg-linear-to-b from-white/30 to-transparent" />
        </div>
      </section>

      {/* Social-proof bar */}
      <div className="border-b border-line bg-white">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-6 px-4 py-5 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
            Trusted at venues across the UK
          </p>
          <div className="flex flex-wrap items-center gap-8">
            {[
              { stat: "30 sec", label: "Avg. drop-off" },
              { stat: "Zero disputes", label: "With digital tracking" },
              { stat: "100% paper-free", label: "End-to-end flow" },
            ].map((s) => (
              <div className="flex items-baseline gap-2" key={s.stat}>
                <span className="text-sm font-bold text-foreground">{s.stat}</span>
                <span className="text-xs text-muted">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
