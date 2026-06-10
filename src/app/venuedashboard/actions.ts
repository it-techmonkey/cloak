"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireVenueAccess } from "@/lib/auth/guards";
import { createAdminClient, isSupabaseAdminConfigured } from "@/lib/supabase/admin";

export async function submitQueryResponse(formData: FormData) {
  const guard = await requireVenueAccess("/venuedashboard", ["manager"]);
  if (guard.status !== "authorized") redirect("/?signin=1");
  if (!isSupabaseAdminConfigured()) redirect("/venuedashboard?error=unavailable");

  const responseText = String(formData.get("responseText") ?? "").trim();
  const venueId = String(formData.get("venueId") ?? "").trim();
  if (!venueId || !responseText) redirect("/venuedashboard?error=missing");

  const supabase = createAdminClient();

  // Store the venue's response appended to the rejection_reason so admin can see it
  const { data: venue } = await supabase
    .from("venues")
    .select("rejection_reason")
    .eq("id", venueId)
    .maybeSingle();

  const existing = venue?.rejection_reason ?? "";
  const updated = `${existing}\n\n— Venue response: ${responseText}`;

  await supabase
    .from("venues")
    .update({ rejection_reason: updated })
    .eq("id", venueId);

  revalidatePath("/venuedashboard");
  redirect("/venuedashboard?message=response_sent");
}
