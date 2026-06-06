import { SecondaryLink } from "@/components/shared/ButtonLink";
import PageShell from "@/components/shared/PageShell";
import type { AdminDashboardData } from "@/lib/admin-dashboard";
import VenueTable from "./VenueTable";

export default function MasterDashboardPage({
  data,
  message,
}: {
  data: AdminDashboardData;
  message?: string;
}) {
  return (
    <PageShell
      activePath="/masterdashboard"
      eyebrow="Platform admin"
      title="Operations"
      actions={<SecondaryLink href="/analytics">Analytics</SecondaryLink>}
    >
      {message ? (
        <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700">
          {message}
        </div>
      ) : null}

      {/* Stat strip */}
      <div className="grid grid-cols-2 divide-x divide-y divide-line overflow-hidden rounded-xl border border-line bg-panel shadow-sm sm:grid-cols-3 md:grid-cols-6 md:divide-y-0">
        {data.stats.map((stat) => (
          <div className="flex flex-col gap-1 px-5 py-4" key={stat.label} title={stat.helper}>
            <span className="text-xs font-medium uppercase tracking-wide text-muted">
              {stat.label}
            </span>
            <span
              className={`text-2xl font-semibold tabular-nums ${
                stat.tone === "warning"
                  ? "text-amber-600"
                  : stat.tone === "green"
                    ? "text-emerald-600"
                    : stat.tone === "danger"
                      ? "text-red-600"
                      : "text-foreground"
              }`}
            >
              {stat.value}
            </span>
          </div>
        ))}
      </div>

      <VenueTable venues={data.venues} />
    </PageShell>
  );
}
