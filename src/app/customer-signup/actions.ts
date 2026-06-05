"use server";

import { redirect } from "next/navigation";
import { createAdminClient, isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import { createPublicCode, createTicketToken } from "@/lib/tickets";

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

  if (!isSupabaseAdminConfigured()) {
    fail("Ticket creation is temporarily unavailable.");
  }

  if (!venueId || !fullName || !email || !mobile) {
    fail("Please complete all required details.");
  }

  if (!email.includes("@") || !email.includes(".")) {
    fail("Please enter a valid email address.");
  }

  const supabase = createAdminClient();
  const { data: venue, error: venueError } = await supabase
    .from("venues")
    .select("id")
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

  const publicCode = createPublicCode();
  const ticketToken = createTicketToken();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  const { error: ticketError } = await supabase.from("tickets").insert({
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
