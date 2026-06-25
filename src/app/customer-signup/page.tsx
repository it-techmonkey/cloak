import GuestCheckInPage from "@/components/guest/GuestCheckInPage";
import { getSelectableVenues } from "@/lib/tickets";
import { getActiveEventsForVenues } from "@/lib/events";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{
  error?: string | string[];
  event?: string | string[];
  venue?: string | string[];
}>;

function getParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function Page({ searchParams }: { searchParams: SearchParams }) {
  const [params, venues] = await Promise.all([searchParams, getSelectableVenues()]);
  const eventsByVenue = await getActiveEventsForVenues(venues.map((v) => v.id));

  const rawVenue = getParam(params.venue);
  // Resolve slug → UUID so the venue dropdown pre-selects correctly
  let defaultVenueId = rawVenue;
  if (rawVenue && !UUID_RE.test(rawVenue)) {
    defaultVenueId = venues.find((v) => v.slug === rawVenue)?.id ?? rawVenue;
  }

  return (
    <GuestCheckInPage
      defaultEventId={getParam(params.event)}
      defaultVenueId={defaultVenueId}
      error={getParam(params.error)}
      eventsByVenue={eventsByVenue}
      venues={venues}
    />
  );
}
