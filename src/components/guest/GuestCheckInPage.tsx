import Link from "next/link";
import GuestFormPreview from "./GuestFormPreview";
import QrValidityRules from "./QrValidityRules";
import type { PublicVenueOption } from "@/lib/tickets";
import type { PublicEventOption } from "@/lib/events";

const venueImage = "/images/venue-checkin.png";

export default function GuestCheckInPage({
  defaultVenueId,
  error,
  eventsByVenue,
  venues,
}: {
  defaultVenueId?: string;
  error?: string;
  eventsByVenue: Record<string, PublicEventOption[]>;
  venues: PublicVenueOption[];
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Slim header */}
      <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link className="flex items-center gap-2.5" href="/">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-foreground text-xs font-bold text-white">CL</span>
            <span className="text-sm font-semibold text-foreground">Cloak</span>
          </Link>
          <Link
            className="flex items-center gap-1.5 text-sm font-medium text-muted transition hover:text-foreground"
            href="/"
          >
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M19 12H5M12 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back to home
          </Link>
        </div>
      </header>

      {/* Full-height split layout */}
      <div className="lg:grid lg:min-h-[calc(100vh-57px)] lg:grid-cols-[1fr_1fr]">

        {/* Left — branding panel with image (desktop only) */}
        <div
          className="relative hidden lg:block"
          style={{
            backgroundImage: `url(${venueImage})`,
            backgroundPosition: "center",
            backgroundSize: "cover",
          }}
        >
          <div className="absolute inset-0 bg-linear-to-br from-black/85 via-black/60 to-black/30" />
          <div className="relative flex h-full flex-col justify-between p-12">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 backdrop-blur-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span className="text-xs font-semibold tracking-wide text-white/80">Free for guests · Always</span>
              </span>
              <h1 className="mt-8 text-4xl font-bold leading-tight tracking-tight text-white">
                Digital cloakroom.<br />
                <span className="text-white/55">In under a minute.</span>
              </h1>
              <p className="mt-4 max-w-sm text-sm leading-7 text-white/60">
                No app, no account. Enter your details, get a QR pass, and hand it to staff. That&apos;s it.
              </p>
            </div>

            {/* Trust strip */}
            <div className="grid gap-3">
              {[
                { icon: "✓", label: "No account required" },
                { icon: "✓", label: "Venue-bound — safe & secure" },
                { icon: "✓", label: "QR + fallback code always works" },
              ].map((t) => (
                <div className="flex items-center gap-3" key={t.label}>
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-xs font-bold text-emerald-400">
                    {t.icon}
                  </span>
                  <span className="text-sm text-white/70">{t.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right — form panel */}
        <div className="flex flex-col items-center justify-center px-4 py-10 sm:px-8 lg:px-12">
          {/* Mobile intro */}
          <div className="mb-8 text-center lg:hidden">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Get your cloakroom pass</h1>
            <p className="mt-1.5 text-sm text-muted">Takes ~30 seconds · No app required</p>
          </div>

          <div className="w-full max-w-md">
            {/* Desktop intro */}
            <div className="mb-8 hidden lg:block">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted">Step 1 of 1</p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground">Get your cloakroom pass</h2>
              <p className="mt-1.5 text-sm text-muted">Takes ~30 seconds. No app or account needed.</p>
            </div>

            <GuestFormPreview defaultVenueId={defaultVenueId} error={error} eventsByVenue={eventsByVenue} venues={venues} />

            {/* How it works — collapsed into accordion on mobile, visible below on desktop */}
            <div className="mt-6">
              <QrValidityRules />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
