import FieldPreview from "@/components/shared/FieldPreview";
import PageShell from "@/components/shared/PageShell";
import Panel from "@/components/shared/Panel";

export default function VenueSettingsPage() {
  return (
    <PageShell
      activePath="/venuedashboard"
      eyebrow="Venue"
      title="Venue settings"
      description="Manage QR entry link, venue details, capacity, event naming, and active status."
    >
      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <Panel title="Venue QR link">
          <div className="grid aspect-square max-w-56 place-items-center rounded-lg border border-line bg-slate-950 text-white">
            QR
          </div>
          <p className="mt-4 break-all rounded-md bg-slate-50 p-3 text-sm text-muted">
            /customer-signup?venue=techmonkey-space
          </p>
        </Panel>
        <Panel title="Venue details">
          <div className="grid gap-4 sm:grid-cols-2">
            <FieldPreview label="Venue name" value="TechMonkey Space" />
            <FieldPreview label="Capacity" value="100 slots" />
            <FieldPreview label="Contact email" value="ops@example.com" />
            <FieldPreview label="Billing status" value="Dummy billing active" />
          </div>
        </Panel>
      </div>
    </PageShell>
  );
}
