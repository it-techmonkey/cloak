import { SecondaryLink } from "@/components/shared/ButtonLink";
import PageShell from "@/components/shared/PageShell";
import type { AdminDashboardData } from "@/lib/admin-dashboard";
import VenueMapPanel from "./VenueMapPanel";
import VenueTable from "./VenueTable";

// ─── SVG icons ────────────────────────────────────────────────────────────────

function IconClock() {
  return (
    <svg fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" className="h-5 w-5">
      <circle cx="12" cy="12" r="9" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 7v5l3 3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconBuilding() {
  return (
    <svg fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" className="h-5 w-5">
      <path d="M3 21h18M4 21V8l8-5 8 5v13M9 21v-5h6v5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconCheckCircle() {
  return (
    <svg fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" className="h-5 w-5">
      <path d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconBox() {
  return (
    <svg fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" className="h-5 w-5">
      <path d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconTicket() {
  return (
    <svg fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" className="h-5 w-5">
      <path d="M16.5 6v.75a3 3 0 0 1 0 6v.75m0-7.5H7.5m9 7.5H7.5m0-7.5v-.75a3 3 0 0 0 0 6v.75M3 9.75h18v4.5H3z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconExclamation() {
  return (
    <svg fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" className="h-5 w-5">
      <path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const STAT_ICONS: Record<string, React.ReactNode> = {
  "Pending venues": <IconClock />,
  "Active venues": <IconBuilding />,
  "Approved venues": <IconCheckCircle />,
  "Stored items": <IconBox />,
  "Total tickets": <IconTicket />,
  "Billing issues": <IconExclamation />,
};

type Tone = "green" | "warning" | "danger" | "neutral" | "blue";

// All cards share the same white/zinc surface — tone only affects the icon chip.
const cardStyle: Record<Tone, { icon: string }> = {
  blue:    { icon: "bg-zinc-100 text-zinc-500" },
  danger:  { icon: "bg-zinc-100 text-zinc-500" },
  green:   { icon: "bg-zinc-100 text-zinc-500" },
  neutral: { icon: "bg-zinc-100 text-zinc-500" },
  warning: { icon: "bg-zinc-100 text-zinc-500" },
};

function normalizeTone(t: string): Tone {
  if (t === "green" || t === "warning" || t === "danger" || t === "blue") return t as Tone;
  return "neutral";
}

function StatCard({
  stat,
}: {
  stat: AdminDashboardData["stats"][number];
}) {
  const tone = normalizeTone(stat.tone);
  const style = cardStyle[tone];
  const isPending = stat.label === "Pending venues" && Number(stat.value) > 0;
  const isBilling = stat.label === "Billing issues" && Number(stat.value) > 0;
  const hasAlert = isPending || isBilling;

  return (
    <div
      className="relative flex flex-col justify-between rounded-xl border border-line bg-panel p-5 shadow-sm"
      title={stat.helper}
    >
      {hasAlert && (
        <span className="absolute right-4 top-4 flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-zinc-400 opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-zinc-500" />
        </span>
      )}
      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${style.icon}`}>
        {STAT_ICONS[stat.label] ?? <IconBuilding />}
      </div>
      <div className="mt-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted">{stat.label}</p>
        <p className="mt-1 text-3xl font-bold tabular-nums text-foreground">
          {stat.value}
        </p>
        {stat.helper && (
          <p className="mt-1 text-xs text-muted">{stat.helper}</p>
        )}
      </div>
    </div>
  );
}

export default function MasterDashboardPage({
  data,
  message,
}: {
  data: AdminDashboardData;
  message?: string;
}) {
  const pending = data.stats.find((s) => s.label === "Pending venues");
  const hasPending = Number(pending?.value ?? 0) > 0;

  // Split stats: urgent first (pending + billing), then operational
  const urgentLabels = ["Pending venues", "Billing issues"];
  const urgentStats = data.stats.filter((s) => urgentLabels.includes(s.label));
  const operationalStats = data.stats.filter((s) => !urgentLabels.includes(s.label));

  return (
    <PageShell
      activePath="/masterdashboard"
      eyebrow="Platform admin"
      title="Admin console"
      description="Monitor venues, manage approvals, and track platform health."
      actions={<SecondaryLink href="/analytics">View analytics</SecondaryLink>}
    >
      {/* Toast notification */}
      {message ? (
        <div className="flex items-center gap-3 rounded-xl border border-line bg-panel px-4 py-3.5 text-sm font-medium text-foreground shadow-sm">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-foreground text-xs text-white">✓</span>
          {message}
        </div>
      ) : null}

      {/* Attention banner when reviews are waiting */}
      {hasPending && (
        <div className="flex items-start gap-4 rounded-xl border border-line bg-panel px-5 py-4 shadow-sm">
          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600">
            <IconClock />
          </span>
          <div>
            <p className="text-sm font-semibold text-foreground">
              {pending!.value} venue{Number(pending!.value) !== 1 ? "s" : ""} awaiting review
            </p>
            <p className="mt-0.5 text-xs text-muted">
              Scroll to the venue table and filter by "Pending review" to action them.
            </p>
          </div>
        </div>
      )}

      {/* ── Stat grid ── */}
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted">
          Requires attention
        </p>
        <div className="grid grid-cols-2 gap-3">
          {urgentStats.map((stat) => (
            <StatCard key={stat.label} stat={stat} />
          ))}
        </div>
      </div>

      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted">
          Platform overview
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {operationalStats.map((stat) => (
            <StatCard key={stat.label} stat={stat} />
          ))}
        </div>
      </div>

      {/* ── Map + table ── */}
      <VenueMapPanel venues={data.venues} />
      <VenueTable venues={data.venues} />
    </PageShell>
  );
}
