import PageShell from "@/components/shared/PageShell";
import BackupConsole from "./BackupConsole";

export default function SmsBackupPage({
  venueRole = "manager",
}: {
  venueRole?: "staff" | "manager";
}) {
  return (
    <PageShell
      activePath="/smsbackup"
      eyebrow="Operations"
      title="Guest check-in"
      description="Create a ticket for a walk-in guest and activate storage at the counter."
      venueRole={venueRole}
    >
      <BackupConsole />
    </PageShell>
  );
}
