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

export type VenueStaffMember = {
  acceptedAt: string | null;
  email: string;
  id: string;
  name: string;
  role: "staff" | "manager";
};

export type VenueInfo = {
  address: string | null;
  bagCapacity: number;
  billingPlan: string | null;
  capacity: number;
  city: string | null;
  contactEmail: string;
  contactPhone: string | null;
  extraDevices: number;
  hangerCapacity: number;
  id: string;
  name: string;
  postalCode: string | null;
  slug: string;
  ticketExpiryHours: number | null;
};

export type UserProfile = {
  email: string;
  fullName: string | null;
  id: string;
  phone: string | null;
};

export type VenueApprovalStatus = "pending" | "approved" | "rejected" | "suspended";

export type VenueDashboardData = {
  activeFilter: TicketFilter;
  approvalStatus: VenueApprovalStatus;
  isManager: boolean;
  profile: UserProfile | null;
  queryMessage: string | null;
  search: string;
  staff: VenueStaffMember[];
  stats: Array<{ helper?: string; label: string; value: string; tone: StatusTone }>;
  tickets: VenueTicketListItem[];
  venue: VenueInfo | null;
  venues: VenueInfo[];
  venueLabel: string;
};

export type VenueAnalyticsData = {
  byEvent: Array<{ id: string; name: string; eventDate: string; tickets: number; collected: number }>;
  hourlyVolume: Array<{ hour: string; count: number; percent: number }>;
  itemTypes: Array<{ count: number; label: string; percent: number }>;
  stats: Array<{ label: string; value: string; tone: StatusTone }>;
  venueLabel: string;
};

export type VenueTicketItem = {
  id: string;
  label: string;
  quantity: number;
  notes: string | null;
  collectedAt: string | null;
};

export type VenueTicketDetail = VenueTicketListItem & {
  activatedAt: string | null;
  collectedAt: string | null;
  eventName: string | null;
  expiresAt: string;
  guestEmail: string;
  itemDescription: string | null;
  items: VenueTicketItem[];
  scans: Array<{
    createdAt: string;
    id: string;
    reason: string | null;
    result: Database["public"]["Enums"]["scan_result"];
    scanType: Database["public"]["Enums"]["scan_type"];
  }>;
};

export type TicketFilter = "all" | "pending" | "active" | "collected" | "expired";

// Note: "expired" is intentionally absent here. No ticket row ever holds the
// "expired" status — expiry is virtual (a pending_activation ticket whose
// expires_at has passed). It needs a compound filter, applied separately below.
const FILTER_TO_STATUS: Partial<Record<TicketFilter, TicketStatus[]>> = {
  active: ["active", "partially_collected"],
  collected: ["collected"],
  pending: ["pending_activation"],
};

function emptyVenueDashboardData(
  activeFilter: TicketFilter = "all",
  search = "",
): VenueDashboardData {
  return {
    activeFilter,
    approvalStatus: "pending",
    isManager: false,
    queryMessage: null,
    search,
    staff: [],
    stats: [
      { helper: "Tickets created today", label: "Today", value: "0", tone: "neutral" },
      { helper: "Waiting at counter", label: "Pending", value: "0", tone: "warning" },
      { helper: "Currently stored", label: "Stored", value: "0", tone: "green" },
      { helper: "Returned today", label: "Collected", value: "0", tone: "blue" },
      { helper: "Expired before activation", label: "Forgotten", value: "0", tone: "danger" },
      { helper: "Active storage use", label: "Capacity", value: "0%", tone: "blue" },
    ],
    profile: null,
    tickets: [],
    venue: null,
    venues: [],
    venueLabel: "No assigned venue",
  };
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  if (!isSupabaseAdminConfigured()) return null;
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, email, full_name, phone")
    .eq("id", userId)
    .maybeSingle();
  if (!data) return null;
  return { email: data.email, fullName: data.full_name, id: data.id, phone: data.phone };
}

