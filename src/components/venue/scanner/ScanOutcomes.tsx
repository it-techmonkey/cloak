import Panel from "@/components/shared/Panel";

export default function ScanOutcomes() {
  return (
    <Panel title="Counter rules">
      <div className="space-y-3 text-sm text-muted">
        {[
          "Pending ticket: staff records item details, storage location, and confirms activation.",
          "Active ticket: staff confirms the guest has received the stored item before checkout.",
          "Wrong venue, expired, cancelled, or collected ticket: the system blocks the action.",
        ].map((item) => (
          <div className="flex gap-3" key={item}>
            <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-brand" />
            <p>{item}</p>
          </div>
        ))}
      </div>
    </Panel>
  );
}
