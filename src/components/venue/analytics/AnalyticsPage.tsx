import PageShell from "@/components/shared/PageShell";
import Panel from "@/components/shared/Panel";
import type { VenueAnalyticsData } from "@/lib/venue-dashboard";

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

export default function AnalyticsPage({
  data,
  venueOnly = false,
}: {
  data: VenueAnalyticsData;
  venueOnly?: boolean;
}) {
  const normalizeTone = (tone: string): Tone => {
    if (tone === "green" || tone === "warning" || tone === "danger") return tone as Tone;
    return "neutral";
  };

  return (
    <PageShell
      activePath={venueOnly ? "/venueanalytics" : "/analytics"}
      eyebrow={venueOnly ? data.venueLabel : "Platform"}
      title="Analytics"
      venueRole={venueOnly ? "manager" : undefined}
    >
      {/* Stat bar */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {data.stats.map((stat) => {
          const tone = normalizeTone(stat.tone);
          return (
            <div className="flex flex-col gap-3 rounded-xl border border-line bg-panel px-4 py-4 shadow-sm" key={stat.label}>
              <span className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm ${iconBg[tone]}`}>
                {stat.label === "Total" ? "📊" : stat.label === "Stored" ? "📦" : stat.label === "Collected" ? "✓" : "⏱"}
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

      {/* Charts */}
      <Panel title="Last 7 days">
        <div className="grid gap-8 md:grid-cols-2">
          <VolumeChart data={data.hourlyVolume} />
          <ItemTypesChart data={data.itemTypes} />
        </div>
      </Panel>

      {/* Per-event breakdown */}
      {data.byEvent.length > 0 && (
        <Panel title="By event" description="Tickets tagged to each event in the last 7 days.">
          <div className="overflow-hidden rounded-lg border border-line">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line bg-zinc-50 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                  <th className="px-4 py-3">Event</th>
                  <th className="px-4 py-3 text-right">Tickets</th>
                  <th className="px-4 py-3 text-right">Collected</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {data.byEvent.map((event) => (
                  <tr key={event.id}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{event.name}</p>
                      {event.eventDate ? (
                        <p className="mt-0.5 text-xs text-muted">
                          {new Date(`${event.eventDate}T00:00:00`).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums text-foreground">
                      {event.tickets}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-muted">{event.collected}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}
    </PageShell>
  );
}

function VolumeChart({ data }: { data: VenueAnalyticsData["hourlyVolume"] }) {
  const peakEntry = data.reduce<{ hour: string; count: number } | null>(
    (best, d) => (!best || d.count > best.count ? d : best),
    null,
  );

  const hasData = data.some((d) => d.count > 0);

  return (
    <div>
      <div className="mb-4 flex items-start justify-between gap-4">
        <p className="text-sm font-medium text-foreground">Ticket volume by hour</p>
        {hasData && peakEntry && peakEntry.count > 0 && (
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
            Peak: {peakEntry.hour}
          </span>
        )}
      </div>
      <div className="flex h-36 items-end gap-1">
        {data.map((item) => (
          <div className="group flex h-full w-full flex-col justify-end gap-1" key={item.hour}>
            <div className="relative flex justify-center">
              {item.count > 0 && (
                <span className="absolute -top-5 hidden text-[9px] font-medium text-muted group-hover:block">
                  {item.count}
                </span>
              )}
              <div
                className={`w-full rounded-t-sm transition-all ${
                  peakEntry && item.hour === peakEntry.hour && item.count > 0
                    ? "bg-amber-400"
                    : "bg-brand/75"
                }`}
                style={{ height: item.percent > 0 ? `${Math.max(item.percent, 4)}%` : "2px", opacity: item.count === 0 ? 0.25 : 1 }}
                title={`${item.count} tickets`}
              />
            </div>
            <span className="text-center text-[9px] text-muted">{item.hour}</span>
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

  const total = data.reduce((s, d) => s + d.count, 0);

  return (
    <div>
      <p className="mb-4 text-sm font-medium text-foreground">Item types</p>
      <div className="space-y-3">
        {data.map((item) => {
          const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
          return (
            <div key={item.label}>
              <div className="flex items-center gap-3">
                <div className="h-5 overflow-hidden rounded bg-brand/15" style={{ width: `${item.percent}%`, minWidth: "4px" }}>
                  <div className="h-full rounded bg-brand" style={{ width: "100%" }} />
                </div>
                <span className="shrink-0 text-sm font-medium text-foreground">{item.label}</span>
                <span className="ml-auto shrink-0 tabular-nums text-xs text-muted">
                  {item.count} <span className="text-muted/60">({pct}%)</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
