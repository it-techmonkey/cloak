import Link from "next/link";
import { PrimaryLink, SecondaryLink } from "@/components/shared/ButtonLink";
import PageShell from "@/components/shared/PageShell";
import Panel from "@/components/shared/Panel";
import StatusPill from "@/components/shared/StatusPill";
import type { VenueDashboardData } from "@/lib/venue-dashboard";
import ApprovalBanner from "./ApprovalBanner";
import LiveDashboardStats, { type LiveCounts } from "./LiveDashboardStats";
import TodayTickets from "./TodayTickets";

export default function VenueDashboardPage({
  data,
  selectedVenueId,
}: {
  data: VenueDashboardData;
  selectedVenueId?: string;
}) {
  if (data.isManager) return <ManagerDashboard data={data} selectedVenueId={selectedVenueId} />;
  return <StaffDashboard data={data} />;
}

function buildInitialCounts(data: VenueDashboardData, selectedVenueId?: string): LiveCounts {
  const get = (label: string) =>
    Number(data.stats.find((s) => s.label === label)?.value ?? 0);

  const selectedVenue =
    selectedVenueId && data.venues.length > 1
      ? data.venues.find((v) => v.id === selectedVenueId)
      : undefined;

  const venueSource = selectedVenue ?? data.venue;

  return {
    bagCapacity: venueSource?.bagCapacity ?? 0,
    bagStored: 0,
    capacity: venueSource?.capacity ?? 0,
    collected: get("Collected"),
    forgotten: get("Forgotten"),
    hangerCapacity: venueSource?.hangerCapacity ?? 0,
    hangerStored: 0,
    pending: get("Pending"),
    stored: get("Stored"),
    today: get("Today"),
  };
}

// ─── Staff view ────────────────────────────────────────────────────────────────

function StaffDashboard({ data }: { data: VenueDashboardData }) {
  const isLocked = data.approvalStatus !== "approved";
  return (
    <PageShell
      activePath="/venuedashboard"
      eyebrow={data.venueLabel}
      locked={isLocked}
      title="Dashboard"
      venueRole="staff"
      actions={
        isLocked ? null : <PrimaryLink href="/venuescanner">Open scanner</PrimaryLink>
      }
    >
      <ApprovalBanner />
      <LiveDashboardStats
        initialCounts={buildInitialCounts(data)}
        showCapacityBar={false}
        venueId={data.venue?.id ?? null}
      />
      <TodayTickets data={data} />
    </PageShell>
  );
}

// ─── Manager view ───────────────────────────────────────────────────────────────

function ManagerDashboard({
  data,
  selectedVenueId,
}: {
  data: VenueDashboardData;
  selectedVenueId?: string;
}) {
  const isLocked = data.approvalStatus !== "approved";
  const activeVenueId = data.venue?.id ?? null;

  return (
    <PageShell
      activePath="/venuedashboard"
      eyebrow={data.venueLabel}
      locked={isLocked}
      title="Dashboard"
      venueRole="manager"
      actions={
        isLocked ? null : (
          <>
            <PrimaryLink href="/venuescanner">Open scanner</PrimaryLink>
            <SecondaryLink href="/venueanalytics">Analytics</SecondaryLink>
            <SecondaryLink href="/venuesettings">Settings</SecondaryLink>
          </>
        )
      }
    >
      {/* Venue switcher — only shown when managing multiple venues */}
      {data.venues.length > 1 && (
        <div className="flex gap-1 overflow-x-auto pb-px">
          {data.venues.map((v) => (
            <a
              className={`shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition ${
                v.id === (selectedVenueId ?? activeVenueId)
                  ? "bg-foreground text-white"
                  : "border border-line bg-white text-muted hover:border-foreground/20 hover:text-foreground"
              }`}
              href={`/venuedashboard?venueId=${v.id}`}
              key={v.id}
            >
              {v.name}
            </a>
          ))}
        </div>
      )}

      <ApprovalBanner />
      <LiveDashboardStats
        initialCounts={buildInitialCounts(data, selectedVenueId)}
        showCapacityBar={!isLocked}
        venueId={activeVenueId}
      />
      <div className="grid gap-5 xl:grid-cols-[1fr_280px]">
        <TodayTickets data={data} />
        {!isLocked && <StaffRoster staff={data.staff} />}
      </div>
    </PageShell>
  );
}

function StaffRoster({ staff }: { staff: VenueDashboardData["staff"] }) {
  return (
    <Panel title="Staff on roster">
      {staff.length === 0 ? (
        <div className="rounded-lg border border-dashed border-line bg-zinc-50 px-4 py-5 text-center text-sm text-muted">
          No staff accounts yet.{" "}
          <Link className="font-medium text-brand hover:underline" href="/venuesettings">
            Add staff
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-line">
          {staff.map((member) => (
            <div className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0" key={member.id}>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{member.name}</p>
                <p className="mt-0.5 truncate text-xs text-muted">{member.email}</p>
              </div>
              <StatusPill tone={member.role === "manager" ? "blue" : "neutral"}>
                {member.role === "manager" ? "Manager" : "Staff"}
              </StatusPill>
            </div>
          ))}
        </div>
      )}
      <div className="mt-4 border-t border-line pt-4">
        <Link className="text-sm font-medium text-brand hover:underline" href="/venuesettings">
          Manage staff →
        </Link>
      </div>
    </Panel>
  );
}

