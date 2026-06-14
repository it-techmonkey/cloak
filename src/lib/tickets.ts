import crypto from "node:crypto";
import { createAdminClient, isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/database.types";

type TicketStatus = Database["public"]["Enums"]["ticket_status"];

export type PublicVenueOption = {
  address: string | null;
  id: string;
  label: string;
  name: string;
  slug: string;
};

export type PublicTicket = {
  email: string;
  expiresAt: string;
  guestName: string;
  itemCount: number;
  itemDescription: string | null;
  itemType: string | null;
  mobile: string;
  status: TicketStatus;
  storageLocation: string | null;
  ticketId: string;
  venueAddress: string | null;
  venueId: string;
  venueName: string;
};

export type TicketLookupStatus = "found" | "invalid" | "expired";

export async function getSelectableVenues(): Promise<PublicVenueOption[]> {
  if (!isSupabaseAdminConfigured()) {
    return [];
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("venues")
    .select("id, name, slug, city, address")
    .eq("active", true)
    .eq("approval_status", "approved")
    .in("billing_status", ["trialing", "active"])
    .order("name", { ascending: true });

  if (error) {
    return [];
  }

  return data.map((venue) => ({
    address: venue.address ?? null,
    id: venue.id,
    label: venue.city ? `${venue.name}, ${venue.city}` : venue.name,
    name: venue.name,
    slug: venue.slug,
  }));
}

export function hashTicketToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function normalizeTicketStatus(ticket: {
  expires_at: string;
  status: PublicTicket["status"];
}) {
  if (
    ticket.status === "pending_activation" &&
    new Date(ticket.expires_at).getTime() < Date.now()
  ) {
    return "expired";
  }

  return ticket.status;
}

async function getTicketByColumn(column: "public_code" | "qr_token_hash", value: string) {
  if (!isSupabaseAdminConfigured()) {
    return { status: "invalid" as const, ticket: null };
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("tickets")
    .select(
      "public_code, guest_email, guest_name, guest_phone, status, venue_id, expires_at, item_type, item_count, item_description, storage_location",
    )
    .eq(column, value)
    .maybeSingle();

  if (error || !data) {
    return { status: "invalid" as const, ticket: null };
  }

  const { data: venue } = await supabase
    .from("venues")
    .select("name, slug, address, city")
    .eq("id", data.venue_id)
    .maybeSingle();

  const status = normalizeTicketStatus(data);

  return {
    status: status === "expired" ? ("expired" as const) : ("found" as const),
    ticket: {
      email: data.guest_email ?? "",
      expiresAt: data.expires_at,
      guestName: data.guest_name,
      itemCount: data.item_count,
      itemDescription: data.item_description,
      itemType: data.item_type,
      mobile: data.guest_phone,
      status,
      storageLocation: data.storage_location,
      ticketId: data.public_code,
      venueAddress: [venue?.address, venue?.city].filter(Boolean).join(", ") || null,
      venueId: venue?.slug ?? data.venue_id,
      venueName: venue?.name ?? "Selected venue",
    } satisfies PublicTicket,
  };
}

export async function getPublicTicketByCode(publicCode: string) {
  return getTicketByColumn("public_code", publicCode.trim().toUpperCase());
}

export async function getPublicTicketByToken(token: string) {
  return getTicketByColumn("qr_token_hash", hashTicketToken(token));
}

export function createPublicCode() {
  const date = new Date();
  const stamp = [
    date.getUTCFullYear(),
    String(date.getUTCMonth() + 1).padStart(2, "0"),
    String(date.getUTCDate()).padStart(2, "0"),
  ].join("");
  const suffix = crypto.randomBytes(3).toString("hex").toUpperCase();

  return `CLK-${stamp}-${suffix}`;
}

export function createTicketToken() {
  const token = crypto.randomBytes(32).toString("base64url");

  return {
    hash: hashTicketToken(token),
    token,
  };
}
