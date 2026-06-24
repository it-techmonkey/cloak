import AuthStatePage from "@/components/auth/AuthStatePage";
import VenueSettingsPage from "@/components/venue/settings/VenueSettingsPage";
import { requireVenueAccess } from "@/lib/auth/guards";
import { getVenueDashboardData } from "@/lib/venue-dashboard";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ error?: string; message?: string; venueId?: string }>;

export default async function Page({ searchParams }: { searchParams: SearchParams }) {
  const guard = await requireVenueAccess("/venuesettings", ["manager"]);

  if (guard.status === "not_configured") {
    return (
      <AuthStatePage
        title="Supabase is not configured"
        description="Add Supabase environment variables to use venue settings."
      />
    );
  }

  const params = await searchParams;
  const data = await getVenueDashboardData({ context: guard });

  const selectedVenue =
    params.venueId && data.venues.find((v) => v.id === params.venueId)
      ? data.venues.find((v) => v.id === params.venueId)!
      : data.venue;

  const origin = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://cloakqr.com").replace(/\/$/, "");
  const checkInUrl = selectedVenue ? `${origin}/customer-signup?venue=${selectedVenue.id}` : null;

  return (
    <VenueSettingsPage
      checkInUrl={checkInUrl}
      error={params.error}
      message={params.message}
      profile={data.profile}
      staff={data.staff}
      venue={selectedVenue ?? null}
      venues={data.venues}
    />
  );
}
