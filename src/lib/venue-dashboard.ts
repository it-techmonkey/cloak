import type { AuthorizedContext } from "@/lib/auth/guards";
import { createAdminClient, isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/database.types";

type TicketStatus = Database["public"]["Enums"]["ticket_status"];
type StatusTone = "blue" | "green" | "warning" | "danger" | "neutral";
type SupabaseAdmin = ReturnType<typeof createAdminClient>;

export type VenueTicketListItem = {
  createdAt: string;
  guestName: string;
  guestPhone: string;
  id: string;
  itemCount: number;
  itemType: string | null;
  publicCode: string;
  status: TicketStatus;
  storageLocation: string | null;
  venueName: string;
};

export type VenueDashboardData = {
  activeFilter: TicketFilter;
  search: string;
  stats: Array<{ helper?: string; label: string; value: string; tone: StatusTone }>;
  tickets: VenueTicketListItem[];
  venueLabel: string;
};

export type VenueAnalyticsData = {
  hourlyVolume: Array<{ hour: string; count: number; percent: number }>;
  itemTypes: Array<{ count: number; label: string; percent: number }>;
  stats: Array<{ label: string; value: string; tone: StatusTone }>;
  venueLabel: string;
};

export type VenueTicketDetail = VenueTicketListItem & {
  activatedAt: string | null;
  collectedAt: string | null;
  expiresAt: string;
  guestEmail: string;
  itemDescription: string | null;
  scans: Array<{
    createdAt: string;
    id: string;
    reason: string | null;
    result: Database["public"]["Enums"]["scan_result"];
    scanType: Database["public"]["Enums"]["scan_type"];
  }>;
};

export type TicketFilter = "all" | "pending" | "active" | "collected" | "expired";

const FILTER_TO_STATUS: Partial<Record<TicketFilter, TicketStatus[]>> = {
  active: ["active"],
  collected: ["collected"],
  expired: ["expired"],
  pending: ["pending_activation"],
};

function emptyVenueDashboardData(
  activeFilter: TicketFilter = "all",
  search = "",
): VenueDashboardData {
  return {
    activeFilter,
    search,
    stats: [
      { helper: "Tickets created today", label: "Today", value: "0", tone: "neutral" },
      { helper: "Waiting at counter", label: "Pending", value: "0", tone: "warning" },
      { helper: "Currently stored", label: "Stored", value: "0", tone: "green" },
      { helper: "Returned today", label: "Collected", value: "0", tone: "blue" },
      { helper: "Expired before activation", label: "Forgotten", value: "0", tone: "danger" },
      { helper: "Active storage use", label: "Capacity", value: "0%", tone: "blue" },
    ],
    tickets: [],
    venueLabel: "No assigned venue",
  };
}

function emptyAnalyticsData(): VenueAnalyticsData {
  return {
    hourlyVolume: [],
    itemTypes: [],
    stats: [
      { label: "Guests", value: "0", tone: "blue" },
      { label: "Collected", value: "0", tone: "green" },
      { label: "Avg. storage", value: "0m", tone: "neutral" },
      { label: "Utilization", value: "0%", tone: "warning" },
    ],
    venueLabel: "No assigned venue",
  };
}

function formatCount(value: number | null) {
  return String(value ?? 0);
}

function formatMinutes(value: number) {
  if (!Number.isFinite(value) || value <= 0) {
    return "0m";
  }

  if (value < 60) {
    return `${Math.round(value)}m`;
  }

  return `${Math.round(value / 60)}h`;
}

function getVenueIds(context: AuthorizedContext) {
  if (context.profileRole === "platform_admin") {
    return null;
  }

  return [...new Set(context.venueRoles.map((venueRole) => venueRole.venueId))];
}

function withVenueScope<T>(
  query: T,
  venueIds: string[] | null,
): T {
  if (!venueIds) {
    return query;
  }

  return (query as { in: (column: string, values: string[]) => T }).in("venue_id", venueIds);
}

async function getVenueLabel(supabase: SupabaseAdmin, venueIds: string[] | null) {
  let query = supabase.from("venues").select("id, name, capacity").order("name");

  if (venueIds) {
    query = query.in("id", venueIds);
  }

  const { data } = await query;
  const venues = data ?? [];
  const capacity = venues.reduce((sum, venue) => sum + venue.capacity, 0);

  return {
    capacity,
    label:
      venues.length === 0
        ? "No assigned venue"
        : venues.length === 1
          ? venues[0].name
          : `${venues.length} venues`,
  };
}

function getTodayStart() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return today.toISOString();
}

export function normalizeTicketFilter(value: string | undefined): TicketFilter {
  if (value === "pending" || value === "active" || value === "collected" || value === "expired") {
    return value;
  }

  return "all";
}

