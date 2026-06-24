import { createAdminClient, isSupabaseAdminConfigured } from "@/lib/supabase/admin";

export type AdminVenueReview = {
  address: string | null;
  bagCapacity: number;
  billingPlan: string | null;
  billingStatus: string;
  capacity: number;
  city: string | null;
  contactEmail: string;
  contactPhone: string | null;
  createdAt: string;
  extraDevices: number;
  hangerCapacity: number;
  id: string;
  latitude: number | null;
  longitude: number | null;
  name: string;
  postalCode: string | null;
  queryMessage: string | null;
  submittedAt: string | null;
  status: "pending" | "approved" | "rejected" | "suspended";
};

export type AdminDashboardData = {
  stats: Array<{ helper?: string; label: string; value: string; tone: "blue" | "green" | "warning" | "danger" | "neutral" }>;
  venues: AdminVenueReview[];
};

function formatCount(value: number | null) {
  return String(value ?? 0);
}

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  if (!isSupabaseAdminConfigured()) {
    return {
      stats: [
        { helper: "Awaiting review", label: "Pending venues", value: "0", tone: "warning" },
        { helper: "Visible to guests", label: "Active venues", value: "0", tone: "green" },
        { helper: "Passed review", label: "Approved venues", value: "0", tone: "green" },
        { helper: "Currently stored", label: "Stored items", value: "0", tone: "blue" },
        { helper: "All generated tickets", label: "Total tickets", value: "0", tone: "blue" },
        { helper: "Needs billing action", label: "Billing issues", value: "0", tone: "danger" },
      ],
      venues: [],
    };
  }

  const supabase = createAdminClient();
  const [
    pendingVenues,
    activeVenues,
    approvedVenues,
    storedTickets,
    ticketCount,
    billingIssues,
    venueRows,
  ] = await Promise.all([
    supabase
      .from("venues")
      .select("id", { count: "exact", head: true }),
    supabase
      .from("venues")
      .select("id", { count: "exact", head: true })
      .not("submitted_at", "is", null)
      .eq("active", true),
    supabase
      .from("venues")
      .select("id", { count: "exact", head: true })
      .eq("active", true),
    supabase
      .from("tickets")
      .select("id", { count: "exact", head: true })
      .eq("status", "active"),
    supabase.from("tickets").select("id", { count: "exact", head: true }),
    supabase
      .from("venues")
      .select("id", { count: "exact", head: true })
      .in("billing_status", ["incomplete", "past_due", "canceled", "unpaid"]),
    supabase
      .from("venues")
      .select(
        "id, name, address, city, postal_code, contact_email, contact_phone, capacity, hanger_capacity, bag_capacity, extra_devices, billing_plan, billing_status, created_at, latitude, longitude",
      )
      .eq("active", true)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  return {
    stats: [
      { helper: "Awaiting review", label: "Pending venues", value: formatCount(pendingVenues.count), tone: "warning" },
      { helper: "Visible to guests", label: "Active venues", value: formatCount(activeVenues.count), tone: "green" },
      { helper: "Passed review", label: "Approved venues", value: formatCount(approvedVenues.count), tone: "green" },
      { helper: "Currently stored", label: "Stored items", value: formatCount(storedTickets.count), tone: "blue" },
      { helper: "All generated tickets", label: "Total tickets", value: formatCount(ticketCount.count), tone: "blue" },
      { helper: "Needs billing action", label: "Billing issues", value: formatCount(billingIssues.count), tone: "danger" },
    ],
    venues:
      venueRows.data?.map((venue) => ({
        address: venue.address ?? null,
        bagCapacity: venue.bag_capacity ?? 0,
        billingPlan: venue.billing_plan,
        billingStatus: venue.billing_status,
        capacity: venue.capacity,
        city: venue.city,
        contactEmail: venue.contact_email,
        contactPhone: venue.contact_phone,
        createdAt: venue.created_at,
        extraDevices: venue.extra_devices ?? 0,
        hangerCapacity: venue.hanger_capacity ?? 0,
        id: venue.id,
        latitude: venue.latitude ?? null,
        longitude: venue.longitude ?? null,
        name: venue.name,
        postalCode: venue.postal_code ?? null,
        queryMessage: null,
        submittedAt: venue.created_at,
        status: "approved" as const,
      })) ?? [],
  };
}
