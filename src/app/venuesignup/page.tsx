import VenueSignupPage from "@/components/venue/signup/VenueSignupPage";
import { getDraftVenueId } from "@/lib/venue-signup-session";
import { getVenueSignupSummary } from "@/lib/venues";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{
  error?: string | string[];
}>;

function getParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function Page({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const venue = await getVenueSignupSummary(await getDraftVenueId());
  const step = !venue ? 1 : venue.billingPlan ? 3 : 2;

  return <VenueSignupPage error={getParam(params.error)} step={step} venue={venue} />;
}
