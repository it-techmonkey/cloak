import type { ReactNode } from "react";
import AppHeader from "./AppHeader";

export default function PageShell({
  activePath,
  children,
  eyebrow,
  title,
  description,
  actions,
}: {
  activePath?: string;
  children: ReactNode;
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader activePath={activePath} />
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 border-b border-line pb-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            {eyebrow ? <p className="text-sm font-medium text-brand">{eyebrow}</p> : null}
            <h1 className="mt-1 text-2xl font-semibold tracking-normal text-foreground sm:text-3xl">
              {title}
            </h1>
            {description ? (
              <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">{description}</p>
            ) : null}
          </div>
          {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
        </div>
        {children}
      </main>
    </div>
  );
}
