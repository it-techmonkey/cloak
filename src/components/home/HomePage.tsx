"use client";

import Link from "next/link";
import { useState } from "react";
import Hero from "./Hero";
import WorkflowHighlights from "./WorkflowHighlights";
import AuthButton from "@/components/auth/AuthButton";

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

function PublicHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link className="flex items-center gap-2.5" href="/">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-foreground text-xs font-bold text-white">
            CL
          </span>
          <span className="text-sm font-semibold tracking-tight text-foreground">Cloak</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-0.5 sm:flex">
          <Link
            className="rounded-lg px-3.5 py-2 text-sm font-medium text-muted transition hover:bg-zinc-50 hover:text-foreground"
            href="#how-it-works"
          >
            How it works
          </Link>
          <Link
            className="rounded-lg px-3.5 py-2 text-sm font-medium text-muted transition hover:bg-zinc-50 hover:text-foreground"
            href="/venues"
          >
            For venues
          </Link>
        </nav>

        <div className="flex items-center gap-2.5">
          <AuthButton />
          <Link
            className="hidden rounded-lg bg-foreground px-4 py-2 text-sm font-semibold text-white transition hover:opacity-85 sm:block"
            href="/customer-signup"
          >
            Get your pass
          </Link>
          <button
            aria-label="Toggle menu"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-white text-muted transition hover:text-foreground sm:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            type="button"
          >
            {mobileOpen ? (
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" />
              </svg>
            ) : (
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-line bg-white sm:hidden">
          <nav className="flex flex-col gap-1 px-4 py-4">
            <Link
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted hover:bg-zinc-50 hover:text-foreground"
              href="#how-it-works"
              onClick={() => setMobileOpen(false)}
            >
              How it works
            </Link>
            <Link
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted hover:bg-zinc-50 hover:text-foreground"
              href="/venues"
              onClick={() => setMobileOpen(false)}
            >
              For venues
            </Link>
            <div className="mt-2 border-t border-line pt-3">
              <Link
                className="block rounded-lg bg-foreground px-3 py-3 text-center text-sm font-semibold text-white"
                href="/customer-signup"
                onClick={() => setMobileOpen(false)}
              >
                Get your pass
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

const ctaImage = "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=1600&q=80";

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
      <div className="relative mx-auto flex w-full max-w-7xl flex-col items-center gap-8 px-4 py-24 text-center sm:px-6 lg:px-8">
        <div className="max-w-xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-xs font-semibold tracking-wide text-white/70">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Free for guests · Always
          </span>
          <h2 className="mt-5 text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Ready to ditch<br />
            paper tickets?
          </h2>
          <p className="mt-4 text-base leading-7 text-white/60">
            Get a digital cloakroom pass in under a minute. No app, no account, no friction.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-7 py-3.5 text-sm font-semibold text-zinc-900 shadow-lg transition hover:bg-zinc-100 active:scale-95"
            href="/customer-signup"
          >
            Get your pass — it&apos;s free
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <Link
            className="inline-flex items-center justify-center rounded-xl border border-white/20 px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
            href="/venues"
          >
            Register your venue
          </Link>
        </div>

        {/* Mini feature badges */}
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 pt-2">
          {["No account required", "Works on any phone", "QR + text fallback", "Staff-verified"].map((f) => (
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

function PublicFooter() {
  return (
    <footer className="bg-zinc-950 text-white">
      <div className="mx-auto w-full max-w-7xl px-4 pt-16 pb-10 sm:px-6 lg:px-8">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link className="flex items-center gap-2.5" href="/">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-white text-xs font-bold text-zinc-950">CL</span>
              <span className="text-sm font-semibold text-white">Cloak</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-6 text-white/45">
              Digital cloakroom management for venues and their guests. Paper-free from check-in to collection.
            </p>
          </div>

          {/* Guests */}
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-white/35">Guests</p>
            <div className="flex flex-col gap-3 text-sm text-white/55">
              <Link className="transition hover:text-white" href="/customer-signup">Get a pass</Link>
              <Link className="transition hover:text-white" href="#how-it-works">How it works</Link>
            </div>
          </div>

          {/* Venues */}
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-white/35">Venues</p>
            <div className="flex flex-col gap-3 text-sm text-white/55">
              <Link className="transition hover:text-white" href="/venues">Why Cloak</Link>
              <Link className="transition hover:text-white" href="/venuesignup">Register</Link>
              <Link className="transition hover:text-white" href="/register-interest">Talk to us</Link>
            </div>
          </div>

          {/* Company */}
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-white/35">Company</p>
            <div className="flex flex-col gap-3 text-sm text-white/55">
              <Link className="transition hover:text-white" href="/register-interest">Contact</Link>
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row sm:items-center">
          <p className="text-xs text-white/25">
            © {new Date().getFullYear()} Cloak by TechMonkeys. All rights reserved.
          </p>
          <div className="flex gap-4">
            {[
              { label: "Guests", href: "/customer-signup" },
              { label: "Venues", href: "/venues" },
              { label: "Contact", href: "/register-interest" },
            ].map((l) => (
              <Link className="text-xs text-white/30 transition hover:text-white/70" href={l.href} key={l.label}>
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
