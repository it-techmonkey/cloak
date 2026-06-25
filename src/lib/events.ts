import "server-only";

import type { AuthorizedContext } from "@/lib/auth/guards";
import { createAdminClient, isSupabaseAdminConfigured } from "@/lib/supabase/admin";

export type VenueEvent = {
  id: string;
  name: string;
  eventDate: string;
  startsAt: string | null;
  endsAt: string | null;
  active: boolean;
  ticketCount: number;
  venueId: string;
  venueName: string;
};

export type PublicEventOption = {
  id: string;
  name: string;
  eventDate: string;
};

function getManagerVenueIds(context: AuthorizedContext): string[] {
  return [
    ...new Set(
      context.venueRoles.filter((r) => r.role === "manager").map((r) => r.venueId),
    ),
  ];
}

/** Manager-facing: all events for the manager's venue(s), newest first. */
export async function getVenueEvents(context: AuthorizedContext): Promise<VenueEvent[]> {
  if (!isSupabaseAdminConfigured()) return [];

  const venueIds = getManagerVenueIds(context);
  if (venueIds.length === 0) return [];

  const supabase = createAdminClient();
  const { data: rawEvents } = await supabase
    .from("events")
    .select("id, name, event_date, starts_at, ends_at, active, venue_id, venues(name)")
    .in("venue_id", venueIds)
    .order("event_date", { ascending: false })
    .limit(100);

  const events = rawEvents as Array<{
    id: string;
    name: string;
    event_date: string;
    starts_at: string | null;
    ends_at: string | null;
    active: boolean;
    venue_id: string;
    venues: { name: string } | null;
  }> | null;

  if (!events || events.length === 0) return [];

  const eventIds = events.map((e) => e.id);
  const { data: tickets } = await supabase
    .from("tickets")
    .select("event_id")
    .in("event_id", eventIds);

  const counts = new Map<string, number>();
  (tickets ?? []).forEach((t) => {
    if (t.event_id) counts.set(t.event_id, (counts.get(t.event_id) ?? 0) + 1);
  });

  return events.map((e) => ({
    active: e.active,
    endsAt: e.ends_at,
    eventDate: e.event_date,
    id: e.id,
    name: e.name,
    startsAt: e.starts_at,
    ticketCount: counts.get(e.id) ?? 0,
    venueId: e.venue_id,
    venueName: (e.venues as { name: string } | null)?.name ?? "",
  }));
}

/** Guest-facing: active events for a venue, used in the check-in dropdown. */
export async function getActiveEventsForVenue(venueId: string): Promise<PublicEventOption[]> {
  if (!isSupabaseAdminConfigured() || !venueId) return [];

  const supabase = createAdminClient();
  const { data } = await supabase
    .from("events")
    .select("id, name, event_date")
    .eq("venue_id", venueId)
    .eq("active", true)
    .order("event_date", { ascending: true })
    .limit(50);

  return (
    data?.map((e) => ({
      eventDate: e.event_date,
      id: e.id,
      name: e.name,
    })) ?? []
  );
}

/** Guest-facing: active events for several venues at once (check-in form). */
export async function getActiveEventsForVenues(
  venueIds: string[],
): Promise<Record<string, PublicEventOption[]>> {
  if (!isSupabaseAdminConfigured() || venueIds.length === 0) return {};

  const supabase = createAdminClient();
  const { data } = await supabase
    .from("events")
    .select("id, venue_id, name, event_date")
    .in("venue_id", venueIds)
    .eq("active", true)
    .order("event_date", { ascending: true });

  const byVenue: Record<string, PublicEventOption[]> = {};
  (data ?? []).forEach((e) => {
    (byVenue[e.venue_id] ??= []).push({
      eventDate: e.event_date,
      id: e.id,
      name: e.name,
    });
  });
  return byVenue;
}

/** Verify an event belongs to a venue and is active (used at ticket creation). */
export async function isEventValidForVenue(eventId: string, venueId: string): Promise<boolean> {
  if (!isSupabaseAdminConfigured() || !eventId) return false;

  const supabase = createAdminClient();
  const { data } = await supabase
    .from("events")
    .select("id")
    .eq("id", eventId)
    .eq("venue_id", venueId)
    .eq("active", true)
    .maybeSingle();

  return Boolean(data);
}
