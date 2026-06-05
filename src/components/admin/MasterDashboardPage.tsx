import PageShell from "@/components/shared/PageShell";
import Panel from "@/components/shared/Panel";
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
      title="Platform operations"
      description="Review submitted venues, monitor billing readiness, and keep cloakroom operations controlled before guest access is enabled."
      actions={<SecondaryLink href="/analytics">Analytics</SecondaryLink>}
    >
      {message ? (
        <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700">
          {message}
        </div>
      ) : null}
      <StatusList items={data.stats} />
      <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <Panel title="Review checklist">
          <div className="grid gap-3 text-sm text-muted">
            <AdminChecklistItem text="Confirm venue name, manager contact details, and physical location." />
            <AdminChecklistItem text="Verify the selected operating plan is appropriate for the venue's scale." />
            <AdminChecklistItem text="Rejected and suspended venues remain invisible to guests immediately." />
          </div>
        </Panel>
        <Panel title="Operational notes">
          <div className="grid gap-3 sm:grid-cols-3">
            <AdminNote label="Guest access" value="Only approved, active venues appear in the guest check-in form." />
            <AdminNote label="Venue workspace" value="Managers and staff access operations via their dedicated workspace." />
            <AdminNote label="Approval effect" value="Approving a venue immediately enables guest check-in for that location." />
          </div>
        </Panel>
      </div>
      <PendingVenueApprovals venues={data.venues} />
    </PageShell>
  );
}

function AdminChecklistItem({ text }: { text: string }) {
  return (
    <div className="flex gap-3 rounded-lg bg-slate-50 px-3 py-2.5">
      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
      <p>{text}</p>
    </div>
  );
}

function AdminNote({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-line bg-slate-50 p-4">
      <p className="text-sm font-semibold text-foreground">{label}</p>
      <p className="mt-2 text-sm leading-6 text-muted">{value}</p>
    </div>
  );
}
