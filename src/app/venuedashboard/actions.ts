"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient, isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import { requireVenueAccess } from "@/lib/auth/guards";

export async function endEvent(eventId: string): Promise<void> {
  if (!isSupabaseAdminConfigured()) return;

  const guard = await requireVenueAccess("/venuedashboard");
  if (guard.status !== "authorized") return;

  const allowedVenueIds = guard.venueRoles
    .filter((r) => r.role === "manager")
    .map((r) => r.venueId);
  if (allowedVenueIds.length === 0) return;

  const supabase = createAdminClient();

  // Mark event as inactive
  await supabase
    .from("events")
    .update({ active: false })
    .eq("id", eventId)
    .in("venue_id", allowedVenueIds);

  // Mark all pending tickets for this event as expired (set expires_at to now)
  // so they appear as "forgotten"
  await supabase
    .from("tickets")
    .update({ expires_at: new Date().toISOString() })
    .eq("event_id", eventId)
    .eq("status", "pending_activation")
    .in("venue_id", allowedVenueIds);

  revalidatePath("/venuedashboard");
}


export async function deletePendingTicket(ticketId: string): Promise<void> {
  if (!isSupabaseAdminConfigured()) return;

  const guard = await requireVenueAccess("/venuedashboard");
  if (guard.status !== "authorized") return;

  const allowedVenueIds = guard.venueRoles.map((r) => r.venueId);
  const supabase = createAdminClient();

  // Only allow deleting tickets that are pending (never activated) and belong to this venue
  const { data: ticket } = await supabase
    .from("tickets")
    .select("id, venue_id, status")
    .eq("id", ticketId)
    .eq("status", "pending_activation")
    .in("venue_id", allowedVenueIds)
    .maybeSingle();

  if (!ticket) return;

  await supabase.from("ticket_items").delete().eq("ticket_id", ticketId);
  await supabase.from("tickets").delete().eq("id", ticketId);

  revalidatePath("/venuedashboard");
}
