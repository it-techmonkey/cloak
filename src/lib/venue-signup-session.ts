import { cookies } from "next/headers";

const draftCookie = "cloak_venue_signup_id";
const submittedCookie = "cloak_venue_submitted_id";

const cookieOptions = {
  httpOnly: true,
  maxAge: 60 * 60 * 24,
  path: "/",
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
};

export async function getDraftVenueId() {
  return (await cookies()).get(draftCookie)?.value;
}

export async function setDraftVenueId(venueId: string) {
  (await cookies()).set(draftCookie, venueId, cookieOptions);
}

export async function clearDraftVenueId() {
  (await cookies()).delete(draftCookie);
}

export async function getSubmittedVenueId() {
  return (await cookies()).get(submittedCookie)?.value;
}

export async function setSubmittedVenueId(venueId: string) {
  (await cookies()).set(submittedCookie, venueId, cookieOptions);
}
