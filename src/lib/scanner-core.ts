import "server-only";

import type { AuthorizedContext } from "@/lib/auth/guards";
import { createAdminClient, isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";
import { hashTicketToken } from "@/lib/tickets";
import type { ScannerTicket, TicketItemView } from "@/app/venuescanner/types";

type TicketRow = Database["public"]["Tables"]["tickets"]["Row"];
type TicketItemRow = Database["public"]["Tables"]["ticket_items"]["Row"];
export type SupabaseAdmin = ReturnType<typeof createAdminClient>;

export type ScannerContext = {
  guard: AuthorizedContext;
  supabase: SupabaseAdmin;
};

// ─── Context & access ─────────────────────────────────────────────────────────

export async function getScannerContext(): Promise<ScannerContext | null> {
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

  return { guard, supabase: createAdminClient() };
}

export function canAccessVenue(guard: AuthorizedContext, venueId: string) {
  return guard.venueRoles.some((venueRole) => venueRole.venueId === venueId);
}

export function isPendingTicketExpired(ticket: TicketRow) {
  return (
    ticket.status === "pending_activation" &&
    new Date(ticket.expires_at).getTime() < Date.now()
  );
}

// ─── Lookup ───────────────────────────────────────────────────────────────────

export function normalizeLookup(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;

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

export async function getVenueName(supabase: SupabaseAdmin, venueId: string) {
  const { data } = await supabase.from("venues").select("name").eq("id", venueId).maybeSingle();
  return data?.name ?? "Selected venue";
}

export async function loadTicketItems(
  supabase: SupabaseAdmin,
  ticketId: string,
): Promise<TicketItemRow[]> {
  const { data } = await supabase
    .from("ticket_items")
    .select("*")
    .eq("ticket_id", ticketId)
    .order("added_at", { ascending: true });
  return data ?? [];
}

function toItemView(row: TicketItemRow): TicketItemView {
  return {
    collected: row.collected_at !== null,
    id: row.id,
    label: row.label,
    notes: row.notes,
    quantity: row.quantity,
  };
}

export function toScannerTicket(
  ticket: TicketRow,
  venueName: string,
  items: TicketItemRow[],
): ScannerTicket {
  return {
    expiresAt: ticket.expires_at,
    guestEmail: ticket.guest_email ?? "",
    guestName: ticket.guest_name,
    guestPhone: ticket.guest_phone,
    id: ticket.id,
    itemCount: ticket.item_count,
    itemDescription: ticket.item_description,
    items: items.map(toItemView),
    itemType: ticket.item_type,
    publicCode: ticket.public_code,
    status: ticket.status,
    storageLocation: ticket.storage_location,
    venueId: ticket.venue_id,
    venueName,
  };
}

export async function loadTicketById(supabase: SupabaseAdmin, ticketId: string) {
  const { data, error } = await supabase
    .from("tickets")
    .select("*")
    .eq("id", ticketId)
    .maybeSingle();
  if (error || !data) return null;
  return data;
}

export async function lookupTicketByInput(supabase: SupabaseAdmin, value: string) {
  const lookup = normalizeLookup(value);
  if (!lookup) return null;

  const { data, error } = await supabase
    .from("tickets")
    .select("*")
    .eq(lookup.column, lookup.value)
    .maybeSingle();
  if (error || !data) return null;
  return data;
}

// ─── Scan logging ─────────────────────────────────────────────────────────────

export async function writeRejectedScan({
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

export async function writeAcceptedScan({
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

// ─── Slot assignment ──────────────────────────────────────────────────────────

// A slot stays occupied while the ticket is active OR partially collected.
const OCCUPYING_STATUSES: TicketRow["status"][] = ["active", "partially_collected"];

export async function assignNextSlotNumber(
  supabase: SupabaseAdmin,
  venueId: string,
): Promise<string | null> {
  const { data: venue } = await supabase
    .from("venues")
    .select("capacity")
    .eq("id", venueId)
    .maybeSingle();

  const capacity = venue?.capacity ?? 0;
  if (capacity < 1) return null;

  const { data: openTickets } = await supabase
    .from("tickets")
    .select("storage_location")
    .eq("venue_id", venueId)
    .in("status", OCCUPYING_STATUSES)
    .not("storage_location", "is", null);

  const usedNumbers = new Set(
    (openTickets ?? [])
      .map((t) => {
        const loc = t.storage_location ?? "";
        const raw = loc.startsWith("h") ? loc.slice(1) : loc;
        return parseInt(raw, 10);
      })
      .filter((n) => !isNaN(n)),
  );

  for (let n = 1; n <= capacity; n++) {
    if (!usedNumbers.has(n)) return `h${n}`;
  }

  return null;
}
