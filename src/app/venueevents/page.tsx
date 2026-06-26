import AuthStatePage from "@/components/auth/AuthStatePage";
import VenueEventsPage from "@/components/venue/events/VenueEventsPage";
import { requireVenueAccess } from "@/lib/auth/guards";
import { getVenueEvents } from "@/lib/events";
import { createAdminClient, isSupabaseAdminConfigured } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ error?: string; message?: string }>;

export default async function Page({ searchParams }: { searchParams: SearchParams }) {
  const guard = await requireVenueAccess("/venueevents", ["manager"]);

  if (guard.status === "not_configured") {
    return (
      <AuthStatePage
        title="Supabase is not configured"
        description="Add Supabase environment variables to manage events."
      />
    );
  }

  const [params, events] = await Promise.all([searchParams, getVenueEvents(guard)]);

  const managerVenueRoles =
    guard.status === "authorized"
      ? guard.venueRoles.filter((r) => r.role === "manager")
      : [];

  // Build unique venue list from events (already fetched with venue name)
  const venueMap = new Map<string, string>();
  events.forEach((e) => venueMap.set(e.venueId, e.venueName));

  // Ensure all manager venues appear even if they have no events yet — fetch real names
  const missingIds = managerVenueRoles.map((r) => r.venueId).filter((id) => !venueMap.has(id));
  if (missingIds.length > 0 && isSupabaseAdminConfigured()) {
    const { data } = await createAdminClient()
      .from("venues")
      .select("id, name")
      .in("id", missingIds);
    (data ?? []).forEach((v) => venueMap.set(v.id, v.name));
    missingIds.filter((id) => !venueMap.has(id)).forEach((id) => venueMap.set(id, id));
  }

  const venues = Array.from(venueMap.entries()).map(([id, name]) => ({ id, name }));

  const origin = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://cloakqr.com").replace(/\/$/, "");

  return (
    <VenueEventsPage
      error={params.error}
      events={events}
      message={params.message}
      origin={origin}
      venues={venues}
    />
  );
}
