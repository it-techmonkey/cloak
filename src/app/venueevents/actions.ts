"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireVenueAccess } from "@/lib/auth/guards";
import { createAdminClient, isSupabaseAdminConfigured } from "@/lib/supabase/admin";

function readField(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function fail(message: string): never {
  redirect(`/venueevents?error=${encodeURIComponent(message)}`);
}

function managerVenueIds(venueRoles: Array<{ venueId: string; role: string }>) {
  return [...new Set(venueRoles.filter((r) => r.role === "manager").map((r) => r.venueId))];
}

export async function createEvent(formData: FormData) {
  const guard = await requireVenueAccess("/venueevents", ["manager"]);
  if (guard.status !== "authorized") fail("Sign in as a venue manager to manage events.");
  if (!isSupabaseAdminConfigured()) fail("Events are temporarily unavailable.");

  const name = readField(formData, "name");
  const eventDate = readField(formData, "eventDate");
  const startsAt = readField(formData, "startsAt");
  const endsAt = readField(formData, "endsAt");

  if (!name || !eventDate) fail("Event name and date are required.");

  const venueIds = managerVenueIds(guard.venueRoles);
  const venueId = venueIds[0];
  if (!venueId) fail("No venue is associated with your account.");

  const supabase = createAdminClient();
  const { error } = await supabase.from("events").insert({
    ends_at: endsAt ? new Date(`${eventDate}T${endsAt}`).toISOString() : null,
    event_date: eventDate,
    name,
    starts_at: startsAt ? new Date(`${eventDate}T${startsAt}`).toISOString() : null,
    venue_id: venueId,
  });

  if (error) fail("Could not create the event. Please try again.");

  revalidatePath("/venueevents");
  redirect("/venueevents?message=Event+created.");
}

export async function setEventActive(formData: FormData) {
  const guard = await requireVenueAccess("/venueevents", ["manager"]);
  if (guard.status !== "authorized") fail("Sign in as a venue manager to manage events.");
  if (!isSupabaseAdminConfigured()) fail("Events are temporarily unavailable.");

  const eventId = readField(formData, "eventId");
  const active = readField(formData, "active") === "1";
  if (!eventId) fail("Missing event.");

  const venueIds = managerVenueIds(guard.venueRoles);
  const supabase = createAdminClient();

  // Scope the update to the manager's own venues so they can't toggle others'.
  const { error } = await supabase
    .from("events")
    .update({ active })
    .eq("id", eventId)
    .in("venue_id", venueIds);

  if (error) fail("Could not update the event.");

  revalidatePath("/venueevents");
  redirect(`/venueevents?message=${active ? "Event+reopened." : "Event+closed."}`);
}
