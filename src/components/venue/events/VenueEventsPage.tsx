import PageShell from "@/components/shared/PageShell";
import Panel from "@/components/shared/Panel";
import SubmitButton from "@/components/shared/SubmitButton";
import { createEvent, setEventActive } from "@/app/venueevents/actions";
import type { VenueEvent } from "@/lib/events";

const input =
  "w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-foreground outline-none transition placeholder:text-zinc-400 focus:border-foreground/40 focus:ring-2 focus:ring-foreground/8";

function formatDate(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    weekday: "short",
    year: "numeric",
  });
}

function formatTime(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

function SectionAlert({ type, message }: { type: "success" | "error"; message: string }) {
  return (
    <div
      className={`rounded-lg border px-4 py-3 text-sm font-medium ${
        type === "success"
          ? "border-emerald-100 bg-emerald-50 text-emerald-700"
          : "border-red-100 bg-red-50 text-red-700"
      }`}
    >
      {message}
    </div>
  );
}

export default function VenueEventsPage({
  error,
  events,
  message,
}: {
  error?: string;
  events: VenueEvent[];
  message?: string;
}) {
  const activeEvents = events.filter((e) => e.active);
  const closedEvents = events.filter((e) => !e.active);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <PageShell
      activePath="/venueevents"
      eyebrow="Events"
      title="Events"
      description="Create the nights your venue runs. Guests pick one when they check in."
      venueRole="manager"
    >
      {message ? <SectionAlert message={message} type="success" /> : null}
      {error ? <SectionAlert message={error} type="error" /> : null}

      <Panel title="Create an event" description="Name the night and set its date. Times are optional.">
        <form action={createEvent} className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="sm:col-span-2">
              <span className="mb-1.5 block text-sm font-medium text-foreground">Event name</span>
              <input className={input} name="name" placeholder="e.g. Friday Night Live" required />
            </label>
            <label>
              <span className="mb-1.5 block text-sm font-medium text-foreground">Date</span>
              <input className={input} defaultValue={today} name="eventDate" required type="date" />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label>
                <span className="mb-1.5 block text-sm font-medium text-foreground">Starts</span>
                <input className={input} name="startsAt" type="time" />
              </label>
              <label>
                <span className="mb-1.5 block text-sm font-medium text-foreground">Ends</span>
                <input className={input} name="endsAt" type="time" />
              </label>
            </div>
          </div>
          <div className="flex justify-end">
            <SubmitButton>Create event</SubmitButton>
          </div>
        </form>
      </Panel>

      <Panel title="Active events" description="Shown to guests at check-in.">
        {activeEvents.length === 0 ? (
          <div className="rounded-lg border border-dashed border-line bg-zinc-50 px-4 py-8 text-center text-sm text-muted">
            No active events. Create one above to let guests tag their visit.
          </div>
        ) : (
          <div className="divide-y divide-line">
            {activeEvents.map((event) => (
              <EventRow event={event} key={event.id} />
            ))}
          </div>
        )}
      </Panel>

      {closedEvents.length > 0 && (
        <Panel title="Closed events">
          <div className="divide-y divide-line">
            {closedEvents.map((event) => (
              <EventRow event={event} key={event.id} />
            ))}
          </div>
        </Panel>
      )}
    </PageShell>
  );
}

function EventRow({ event }: { event: VenueEvent }) {
  const start = formatTime(event.startsAt);
  const end = formatTime(event.endsAt);
  const timeLabel = start && end ? `${start}–${end}` : start ? `from ${start}` : null;

  return (
    <div className="flex items-center justify-between gap-4 py-3.5 first:pt-0 last:pb-0">
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-foreground">{event.name}</p>
        <p className="mt-0.5 text-xs text-muted">
          {formatDate(event.eventDate)}
          {timeLabel ? ` · ${timeLabel}` : ""}
          {` · ${event.ticketCount} ticket${event.ticketCount === 1 ? "" : "s"}`}
        </p>
      </div>
      <form action={setEventActive}>
        <input name="eventId" type="hidden" value={event.id} />
        <input name="active" type="hidden" value={event.active ? "0" : "1"} />
        <button
          className={`shrink-0 rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
            event.active
              ? "border-line text-muted hover:border-foreground/30 hover:text-foreground"
              : "border-foreground bg-foreground text-white hover:opacity-90"
          }`}
          type="submit"
        >
          {event.active ? "Close" : "Reopen"}
        </button>
      </form>
    </div>
  );
}
