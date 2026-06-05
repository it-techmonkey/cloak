import Link from "next/link";
import Hero from "./Hero";
import WorkflowHighlights from "./WorkflowHighlights";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <CustomerHeader />
      <main>
        <Hero />
        <WorkflowHighlights />
      </main>
      <CustomerFooter />
    </div>
  );
}

function CustomerHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link className="flex items-center gap-3" href="/">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-foreground text-sm font-semibold text-white shadow-sm">
            CL
          </span>
          <span>
            <span className="block text-sm font-semibold text-foreground">Cloak</span>
            <span className="block text-xs text-muted">Digital cloakroom</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-1 sm:flex">
          <Link className="rounded-md px-3 py-2 text-sm font-medium text-muted hover:bg-slate-50 hover:text-foreground" href="#how-it-works">
            How it works
          </Link>
          <Link className="rounded-md px-3 py-2 text-sm font-medium text-muted hover:bg-slate-50 hover:text-foreground" href="#safety">
            Safety
          </Link>
        </nav>
        <Link
          className="inline-flex items-center justify-center rounded-lg bg-foreground px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-95"
          href="/customer-signup"
        >
          Start check-in
        </Link>
      </div>
    </header>
  );
}

function CustomerFooter() {
  return (
    <footer className="border-t border-line bg-white">
      <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-8 text-sm sm:grid-cols-[1fr_auto] sm:px-6 lg:px-8">
        <div>
          <p className="font-semibold text-foreground">Cloak</p>
          <p className="mt-2 max-w-xl leading-6 text-muted">
            A digital cloakroom pass for guests at approved venues.
          </p>
        </div>
        <div className="flex flex-wrap gap-4 text-muted">
          <Link className="hover:text-foreground" href="/venuesignup">
            For venues
          </Link>
          <Link className="hover:text-foreground" href="/login">
            Staff login
          </Link>
          <Link className="hover:text-foreground" href="/register-interest">
            Contact
          </Link>
        </div>
      </div>
    </footer>
  );
}
