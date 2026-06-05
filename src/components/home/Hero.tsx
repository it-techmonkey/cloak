import Link from "next/link";

const heroImage =
  "https://images.unsplash.com/photo-1756597109397-1cdd6cd7ddce?auto=format&fit=crop&w=1800&q=80";

export default function Hero() {
  return (
    <section
      className="relative min-h-[74svh] overflow-hidden bg-slate-950 text-white"
      style={{
        backgroundImage: `url(${heroImage})`,
        backgroundPosition: "center",
        backgroundSize: "cover",
      }}
    >
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative mx-auto flex min-h-[74svh] w-full max-w-7xl items-center px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-white/60">
            Digital cloakroom
          </p>
          <h1 className="mt-4 text-5xl font-semibold leading-tight tracking-tight text-white sm:text-6xl">
            Ditch the paper&nbsp;ticket.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-white/75">
            Cloak gives guests a QR pass for bags, coats, and belongings — venue-bound, staff-verified, and tracked from drop-off to collection.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              className="inline-flex items-center justify-center rounded-lg bg-white px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-slate-100"
              href="/customer-signup"
            >
              Get your cloakroom pass
            </Link>
            <Link
              className="inline-flex items-center justify-center rounded-lg border border-white/30 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              href="#how-it-works"
            >
              See how it works
            </Link>
          </div>
          <div className="mt-10 grid max-w-sm grid-cols-3 gap-4 text-sm text-white/70">
            <HeroStat label="Venue-bound" detail="Passes only activate at the selected location" />
            <HeroStat label="Fallback code" detail="Works even when a camera cannot read the QR" />
            <HeroStat label="Counter verified" detail="Staff confirm item details before storage" />
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroStat({ label, detail }: { label: string; detail: string }) {
  return (
    <div className="border-l border-white/25 pl-3">
      <p className="font-semibold text-white">{label}</p>
      <p className="mt-1 text-xs leading-5 text-white/55">{detail}</p>
    </div>
  );
}
