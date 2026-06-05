import Panel from "@/components/shared/Panel";

const rules = [
  {
    heading: "Pending ticket",
    body: "Enter item type, count, and storage location, then confirm activation.",
  },
  {
    heading: "Active ticket",
    body: "Confirm the guest has received their stored item before completing checkout.",
  },
  {
    heading: "Blocked ticket",
    body: "Wrong venue, expired, cancelled, or already collected — the system will reject the action and log the attempt.",
  },
];

export default function ScanOutcomes() {
  return (
    <Panel title="Counter guide">
      <div className="space-y-4 text-sm">
        {rules.map((rule) => (
          <div className="flex gap-3" key={rule.heading}>
            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand" />
            <div>
              <p className="font-semibold text-foreground">{rule.heading}</p>
              <p className="mt-0.5 leading-6 text-muted">{rule.body}</p>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}
