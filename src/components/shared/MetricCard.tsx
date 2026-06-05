import StatusPill, { type StatusTone } from "./StatusPill";

export default function MetricCard({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: StatusTone;
}) {
  return (
    <div className="rounded-lg border border-line bg-panel p-4 shadow-sm">
      <p className="text-sm text-muted">{label}</p>
      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="text-2xl font-semibold text-foreground">{value}</p>
        <StatusPill tone={tone}>Status</StatusPill>
      </div>
    </div>
  );
}
