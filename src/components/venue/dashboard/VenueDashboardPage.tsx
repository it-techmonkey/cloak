import { PrimaryLink, SecondaryLink } from "@/components/shared/ButtonLink";
import PageShell from "@/components/shared/PageShell";
import Panel from "@/components/shared/Panel";
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
      <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <Panel
          title="Counter workflow"
          description="Use this during live operations to move guests through storage and collection."
        >
          <div className="grid gap-3 sm:grid-cols-3">
            <WorkflowItem
              label="1. Verify pass"
              value="Scan QR or enter fallback code at the counter."
            />
            <WorkflowItem
              label="2. Store item"
              value="Record item type, count, notes, and storage location."
            />
            <WorkflowItem
              label="3. Complete checkout"
              value="Scan again when the guest receives their item."
            />
          </div>
        </Panel>
        <Panel title="Quick actions">
          <div className="grid gap-3">
            <PrimaryLink href="/venuescanner">Open scanner</PrimaryLink>
            <SecondaryLink href="/venueanalytics">Review analytics</SecondaryLink>
            <SecondaryLink href="/venuesettings">Manage staff and settings</SecondaryLink>
          </div>
        </Panel>
      </div>
      <TodayTickets data={data} />
    </PageShell>
  );
}

function WorkflowItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-line bg-slate-50 p-4">
      <p className="text-sm font-semibold text-foreground">{label}</p>
      <p className="mt-2 text-sm leading-6 text-muted">{value}</p>
    </div>
  );
}
