import { SecondaryLink } from "@/components/shared/ButtonLink";
import PageShell from "@/components/shared/PageShell";
import type { AdminDashboardData } from "@/lib/admin-dashboard";
import VenueMapPanel from "./VenueMapPanel";
import VenueTable from "./VenueTable";

type Tone = "green" | "warning" | "danger" | "neutral";

const toneClass: Record<Tone, string> = {
  danger: "text-red-600",
  green: "text-emerald-600",
  neutral: "text-foreground",
  warning: "text-amber-600",
};

const iconBg: Record<Tone, string> = {
  danger: "bg-red-50 text-red-500",
  green: "bg-emerald-50 text-emerald-500",
  neutral: "bg-zinc-100 text-zinc-500",
  warning: "bg-amber-50 text-amber-500",
};

const labelIcon: Record<string, string> = {
  "Active venues": "✓",
  "Approved venues": "🏢",
  "Pending venues": "⏳",
  "Stored items": "📦",
  "Total tickets": "🎫",
};

function normalizeTone(t: string): Tone {
  if (t === "green" || t === "warning" || t === "danger") return t as Tone;
  return "neutral";
}

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
        <div className="rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          {message}
        </div>
      ) : null}

      {/* Stat strip with icons */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
        {data.stats.map((stat) => {
          const tone = normalizeTone(stat.tone);
          return (
            <div
              className="flex flex-col gap-3 rounded-xl border border-line bg-panel px-4 py-4 shadow-sm"
              key={stat.label}
              title={stat.helper}
            >
              <span className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm ${iconBg[tone]}`}>
                {labelIcon[stat.label] ?? "·"}
              </span>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted">{stat.label}</p>
                <p className={`mt-0.5 text-2xl font-semibold tabular-nums ${toneClass[tone]}`}>
                  {stat.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <VenueMapPanel venues={data.venues} />
      <VenueTable venues={data.venues} />
    </PageShell>
  );
}
