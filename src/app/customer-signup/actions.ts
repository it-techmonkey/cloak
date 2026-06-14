"use server";

import { redirect } from "next/navigation";
import { createAdminClient, isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import { createPublicCode, createTicketToken } from "@/lib/tickets";
import { isValidEmail, isValidPhone } from "@/lib/validation";

function readField(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function fail(message: string): never {
  redirect(`/customer-signup?error=${encodeURIComponent(message)}`);
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function createGuestTicket(formData: FormData) {
  const venueId = readField(formData, "venue");
  const fullName = readField(formData, "fullName");
  const email = normalizeEmail(readField(formData, "email"));
  const mobile = readField(formData, "mobile");
  const eventId = readField(formData, "event");

  if (!isSupabaseAdminConfigured()) {
    fail("Ticket creation is temporarily unavailable.");
  }

  if (!venueId || !fullName || !email || !mobile) {
    fail("Please complete all required details.");
  }

  if (!isValidEmail(email)) {
    fail("Please enter a valid email address.");
  }

  if (!isValidPhone(mobile)) {
    fail("Please enter a valid mobile number.");
  }

  const supabase = createAdminClient();
  const { data: venue, error: venueError } = await supabase
    .from("venues")
    .select("id, ticket_expiry_hours")
    .eq("id", venueId)
    .eq("active", true)
    .eq("approval_status", "approved")
    .in("billing_status", ["trialing", "active"])
    .maybeSingle();

  if (venueError || !venue) {
    fail("Please select an available venue.");
  }

  const { data: contact, error: contactError } = await supabase
    .from("guest_contacts")
    .upsert(
      {
        email,
        email_normalized: email,
        full_name: fullName,
        phone: mobile,
      },
      { onConflict: "email_normalized" },
    )
    .select("id")
    .single();

  if (contactError || !contact) {
    fail("We could not save your contact details. Please try again.");
  }

  // Only attach the event if it belongs to this venue and is still active.
  let validEventId: string | null = null;
  if (eventId) {
    const { data: event } = await supabase
      .from("events")
      .select("id")
      .eq("id", eventId)
      .eq("venue_id", venue.id)
      .eq("active", true)
      .maybeSingle();
    validEventId = event?.id ?? null;
  }

  const publicCode = createPublicCode();
  const ticketToken = createTicketToken();
  const expiryHours = venue.ticket_expiry_hours;
  const expiresAt = expiryHours !== null
    ? new Date(Date.now() + expiryHours * 60 * 60 * 1000).toISOString()
    : new Date("9999-12-31T23:59:59Z").toISOString();
  const { error: ticketError } = await supabase.from("tickets").insert({
    event_id: validEventId,
    expires_at: expiresAt,
    guest_contact_id: contact.id,
    guest_email: email,
    guest_name: fullName,
    guest_phone: mobile,
    public_code: publicCode,
    qr_token_hash: ticketToken.hash,
    venue_id: venue.id,
  });

  if (ticketError) {
    fail("We could not create your ticket. Please try again.");
  }

  redirect(`/ticket?token=${encodeURIComponent(ticketToken.token)}`);
}
