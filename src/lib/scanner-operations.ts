import "server-only";

import { revalidatePath } from "next/cache";
import type { Database } from "@/lib/supabase/database.types";
import type { ScannerState } from "@/app/venuescanner/types";
import {
  type ScannerContext,
  assignNextSlotNumber,
  canAccessVenue,
  getVenueName,
  isPendingTicketExpired,
  loadTicketById,
  loadTicketItems,
  toScannerTicket,
  writeAcceptedScan,
  writeRejectedScan,
} from "@/lib/scanner-core";
import {
  sendWhatsAppItemsCollected,
  sendWhatsAppItemsStored,
} from "@/lib/whatsapp";

type TicketRow = Database["public"]["Tables"]["tickets"]["Row"];

export type ParsedItem = { label: string; quantity: number };

function revalidateSurfaces() {
  revalidatePath("/venuescanner");
  revalidatePath("/smsbackup");
  revalidatePath("/ticket");
}

// ─── Ready-state resolution ──────────────────────────────────────────────────

export async function ticketReadyState(
  context: ScannerContext,
  ticket: TicketRow,
): Promise<ScannerState> {
  const venueName = await getVenueName(context.supabase, ticket.venue_id);
  const items = await loadTicketItems(context.supabase, ticket.id);
  const scannerTicket = toScannerTicket(ticket, venueName, items);

  if (ticket.status === "pending_activation") {
    return {
      intent: "activation",
      message: "Ticket found. Confirm the stored item details before activation.",
      status: "ready",
      ticket: scannerTicket,
    };
  }

  if (ticket.status === "active" || ticket.status === "partially_collected") {
    return {
      intent: "checkout",
      message:
        ticket.status === "partially_collected"
          ? "Some items already returned. Select items to return or add more."
          : "Ticket found. Select items to return, or add more items.",
      status: "ready",
      ticket: scannerTicket,
    };
  }

  return {
    message: "This ticket is not available for scanner action.",
    status: "error",
    ticket: scannerTicket,
  };
}

// ─── Lookup ───────────────────────────────────────────────────────────────────

export async function performLookup(
  context: ScannerContext,
  lookupValue: string,
  ticket: TicketRow | null,
): Promise<ScannerState> {
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
    await writeRejectedScan({ reason: "Ticket was cancelled.", scanner: context.guard, ticket });
    return { message: "This ticket has been cancelled.", status: "error" };
  }

  if (ticket.status === "collected") {
    await writeRejectedScan({
      reason: "Ticket was already checked out.",
      scanner: context.guard,
      ticket,
    });
    return { message: "All items on this ticket have already been collected.", status: "error" };
  }

  void lookupValue;
  return ticketReadyState(context, ticket);
}

// ─── Activation ───────────────────────────────────────────────────────────────

export async function performActivation(
  context: ScannerContext,
  {
    ticketId,
    items,
    notes,
  }: { ticketId: string; items: ParsedItem[]; notes: string },
): Promise<ScannerState> {
  const ticket = await loadTicketById(context.supabase, ticketId);

  if (!ticket || !canAccessVenue(context.guard, ticket.venue_id)) {
    return { message: "Ticket could not be verified for this venue.", status: "error" };
  }

  if (ticket.status !== "pending_activation") {
    return ticketReadyState(context, ticket);
  }

  if (isPendingTicketExpired(ticket)) {
    await writeRejectedScan({
      reason: "Ticket expired before activation.",
      scanner: context.guard,
      ticket,
    });
    return { message: "This ticket has expired and cannot be activated.", status: "error" };
  }

  const validItems = items.filter((i) => i.label && i.quantity >= 1 && i.quantity <= 99);
  if (validItems.length === 0) {
    const venueName = await getVenueName(context.supabase, ticket.venue_id);
    const existing = await loadTicketItems(context.supabase, ticket.id);
    return {
      intent: "activation",
      message: "Add at least one item before activation.",
      status: "ready",
      ticket: toScannerTicket(ticket, venueName, existing),
    };
  }

  const slotNumber = await assignNextSlotNumber(context.supabase, ticket.venue_id);
  if (!slotNumber) {
    return {
      message: "All cloakroom slots are currently occupied. Please complete a checkout first.",
      status: "error",
    };
  }

  const totalCount = validItems.reduce((sum, i) => sum + i.quantity, 0);
  const summary = validItems.map((i) => `${i.quantity}× ${i.label}`).join(", ");
  const description = notes.trim() ? `${summary}\n${notes.trim()}` : summary;
  const activatedAt = new Date().toISOString();

  const { data: updatedTicket, error } = await context.supabase
    .from("tickets")
    .update({
      activated_at: activatedAt,
      activation_confirmed_by: context.guard.userId,
      item_count: totalCount,
      item_description: description,
      item_type: validItems[0].label,
      status: "active",
      storage_location: slotNumber,
    })
    .eq("id", ticket.id)
    .eq("status", "pending_activation")
    .select("*")
    .single();

  if (error || !updatedTicket) {
    return { message: "Ticket activation failed. Please refresh and try again.", status: "error" };
  }

  // Write one row per item line as the source of truth for partial returns.
  await context.supabase.from("ticket_items").insert(
    validItems.map((i) => ({
      added_by: context.guard.userId,
      label: i.label,
      notes: notes.trim() || null,
      quantity: i.quantity,
      ticket_id: ticket.id,
    })),
  );

  await writeAcceptedScan({ scanType: "activation", scanner: context.guard, ticket });
  revalidateSurfaces();

  const venueName = await getVenueName(context.supabase, ticket.venue_id);
  const freshItems = await loadTicketItems(context.supabase, ticket.id);

  void sendWhatsAppItemsStored({
    phone: updatedTicket.guest_phone,
    guestName: updatedTicket.guest_name,
    itemCount: totalCount,
    slotNumber,
    venueName,
  });

  return {
    message: `Ticket activated. Cloak number ${slotNumber} assigned.`,
    status: "success",
    ticket: toScannerTicket(updatedTicket, venueName, freshItems),
  };
}

