"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { getScannerContext, lookupTicketByInput } from "@/lib/scanner-core";
import {
  type ParsedItem,
  performActivation,
  performAddItems,
  performCheckout,
  performLookup,
} from "@/lib/scanner-operations";
import type { ScannerState } from "./types";

function readField(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

const NO_CONTEXT: ScannerState = {
  message: "Sign in with a venue manager or staff account assigned to this venue.",
  status: "error",
};

/**
 * Item lines are sent as a JSON array under "items":
 *   [{ "label": "Coat", "quantity": 1 }, ...]
 */
function parseItems(formData: FormData): ParsedItem[] {
  const raw = readField(formData, "items");
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as Array<{ label?: unknown; quantity?: unknown; pool?: unknown }>;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((i) => {
        const pool: "hanger" | "bag" | undefined =
          i.pool === "hanger" ? "hanger" : i.pool === "bag" ? "bag" : undefined;
        return { label: String(i.label ?? "").trim(), pool, quantity: Number(i.quantity ?? 1) };
      })
      .filter((i) => i.label.length > 0);
  } catch {
    return [];
  }
}

function parseItemIds(formData: FormData): string[] {
  const raw = readField(formData, "itemIds");
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.map((id) => String(id)).filter(Boolean);
  } catch {
    return [];
  }
}

export type PendingTicketSuggestion = {
  id: string;
  publicCode: string;
  guestName: string;
  guestPhone: string;
};

export async function searchPendingTickets(
  query: string,
  venueId?: string,
): Promise<PendingTicketSuggestion[]> {
  if (!query || query.length < 2) return [];

  const context = await getScannerContext();
  if (!context) return [];

  const allowedVenueIds = context.guard.venueRoles.map((r) => r.venueId);
  if (venueId && !allowedVenueIds.includes(venueId)) return [];
  const scopeIds = venueId ? [venueId] : allowedVenueIds;

  const supabase = createAdminClient();
  const pattern = `%${query.trim()}%`;
  const { data } = await supabase
    .from("tickets")
    .select("id, public_code, guest_name, guest_phone")
    .in("venue_id", scopeIds)
    .eq("status", "pending_activation")
    .gt("expires_at", new Date().toISOString())
    .or(`public_code.ilike.${pattern},guest_name.ilike.${pattern}`)
    .order("created_at", { ascending: false })
    .limit(6);

  return (data ?? []).map((t) => ({
    guestName: t.guest_name,
    guestPhone: t.guest_phone,
    id: t.id,
    publicCode: t.public_code,
  }));
}

export async function handleScannerAction(
  _previousState: ScannerState,
  formData: FormData,
): Promise<ScannerState> {
  try {
    const action = readField(formData, "_action");

    if (action === "reset") {
      return { message: "", status: "idle" };
    }

    const context = await getScannerContext();
    if (!context) return NO_CONTEXT;

    const venueId = readField(formData, "venueId") || undefined;

    // Validate that the submitted venueId (if any) is in the user's venue roles.
    if (venueId && !context.guard.venueRoles.some((r) => r.venueId === venueId)) {
      return { message: "You do not have access to the selected venue.", status: "error" };
    }

    if (action === "activate") {
      return performActivation(context, {
        items: parseItems(formData),
        notes: readField(formData, "notes"),
        ticketId: readField(formData, "ticketId"),
        venueId,
      });
    }

    if (action === "add_items") {
      return performAddItems(context, {
        items: parseItems(formData),
        notes: readField(formData, "notes"),
        ticketId: readField(formData, "ticketId"),
      });
    }

    if (action === "checkout") {
      return performCheckout(context, {
        itemIds: parseItemIds(formData),
        ticketId: readField(formData, "ticketId"),
      });
    }

    // Default: lookup by scanned/typed value.
    const lookupValue = readField(formData, "lookupValue");
    if (!lookupValue) {
      return { message: "Enter a QR link, QR token, or fallback code.", status: "error" };
    }
    const ticket = await lookupTicketByInput(context.supabase, lookupValue, venueId);
    return performLookup(context, lookupValue, ticket, venueId);
  } catch {
    return {
      message: "The scanner could not complete this request. Please refresh and try again.",
      status: "error",
    };
  }
}
