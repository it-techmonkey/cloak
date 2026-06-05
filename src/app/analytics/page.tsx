import AuthStatePage from "@/components/auth/AuthStatePage";
import AnalyticsPage from "@/components/venue/analytics/AnalyticsPage";
import { requirePlatformAdmin } from "@/lib/auth/guards";
import { getVenueAnalyticsData } from "@/lib/venue-dashboard";

export const dynamic = "force-dynamic";

export default async function Page() {
  const guard = await requirePlatformAdmin("/analytics");

  if (guard.status === "not_configured") {
    return (
      <AuthStatePage
        title="Supabase is not configured"
        description="Add Supabase environment variables before using platform analytics."
      />
    );
  }

  const data = await getVenueAnalyticsData(guard);

  return <AnalyticsPage data={data} />;
}