function normalizeSearch(value: string | undefined) {
  return (value ?? "").trim().slice(0, 80);
}

function searchPattern(value: string) {
  return `%${value.replaceAll("%", "").replaceAll(",", " ").trim()}%`;
}

export async function getVenueDashboardData({
  context,
  filter,
  search,
}: {
  context: AuthorizedContext;
  filter?: string;
  search?: string;
}): Promise<VenueDashboardData> {
  const activeFilter = normalizeTicketFilter(filter);
  const normalizedSearch = normalizeSearch(search);

  if (!isSupabaseAdminConfigured()) {
    return emptyVenueDashboardData(activeFilter, normalizedSearch);
  }

  const venueIds = getVenueIds(context);

  if (venueIds?.length === 0) {
    return emptyVenueDashboardData(activeFilter, normalizedSearch);
  }

  const supabase = createAdminClient();
  const todayStart = getTodayStart();
  const venueMeta = await getVenueLabel(supabase, venueIds);
  const scopedCount = () => withVenueScope(supabase.from("tickets").select("id", { count: "exact", head: true }), venueIds);
  const ticketQuery = withVenueScope(
    supabase
      .from("tickets")
      .select(
        "id, public_code, guest_name, guest_phone, status, created_at, item_type, item_count, storage_location, venue_id",
      )
      .order("created_at", { ascending: false })
      .limit(60),
    venueIds,
  );

  const selectedStatuses = FILTER_TO_STATUS[activeFilter];

  if (selectedStatuses) {
    ticketQuery.in("status", selectedStatuses);
  }

  if (normalizedSearch) {
    const pattern = searchPattern(normalizedSearch);
    ticketQuery.or(
      `guest_name.ilike.${pattern},guest_phone.ilike.${pattern},guest_email.ilike.${pattern},public_code.ilike.${pattern}`,
    );
  }

  const [todayCount, pendingCount, storedCount, collectedCount, forgottenCount, ticketRows] = await Promise.all([
    scopedCount().gte("created_at", todayStart),
    scopedCount().eq("status", "pending_activation"),
    scopedCount().eq("status", "active"),
    scopedCount().eq("status", "collected").gte("collected_at", todayStart),
    scopedCount().eq("status", "pending_activation").lt("expires_at", new Date().toISOString()),
    ticketQuery,
  ]);

  const usedCapacity = storedCount.count ?? 0;
  const utilization = venueMeta.capacity > 0 ? Math.round((usedCapacity / venueMeta.capacity) * 100) : 0;
  const venueNames = await getVenueNameMap(
    supabase,
    [...new Set(ticketRows.data?.map((ticket) => ticket.venue_id) ?? [])],
  );

  return {
    activeFilter,
    search: normalizedSearch,
    stats: [
      { helper: "Tickets created today", label: "Today", value: formatCount(todayCount.count), tone: "neutral" },
      { helper: "Waiting at counter", label: "Pending", value: formatCount(pendingCount.count), tone: "warning" },
      { helper: "Currently stored", label: "Stored", value: formatCount(storedCount.count), tone: "green" },
      { helper: "Returned today", label: "Collected", value: formatCount(collectedCount.count), tone: "blue" },
      { helper: "Expired before activation", label: "Forgotten", value: formatCount(forgottenCount.count), tone: "danger" },
      {
        helper: "Active storage use",
        label: "Capacity",
        value: `${utilization}%`,
        tone: utilization >= 90 ? "danger" : utilization >= 70 ? "warning" : "blue",
      },
    ],
    tickets:
      ticketRows.data?.map((ticket) => ({
        createdAt: ticket.created_at,
        guestName: ticket.guest_name,
        guestPhone: ticket.guest_phone,
        id: ticket.id,
        itemCount: ticket.item_count,
        itemType: ticket.item_type,
        publicCode: ticket.public_code,
        status: ticket.status,
        storageLocation: ticket.storage_location,
        venueName: venueNames.get(ticket.venue_id) ?? venueMeta.label,
      })) ?? [],
    venueLabel: venueMeta.label,
  };
}

async function getVenueNameMap(supabase: SupabaseAdmin, venueIds: string[]) {
  const names = new Map<string, string>();

  if (venueIds.length === 0) {
    return names;
  }

  const { data } = await supabase.from("venues").select("id, name").in("id", venueIds);

  data?.forEach((venue) => names.set(venue.id, venue.name));

  return names;
}

