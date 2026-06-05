import PageShell from "@/components/shared/PageShell";
import StatusList from "@/components/shared/StatusList";
import type { AdminDashboardData } from "@/lib/admin-dashboard";
import PendingVenueApprovals from "./PendingVenueApprovals";
import { SecondaryLink } from "@/components/shared/ButtonLink";

export default function MasterDashboardPage({
  data,
  message,
}: {
  data: AdminDashboardData;
  message?: string;
}) {
  return (
    <PageShell
      activePath="/masterdashboard"
      eyebrow="Platform admin"
      title="Venue approval dashboard"
      description="Review venue registrations, billing readiness, and platform-wide operations."
      actions={<SecondaryLink href="/analytics">Analytics</SecondaryLink>}
    >
      {message ? (
        <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700">
          {message}
        </div>
      ) : null}
      <StatusList items={data.stats} />
      <PendingVenueApprovals venues={data.venues} />
    </PageShell>
  );
}
