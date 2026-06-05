import AuthStatePage from "@/components/auth/AuthStatePage";
import MasterDashboardPage from "@/components/admin/MasterDashboardPage";
import { requirePlatformAdmin } from "@/lib/auth/guards";
import { getAdminDashboardData } from "@/lib/admin-dashboard";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{
  message?: string | string[];
}>;

function getParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function Page({ searchParams }: { searchParams: SearchParams }) {
  const guard = await requirePlatformAdmin("/masterdashboard");

  if (guard.status === "not_configured") {
    return (
      <AuthStatePage
        title="Supabase is not configured"
        description="Add Supabase environment variables before using the platform admin dashboard."
      />
    );
  }

  const [params, data] = await Promise.all([searchParams, getAdminDashboardData()]);

  return <MasterDashboardPage data={data} message={getParam(params.message)} />;
}
