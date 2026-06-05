import { PrimaryLink, SecondaryLink } from "@/components/shared/ButtonLink";
import PageShell from "@/components/shared/PageShell";
import type { VenueDashboardData } from "@/lib/venue-dashboard";
import TodayTickets from "./TodayTickets";
import VenueStats from "./VenueStats";

export default function VenueDashboardPage({ data }: { data: VenueDashboardData }) {
  return (
    <PageShell
      activePath="/venuedashboard"
      eyebrow="Venue"
      title={data.venueLabel}
      description="Track pending tickets, stored items, collections, and capacity from one compact venue view."
      actions={
        <>
          <PrimaryLink href="/venuescanner">Scan ticket</PrimaryLink>
          <SecondaryLink href="/venueanalytics">Analytics</SecondaryLink>
          <SecondaryLink href="/venuesettings">Settings</SecondaryLink>
        </>
      }
    >
      <VenueStats stats={data.stats} />
      <TodayTickets data={data} />
    </PageShell>
  );
}
