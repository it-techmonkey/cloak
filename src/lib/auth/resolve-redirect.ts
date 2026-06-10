"use server";

import { createAdminClient, isSupabaseAdminConfigured } from "@/lib/supabase/admin";

export async function resolvePostLoginRedirect(userId: string, explicitNext: string): Promise<string> {
  // If a specific destination was requested and it's not the root, honour it
  // (but only after we confirm the user has the right role — guards handle that)
  if (!isSupabaseAdminConfigured()) return explicitNext !== "/" ? explicitNext : "/";

  const supabase = createAdminClient();
  const [{ data: profile }, { data: venueRoles }] = await Promise.all([
    supabase.from("profiles").select("role").eq("id", userId).maybeSingle(),
    supabase.from("venue_staff").select("venue_id").eq("profile_id", userId).limit(1),
  ]);

  if (profile?.role === "platform_admin") return "/masterdashboard";
  if (venueRoles && venueRoles.length > 0) return "/venuedashboard";
  // Customer — honour explicit next or go to home
  return explicitNext !== "/" ? explicitNext : "/";
}
