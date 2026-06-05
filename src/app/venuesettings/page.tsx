import AuthStatePage from "@/components/auth/AuthStatePage";
import VenueSettingsPage from "@/components/venue/settings/VenueSettingsPage";
import { requireVenueAccess } from "@/lib/auth/guards";

export const dynamic = "force-dynamic";

export default async function Page() {
  const guard = await requireVenueAccess("/venuesettings", ["manager"]);

  if (guard.status === "not_configured") {
    return (
      <AuthStatePage
        title="Supabase is not configured"
        description="Add Supabase environment variables before managing venue settings."
      />
    );
  }

  return <VenueSettingsPage />;
}