function emptyAnalyticsData(): VenueAnalyticsData {
  return {
    byEvent: [],
    hourlyVolume: [],
    itemTypes: [],
    stats: [
      { label: "Guests", value: "0", tone: "neutral" },
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
  if (!Number.isFinite(value) || value <= 0) return "0m";
  if (value < 60) return `${Math.round(value)}m`;
  return `${Math.round(value / 60)}h`;
}

function getVenueIds(context: AuthorizedContext) {
  if (context.profileRole === "platform_admin") return null;
  return [...new Set(context.venueRoles.map((r) => r.venueId))];
}

function isManagerContext(context: AuthorizedContext) {
  return context.venueRoles.some((r) => r.role === "manager");
}

async function getVenueMeta(supabase: SupabaseAdmin, venueIds: string[] | null) {
  let query = supabase
    .from("venues")
    .select("id, name, capacity, hanger_capacity, bag_capacity, extra_devices, address, city, postal_code, contact_email, contact_phone, billing_plan, slug, ticket_expiry_hours")
    .order("name");

  if (venueIds) query = query.in("id", venueIds);

  const { data } = await query;
  const venues = data ?? [];
  const capacity = venues.reduce((s, v) => s + v.capacity, 0);
  const hangerCapacity = venues.reduce((s, v) => s + (v.hanger_capacity ?? 0), 0);
  const bagCapacity = venues.reduce((s, v) => s + (v.bag_capacity ?? 0), 0);
  const first = venues[0] ?? null;

  const venueInfoList: VenueInfo[] = venues.map((v) => ({
    address: v.address,
    bagCapacity: v.bag_capacity ?? 0,
    billingPlan: v.billing_plan,
    capacity: v.capacity,
    city: v.city,
    contactEmail: v.contact_email,
    contactPhone: v.contact_phone,
    extraDevices: v.extra_devices ?? 0,
    hangerCapacity: v.hanger_capacity ?? 0,
    id: v.id,
    name: v.name,
    postalCode: v.postal_code,
    slug: v.slug,
    ticketExpiryHours: v.ticket_expiry_hours ?? null,
  }));

  return {
    approvalStatus: "approved" as const,
    bagCapacity,
    capacity,
    hangerCapacity,
    label:
      venues.length === 0
        ? "No assigned venue"
        : venues.length === 1
          ? first!.name
          : `${venues.length} venues`,
    queryMessage: null,
    venue: venueInfoList[0] ?? null,
    venues: venueInfoList,
  };
}

async function getStaffList(supabase: SupabaseAdmin, venueIds: string[] | null): Promise<VenueStaffMember[]> {
  if (!venueIds || venueIds.length === 0) return [];

  const { data: staffRows } = await supabase
    .from("venue_staff")
    .select("id, profile_id, role, accepted_at, invited_email")
    .in("venue_id", venueIds)
    .not("profile_id", "is", null)
    .order("accepted_at", { ascending: false });

  if (!staffRows || staffRows.length === 0) return [];

  const profileIds = staffRows.map((s) => s.profile_id!).filter(Boolean);
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .in("id", profileIds);

  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));

  // Deduplicate by profile_id — a person linked to multiple venues appears once.
  // Prefer "manager" role over "staff" when the same person has both.
  const seen = new Map<string, VenueStaffMember>();
  for (const s of staffRows) {
    const pid = s.profile_id!;
    const profile = profileMap.get(pid);
    const member: VenueStaffMember = {
      acceptedAt: s.accepted_at,
      email: profile?.email ?? s.invited_email ?? "",
      id: s.id,
      name: profile?.full_name ?? profile?.email ?? "Staff member",
      role: s.role as "staff" | "manager",
    };
    const existing = seen.get(pid);
    if (!existing || member.role === "manager") {
      seen.set(pid, member);
    }
  }
  return [...seen.values()];
}

function getTodayStart() {
  const t = new Date();
  t.setHours(0, 0, 0, 0);
  return t.toISOString();
}

export function normalizeTicketFilter(value: string | undefined): TicketFilter {
  if (value === "pending" || value === "active" || value === "collected" || value === "expired") return value;
  return "all";
}

function normalizeSearch(value: string | undefined) {
  return (value ?? "").trim().slice(0, 80);
}

