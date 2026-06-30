import AuthStatePage from "@/components/auth/AuthStatePage";
import VenueDashboardPage from "@/components/venue/dashboard/VenueDashboardPage";
import { requireVenueAccess } from "@/lib/auth/guards";
import { getVenueDashboardData, normalizeTicketFilter } from "@/lib/venue-dashboard";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{
  filter?: string;
  q?: string;
  range?: string;
  from?: string;
  to?: string;
  venueId?: string;
}>;

export default async function Page({ searchParams }: { searchParams: SearchParams }) {
  const guard = await requireVenueAccess("/venuedashboard");

  if (guard.status === "not_configured") {
    return (
      <AuthStatePage
        title="Supabase is not configured"
        description="Add Supabase environment variables to use the venue dashboard."
      />
    );
  }

  const params = await searchParams;
  const data = await getVenueDashboardData({
    context: guard,
    filter: normalizeTicketFilter(params.filter),
    range: params.range,
    search: params.q,
    from: params.from,
    to: params.to,
  });

  return <VenueDashboardPage data={data} selectedVenueId={params.venueId} />;
}
