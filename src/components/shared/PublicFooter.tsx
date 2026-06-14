import Link from "next/link";

/**
 * The standard marketing-site footer, shared by the home page and the venues
 * page. The "how it works" anchor targets the home page so it works from any
 * marketing route.
 */
export default function PublicFooter() {
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
              <Link className="transition hover:text-white" href="/#how-it-works">How it works</Link>
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
            © {new Date().getFullYear()} Cloak. All rights reserved.
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
