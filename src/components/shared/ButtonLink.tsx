import Link from "next/link";
import type { ReactNode } from "react";

export function PrimaryLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      className="inline-flex items-center justify-center rounded-lg bg-foreground px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
      href={href}
    >
      {children}
    </Link>
  );
}

export function SecondaryLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      className="inline-flex items-center justify-center rounded-lg border border-line bg-panel px-4 py-2.5 text-sm font-semibold text-foreground transition hover:border-slate-300"
      href={href}
    >
      {children}
    </Link>
  );
}
