import type { ReactNode } from "react";

export default function Panel({
  children,
  title,
  description,
}: {
  children: ReactNode;
  title?: string;
  description?: string;
}) {
  return (
    <section className="rounded-lg border border-line bg-panel p-4 shadow-sm sm:p-5">
      {title ? (
        <div className="mb-5">
          <h2 className="text-base font-semibold text-foreground">{title}</h2>
          {description ? <p className="mt-1 text-sm text-muted">{description}</p> : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}
