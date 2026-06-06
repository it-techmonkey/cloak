"use server";

import { redirect } from "next/navigation";
import { createAdminClient, isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

function safeNextPath(value: FormDataEntryValue | null) {
  const nextPath = typeof value === "string" ? value : "/";
  if (!nextPath.startsWith("/") || nextPath.startsWith("//")) return "/";
  return nextPath;
}

async function resolvePostLoginPath(userId: string, explicitNext: string): Promise<string> {
  // If the caller already set a specific destination, honour it
  if (explicitNext !== "/") return explicitNext;

  if (!isSupabaseAdminConfigured()) return "/";

  const supabase = createAdminClient();

  const [{ data: profile }, { data: venueRoles }] = await Promise.all([
    supabase.from("profiles").select("role").eq("id", userId).maybeSingle(),
    supabase.from("venue_staff").select("venue_id").eq("profile_id", userId).limit(1),
  ]);

  if (profile?.role === "platform_admin") return "/masterdashboard";
  if (venueRoles && venueRoles.length > 0) return "/venuedashboard";
  return "/";
}

export async function signInWithPassword(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const nextPath = safeNextPath(formData.get("next"));

  if (!isSupabaseConfigured()) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}&message=supabase-not-configured`);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}&message=signin-failed`);
  }

  const destination = await resolvePostLoginPath(data.user.id, nextPath);
  redirect(destination);
}

export async function signOut() {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect("/login");
}
