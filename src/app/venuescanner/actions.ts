"use server";

import { revalidatePath } from "next/cache";
import type { AuthorizedContext } from "@/lib/auth/guards";
import { createAdminClient, isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";
import { hashTicketToken } from "@/lib/tickets";

type TicketRow = Database["public"]["Tables"]["tickets"]["Row"];
type SupabaseAdmin = ReturnType<typeof createAdminClient>;

export type ScannerTicket = {
  expiresAt: string;
  guestEmail: string;
  guestName: string;
  guestPhone: string;
  id: string;
  itemCount: number;
  itemDescription: string | null;
  itemType: string | null;
  publicCode: string;
  status: TicketRow["status"];
  storageLocation: string | null;
  venueId: string;
  venueName: string;
};

export type ScannerState =
  | {
      message: "";
      status: "idle";
    }
  | {
      message: string;
      status: "error";
      ticket?: ScannerTicket;
    }
  | {
      message: string;
      status: "success";
      ticket?: ScannerTicket;
    }
  | {
      intent: "activation";
      message: string;
      status: "ready";
      ticket: ScannerTicket;
    }
  | {
      intent: "checkout";
      message: string;
      status: "ready";
      ticket: ScannerTicket;
    };

export const initialScannerState: ScannerState = {
  message: "",
  status: "idle",
};

function readField(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

async function getScannerContext() {
  if (!isSupabaseConfigured() || !isSupabaseAdminConfigured()) {
    return null;
  }

  const authClient = await createClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();

  if (!user) {
    return null;
  }

  const [{ data: profile }, { data: venueRoles }] = await Promise.all([
    authClient.from("profiles").select("role").eq("id", user.id).maybeSingle(),
    authClient.from("venue_staff").select("venue_id, role").eq("profile_id", user.id),
  ]);

  const guard: AuthorizedContext = {
    profileRole: profile?.role ?? "guest",
    status: "authorized",
    userId: user.id,
    venueRoles:
      venueRoles?.map((venueRole) => ({
        role: venueRole.role,
        venueId: venueRole.venue_id,
      })) ?? [],
  };

  if (guard.profileRole === "platform_admin" || guard.venueRoles.length === 0) {
    return null;
  }

  return {
    guard,
    supabase: createAdminClient(),
  };
}

function canAccessVenue(guard: AuthorizedContext, venueId: string) {
  return guard.venueRoles.some((venueRole) => venueRole.venueId === venueId);
}

function isPendingTicketExpired(ticket: TicketRow) {
  return (
    ticket.status === "pending_activation" &&
    new Date(ticket.expires_at).getTime() < Date.now()
  );
}

function normalizeLookup(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  try {
    const url = new URL(trimmed);
    const token = url.searchParams.get("token");
    const code = url.searchParams.get("code");

    if (token) {
      return { column: "qr_token_hash" as const, value: hashTicketToken(token) };
    }

    if (code) {
      return { column: "public_code" as const, value: code.trim().toUpperCase() };
    }
  } catch {
    // Plain fallback codes and raw QR tokens are handled below.
  }

  if (trimmed.toUpperCase().startsWith("CLK-")) {
    return { column: "public_code" as const, value: trimmed.toUpperCase() };
  }

  return { column: "qr_token_hash" as const, value: hashTicketToken(trimmed) };
}

async function getVenueName(supabase: SupabaseAdmin, venueId: string) {
  const { data } = await supabase.from("venues").select("name").eq("id", venueId).maybeSingle();

  return data?.name ?? "Selected venue";
}

function toScannerTicket(ticket: TicketRow, venueName: string): ScannerTicket {
  return {
    expiresAt: ticket.expires_at,
    guestEmail: ticket.guest_email,
    guestName: ticket.guest_name,
    guestPhone: ticket.guest_phone,
    id: ticket.id,
    itemCount: ticket.item_count,
    itemDescription: ticket.item_description,
    itemType: ticket.item_type,
    publicCode: ticket.public_code,
    status: ticket.status,
    storageLocation: ticket.storage_location,
    venueId: ticket.venue_id,
    venueName,
  };
}

async function loadTicketById(supabase: SupabaseAdmin, ticketId: string) {
  const { data, error } = await supabase
    .from("tickets")
    .select("*")
    .eq("id", ticketId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data;
}

async function lookupTicketByInput(supabase: SupabaseAdmin, value: string) {
  const lookup = normalizeLookup(value);

  if (!lookup) {
    return null;
  }

  const { data, error } = await supabase
    .from("tickets")
    .select("*")
    .eq(lookup.column, lookup.value)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data;
}

async function writeRejectedScan({
  reason,
  scanner,
  ticket,
}: {
  reason: string;
  scanner: AuthorizedContext;
  ticket: TicketRow;
}) {
  const supabase = createAdminClient();

  try {
    await supabase.from("ticket_scans").insert({
      reason,
      result: "rejected",
      scan_type: "rejected",
      scanned_by: scanner.userId,
      ticket_id: ticket.id,
      venue_id: ticket.venue_id,
    });
  } catch {
    // Scan rejection logging should not break the counter workflow.
  }
}

async function writeAcceptedScan({
  scanType,
  scanner,
  ticket,
}: {
  scanType: "activation" | "checkout";
  scanner: AuthorizedContext;
  ticket: TicketRow;
}) {
  const supabase = createAdminClient();

  try {
    await supabase.from("ticket_scans").insert({
      result: "accepted",
      scan_type: scanType,
      scanned_by: scanner.userId,
      ticket_id: ticket.id,
      venue_id: ticket.venue_id,
    });
  } catch {
    // Scan logging should not block an already validated ticket update.
  }
}

function ticketReadyState(ticket: TicketRow, venueName: string): ScannerState {
  if (ticket.status === "pending_activation") {
    return {
      intent: "activation",
      message: "Ticket found. Confirm the stored item details before activation.",
      status: "ready",
      ticket: toScannerTicket(ticket, venueName),
    };
  }

  if (ticket.status !== "active") {
    return {
      message: "This ticket is not available for scanner action.",
      status: "error",
      ticket: toScannerTicket(ticket, venueName),
    };
  }

  return {
    intent: "checkout",
    message: "Ticket found. Confirm the item return to complete checkout.",
    status: "ready",
    ticket: toScannerTicket(ticket, venueName),
  };
}

async function handleLookup(formData: FormData): Promise<ScannerState> {
  const context = await getScannerContext();
  const lookupValue = readField(formData, "lookupValue");

  if (!context) {
    return {
      message: "Sign in with a venue manager or staff account assigned to this venue.",
      status: "error",
    };
  }

  if (!lookupValue) {
    return { message: "Enter a QR link, QR token, or fallback code.", status: "error" };
  }

  const ticket = await lookupTicketByInput(context.supabase, lookupValue);

  if (!ticket) {
    return { message: "Ticket was not found. Check the code and try again.", status: "error" };
  }

  if (!canAccessVenue(context.guard, ticket.venue_id)) {
    await writeRejectedScan({
      reason: "Ticket belongs to another venue.",
      scanner: context.guard,
      ticket,
    });

    return { message: "This ticket is not valid for your venue.", status: "error" };
  }

  if (isPendingTicketExpired(ticket) || ticket.status === "expired") {
    await writeRejectedScan({
      reason: "Ticket expired before activation.",
      scanner: context.guard,
      ticket,
    });

    return { message: "This ticket has expired and cannot be activated.", status: "error" };
  }

  if (ticket.status === "cancelled") {
    await writeRejectedScan({
      reason: "Ticket was cancelled.",
      scanner: context.guard,
      ticket,
    });

    return { message: "This ticket has been cancelled.", status: "error" };
  }

  if (ticket.status === "collected") {
    await writeRejectedScan({
      reason: "Ticket was already checked out.",
      scanner: context.guard,
      ticket,
    });

    return { message: "This ticket has already been checked out.", status: "error" };
  }

  const venueName = await getVenueName(context.supabase, ticket.venue_id);

  return ticketReadyState(ticket, venueName);
}

async function handleActivation(formData: FormData): Promise<ScannerState> {
  const context = await getScannerContext();
  const ticketId = readField(formData, "ticketId");
  const itemType = readField(formData, "itemType");
  const itemDescription = readField(formData, "itemDescription");
  const storageLocation = readField(formData, "storageLocation");
  const itemCount = Number(readField(formData, "itemCount") || "1");

  if (!context) {
    return {
      message: "Sign in with a venue manager or staff account assigned to this venue.",
      status: "error",
    };
  }

  const ticket = await loadTicketById(context.supabase, ticketId);

  if (!ticket || !canAccessVenue(context.guard, ticket.venue_id)) {
    return { message: "Ticket could not be verified for this venue.", status: "error" };
  }

  const venueName = await getVenueName(context.supabase, ticket.venue_id);

  if (ticket.status !== "pending_activation") {
    return ticketReadyState(ticket, venueName);
  }

  if (isPendingTicketExpired(ticket)) {
    await writeRejectedScan({
      reason: "Ticket expired before activation.",
      scanner: context.guard,
      ticket,
    });

    return { message: "This ticket has expired and cannot be activated.", status: "error" };
  }

  if (!itemType || !storageLocation) {
    return {
      intent: "activation",
      message: "Item type and storage location are required before activation.",
      status: "ready",
      ticket: toScannerTicket(ticket, venueName),
    };
  }

  if (!Number.isInteger(itemCount) || itemCount < 1 || itemCount > 99) {
    return {
      intent: "activation",
      message: "Item count must be between 1 and 99.",
      status: "ready",
      ticket: toScannerTicket(ticket, venueName),
    };
  }

  const activatedAt = new Date().toISOString();
  const { data: updatedTicket, error } = await context.supabase
    .from("tickets")
    .update({
      activated_at: activatedAt,
      activation_confirmed_by: context.guard.userId,
      item_count: itemCount,
      item_description: itemDescription || null,
      item_type: itemType,
      status: "active",
      storage_location: storageLocation,
    })
    .eq("id", ticket.id)
    .eq("status", "pending_activation")
    .select("*")
    .single();

  if (error || !updatedTicket) {
    return { message: "Ticket activation failed. Please refresh and try again.", status: "error" };
  }

  await writeAcceptedScan({
    scanType: "activation",
    scanner: context.guard,
    ticket,
  });

  revalidatePath("/venuescanner");
  revalidatePath("/ticket");

  return {
    message: "Ticket activated. The item is now stored.",
    status: "success",
    ticket: toScannerTicket(updatedTicket, venueName),
  };
}

async function handleCheckout(formData: FormData): Promise<ScannerState> {
  const context = await getScannerContext();
  const ticketId = readField(formData, "ticketId");

  if (!context) {
    return {
      message: "Sign in with a venue manager or staff account assigned to this venue.",
      status: "error",
    };
  }

  const ticket = await loadTicketById(context.supabase, ticketId);

  if (!ticket || !canAccessVenue(context.guard, ticket.venue_id)) {
    return { message: "Ticket could not be verified for this venue.", status: "error" };
  }

  const venueName = await getVenueName(context.supabase, ticket.venue_id);

  if (ticket.status === "collected") {
    return { message: "This ticket has already been checked out.", status: "error" };
  }

  if (ticket.status === "cancelled" || ticket.status === "expired") {
    return { message: "This ticket is no longer valid.", status: "error" };
  }

  if (ticket.status !== "active") {
    return ticketReadyState(ticket, venueName);
  }

  const collectedAt = new Date().toISOString();
  const { data: updatedTicket, error } = await context.supabase
    .from("tickets")
    .update({
      checkout_confirmed_by: context.guard.userId,
      collected_at: collectedAt,
      status: "collected",
    })
    .eq("id", ticket.id)
    .eq("status", "active")
    .select("*")
    .single();

  if (error || !updatedTicket) {
    return { message: "Ticket checkout failed. Please refresh and try again.", status: "error" };
  }

  if (ticket.assigned_slot_id) {
    await context.supabase
      .from("venue_slots")
      .update({ status: "available" })
      .eq("id", ticket.assigned_slot_id);
  }

  await writeAcceptedScan({
    scanType: "checkout",
    scanner: context.guard,
    ticket,
  });

  revalidatePath("/venuescanner");
  revalidatePath("/ticket");

  return {
    message: "Checkout confirmed. The ticket is now closed.",
    status: "success",
    ticket: toScannerTicket(updatedTicket, venueName),
  };
}

export async function handleScannerAction(
  _previousState: ScannerState,
  formData: FormData,
): Promise<ScannerState> {
  try {
    const action = readField(formData, "_action");

    if (action === "activate") {
      return handleActivation(formData);
    }

    if (action === "checkout") {
      return handleCheckout(formData);
    }

    return handleLookup(formData);
  } catch {
    return {
      message: "The scanner could not complete this request. Please refresh and try again.",
      status: "error",
    };
  }
}
