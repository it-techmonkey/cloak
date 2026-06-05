"use server";

import { redirect } from "next/navigation";
import { createAdminClient, isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import {
  clearDraftVenueId,
  getDraftVenueId,
  setDraftVenueId,
  setSubmittedVenueId,
} from "@/lib/venue-signup-session";
import { slugifyVenueName, type VenuePlanId, venuePlans } from "@/lib/venues";

function readField(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function fail(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}

function isPlanId(value: string): value is VenuePlanId {
  return venuePlans.some((plan) => plan.id === value);
}

export async function createVenueSignup(formData: FormData) {
  const venueName = readField(formData, "venueName");
  const address = readField(formData, "address");
  const city = readField(formData, "city");
  const country = readField(formData, "country");
  const contactEmail = readField(formData, "contactEmail").toLowerCase();
  const contactPhone = readField(formData, "contactPhone");
  const capacity = Number(readField(formData, "capacity"));

  if (!isSupabaseAdminConfigured()) {
    fail("/venuesignup", "Venue registration is temporarily unavailable.");
  }

  if (!venueName || !city || !country || !contactEmail || !contactPhone || !capacity) {
    fail("/venuesignup", "Please complete all required venue details.");
  }

  if (!contactEmail.includes("@") || !contactEmail.includes(".")) {
    fail("/venuesignup", "Please enter a valid contact email address.");
  }

  if (!Number.isInteger(capacity) || capacity < 1) {
    fail("/venuesignup", "Capacity must be at least one slot.");
  }

  const supabase = createAdminClient();
  const { data: venue, error: venueError } = await supabase
    .from("venues")
    .insert({
      address,
      capacity,
      city,
      contact_email: contactEmail,
      contact_phone: contactPhone,
      country,
      name: venueName,
      slug: slugifyVenueName(venueName),
    })
    .select("id")
    .single();

  if (venueError || !venue) {
    fail("/venuesignup", "We could not create the venue registration. Please try again.");
  }

  const { error: staffError } = await supabase.from("venue_staff").insert({
    invited_email: contactEmail,
    role: "manager",
    venue_id: venue.id,
  });

  if (staffError) {
    fail("/venuesignup", "We could not assign the venue manager. Please try again.");
  }

  await setDraftVenueId(venue.id);
  redirect("/venuesignup");
}

export async function selectVenuePlan(formData: FormData) {
  const venueId = await getDraftVenueId();
  const plan = readField(formData, "plan");

  if (!isSupabaseAdminConfigured()) {
    fail("/venuesignup", "Plan selection is temporarily unavailable.");
  }

  if (!venueId || !isPlanId(plan)) {
    fail("/venuesignup", "Please complete the venue details before selecting a plan.");
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("venues")
    .update({
      billing_plan: plan,
      billing_status: "trialing",
      stripe_customer_id: `dummy_${venueId}`,
      stripe_price_id: `dummy_${plan}`,
    })
    .eq("id", venueId);

  if (error) {
    fail("/venuesignup", "We could not save the selected plan.");
  }

  redirect("/venuesignup");
}

export async function finishVenueSignup() {
  const venueId = await getDraftVenueId();

  if (!venueId) {
    redirect("/venuependingapproval");
  }

  await setSubmittedVenueId(venueId);
  await clearDraftVenueId();
  redirect("/venuependingapproval");
}
