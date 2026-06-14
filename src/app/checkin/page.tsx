import GuestCheckInPage from "@/components/guest/GuestCheckInPage";
import { getSelectableVenues } from "@/lib/tickets";
import { getActiveEventsForVenues } from "@/lib/events";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{
  error?: string | string[];
}>;

function getParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function Page({ searchParams }: { searchParams: SearchParams }) {
  const [params, venues] = await Promise.all([searchParams, getSelectableVenues()]);
  const eventsByVenue = await getActiveEventsForVenues(venues.map((v) => v.id));

  return (
    <GuestCheckInPage
      error={getParam(params.error)}
      eventsByVenue={eventsByVenue}
      venues={venues}
    />
  );
}
