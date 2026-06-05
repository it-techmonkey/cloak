import AuthStatePage from "@/components/auth/AuthStatePage";
import AnalyticsPage from "@/components/venue/analytics/AnalyticsPage";
import { requireVenueAccess } from "@/lib/auth/guards";
import { getVenueAnalyticsData } from "@/lib/venue-dashboard";

export const dynamic = "force-dynamic";

export default async function Page() {
  const guard = await requireVenueAccess("/venueanalytics");

  if (guard.status === "not_configured") {
    return (
      <AuthStatePage
        title="Supabase is not configured"
        description="Add Supabase environment variables before using venue analytics."
      />
    );
  }

  const data = await getVenueAnalyticsData(guard);

  return <AnalyticsPage data={data} venueOnly />;
}
