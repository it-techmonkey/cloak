import Link from "next/link";
import { signOut } from "@/app/login/actions";

type HeaderMode = "public" | "venue" | "admin";

const navItems: Record<HeaderMode, Array<{ href: string; label: string }>> = {
  admin: [
    { href: "/masterdashboard", label: "Overview" },
    { href: "/analytics", label: "Analytics" },
  ],
  public: [
    { href: "/", label: "Home" },
    { href: "/customer-signup", label: "Check in" },
  ],
  venue: [
    { href: "/venuedashboard", label: "Dashboard" },
    { href: "/venuescanner", label: "Scanner" },
    { href: "/venueanalytics", label: "Analytics" },
    { href: "/venuesettings", label: "Settings" },
  ],
};

function getMode(activePath?: string): HeaderMode {
  if (activePath === "/masterdashboard" || activePath === "/analytics") {
    return "admin";
  }

  if (
    activePath === "/venuedashboard" ||
    activePath === "/venuescanner" ||
    activePath === "/venueanalytics" ||
    activePath === "/venuesettings" ||
    activePath === "/smsbackup" ||
    activePath === "/venueticketdetail"
  ) {
    return "venue";
  }

  return "public";
}

export default function AppHeader({
  activePath,
  mode,
}: {
  activePath?: string;
  mode?: HeaderMode;
}) {
  const resolvedMode = mode ?? getMode(activePath);
  const items = navItems[resolvedMode];
  const isWorkspace = resolvedMode !== "public";

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-panel/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link
          className="flex items-center gap-3"
          href={resolvedMode === "admin" ? "/masterdashboard" : resolvedMode === "venue" ? "/venuedashboard" : "/"}
        >
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-brand to-brand-dark text-sm font-semibold text-white shadow-sm">
            CL
          </span>
          <span>
            <span className="block text-sm font-semibold text-foreground">Cloak</span>
            <span className="block text-xs text-muted">
              {resolvedMode === "admin"
                ? "Platform admin"
                : resolvedMode === "venue"
                  ? "Venue workspace"
                  : "Digital cloakroom"}
            </span>
          </span>
        </Link>

        <div className="hidden items-center gap-2 md:flex">
          <nav className="flex items-center gap-1">
            {items.map((item) => (
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
          {isWorkspace ? <LogoutButton /> : null}
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto px-4 pb-3 md:hidden">
        {items.map((item) => (
          <Link
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium ${
              activePath === item.href ? "bg-brand text-white" : "bg-slate-100 text-muted"
            }`}
            href={item.href}
            key={item.href}
          >
            {item.label}
          </Link>
        ))}
        {isWorkspace ? <LogoutButton compact /> : null}
      </div>
    </header>
  );
}

function LogoutButton({ compact = false }: { compact?: boolean }) {
  return (
    <form action={signOut}>
      <button
        className={
          compact
            ? "shrink-0 rounded-full border border-line bg-white px-3 py-1.5 text-xs font-medium text-muted"
            : "rounded-md border border-line bg-white px-3 py-2 text-sm font-medium text-muted transition hover:border-slate-300 hover:text-foreground"
        }
        type="submit"
      >
        Log out
      </button>
    </form>
  );
}
