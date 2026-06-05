import { SecondaryLink } from "@/components/shared/ButtonLink";
import Panel from "@/components/shared/Panel";
import StatusPill from "@/components/shared/StatusPill";

export default function TicketUnavailablePage({
  reason,
}: {
  reason: "invalid" | "expired";
}) {
  return (
    <div className="min-h-screen bg-night text-white">
      <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-8">
        <Panel>
          <div className="grid gap-4">
            <StatusPill tone={reason === "expired" ? "warning" : "danger"}>
              {reason === "expired" ? "Ticket expired" : "Ticket unavailable"}
            </StatusPill>
            <div>
              <h1 className="text-2xl font-semibold text-foreground">
                We could not open this ticket
              </h1>
              <p className="mt-2 text-sm leading-6 text-muted">
                {reason === "expired"
                  ? "This ticket is past its validity window. Please speak with the venue counter."
                  : "The ticket link or code is invalid. Please check the details and try again."}
              </p>
            </div>
            <SecondaryLink href="/customer-signup">Create a new ticket</SecondaryLink>
          </div>
        </Panel>
      </main>
    </div>
  );
}
