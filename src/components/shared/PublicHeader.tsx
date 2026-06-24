"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import AuthButton from "@/components/auth/AuthButton";

const NAV_LINKS: Array<{ label: string; href: string; match: string }> = [
  { label: "For Venues", href: "/", match: "home" },
  { label: "For Customers", href: "/for-customers", match: "/for-customers" },
  { label: "Book a Demo", href: "/book-a-demo", match: "/book-a-demo" },
  { label: "Contact Us", href: "/contact-us", match: "/contact-us" },
];

export default function PublicHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (match: string) => {
    if (match === "home") return pathname === "/";
    return pathname.startsWith(match);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link className="flex items-center gap-2.5" href="/">
          <img
            alt="Cloak"
            className="h-8 w-8 rounded-lg object-cover"
            src="/images/cloak-logo.png"
          />
          <span className="text-sm font-semibold tracking-tight text-foreground">Cloak</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 sm:flex">
          {NAV_LINKS.map((link) => {
            const active = isActive(link.match);
            return (
              <Link
                aria-current={active ? "page" : undefined}
                className={`group relative rounded-lg px-3.5 py-2 text-sm font-medium transition hover:bg-zinc-50 ${
                  active ? "text-foreground" : "text-muted hover:text-foreground"
                }`}
                href={link.href}
                key={link.href}
              >
                {link.label}
                {/* Animated underline — full width when active, grows on hover. */}
                <span
                  className={`pointer-events-none absolute inset-x-3.5 -bottom-px h-0.5 origin-left rounded-full bg-foreground transition-transform duration-200 ${
                    active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                  }`}
                />
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2.5">
          <AuthButton />
          <Link
            className="hidden rounded-lg bg-foreground px-4 py-2 text-sm font-semibold text-white transition hover:opacity-85 sm:block"
            href={pathname.startsWith("/for-customers") ? "/customer-signup" : "/venuesignup"}
          >
            Sign up
          </Link>
          <button
            aria-label="Toggle menu"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-white text-muted transition hover:text-foreground sm:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            type="button"
          >
            {mobileOpen ? (
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" />
              </svg>
            ) : (
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-line bg-white sm:hidden">
          <nav className="flex flex-col gap-1 px-4 py-4">
            {NAV_LINKS.map((link) => {
              const active = isActive(link.match);
              return (
                <Link
                  aria-current={active ? "page" : undefined}
                  className={`rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                    active
                      ? "bg-zinc-50 text-foreground"
                      : "text-muted hover:bg-zinc-50 hover:text-foreground"
                  }`}
                  href={link.href}
                  key={link.href}
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              );
            })}
            <div className="mt-2 flex flex-col gap-2 border-t border-line pt-3">
              <Link
                className="block rounded-lg bg-foreground px-3 py-3 text-center text-sm font-semibold text-white"
                href={pathname.startsWith("/for-customers") ? "/customer-signup" : "/venuesignup"}
                onClick={() => setMobileOpen(false)}
              >
                Sign up
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
