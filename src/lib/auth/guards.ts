import { redirect } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

export type AuthIssue = {
  status: "not_configured";
};

export type AuthorizedContext = {
  status: "authorized";
  userId: string;
  profileRole: "guest" | "platform_admin";
  venueRoles: Array<{
    venueId: string;
    role: "staff" | "manager";
  }>;
};

type GuardResult = AuthIssue | AuthorizedContext;

function loginPath(nextPath: string) {
  return `/?signin=1&next=${encodeURIComponent(nextPath)}`;
}

async function getAuthContext(nextPath: string): Promise<GuardResult> {
  if (!isSupabaseConfigured()) {
    return { status: "not_configured" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(loginPath(nextPath));
  }

  const [{ data: profile }, { data: venueRoles }] = await Promise.all([
    supabase.from("profiles").select("role").eq("id", user.id).maybeSingle(),
    supabase.from("venue_staff").select("venue_id, role").eq("profile_id", user.id),
  ]);

  return {
    status: "authorized",
    userId: user.id,
    profileRole: profile?.role ?? "guest",
    venueRoles:
      venueRoles?.map((venueRole) => ({
        role: venueRole.role,
        venueId: venueRole.venue_id,
      })) ?? [],
  };
}

export async function requirePlatformAdmin(nextPath: string) {
  const context = await getAuthContext(nextPath);

  if (context.status !== "authorized") {
    return context;
  }

  if (context.profileRole !== "platform_admin") {
    redirect("/unauthorized");
  }

  return context;
}

export async function requireVenueAccess(
  nextPath: string,
  allowedRoles: Array<"staff" | "manager"> = ["staff", "manager"],
) {
  const context = await getAuthContext(nextPath);

  if (context.status !== "authorized") {
    return context;
  }

  if (context.profileRole === "platform_admin") {
    redirect("/unauthorized");
  }

  const hasVenueRole = context.venueRoles.some((venueRole) =>
    allowedRoles.includes(venueRole.role),
  );

  if (!hasVenueRole) {
    redirect("/unauthorized");
  }

  return context;
}
