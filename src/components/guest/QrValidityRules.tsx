import Panel from "@/components/shared/Panel";

export default function QrValidityRules() {
  return (
    <Panel title="How your ticket works">
      <div className="space-y-3 text-sm leading-6 text-muted">
        {[
          "Choose the venue where you are storing your item.",
          "Show the generated QR at the counter to activate it.",
          "Scan the same QR again when collecting your item.",
        ].map((item) => (
          <div className="flex gap-3" key={item}>
            <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-success" />
            <p>{item}</p>
          </div>
        ))}
      </div>
    </Panel>
  );
}
