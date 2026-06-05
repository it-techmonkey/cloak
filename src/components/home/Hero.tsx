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
      <div className="absolute inset-0 bg-black/55" />
      <div className="relative mx-auto flex min-h-[74svh] w-full max-w-7xl items-center px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-normal text-white/75">
            Secure venue storage
          </p>
          <h1 className="mt-4 text-5xl font-semibold tracking-normal text-white sm:text-6xl">
            Cloak
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-white/82">
            Check in your bags, jackets, helmets, and personal items with a QR pass that works only at your selected venue.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              className="inline-flex items-center justify-center rounded-lg bg-white px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-slate-100"
              href="/customer-signup"
            >
              Create your pass
            </Link>
            <Link
              className="inline-flex items-center justify-center rounded-lg border border-white/45 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              href="#how-it-works"
            >
              See how it works
            </Link>
          </div>
          <div className="mt-8 grid max-w-lg grid-cols-3 gap-3 text-sm text-white/80">
            <HeroPoint label="Venue-bound" value="QR" />
            <HeroPoint label="Backup" value="Code" />
            <HeroPoint label="Counter" value="Verified" />
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroPoint({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-l border-white/35 pl-3">
      <p className="font-semibold text-white">{value}</p>
      <p className="mt-1 text-xs text-white/70">{label}</p>
    </div>
  );
}