export async function getVenueTicketDetail({
  context,
  ticketId,
}: {
  context: AuthorizedContext;
  ticketId?: string;
}): Promise<VenueTicketDetail | null> {
  if (!ticketId || !isSupabaseAdminConfigured()) {
    return null;
  }

  const venueIds = getVenueIds(context);

  if (venueIds?.length === 0) {
    return null;
  }

  const supabase = createAdminClient();
  let query = supabase
    .from("tickets")
    .select(
      "id, public_code, guest_name, guest_email, guest_phone, status, created_at, expires_at, activated_at, collected_at, item_type, item_description, item_count, storage_location, venue_id",
    )
    .eq("id", ticketId);

  if (venueIds) {
    query = query.in("venue_id", venueIds);
  }

  const { data: ticket } = await query.maybeSingle();

  if (!ticket) {
    return null;
  }

  const [venueNames, scans] = await Promise.all([
    getVenueNameMap(supabase, [ticket.venue_id]),
    supabase
      .from("ticket_scans")
      .select("id, scan_type, result, reason, created_at")
      .eq("ticket_id", ticket.id)
      .order("created_at", { ascending: true }),
  ]);

  return {
    activatedAt: ticket.activated_at,
    collectedAt: ticket.collected_at,
    createdAt: ticket.created_at,
    expiresAt: ticket.expires_at,
    guestEmail: ticket.guest_email,
    guestName: ticket.guest_name,
    guestPhone: ticket.guest_phone,
    id: ticket.id,
    itemCount: ticket.item_count,
    itemDescription: ticket.item_description,
    itemType: ticket.item_type,
    publicCode: ticket.public_code,
    scans:
      scans.data?.map((scan) => ({
        createdAt: scan.created_at,
        id: scan.id,
        reason: scan.reason,
        result: scan.result,
        scanType: scan.scan_type,
      })) ?? [],
    status: ticket.status,
    storageLocation: ticket.storage_location,
    venueName: venueNames.get(ticket.venue_id) ?? "Selected venue",
  };
}

export async function getVenueAnalyticsData(
  context: AuthorizedContext,
): Promise<VenueAnalyticsData> {
  if (!isSupabaseAdminConfigured()) {
    return emptyAnalyticsData();
  }

  const venueIds = getVenueIds(context);

  if (venueIds?.length === 0) {
    return emptyAnalyticsData();
  }

  const supabase = createAdminClient();
  const venueMeta = await getVenueLabel(supabase, venueIds);
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const recentTickets = await withVenueScope(
    supabase
      .from("tickets")
      .select("created_at, activated_at, collected_at, status, item_type")
      .gte("created_at", since)
      .order("created_at", { ascending: true })
      .limit(500),
    venueIds,
  );

  const tickets = recentTickets.data ?? [];
  const guests = tickets.length;
  const collected = tickets.filter((ticket) => ticket.status === "collected").length;
  const active = tickets.filter((ticket) => ticket.status === "active").length;
  const storageDurations = tickets
    .filter((ticket) => ticket.activated_at && ticket.collected_at)
    .map(
      (ticket) =>
        (new Date(ticket.collected_at as string).getTime() -
          new Date(ticket.activated_at as string).getTime()) /
        60000,
    );
  const avgStorage =
    storageDurations.length > 0
      ? storageDurations.reduce((sum, duration) => sum + duration, 0) / storageDurations.length
      : 0;
  const utilization = venueMeta.capacity > 0 ? Math.round((active / venueMeta.capacity) * 100) : 0;

  return {
    hourlyVolume: buildHourlyVolume(tickets.map((ticket) => ticket.created_at)),
    itemTypes: buildItemTypes(tickets.map((ticket) => ticket.item_type)),
    stats: [
      { label: "Guests", value: formatCount(guests), tone: "blue" },
      { label: "Collected", value: formatCount(collected), tone: "green" },
      { label: "Avg. storage", value: formatMinutes(avgStorage), tone: "neutral" },
      {
        label: "Utilization",
        value: `${utilization}%`,
        tone: utilization >= 90 ? "danger" : utilization >= 70 ? "warning" : "blue",
      },
    ],
    venueLabel: venueMeta.label,
  };
}

function buildHourlyVolume(values: string[]) {
  const counts = Array.from({ length: 8 }, (_, index) => ({
    count: 0,
    hour: `${String(index * 3).padStart(2, "0")}:00`,
    percent: 0,
  }));

  values.forEach((value) => {
    const hour = new Date(value).getHours();
    counts[Math.floor(hour / 3)].count += 1;
  });

  const max = Math.max(...counts.map((item) => item.count), 1);

  return counts.map((item) => ({
    ...item,
    percent: Math.max(8, Math.round((item.count / max) * 100)),
  }));
}

function buildItemTypes(values: Array<string | null>) {
  const counts = new Map<string, number>();

  values.forEach((value) => {
    const label = value || "Unassigned";
    counts.set(label, (counts.get(label) ?? 0) + 1);
  });

  const total = Math.max([...counts.values()].reduce((sum, count) => sum + count, 0), 1);

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([label, count]) => ({
      count,
      label,
      percent: Math.round((count / total) * 100),
    }));
}
