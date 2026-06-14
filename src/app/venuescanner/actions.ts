"use server";

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
    const parsed = JSON.parse(raw) as Array<{ label?: unknown; quantity?: unknown }>;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((i) => ({
        label: String(i.label ?? "").trim(),
        quantity: Number(i.quantity ?? 1),
      }))
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

    if (action === "activate") {
      return performActivation(context, {
        items: parseItems(formData),
        notes: readField(formData, "notes"),
        ticketId: readField(formData, "ticketId"),
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
    const ticket = await lookupTicketByInput(context.supabase, lookupValue);
    return performLookup(context, lookupValue, ticket);
  } catch {
    return {
      message: "The scanner could not complete this request. Please refresh and try again.",
      status: "error",
    };
  }
}
