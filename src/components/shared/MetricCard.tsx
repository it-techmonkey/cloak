import type { StatusTone } from "./StatusPill";

const toneClass: Record<StatusTone, string> = {
  blue: "bg-foreground",
  danger: "bg-red-500",
  green: "bg-emerald-500",
  neutral: "bg-zinc-400",
  warning: "bg-amber-500",
};

export default function MetricCard({
  helper,
  label,
  value,
  tone = "neutral",
}: {
  helper?: string;
  label: string;
  value: string;
  tone?: StatusTone;
}) {
  return (
    <div className="rounded-lg border border-line bg-panel p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-muted">{label}</p>
        <span className={`mt-1 h-2.5 w-2.5 rounded-full ${toneClass[tone]}`} />
      </div>
      <p className="mt-3 text-2xl font-semibold text-foreground">{value}</p>
      {helper ? <p className="mt-2 text-xs leading-5 text-muted">{helper}</p> : null}
    </div>
  );
}

