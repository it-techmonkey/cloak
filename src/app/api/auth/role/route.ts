import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createAdminClient, isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import { getSupabaseEnv } from "@/lib/supabase/env";

export async function GET(request: NextRequest) {
  const env = getSupabaseEnv();
  if (!env.url || !env.key) {
    return NextResponse.json({ destination: "/" });
  }

  // Accept the access token from the Authorization header so this works
  // immediately after signInWithPassword (before cookies are written)
  const authHeader = request.headers.get("authorization");
  const accessToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!accessToken) {
    return NextResponse.json({ destination: "/" });
  }

  // Use the token directly to get the user — no cookie needed
  const supabase = createServerClient(env.url, env.key, {
    cookies: { getAll: () => [], setAll: () => {} },
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });

  const { data: { user }, error } = await supabase.auth.getUser(accessToken);

  if (error || !user) {
    return NextResponse.json({ destination: "/" });
  }

  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json({ destination: "/" });
  }

  const admin = createAdminClient();
  const [{ data: profile }, { data: venueRoles }] = await Promise.all([
    admin.from("profiles").select("role").eq("id", user.id).maybeSingle(),
    admin.from("venue_staff").select("venue_id").eq("profile_id", user.id).limit(1),
  ]);

  if (profile?.role === "platform_admin") {
    return NextResponse.json({ destination: "/masterdashboard" });
  }
  if (venueRoles && venueRoles.length > 0) {
    return NextResponse.json({ destination: "/venuedashboard" });
  }
  return NextResponse.json({ destination: "/" });
}
