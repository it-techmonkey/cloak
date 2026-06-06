"use client";

import Link from "next/link";
import { useState } from "react";
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
  const [open, setOpen] = useState(false);

  const logoHref =
    mode === "admin"
      ? "/masterdashboard"
      : mode === "venue-manager" || mode === "venue-staff"
        ? "/venuedashboard"
        : "/";

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-panel/95 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link className="flex shrink-0 items-center gap-2.5" href={logoHref}>
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-foreground text-xs font-bold text-white">
            CL
          </span>
          <span className="text-sm font-semibold text-foreground">Cloak</span>
        </Link>

        {/* Desktop nav */}
        {items.length > 0 && (
          <nav className="hidden items-center gap-0.5 md:flex">
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

        {/* Right side */}
        <div className="flex items-center gap-2">
          {isWorkspace ? (
            <form action={signOut} className="hidden md:block">
              <button
                className="rounded-md border border-line bg-white px-3 py-1.5 text-sm font-medium text-muted transition hover:border-foreground/20 hover:text-foreground"
                type="submit"
              >
                Sign out
              </button>
            </form>
          ) : null}

          {/* Hamburger — shown on mobile when there are nav items */}
          {(items.length > 0 || isWorkspace) && (
            <button
              aria-label="Toggle menu"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-white text-muted transition hover:text-foreground md:hidden"
              onClick={() => setOpen((v) => !v)}
              type="button"
            >
              {open ? (
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" />
                </svg>
              ) : (
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
                </svg>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="border-t border-line bg-panel md:hidden">
          <nav className="flex flex-col px-4 py-3 gap-1">
            {items.map((item) => (
              <Link
                className={`rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  activePath === item.href
                    ? "bg-slate-100 text-foreground"
                    : "text-muted hover:bg-slate-50 hover:text-foreground"
                }`}
                href={item.href}
                key={item.href}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            {isWorkspace && (
              <form action={signOut} className="mt-1">
                <button
                  className="w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium text-muted transition hover:bg-slate-50 hover:text-foreground"
                  type="submit"
                >
                  Sign out
                </button>
              </form>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
