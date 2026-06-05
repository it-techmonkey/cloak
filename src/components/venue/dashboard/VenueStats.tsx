import StatusList from "@/components/shared/StatusList";
import type { VenueDashboardData } from "@/lib/venue-dashboard";

export default function VenueStats({ stats }: { stats: VenueDashboardData["stats"] }) {
  return <StatusList items={stats} />;
}
