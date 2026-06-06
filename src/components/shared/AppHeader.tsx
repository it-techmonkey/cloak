import Link from "next/link";
import { signOut } from "@/app/login/actions";

type HeaderMode = "public" | "venue-staff" | "venue-manager" | "admin";

const navItems: Record<HeaderMode, Array<{ href: string; label: string }>> = {
  admin: [
    { href: "/masterdashboard", label: "Overview" },
    { href: "/analytics", label: "Analytics" },
  ],
  "venue-manager": [
    { href: "/venuedashboard", label: "Dashboard" },
    { href: "/venuescanner", label: "Scanner" },
    { href: "/venueanalytics", label: "Analytics" },
    { href: "/venuesettings", label: "Settings" },
  ],
  "venue-staff": [
    { href: "/venuedashboard", label: "Dashboard" },
    { href: "/venuescanner", label: "Scanner" },
  ],
  public: [],
};

function resolveMode(activePath?: string, venueRole?: "staff" | "manager"): HeaderMode {
  if (activePath === "/masterdashboard" || activePath === "/analytics") return "admin";
  if (
    activePath === "/venuedashboard" ||
    activePath === "/venuescanner" ||
    activePath === "/venueanalytics" ||
    activePath === "/venuesettings" ||
    activePath === "/smsbackup" ||
    activePath === "/venueticketdetail"
  ) {
    return venueRole === "manager" ? "venue-manager" : "venue-staff";
  }
  return "public";
}

export default function AppHeader({
  activePath,
  venueRole,
}: {
  activePath?: string;
  venueRole?: "staff" | "manager";
}) {
  const mode = resolveMode(activePath, venueRole);
  const items = navItems[mode];
  const isWorkspace = mode !== "public";

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-panel/95 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          className="flex shrink-0 items-center gap-2.5"
          href={
            mode === "admin"
              ? "/masterdashboard"
              : mode === "venue-manager" || mode === "venue-staff"
                ? "/venuedashboard"
                : "/"
          }
        >
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-linear-to-br from-brand to-brand-dark text-xs font-bold text-white">
            CL
          </span>
          <span className="text-sm font-semibold text-foreground">Cloak</span>
        </Link>

        {/* Nav */}
        {items.length > 0 && (
          <nav className="flex items-center gap-0.5">
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
        )}

        {/* Sign out */}
        {isWorkspace ? (
          <form action={signOut}>
            <button
              className="rounded-md border border-line bg-white px-3 py-1.5 text-sm font-medium text-muted transition hover:border-slate-300 hover:text-foreground"
              type="submit"
            >
              Sign out
            </button>
          </form>
        ) : null}
      </div>
    </header>
  );
}
