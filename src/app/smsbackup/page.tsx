import AuthStatePage from "@/components/auth/AuthStatePage";
import SmsBackupPage from "@/components/operations/SmsBackupPage";
import { requireVenueAccess } from "@/lib/auth/guards";

export const dynamic = "force-dynamic";

export default async function Page() {
  const guard = await requireVenueAccess("/smsbackup", ["staff", "manager"]);

  if (guard.status === "not_configured") {
    return (
      <AuthStatePage
        title="Supabase is not configured"
        description="Add Supabase environment variables before using operational backup tools."
      />
    );
  }

  const isManager = guard.venueRoles.some((r) => r.role === "manager");
  return <SmsBackupPage venueRole={isManager ? "manager" : "staff"} />;
}
