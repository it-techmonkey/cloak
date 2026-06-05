import Link from "next/link";

const mainNav = [
  { href: "/", label: "Home" },
  { href: "/customer-signup", label: "Guest" },
  { href: "/venuedashboard", label: "Venue" },
  { href: "/masterdashboard", label: "Admin" },
];

export default function AppHeader({ activePath }: { activePath?: string }) {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-panel/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link className="flex items-center gap-3" href="/">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-brand to-brand-dark text-sm font-semibold text-white shadow-sm">
            CL
          </span>
          <span>
            <span className="block text-sm font-semibold text-foreground">Cloak</span>
            <span className="block text-xs text-muted">Digital cloakroom</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {mainNav.map((item) => (
            <Link
              className={`rounded-md px-3 py-2 text-sm font-medium transition ${
                activePath === item.href
                  ? "bg-slate-100 text-foreground"
                  : "text-muted hover:bg-slate-50 hover:text-foreground"
              }`}
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
      <nav className="flex gap-2 overflow-x-auto px-4 pb-3 md:hidden">
        {mainNav.map((item) => (
          <Link
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium ${
              activePath === item.href
                ? "bg-brand text-white"
                : "bg-slate-100 text-muted"
            }`}
            href={item.href}
            key={item.href}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
