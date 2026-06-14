import AuthStatePage from "@/components/auth/AuthStatePage";
import VenueEventsPage from "@/components/venue/events/VenueEventsPage";
import { requireVenueAccess } from "@/lib/auth/guards";
import { getVenueEvents } from "@/lib/events";

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

  return <VenueEventsPage error={params.error} events={events} message={params.message} />;
}
