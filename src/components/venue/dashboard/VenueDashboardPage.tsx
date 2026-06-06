import Link from "next/link";
import { PrimaryLink, SecondaryLink } from "@/components/shared/ButtonLink";
import PageShell from "@/components/shared/PageShell";
import Panel from "@/components/shared/Panel";
import StatusPill from "@/components/shared/StatusPill";
import type { VenueDashboardData } from "@/lib/venue-dashboard";
import TodayTickets from "./TodayTickets";
import VenueStats from "./VenueStats";

export default function VenueDashboardPage({ data }: { data: VenueDashboardData }) {
  if (data.isManager) return <ManagerDashboard data={data} />;
  return <StaffDashboard data={data} />;
}

// ─── Shared pending alert ──────────────────────────────────────────────────────

function PendingAlert({ count }: { count: number }) {
  if (count === 0) return null;
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
      <div className="flex items-center gap-3">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-400 text-xs font-bold text-white">
          {count}
        </span>
        <p className="text-sm font-medium text-amber-900">
          {count === 1
            ? "1 guest is waiting at the counter to activate their pass."
            : `${count} guests are waiting at the counter to activate their passes.`}
        </p>
      </div>
      <Link
        className="shrink-0 rounded-lg bg-amber-400 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-500"
        href="/venuescanner"
      >
        Open scanner
      </Link>
    </div>
  );
}

// ─── Staff view ────────────────────────────────────────────────────────────────

function StaffDashboard({ data }: { data: VenueDashboardData }) {
  const pendingCount = Number(data.stats.find((s) => s.label === "Pending")?.value ?? 0);

  return (
    <PageShell
      activePath="/venuedashboard"
      eyebrow={data.venueLabel}
      title="Dashboard"
      venueRole="staff"
      actions={<PrimaryLink href="/venuescanner">Open scanner</PrimaryLink>}
    >
      <PendingAlert count={pendingCount} />
      <VenueStats stats={data.stats} />
      <TodayTickets data={data} />
    </PageShell>
  );
}

// ─── Manager view ───────────────────────────────────────────────────────────────

function ManagerDashboard({ data }: { data: VenueDashboardData }) {
  const pendingCount = Number(data.stats.find((s) => s.label === "Pending")?.value ?? 0);

  return (
    <PageShell
      activePath="/venuedashboard"
      eyebrow={data.venueLabel}
      title="Dashboard"
      venueRole="manager"
      actions={
        <>
          <PrimaryLink href="/venuescanner">Open scanner</PrimaryLink>
          <SecondaryLink href="/venueanalytics">Analytics</SecondaryLink>
          <SecondaryLink href="/venuesettings">Settings</SecondaryLink>
        </>
      }
    >
      <PendingAlert count={pendingCount} />
      <VenueStats stats={data.stats} />
      <div className="grid gap-5 xl:grid-cols-[1fr_280px]">
        <TodayTickets data={data} />
        <StaffRoster staff={data.staff} />
      </div>
    </PageShell>
  );
}

function StaffRoster({ staff }: { staff: VenueDashboardData["staff"] }) {
  return (
    <Panel title="Staff on roster">
      {staff.length === 0 ? (
        <div className="rounded-lg border border-dashed border-line bg-slate-50 px-4 py-5 text-center text-sm text-muted">
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
