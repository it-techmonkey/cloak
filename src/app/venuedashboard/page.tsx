import AuthStatePage from "@/components/auth/AuthStatePage";
import VenueDashboardPage from "@/components/venue/dashboard/VenueDashboardPage";
import { requireVenueAccess } from "@/lib/auth/guards";
import { getVenueDashboardData } from "@/lib/venue-dashboard";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{
  filter?: string | string[];
  q?: string | string[];
}>;

function getParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function Page({ searchParams }: { searchParams: SearchParams }) {
  const guard = await requireVenueAccess("/venuedashboard");

  if (guard.status === "not_configured") {
    return (
      <AuthStatePage
        title="Supabase is not configured"
        description="Add Supabase environment variables before using venue operations."
      />
    );
  }

  const params = await searchParams;
  const data = await getVenueDashboardData({
    context: guard,
    filter: getParam(params.filter),
    search: getParam(params.q),
  });

  return <VenueDashboardPage data={data} />;
}
