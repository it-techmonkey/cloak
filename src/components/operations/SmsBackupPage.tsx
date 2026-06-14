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
      title="Phone backup lookup"
      description="When a guest's phone has died or they've lost their code, find their open ticket by phone number and complete check-in or collection here."
      venueRole={venueRole}
    >
      <BackupConsole />
    </PageShell>
  );
}
