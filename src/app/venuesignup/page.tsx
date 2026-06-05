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
  const venue: VenueSignupSummary | null = draft
    ? {
        billingPlan: draft.billingPlan ?? null,
        billingStatus: draft.billingPlan ? "trialing" : "not_started",
        city: draft.city,
        contactEmail: draft.contactEmail,
        name: draft.venueName,
      }
    : null;
  const step = !venue ? 1 : venue.billingPlan ? 3 : 2;

  return <VenueSignupPage error={getParam(params.error)} step={step} venue={venue} />;
}
