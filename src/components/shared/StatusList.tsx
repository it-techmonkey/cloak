import MetricCard from "./MetricCard";
import type { StatusTone } from "./StatusPill";

export default function StatusList({
  items,
}: {
  items: Array<{ helper?: string; label: string; value: string; tone?: StatusTone }>;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <MetricCard
          helper={item.helper}
          key={item.label}
          label={item.label}
          value={item.value}
          tone={item.tone}
        />
      ))}
    </div>
  );
}
