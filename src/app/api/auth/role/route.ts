import { NextResponse } from "next/server";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { createAdminClient, isSupabaseAdminConfigured } from "@/lib/supabase/admin";

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ destination: "/" });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
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
