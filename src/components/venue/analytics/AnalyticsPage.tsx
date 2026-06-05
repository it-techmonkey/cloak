import PageShell from "@/components/shared/PageShell";
import Panel from "@/components/shared/Panel";
import StatusList from "@/components/shared/StatusList";
import type { VenueAnalyticsData } from "@/lib/venue-dashboard";

export default function AnalyticsPage({
  data,
  venueOnly = false,
}: {
  data: VenueAnalyticsData;
  venueOnly?: boolean;
}) {
  return (
    <PageShell
      activePath={venueOnly ? "/venuedashboard" : "/masterdashboard"}
      eyebrow={venueOnly ? "Venue analytics" : "Platform analytics"}
      title={venueOnly ? data.venueLabel : "Platform performance"}
      description="Review guest volume, collection activity, storage duration, utilization, and item mix."
    >
      <StatusList items={data.stats} />
      <Panel title="Operational insights">
        <div className="grid gap-4 md:grid-cols-2">
          <PopularTimesPreview data={data.hourlyVolume} />
          <ItemTypesPreview data={data.itemTypes} />
        </div>
      </Panel>
    </PageShell>
  );
}

function PopularTimesPreview({
  data,
}: {
  data: VenueAnalyticsData["hourlyVolume"];
}) {
  return (
    <div className="rounded-md border border-line p-4">
      <p className="text-sm font-medium text-foreground">Ticket volume</p>
      <div className="mt-4 flex h-36 items-end gap-2">
        {data.map((item) => (
          <div className="flex h-full w-full flex-col justify-end gap-2" key={item.hour}>
            <span
              className="w-full rounded-t bg-slate-800"
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

function ItemTypesPreview({ data }: { data: VenueAnalyticsData["itemTypes"] }) {
  return (
    <div className="rounded-md border border-line p-4">
      <p className="text-sm font-medium text-foreground">Item types</p>
      {data.length === 0 ? (
        <p className="mt-4 rounded-lg bg-slate-50 p-4 text-sm text-muted">
          Item details will appear after staff activates tickets.
        </p>
      ) : (
        <div className="mt-4 space-y-3">
          {data.map((item) => (
            <div key={item.label}>
              <div className="flex justify-between gap-3 text-sm">
                <span>{item.label}</span>
                <span className="text-muted">{item.count}</span>
              </div>
              <div className="mt-1 h-2 rounded-full bg-slate-100">
                <div className="h-2 rounded-full bg-brand" style={{ width: `${item.percent}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
