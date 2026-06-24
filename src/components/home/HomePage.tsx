"use client";

import Link from "next/link";
import Hero from "./Hero";
import WorkflowHighlights from "./WorkflowHighlights";
import PublicHeader from "@/components/shared/PublicHeader";
import PublicFooter from "@/components/shared/PublicFooter";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <PublicHeader />
      <main>
        <Hero />
        <WorkflowHighlights />
        <CtaBand />
      </main>
      <PublicFooter />
    </div>
  );
}

const ctaImage = "/images/cta-crowd.png";

function CtaBand() {
  return (
    <section
      className="relative overflow-hidden"
      style={{
        backgroundImage: `url(${ctaImage})`,
        backgroundPosition: "center",
        backgroundSize: "cover",
      }}
    >
      <div className="absolute inset-0 bg-zinc-950/88" />
      <div className="relative mx-auto flex w-full max-w-7xl flex-col items-center gap-8 px-4 py-16 text-center sm:py-24 sm:px-6 lg:px-8">
        <div className="max-w-xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-xs font-semibold tracking-wide text-white/70">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Free to get started · No hardware
          </span>
          <h2 className="mt-5 text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Ready to upgrade<br />
            your cloakroom?
          </h2>
          <p className="mt-4 text-base leading-7 text-white/60">
            Print a QR code, stick it at the counter, and go live today. No contracts, no kit to buy.
          </p>
        </div>

        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <Link
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-7 py-3.5 text-sm font-semibold text-zinc-900 shadow-lg transition hover:bg-zinc-100 active:scale-95"
            href="/venuesignup"
          >
            Register your venue — free
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <Link
            className="inline-flex items-center justify-center rounded-xl border border-white/20 px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
            href="/book-a-demo"
          >
            Book a Demo
          </Link>
        </div>

        {/* Mini feature badges */}
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 pt-2">
          {["No hardware required", "Live in under a day", "Zero disputes", "Full analytics dashboard"].map((f) => (
            <span className="flex items-center gap-1.5 text-xs text-white/40" key={f}>
              <svg className="h-3 w-3 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                <path clipRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" fillRule="evenodd" />
              </svg>
              {f}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
