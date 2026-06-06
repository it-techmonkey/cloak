import Link from "next/link";
import Hero from "./Hero";
import WorkflowHighlights from "./WorkflowHighlights";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <PublicHeader />
      <main>
        <Hero />
        <WorkflowHighlights />
      </main>
      <PublicFooter />
    </div>
  );
}

function PublicHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link className="flex items-center gap-2.5" href="/">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-foreground text-xs font-bold text-white">
            CL
          </span>
          <span className="text-sm font-semibold text-foreground">Cloak</span>
        </Link>
        <nav className="hidden items-center gap-0.5 sm:flex">
          <Link
            className="rounded-md px-3 py-2 text-sm font-medium text-muted hover:bg-slate-50 hover:text-foreground"
            href="#how-it-works"
          >
            How it works
          </Link>
          <Link
            className="rounded-md px-3 py-2 text-sm font-medium text-muted hover:bg-slate-50 hover:text-foreground"
            href="/venuesignup"
          >
            For venues
          </Link>
        </nav>
        <Link
          className="rounded-lg bg-foreground px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
          href="/customer-signup"
        >
          Get your pass
        </Link>
      </div>
    </header>
  );
}

function PublicFooter() {
  return (
    <footer className="border-t border-line bg-white">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-semibold text-foreground">Cloak</p>
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted">
            <Link className="hover:text-foreground" href="/venuesignup">
              For venues
            </Link>
            <Link className="hover:text-foreground" href="/venuedashboard">
              Venue dashboard
            </Link>
            <Link className="hover:text-foreground" href="/masterdashboard">
              Admin dashboard
            </Link>
            <Link className="hover:text-foreground" href="/login">
              Login
            </Link>
            <Link className="hover:text-foreground" href="/register-interest">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
