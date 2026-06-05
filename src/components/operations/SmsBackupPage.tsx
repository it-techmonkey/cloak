import FieldPreview from "@/components/shared/FieldPreview";
import PageShell from "@/components/shared/PageShell";
import Panel from "@/components/shared/Panel";

export default function SmsBackupPage() {
  return (
    <PageShell
      activePath="/smsbackup"
      eyebrow="Operations"
      title="SMS backup"
      description="Fallback lookup surface for manual ticket recovery. SMS sending remains a cost-controlled feature."
    >
      <Panel title="Backup lookup">
        <div className="grid gap-4 sm:grid-cols-3">
          <FieldPreview label="Mobile" value="+44 7700 123456" />
          <FieldPreview label="Ticket code" value="CLK-0001" />
          <FieldPreview label="Result" value="Pending activation" />
        </div>
      </Panel>
    </PageShell>
  );
}
