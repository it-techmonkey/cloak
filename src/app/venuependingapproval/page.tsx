import VenuePendingApprovalPage from "@/components/venue/signup/VenuePendingApprovalPage";
import { getSubmittedVenueId } from "@/lib/venue-signup-session";
import { getVenueSignupSummary } from "@/lib/venues";

export const dynamic = "force-dynamic";

export default async function Page() {
  const venue = await getVenueSignupSummary(await getSubmittedVenueId());

  return <VenuePendingApprovalPage venue={venue} />;
}
