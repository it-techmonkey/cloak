import type { ReactNode } from "react";
import AppHeader from "./AppHeader";

export default function PageShell({
  actions,
  activePath,
  children,
  description,
  eyebrow,
  title,
  venueRole,
}: {
  actions?: ReactNode;
  activePath?: string;
  children: ReactNode;
  description?: string;
  eyebrow?: string;
  title: string;
  venueRole?: "staff" | "manager";
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader activePath={activePath} venueRole={venueRole} />
      <main className="mx-auto w-full max-w-7xl px-4 pb-12 pt-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            {eyebrow ? (
              <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-muted">
                {eyebrow}
              </p>
            ) : null}
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
            {description ? (
              <p className="mt-1 text-sm text-muted">{description}</p>
            ) : null}
          </div>
          {actions ? (
            <div className="flex shrink-0 items-center gap-2">{actions}</div>
          ) : null}
        </div>
        <div className="grid gap-5">{children}</div>
      </main>
    </div>
  );
}
