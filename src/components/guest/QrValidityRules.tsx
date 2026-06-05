import Panel from "@/components/shared/Panel";

const rules = [
  {
    heading: "Venue-bound",
    body: "Your pass is tied to the venue you select. It can only be activated and collected there.",
  },
  {
    heading: "Valid for 24 hours",
    body: "Unused passes expire 24 hours after creation. Activated passes remain open until collection.",
  },
  {
    heading: "Fallback code included",
    body: "Every pass has a plain-text fallback code (CLK-…) that staff can enter manually if the QR cannot be scanned.",
  },
  {
    heading: "One pass per visit",
    body: "Each pass covers a single drop-off. Create a new pass if you need to store items again.",
  },
];

export default function QrValidityRules() {
  return (
    <Panel title="How your pass works">
      <div className="space-y-4">
        {rules.map((rule) => (
          <div className="flex gap-3" key={rule.heading}>
            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-success" />
            <div>
              <p className="text-sm font-semibold text-foreground">{rule.heading}</p>
              <p className="mt-0.5 text-sm leading-6 text-muted">{rule.body}</p>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}
