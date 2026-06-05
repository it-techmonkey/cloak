"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requirePlatformAdmin } from "@/lib/auth/guards";
import { createAdminClient, isSupabaseAdminConfigured } from "@/lib/supabase/admin";

function readField(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function finish(message: string): never {
  redirect(`/masterdashboard?message=${encodeURIComponent(message)}`);
}

async function assertAdmin() {
  const guard = await requirePlatformAdmin("/masterdashboard");

  if (guard.status === "not_configured" || !isSupabaseAdminConfigured()) {
    finish("Admin actions are temporarily unavailable.");
  }

  return guard;
}

async function writeAuditLog({
  action,
  actorId,
  metadata = {},
  venueId,
}: {
  action: string;
  actorId: string;
  metadata?: Record<string, string>;
  venueId: string;
}) {
  const supabase = createAdminClient();

  await supabase.from("audit_logs").insert({
    action,
    actor_profile_id: actorId,
    entity_id: venueId,
    entity_type: "venue",
    metadata,
    venue_id: venueId,
  });
}

export async function approveVenue(formData: FormData) {
  const venueId = readField(formData, "venueId");
  const admin = await assertAdmin();
  const supabase = createAdminClient();

  const { data: venue } = await supabase
    .from("venues")
    .select("billing_status, stripe_customer_id")
    .eq("id", venueId)
    .maybeSingle();

  if (!venue) {
    finish("Venue registration was not found.");
  }

  const billingValid =
    ["trialing", "active"].includes(venue.billing_status) && Boolean(venue.stripe_customer_id);

  if (!billingValid) {
    finish("Venue cannot be approved until billing is valid.");
  }

  const { error } = await supabase
    .from("venues")
    .update({
      active: true,
      approval_status: "approved",
      approved_at: new Date().toISOString(),
      approved_by: admin.userId,
      rejection_reason: null,
    })
    .eq("id", venueId);

  if (error) {
    finish("Venue approval failed. Please try again.");
  }

  await writeAuditLog({
    action: "venue.approved",
    actorId: admin.userId,
    metadata: { billing_status: venue.billing_status },
    venueId,
  });

  revalidatePath("/masterdashboard");
  finish("Venue approved and activated.");
}

export async function rejectVenue(formData: FormData) {
  const venueId = readField(formData, "venueId");
  const reason = readField(formData, "reason") || "Rejected by platform admin.";
  const admin = await assertAdmin();
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("venues")
    .update({
      active: false,
      approval_status: "rejected",
      rejection_reason: reason,
    })
    .eq("id", venueId);

  if (error) {
    finish("Venue rejection failed. Please try again.");
  }

  await writeAuditLog({
    action: "venue.rejected",
    actorId: admin.userId,
    metadata: { reason },
    venueId,
  });

  revalidatePath("/masterdashboard");
  finish("Venue registration rejected.");
}

export async function suspendVenue(formData: FormData) {
  const venueId = readField(formData, "venueId");
  const reason = readField(formData, "reason") || "Suspended by platform admin.";
  const admin = await assertAdmin();
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("venues")
    .update({
      active: false,
      approval_status: "suspended",
      rejection_reason: reason,
    })
    .eq("id", venueId);

  if (error) {
    finish("Venue suspension failed. Please try again.");
  }

  await writeAuditLog({
    action: "venue.suspended",
    actorId: admin.userId,
    metadata: { reason },
    venueId,
  });

  revalidatePath("/masterdashboard");
  finish("Venue suspended.");
}
