import Link from "next/link";
import Panel from "@/components/shared/Panel";
import StatusPill, { type StatusTone } from "@/components/shared/StatusPill";
import type {
  TicketFilter,
  VenueDashboardData,
  VenueTicketListItem,
} from "@/lib/venue-dashboard";

const filters: Array<{ label: string; value: TicketFilter }> = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Stored", value: "active" },
  { label: "Collected", value: "collected" },
  { label: "Expired", value: "expired" },
];

function statusCopy(status: VenueTicketListItem["status"]) {
  if (status === "pending_activation") {
    return "Pending";
  }

  if (status === "active") {
    return "Stored";
  }

  return status.charAt(0).toUpperCase() + status.slice(1);
}

function statusTone(status: VenueTicketListItem["status"]): StatusTone {
  if (status === "active") {
    return "green";
  }

  if (status === "pending_activation") {
    return "warning";
  }

  if (status === "collected") {
    return "blue";
  }

  return "danger";
}

function filterHref(filter: TicketFilter, search: string) {
  const params = new URLSearchParams();

  if (filter !== "all") {
    params.set("filter", filter);
  }

  if (search) {
    params.set("q", search);
  }

  const query = params.toString();

  return query ? `/venuedashboard?${query}` : "/venuedashboard";
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("en", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function TodayTickets({ data }: { data: VenueDashboardData }) {
  return (
    <Panel
      title="Tickets"
      description="Search by guest, mobile, email, or fallback code."
    >
      <div className="mb-4 grid gap-3 lg:grid-cols-[1fr_auto]">
        <form action="/venuedashboard" className="grid gap-2 sm:grid-cols-[1fr_auto]">
          {data.activeFilter !== "all" ? (
            <input name="filter" type="hidden" value={data.activeFilter} />
          ) : null}
          <input
            className="rounded-lg border border-line bg-slate-50 px-3 py-2.5 text-sm text-foreground outline-none focus:border-brand"
            defaultValue={data.search}
            name="q"
            placeholder="Search tickets"
          />
          <button
            className="rounded-lg bg-foreground px-4 py-2.5 text-sm font-semibold text-white"
            type="submit"
          >
            Search
          </button>
        </form>
        <div className="grid grid-cols-3 gap-2 text-center text-xs font-medium text-muted sm:flex">
          {filters.map((filter) => {
            const active = data.activeFilter === filter.value;

            return (
              <Link
                className={`rounded-full px-3 py-2 ${
                  active ? "bg-foreground text-white" : "bg-slate-100 text-muted"
                }`}
                href={filterHref(filter.value, data.search)}
                key={filter.value}
              >
                {filter.label}
              </Link>
            );
          })}
        </div>
      </div>

      {data.tickets.length === 0 ? (
        <div className="rounded-lg border border-dashed border-line bg-slate-50 p-5 text-sm text-muted">
          No tickets match the current view.
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-line">
          <div className="hidden grid-cols-[1.1fr_0.85fr_0.9fr_0.65fr_auto] gap-3 border-b border-line bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-normal text-muted lg:grid">
            <span>Guest</span>
            <span>Ticket</span>
            <span>Item</span>
            <span>Created</span>
            <span>Status</span>
          </div>
          {data.tickets.map((ticket) => (
            <Link
              className="grid gap-3 border-b border-line p-4 transition last:border-b-0 hover:bg-slate-50 lg:grid-cols-[1.1fr_0.85fr_0.9fr_0.65fr_auto] lg:items-center"
              href={`/venueticketdetail?id=${ticket.id}`}
              key={ticket.id}
            >
              <div>
                <p className="text-sm font-medium text-foreground">{ticket.guestName}</p>
                <p className="mt-1 text-xs text-muted">{ticket.guestPhone}</p>
              </div>
              <div>
                <p className="font-mono text-sm font-semibold text-foreground">{ticket.publicCode}</p>
                <p className="mt-1 text-xs text-muted">{ticket.venueName}</p>
              </div>
              <div>
                <p className="text-sm text-foreground">
                  {ticket.itemType ? `${ticket.itemCount} x ${ticket.itemType}` : "Pending"}
                </p>
                <p className="mt-1 text-xs text-muted">
                  {ticket.storageLocation ?? "No location yet"}
                </p>
              </div>
              <p className="text-sm text-muted">{formatTime(ticket.createdAt)}</p>
              <StatusPill tone={statusTone(ticket.status)}>{statusCopy(ticket.status)}</StatusPill>
            </Link>
          ))}
        </div>
      )}
    </Panel>
  );
}
