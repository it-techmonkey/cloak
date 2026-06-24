import VenueSignupPage from "@/components/venue/signup/VenueSignupPage";
import { getDraftVenueSignup } from "@/lib/venue-signup-session";
import type { VenueSignupSummary } from "@/lib/venues";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{
  error?: string | string[];
}>;

function getParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function Page({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const draft = await getDraftVenueSignup();

  // Step detection: no draft → 1 (plan), plan only → 2 (details), plan + venues → 3 (review)
  let step: 1 | 2 | 3 = 1;
  if (draft?.billingPlan) step = draft.venues.length > 0 ? 3 : 2;

  const venue: VenueSignupSummary | null =
    draft && step === 3
      ? {
          billingPlan: draft.billingPlan ?? null,
          billingStatus: "trialing",
          city: draft.venues[0]?.city ?? null,
          companyName: draft.companyName,
          contactEmail: draft.contactEmail,
          contactName: draft.contactName,
          name: draft.venues[0]?.venueName ?? "",
          venueNames: draft.venues.map((v) => v.venueName),
        }
      : null;

  return <VenueSignupPage error={getParam(params.error)} step={step} venue={venue} />;
}