function searchPattern(value: string) {
  return `%${value.replaceAll("%", "").replaceAll(",", " ").trim()}%`;
}

async function getVenueNameMap(supabase: SupabaseAdmin, venueIds: string[]) {
  const names = new Map<string, string>();
  if (venueIds.length === 0) return names;
  const { data } = await supabase.from("venues").select("id, name").in("id", venueIds);
  data?.forEach((v) => names.set(v.id, v.name));
  return names;
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

  if (!isSupabaseAdminConfigured()) return emptyVenueDashboardData(activeFilter, normalizedSearch);

  const venueIds = getVenueIds(context);
  if (venueIds?.length === 0) return emptyVenueDashboardData(activeFilter, normalizedSearch);

  const supabase = createAdminClient();
  const todayStart = getTodayStart();
  const [venueMeta, staffList, profileRow] = await Promise.all([
    getVenueMeta(supabase, venueIds),
    isManagerContext(context) ? getStaffList(supabase, venueIds) : Promise.resolve([]),
    supabase.from("profiles").select("id, email, full_name, phone").eq("id", context.userId).maybeSingle(),
  ]);

  const scopedCount = () => {
    let q = supabase.from("tickets").select("id", { count: "exact", head: true });
    if (venueIds) q = q.in("venue_id", venueIds);
    return q;
  };

  let ticketQuery = supabase
    .from("tickets")
    .select("id, public_code, guest_name, guest_phone, status, created_at, item_type, item_count, storage_location, venue_id")
    .order("created_at", { ascending: false })
    .limit(60);

  if (venueIds) ticketQuery = ticketQuery.in("venue_id", venueIds);

  if (activeFilter === "expired") {
    // "Expired" means forgotten: a pending ticket that was never activated
    // before its expiry passed. Mirror the forgottenCount logic below.
    ticketQuery = ticketQuery
      .eq("status", "pending_activation")
      .lt("expires_at", new Date().toISOString());
  } else {
    const selectedStatuses = FILTER_TO_STATUS[activeFilter];
    if (selectedStatuses) ticketQuery = ticketQuery.in("status", selectedStatuses);
  }

  if (normalizedSearch) {
    const pattern = searchPattern(normalizedSearch);
    ticketQuery = ticketQuery.or(
      `guest_name.ilike.${pattern},guest_phone.ilike.${pattern},guest_email.ilike.${pattern},public_code.ilike.${pattern}`,
    );
  }

  const [todayCount, pendingCount, storedCount, collectedCount, forgottenCount, ticketRows] =
    await Promise.all([
      scopedCount().gte("created_at", todayStart),
      scopedCount().eq("status", "pending_activation"),
      scopedCount().in("status", ["active", "partially_collected"]),
      scopedCount().eq("status", "collected").gte("collected_at", todayStart),
      scopedCount().eq("status", "pending_activation").lt("expires_at", new Date().toISOString()),
      ticketQuery,
    ]);

  const usedCapacity = storedCount.count ?? 0;
  const utilization = venueMeta.capacity > 0 ? Math.round((usedCapacity / venueMeta.capacity) * 100) : 0;
  const venueNames = await getVenueNameMap(
    supabase,
    [...new Set(ticketRows.data?.map((t) => t.venue_id) ?? [])],
  );

  const profile = profileRow.data
    ? { email: profileRow.data.email, fullName: profileRow.data.full_name, id: profileRow.data.id, phone: profileRow.data.phone }
    : null;

  return {
    activeFilter,
    approvalStatus: venueMeta.approvalStatus,
    isManager: isManagerContext(context),
    profile,
    queryMessage: venueMeta.queryMessage,
    search: normalizedSearch,
    staff: staffList,
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
      ticketRows.data?.map((t) => ({
        createdAt: t.created_at,
        guestName: t.guest_name,
        guestPhone: t.guest_phone,
        id: t.id,
        itemCount: t.item_count,
        itemType: t.item_type,
        publicCode: t.public_code,
        status: t.status,
        storageLocation: t.storage_location,
        venueName: venueNames.get(t.venue_id) ?? venueMeta.label,
      })) ?? [],
    venue: venueMeta.venue,
    venues: venueMeta.venues,
    venueLabel: venueMeta.label,
  };
}

