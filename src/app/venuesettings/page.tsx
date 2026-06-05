import AuthStatePage from "@/components/auth/AuthStatePage";
import VenueSettingsPage from "@/components/venue/settings/VenueSettingsPage";
import { requireVenueAccess } from "@/lib/auth/guards";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{
  error?: string | string[];
  message?: string | string[];
}>;

function getParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function Page({ searchParams }: { searchParams: SearchParams }) {
  const guard = await requireVenueAccess("/venuesettings", ["manager"]);

  if (guard.status === "not_configured") {
    return (
      <AuthStatePage
        title="Supabase is not configured"
        description="Add Supabase environment variables before managing venue settings."
      />
    );
  }

  const params = await searchParams;

  return (
    <VenueSettingsPage
      error={getParam(params.error)}
      message={getParam(params.message)}
    />
  );
}
