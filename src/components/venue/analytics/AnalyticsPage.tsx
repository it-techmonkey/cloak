import PageShell from "@/components/shared/PageShell";
import Panel from "@/components/shared/Panel";
import type { VenueAnalyticsData } from "@/lib/venue-dashboard";

type Tone = "blue" | "green" | "warning" | "danger" | "neutral";

const toneClass: Record<Tone, string> = {
  blue: "text-blue-600",
  danger: "text-red-600",
  green: "text-emerald-600",
  neutral: "text-foreground",
  warning: "text-amber-600",
};

export default function AnalyticsPage({
  data,
  venueOnly = false,
}: {
  data: VenueAnalyticsData;
  venueOnly?: boolean;
}) {
  return (
    <PageShell
      activePath={venueOnly ? "/venueanalytics" : "/analytics"}
      eyebrow={venueOnly ? data.venueLabel : "Platform"}
      title="Analytics"
      venueRole={venueOnly ? "manager" : undefined}
    >
      {/* Stat bar */}
      <div className="grid grid-cols-2 divide-x divide-line overflow-hidden rounded-xl border border-line bg-panel shadow-sm md:grid-cols-4">
        {data.stats.map((stat) => (
          <div className="flex flex-col gap-1 px-5 py-4" key={stat.label}>
            <span className="text-xs font-medium uppercase tracking-wide text-muted">
              {stat.label}
            </span>
            <span className={`text-2xl font-semibold tabular-nums ${toneClass[stat.tone as Tone]}`}>
              {stat.value}
            </span>
          </div>
        ))}
      </div>

      {/* Charts */}
      <Panel title="Last 7 days">
        <div className="grid gap-6 md:grid-cols-2">
          <VolumeChart data={data.hourlyVolume} />
          <ItemTypesChart data={data.itemTypes} />
        </div>
      </Panel>
    </PageShell>
  );
}

function VolumeChart({ data }: { data: VenueAnalyticsData["hourlyVolume"] }) {
  return (
    <div>
      <p className="mb-4 text-sm font-medium text-foreground">Ticket volume by hour</p>
      <div className="flex h-32 items-end gap-1.5">
        {data.map((item) => (
          <div className="flex h-full w-full flex-col justify-end gap-1.5" key={item.hour}>
            <div
              className="w-full rounded-t-sm bg-brand/80"
              style={{ height: `${item.percent}%` }}
              title={`${item.count} tickets`}
            />
            <span className="text-center text-[10px] text-muted">{item.hour}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ItemTypesChart({ data }: { data: VenueAnalyticsData["itemTypes"] }) {
  if (data.length === 0) {
    return (
      <div>
        <p className="mb-4 text-sm font-medium text-foreground">Item types</p>
        <p className="text-sm text-muted">No item data yet — appears after staff activate tickets.</p>
      </div>
    );
  }

  return (
    <div>
      <p className="mb-4 text-sm font-medium text-foreground">Item types</p>
      <div className="space-y-3">
        {data.map((item) => (
          <div key={item.label}>
            <div className="flex items-center justify-between text-sm">
              <span className="text-foreground">{item.label}</span>
              <span className="text-muted">{item.count}</span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-brand" style={{ width: `${item.percent}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