export async function getVenueTicketDetail({
  context,
  ticketId,
}: {
  context: AuthorizedContext;
  ticketId?: string;
}): Promise<VenueTicketDetail | null> {
  if (!ticketId || !isSupabaseAdminConfigured()) return null;

  const venueIds = getVenueIds(context);
  if (venueIds?.length === 0) return null;

  const supabase = createAdminClient();
  let query = supabase
    .from("tickets")
    .select("id, public_code, guest_name, guest_email, guest_phone, status, created_at, expires_at, activated_at, collected_at, item_type, item_description, item_count, storage_location, venue_id, event_id")
    .eq("id", ticketId);

  if (venueIds) query = query.in("venue_id", venueIds);

  const { data: ticket } = await query.maybeSingle();
  if (!ticket) return null;

  const [venueNames, scans, items, eventRow] = await Promise.all([
    getVenueNameMap(supabase, [ticket.venue_id]),
    supabase
      .from("ticket_scans")
      .select("id, scan_type, result, reason, created_at")
      .eq("ticket_id", ticket.id)
      .order("created_at", { ascending: true }),
    supabase
      .from("ticket_items")
      .select("id, label, quantity, notes, collected_at")
      .eq("ticket_id", ticket.id)
      .order("added_at", { ascending: true }),
    ticket.event_id
      ? supabase.from("events").select("name").eq("id", ticket.event_id).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  return {
    activatedAt: ticket.activated_at,
    collectedAt: ticket.collected_at,
    createdAt: ticket.created_at,
    eventName: eventRow.data?.name ?? null,
    expiresAt: ticket.expires_at,
    guestEmail: ticket.guest_email ?? "",
    guestName: ticket.guest_name,
    guestPhone: ticket.guest_phone,
    id: ticket.id,
    itemCount: ticket.item_count,
    itemDescription: ticket.item_description,
    items:
      items.data?.map((i) => ({
        collectedAt: i.collected_at,
        id: i.id,
        label: i.label,
        notes: i.notes,
        quantity: i.quantity,
      })) ?? [],
    itemType: ticket.item_type,
    publicCode: ticket.public_code,
    scans:
      scans.data?.map((s) => ({
        createdAt: s.created_at,
        id: s.id,
        reason: s.reason,
        result: s.result,
        scanType: s.scan_type,
      })) ?? [],
    status: ticket.status,
    storageLocation: ticket.storage_location,
    venueName: venueNames.get(ticket.venue_id) ?? "Selected venue",
  };
}

export async function getVenueAnalyticsData(context: AuthorizedContext): Promise<VenueAnalyticsData> {
  if (!isSupabaseAdminConfigured()) return emptyAnalyticsData();

  const venueIds = getVenueIds(context);
  if (venueIds?.length === 0) return emptyAnalyticsData();

  const supabase = createAdminClient();
  const venueMeta = await getVenueMeta(supabase, venueIds);
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  let q = supabase
    .from("tickets")
    .select("id, created_at, activated_at, collected_at, status, item_type, event_id")
    .gte("created_at", since)
    .order("created_at", { ascending: true })
    .limit(500);

  if (venueIds) q = q.in("venue_id", venueIds);

  const { data: recentTickets } = await q;
  const tickets = recentTickets ?? [];
  const guests = tickets.length;
  const collected = tickets.filter((t) => t.status === "collected").length;
  const active = tickets.filter(
    (t) => t.status === "active" || t.status === "partially_collected",
  ).length;
  const storageDurations = tickets
    .filter((t) => t.activated_at && t.collected_at)
    .map(
      (t) =>
        (new Date(t.collected_at as string).getTime() - new Date(t.activated_at as string).getTime()) / 60000,
    );
  const avgStorage =
    storageDurations.length > 0
      ? storageDurations.reduce((s, d) => s + d, 0) / storageDurations.length
      : 0;
  const utilization = venueMeta.capacity > 0 ? Math.round((active / venueMeta.capacity) * 100) : 0;

  // Item types from per-item rows (more accurate than the denormalized blob).
  const ticketIds = tickets.map((t) => t.id);
  let itemTypes: VenueAnalyticsData["itemTypes"];
  if (ticketIds.length > 0) {
    const { data: itemRows } = await supabase
      .from("ticket_items")
      .select("label, quantity")
      .in("ticket_id", ticketIds);
    if (itemRows && itemRows.length > 0) {
      itemTypes = buildItemTypesFromRows(itemRows);
    } else {
      itemTypes = buildItemTypes(tickets.map((t) => t.item_type));
    }
  } else {
    itemTypes = [];
  }

  const byEvent = await buildEventBreakdown(supabase, venueIds, tickets);

  return {
    byEvent,
    hourlyVolume: buildHourlyVolume(tickets.map((t) => t.created_at)),
    itemTypes,
    stats: [
      { label: "Guests", value: formatCount(guests), tone: "neutral" },
      { label: "Collected", value: formatCount(collected), tone: "green" },
      { label: "Avg. storage", value: formatMinutes(avgStorage), tone: "neutral" },
      {
        label: "Utilization",
        value: `${utilization}%`,
        tone: utilization >= 90 ? "danger" : utilization >= 70 ? "warning" : "neutral",
      },
    ],
    venueLabel: venueMeta.label,
  };
}

async function buildEventBreakdown(
  supabase: SupabaseAdmin,
  venueIds: string[] | null,
  tickets: Array<{ event_id: string | null; status: string }>,
): Promise<VenueAnalyticsData["byEvent"]> {
  const eventTickets = tickets.filter((t) => t.event_id);
  if (eventTickets.length === 0) return [];

  const eventIds = [...new Set(eventTickets.map((t) => t.event_id as string))];
  let eventsQuery = supabase.from("events").select("id, name, event_date").in("id", eventIds);
  if (venueIds) eventsQuery = eventsQuery.in("venue_id", venueIds);
  const { data: events } = await eventsQuery;

  const meta = new Map((events ?? []).map((e) => [e.id, e]));
  const counts = new Map<string, { tickets: number; collected: number }>();
  eventTickets.forEach((t) => {
    const key = t.event_id as string;
    const entry = counts.get(key) ?? { collected: 0, tickets: 0 };
    entry.tickets += 1;
    if (t.status === "collected") entry.collected += 1;
    counts.set(key, entry);
  });

  return [...counts.entries()]
    .map(([id, c]) => {
      const event = meta.get(id);
      return {
        collected: c.collected,
        eventDate: event?.event_date ?? "",
        id,
        name: event?.name ?? "Unknown event",
        tickets: c.tickets,
      };
    })
    .filter((e) => e.name !== "Unknown event")
    .sort((a, b) => b.tickets - a.tickets);
}

function buildHourlyVolume(values: string[]) {
  const counts = Array.from({ length: 8 }, (_, i) => ({
    count: 0,
    hour: `${String(i * 3).padStart(2, "0")}:00`,
    percent: 0,
  }));
  values.forEach((v) => {
    const h = new Date(v).getHours();
    counts[Math.floor(h / 3)].count += 1;
  });
  const max = Math.max(...counts.map((c) => c.count), 1);
  return counts.map((c) => ({ ...c, percent: Math.max(8, Math.round((c.count / max) * 100)) }));
}

function buildItemTypes(values: Array<string | null>) {
  const counts = new Map<string, number>();
  values.forEach((v) => {
    const label = v || "Unassigned";
    counts.set(label, (counts.get(label) ?? 0) + 1);
  });
  return summarizeCounts(counts);
}

function buildItemTypesFromRows(rows: Array<{ label: string; quantity: number }>) {
  const counts = new Map<string, number>();
  rows.forEach((r) => {
    const label = r.label || "Unassigned";
    counts.set(label, (counts.get(label) ?? 0) + (r.quantity || 1));
  });
  return summarizeCounts(counts);
}

function summarizeCounts(counts: Map<string, number>) {
  const total = Math.max([...counts.values()].reduce((s, c) => s + c, 0), 1);
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([label, count]) => ({ count, label, percent: Math.round((count / total) * 100) }));
}
