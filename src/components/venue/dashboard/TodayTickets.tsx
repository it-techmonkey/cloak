import Link from "next/link";
import Panel from "@/components/shared/Panel";
import StatusPill, { type StatusTone } from "@/components/shared/StatusPill";
import type { TicketFilter, VenueDashboardData, VenueTicketListItem } from "@/lib/venue-dashboard";

const filters: Array<{ label: string; value: TicketFilter }> = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Stored", value: "active" },
  { label: "Collected", value: "collected" },
  { label: "Expired", value: "expired" },
];

function statusLabel(status: VenueTicketListItem["status"]) {
  if (status === "pending_activation") return "Pending";
  if (status === "active") return "Stored";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function statusTone(status: VenueTicketListItem["status"]): StatusTone {
  if (status === "active") return "green";
  if (status === "pending_activation") return "warning";
  if (status === "collected") return "blue";
  return "danger";
}

function filterHref(filter: TicketFilter, search: string) {
  const p = new URLSearchParams();
  if (filter !== "all") p.set("filter", filter);
  if (search) p.set("q", search);
  const qs = p.toString();
  return qs ? `/venuedashboard?${qs}` : "/venuedashboard";
}

function fmtTime(value: string) {
  return new Intl.DateTimeFormat("en", { hour: "2-digit", minute: "2-digit" }).format(
    new Date(value),
  );
}

export default function TodayTickets({ data }: { data: VenueDashboardData }) {
  return (
    <Panel title="Tickets">
      {/* Search */}
      <form action="/venuedashboard" className="mb-3 flex gap-2">
        {data.activeFilter !== "all" && (
          <input name="filter" type="hidden" value={data.activeFilter} />
        )}
        <input
          className="min-w-0 flex-1 rounded-lg border border-line bg-slate-50 px-3 py-2 text-sm text-foreground outline-none focus:border-foreground/30 focus:bg-white"
          defaultValue={data.search}
          name="q"
          placeholder="Search guests…"
        />
        <button
          className="shrink-0 rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-white"
          type="submit"
        >
          Go
        </button>
      </form>

      {/* Filter tabs — scrollable on mobile */}
      <div className="mb-4 flex gap-1 overflow-x-auto pb-1">
        {filters.map((f) => {
          const active = data.activeFilter === f.value;
          return (
            <Link
              className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                active
                  ? "bg-foreground text-white"
                  : "bg-slate-100 text-muted hover:bg-slate-200 hover:text-foreground"
              }`}
              href={filterHref(f.value, data.search)}
              key={f.value}
            >
              {f.label}
            </Link>
          );
        })}
      </div>

      {/* Table */}
      {data.tickets.length === 0 ? (
        <div className="rounded-lg border border-dashed border-line bg-slate-50 px-4 py-8 text-center text-sm text-muted">
          No tickets match the current filter.
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-line">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                <th className="px-3 py-3 sm:px-4">Guest</th>
                <th className="hidden px-3 py-3 sm:table-cell sm:px-4">Item</th>
                <th className="hidden px-3 py-3 lg:table-cell lg:px-4">Time</th>
                <th className="px-3 py-3 sm:px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {data.tickets.map((ticket) => (
                <tr className="hover:bg-slate-50" key={ticket.id}>
                  <td className="px-3 py-3 sm:px-4">
                    <Link className="block" href={`/venueticketdetail?id=${ticket.id}`}>
                      <p className="font-medium text-foreground">{ticket.guestName}</p>
                      <p className="mt-0.5 font-mono text-xs text-muted">{ticket.publicCode}</p>
                    </Link>
                  </td>
                  <td className="hidden px-3 py-3 sm:table-cell sm:px-4">
                    {ticket.itemType ? (
                      <span className="text-foreground">
                        {ticket.itemCount > 1 ? `${ticket.itemCount}× ` : ""}
                        {ticket.itemType}
                      </span>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                  <td className="hidden px-3 py-3 text-muted lg:table-cell lg:px-4">
                    {fmtTime(ticket.createdAt)}
                  </td>
                  <td className="px-3 py-3 sm:px-4">
                    <StatusPill tone={statusTone(ticket.status)}>
                      {statusLabel(ticket.status)}
                    </StatusPill>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
}
