import AuthStatePage from "@/components/auth/AuthStatePage";
import VenueScannerPage from "@/components/venue/scanner/VenueScannerPage";
import { requireVenueAccess } from "@/lib/auth/guards";

export const dynamic = "force-dynamic";

export default async function Page() {
  const guard = await requireVenueAccess("/venuescanner");

  if (guard.status === "not_configured") {
    return (
      <AuthStatePage
        title="Supabase is not configured"
        description="Add Supabase environment variables before using the venue scanner."
      />
    );
  }

  return <VenueScannerPage />;
}
