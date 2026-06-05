import FieldPreview from "@/components/shared/FieldPreview";
import PageShell from "@/components/shared/PageShell";
import Panel from "@/components/shared/Panel";

export default function RegisterInterestPage() {
  return (
    <PageShell
      activePath="/"
      eyebrow="Public"
      title="Register interest"
      description="A simple lead capture page for venues before full signup and Stripe onboarding."
    >
      <Panel title="Your details">
        <div className="grid gap-4 sm:grid-cols-2">
          <FieldPreview label="Venue name" value="Your venue" />
          <FieldPreview label="Work email" value="you@example.com" />
          <FieldPreview label="Expected capacity" value="100 to 500 items" />
          <FieldPreview label="Status" value="Sales follow-up" />
        </div>
      </Panel>
    </PageShell>
  );
}
