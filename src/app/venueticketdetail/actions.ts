"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient, isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import { requireVenueAccess } from "@/lib/auth/guards";

export async function collectItemsFromDetail(
  ticketId: string,
  itemIds: string[],
): Promise<{ ok: boolean; allCollected: boolean }> {
  if (!isSupabaseAdminConfigured() || itemIds.length === 0) {
    return { ok: false, allCollected: false };
  }

  const guard = await requireVenueAccess("/venueticketdetail");
  if (guard.status !== "authorized") return { ok: false, allCollected: false };

  const allowedVenueIds = guard.venueRoles.map((r) => r.venueId);
  const supabase = createAdminClient();

  const { data: ticket } = await supabase
    .from("tickets")
    .select("id, venue_id, status")
    .eq("id", ticketId)
    .in("venue_id", allowedVenueIds)
    .maybeSingle();

  if (!ticket) return { ok: false, allCollected: false };

  const now = new Date().toISOString();

  await supabase
    .from("ticket_items")
    .update({ collected_at: now, collected_by: guard.userId })
    .in("id", itemIds)
    .eq("ticket_id", ticketId);

  // Check if all items are now collected
  const { data: remaining } = await supabase
    .from("ticket_items")
    .select("id")
    .eq("ticket_id", ticketId)
    .is("collected_at", null);

  const allCollected = (remaining?.length ?? 0) === 0;

  if (allCollected) {
    await supabase
      .from("tickets")
      .update({ status: "collected", collected_at: now })
      .eq("id", ticketId);
  } else {
    await supabase
      .from("tickets")
      .update({ status: "partially_collected" })
      .eq("id", ticketId);
  }

  revalidatePath(`/venueticketdetail`);
  revalidatePath("/venuedashboard");

  return { ok: true, allCollected };
}
