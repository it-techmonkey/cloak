type Tone = "blue" | "green" | "warning" | "danger" | "neutral";

const toneClass: Record<Tone, string> = {
  blue: "text-blue-600",
  danger: "text-red-600",
  green: "text-emerald-600",
  neutral: "text-foreground",
  warning: "text-amber-600",
};

export default function VenueStats({
  stats,
}: {
  stats: Array<{ helper?: string; label: string; value: string; tone: Tone }>;
}) {
  return (
    <div className="grid grid-cols-3 divide-x divide-line overflow-hidden rounded-xl border border-line bg-panel shadow-sm lg:grid-cols-6">
      {stats.map((stat) => (
        <div className="flex flex-col gap-1 px-4 py-4" key={stat.label} title={stat.helper}>
          <span className="text-xs font-medium uppercase tracking-wide text-muted">
            {stat.label}
          </span>
          <span className={`text-2xl font-semibold tabular-nums ${toneClass[stat.tone]}`}>
            {stat.value}
          </span>
        </div>
      ))}
    </div>
  );
}
