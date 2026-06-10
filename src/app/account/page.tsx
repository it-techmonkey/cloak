import { redirect } from "next/navigation";
import Link from "next/link";
import { getAccountData, checkAccountAccess, type CustomerTicket } from "./actions";
import AccountEditForm from "./AccountEditForm";
import AccountSignOutButton from "./AccountSignOutButton";

function statusLabel(status: string) {
  switch (status) {
    case "pending_activation": return "Awaiting activation";
    case "active": return "Stored";
    case "collected": return "Collected";
    case "cancelled": return "Cancelled";
    case "expired": return "Expired";
    default: return status;
  }
}

function statusColor(status: string) {
  switch (status) {
    case "active": return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "pending_activation": return "bg-amber-50 text-amber-700 border-amber-200";
    case "collected": return "bg-slate-100 text-slate-600 border-slate-200";
    default: return "bg-red-50 text-red-600 border-red-200";
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });
}

export default async function AccountPage() {
  const access = await checkAccountAccess();
  if (access === "unauthenticated") redirect("/?signin=1");
  if (access === "admin") redirect("/masterdashboard");
  if (access === "venue") redirect("/venuedashboard");

  const data = await getAccountData();
  if (!data) redirect("/?signin=1");

  const active = data.tickets.filter((t) => t.status === "active" || t.status === "pending_activation");
  const past = data.tickets.filter((t) => t.status !== "active" && t.status !== "pending_activation");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-line bg-panel/95 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-3xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link className="flex items-center gap-2.5" href="/">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-foreground text-xs font-bold text-white">CL</span>
            <span className="text-sm font-semibold text-foreground">Cloak</span>
          </Link>
          <AccountSignOutButton />
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
        <div className="grid gap-6">

          {/* Profile card */}
          <div className="rounded-xl border border-line bg-panel p-5">
            <div className="mb-4 flex items-center gap-4">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-foreground text-sm font-bold text-white">
                {data.fullName
                  ? data.fullName.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
                  : data.email[0].toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-foreground">{data.fullName ?? "No name set"}</p>
                <p className="text-sm text-muted">{data.email}</p>
              </div>
            </div>
            <AccountEditForm fullName={data.fullName} phone={data.phone} />
          </div>

          {/* Active tickets */}
          {active.length > 0 && (
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted">Active tickets</p>
              <div className="grid gap-3">
                {active.map((t) => (
                  <TicketCard key={t.ticketId} ticket={t} />
                ))}
              </div>
            </div>
          )}

          {/* Past tickets */}
          {past.length > 0 && (
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted">Past tickets</p>
              <div className="grid gap-3">
                {past.map((t) => (
                  <TicketCard key={t.ticketId} ticket={t} />
                ))}
              </div>
            </div>
          )}

          {data.tickets.length === 0 && (
            <div className="rounded-xl border border-line bg-panel px-5 py-10 text-center">
              <p className="text-sm font-medium text-foreground">No tickets yet</p>
              <p className="mt-1 text-sm text-muted">Your cloakroom tickets will appear here once created.</p>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}

function TicketCard({ ticket }: { ticket: CustomerTicket }) {
  return (
    <Link
      className="flex items-center justify-between gap-4 rounded-xl border border-line bg-panel p-4 transition hover:border-foreground/20 hover:shadow-sm"
      href={`/ticket?code=${encodeURIComponent(ticket.ticketId)}`}
    >
      <div className="min-w-0">
        <p className="truncate font-medium text-foreground">{ticket.venueName}</p>
        <p className="mt-0.5 text-xs text-muted">
          {ticket.itemType ?? "Items"} · {formatDate(ticket.createdAt)}
        </p>
        {ticket.storageLocation && (
          <p className="mt-1 font-mono text-xs font-bold text-foreground">{ticket.storageLocation}</p>
        )}
      </div>
      <div className="flex shrink-0 flex-col items-end gap-2">
        <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusColor(ticket.status)}`}>
          {statusLabel(ticket.status)}
        </span>
        <span className="font-mono text-xs text-muted">{ticket.ticketId}</span>
      </div>
    </Link>
  );
}

