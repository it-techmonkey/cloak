import { createAdminClient, isSupabaseAdminConfigured } from "@/lib/supabase/admin";

export type AdminVenueReview = {
  billingPlan: string | null;
  billingStatus: string;
  capacity: number;
  city: string | null;
  contactEmail: string;
  contactPhone: string | null;
  createdAt: string;
  id: string;
  name: string;
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
      .select("id", { count: "exact", head: true })
      .not("submitted_at", "is", null)
      .eq("approval_status", "pending"),
    supabase
      .from("venues")
      .select("id", { count: "exact", head: true })
      .not("submitted_at", "is", null)
      .eq("active", true),
    supabase
      .from("venues")
      .select("id", { count: "exact", head: true })
      .not("submitted_at", "is", null)
      .eq("approval_status", "approved"),
    supabase
      .from("tickets")
      .select("id", { count: "exact", head: true })
      .eq("status", "active"),
    supabase.from("tickets").select("id", { count: "exact", head: true }),
    supabase
      .from("venues")
      .select("id", { count: "exact", head: true })
      .not("submitted_at", "is", null)
      .in("billing_status", ["incomplete", "past_due", "canceled", "unpaid"]),
    supabase
      .from("venues")
      .select(
        "id, name, city, contact_email, contact_phone, capacity, approval_status, billing_plan, billing_status, created_at, submitted_at",
      )
      .not("submitted_at", "is", null)
      .order("submitted_at", { ascending: false })
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
        billingPlan: venue.billing_plan,
        billingStatus: venue.billing_status,
        capacity: venue.capacity,
        city: venue.city,
        contactEmail: venue.contact_email,
        contactPhone: venue.contact_phone,
        createdAt: venue.created_at,
        id: venue.id,
        name: venue.name,
        submittedAt: venue.submitted_at,
        status: venue.approval_status,
      })) ?? [],
  };
}