// ─── Add items to an already-active ticket ────────────────────────────────────

export async function performAddItems(
  context: ScannerContext,
  {
    ticketId,
    items,
    notes,
  }: { ticketId: string; items: ParsedItem[]; notes: string },
): Promise<ScannerState> {
  const ticket = await loadTicketById(context.supabase, ticketId);

  if (!ticket || !canAccessVenue(context.guard, ticket.venue_id)) {
    return { message: "Ticket could not be verified for this venue.", status: "error" };
  }

  if (ticket.status !== "active" && ticket.status !== "partially_collected") {
    return ticketReadyState(context, ticket);
  }

  const validItems = items.filter((i) => i.label && i.quantity >= 1 && i.quantity <= 99);
  if (validItems.length === 0) {
    return ticketReadyState(context, ticket);
  }

  await context.supabase.from("ticket_items").insert(
    validItems.map((i) => ({
      added_by: context.guard.userId,
      label: i.label,
      notes: notes.trim() || null,
      quantity: i.quantity,
      ticket_id: ticket.id,
    })),
  );

  // Re-open the ticket if it had slipped to partially_collected, and refresh
  // the denormalized counters on the ticket row.
  const freshItems = await loadTicketItems(context.supabase, ticket.id);
  const openItems = freshItems.filter((i) => i.collected_at === null);
  const totalOpen = openItems.reduce((sum, i) => sum + i.quantity, 0);

  const { data: updatedTicket } = await context.supabase
    .from("tickets")
    .update({
      item_count: totalOpen,
      item_type: openItems[0]?.label ?? ticket.item_type,
      status: "active",
    })
    .eq("id", ticket.id)
    .select("*")
    .single();

  await writeAcceptedScan({ scanType: "activation", scanner: context.guard, ticket });
  revalidateSurfaces();

  const venueName = await getVenueName(context.supabase, ticket.venue_id);
  const added = validItems.reduce((s, i) => s + i.quantity, 0);
  return {
    message: `${added} item${added === 1 ? "" : "s"} added to this ticket.`,
    status: "success",
    ticket: toScannerTicket(updatedTicket ?? ticket, venueName, freshItems),
  };
}

// ─── Checkout (full or partial) ───────────────────────────────────────────────

export async function performCheckout(
  context: ScannerContext,
  { ticketId, itemIds }: { ticketId: string; itemIds: string[] },
): Promise<ScannerState> {
  const ticket = await loadTicketById(context.supabase, ticketId);

  if (!ticket || !canAccessVenue(context.guard, ticket.venue_id)) {
    return { message: "Ticket could not be verified for this venue.", status: "error" };
  }

  if (ticket.status === "collected") {
    return { message: "All items on this ticket have already been collected.", status: "error" };
  }

  if (ticket.status === "cancelled" || ticket.status === "expired") {
    return { message: "This ticket is no longer valid.", status: "error" };
  }

  if (ticket.status !== "active" && ticket.status !== "partially_collected") {
    return ticketReadyState(context, ticket);
  }

  const allItems = await loadTicketItems(context.supabase, ticket.id);
  const openItems = allItems.filter((i) => i.collected_at === null);

  // Default to returning everything still stored when no specific items chosen.
  const targetIds =
    itemIds.length > 0
      ? itemIds.filter((id) => openItems.some((i) => i.id === id))
      : openItems.map((i) => i.id);

  if (targetIds.length === 0) {
    return { message: "Select at least one item to return.", status: "error" };
  }

  const collectedAt = new Date().toISOString();
  await context.supabase
    .from("ticket_items")
    .update({ collected_at: collectedAt, collected_by: context.guard.userId })
    .in("id", targetIds);

  const remainingOpen = openItems.filter((i) => !targetIds.includes(i.id));
  const fullyCollected = remainingOpen.length === 0;

  const { data: updatedTicket, error } = await context.supabase
    .from("tickets")
    .update({
      checkout_confirmed_by: context.guard.userId,
      collected_at: fullyCollected ? collectedAt : ticket.collected_at,
      item_count: remainingOpen.reduce((s, i) => s + i.quantity, 0) || ticket.item_count,
      status: fullyCollected ? "collected" : "partially_collected",
      // Keep storage_location for history. The slot is freed by the status
      // change alone — slot assignment only counts active/partially_collected
      // tickets, so a collected ticket no longer occupies it.
      storage_location: ticket.storage_location,
    })
    .eq("id", ticket.id)
    .select("*")
    .single();

  if (error || !updatedTicket) {
    return { message: "Ticket checkout failed. Please refresh and try again.", status: "error" };
  }

  await writeAcceptedScan({ scanType: "checkout", scanner: context.guard, ticket });
  revalidateSurfaces();

  const venueName = await getVenueName(context.supabase, ticket.venue_id);
  const freshItems = await loadTicketItems(context.supabase, ticket.id);
  const returnedCount = targetIds.length;

  void sendWhatsAppItemsCollected({
    phone: ticket.guest_phone,
    guestName: ticket.guest_name,
    collectedCount: returnedCount,
    venueName,
  });

  return {
    message: fullyCollected
      ? "Checkout complete. All items returned and the ticket is now closed."
      : `${returnedCount} item${returnedCount === 1 ? "" : "s"} returned. ${remainingOpen.length} still stored.`,
    status: "success",
    ticket: toScannerTicket(updatedTicket, venueName, freshItems),
  };
}
