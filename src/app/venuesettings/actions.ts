"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireVenueAccess } from "@/lib/auth/guards";
import { createAdminClient, isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

function readField(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function finish(message: string): never {
  redirect(`/venuesettings?message=${encodeURIComponent(message)}`);
}

function fail(message: string): never {
  redirect(`/venuesettings?error=${encodeURIComponent(message)}`);
}

async function findUserByEmail(email: string) {
  const supabase = createAdminClient();
  const normalizedEmail = email.toLowerCase();

  for (let page = 1; page <= 20; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 100 });
    if (error) throw error;
    const user = data.users.find((item) => item.email?.toLowerCase() === normalizedEmail);
    if (user) return user;
    if (data.users.length < 100) return null;
  }

  return null;
}

// ─── Create staff account ──────────────────────────────────────────────────────

export async function createVenueStaffAccount(formData: FormData) {
  const guard = await requireVenueAccess("/venuesettings", ["manager"]);
  const fullName = readField(formData, "fullName");
  const email = readField(formData, "email").toLowerCase();
  const password = readField(formData, "password");

  if (guard.status !== "authorized" || !isSupabaseAdminConfigured()) {
    fail("Staff account creation is temporarily unavailable.");
  }

  const venueId = guard.venueRoles.find((r) => r.role === "manager")?.venueId;
  if (!venueId) fail("No managed venue was found for this account.");

  if (!fullName || !email || !password) fail("Please complete all staff account details.");
  if (!email.includes("@") || !email.includes(".")) fail("Please enter a valid staff email address.");
  if (password.length < 8) fail("Staff password must be at least 8 characters.");

  const supabase = createAdminClient();
  let user = await findUserByEmail(email);

  if (!user) {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      email_confirm: true,
      password,
      user_metadata: { full_name: fullName },
    });
    if (error || !data.user) fail("We could not create the staff account. Please try again.");
    user = data.user;
  } else {
    const { error } = await supabase.auth.admin.updateUserById(user.id, {
      password,
      user_metadata: { full_name: fullName },
    });
    if (error) fail("We could not update the staff account. Please try again.");
  }

  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const { error: profileError } = await supabase.from("profiles").upsert({
    email,
    full_name: fullName,
    id: user.id,
    role: existingProfile?.role ?? "guest",
  });
  if (profileError) fail("We could not prepare the staff profile. Please try again.");

  const { data: existingStaff } = await supabase
    .from("venue_staff")
    .select("id")
    .eq("venue_id", venueId)
    .eq("profile_id", user.id)
    .maybeSingle();

  if (existingStaff) {
    await supabase
      .from("venue_staff")
      .update({ accepted_at: new Date().toISOString(), role: "staff" })
      .eq("id", existingStaff.id);
  } else {
    const { error: staffError } = await supabase.from("venue_staff").insert({
      accepted_at: new Date().toISOString(),
      profile_id: user.id,
      role: "staff",
      venue_id: venueId,
    });
    if (staffError) fail("We could not attach the staff account to this venue.");
  }

  finish("Staff account created.");
}

// ─── Remove staff member ───────────────────────────────────────────────────────

export async function removeStaffMember(formData: FormData) {
  const guard = await requireVenueAccess("/venuesettings", ["manager"]);
  const staffId = readField(formData, "staffId");

  if (guard.status !== "authorized" || !isSupabaseAdminConfigured()) {
    fail("This action is temporarily unavailable.");
  }

  const venueId = guard.venueRoles.find((r) => r.role === "manager")?.venueId;
  if (!venueId) fail("No managed venue was found for this account.");
  if (!staffId) fail("Staff member not identified.");

  const supabase = createAdminClient();

  // Verify the staff row belongs to this venue and is not a manager (can't remove managers)
  const { data: staffRow } = await supabase
    .from("venue_staff")
    .select("id, role, profile_id")
    .eq("id", staffId)
    .eq("venue_id", venueId)
    .maybeSingle();

  if (!staffRow) fail("Staff member not found in this venue.");
  if (staffRow.role === "manager") fail("Managers cannot be removed from this page.");
  if (staffRow.profile_id === guard.userId) fail("You cannot remove your own account.");

  const { error } = await supabase.from("venue_staff").delete().eq("id", staffId);
  if (error) fail("Could not remove staff member. Please try again.");

  revalidatePath("/venuesettings");
  finish("Staff member removed.");
}

// ─── Update venue details ──────────────────────────────────────────────────────

export async function updateVenueDetails(formData: FormData) {
  const guard = await requireVenueAccess("/venuesettings", ["manager"]);

  if (guard.status !== "authorized" || !isSupabaseAdminConfigured()) {
    fail("Venue updates are temporarily unavailable.");
  }

  const venueId = guard.venueRoles.find((r) => r.role === "manager")?.venueId;
  if (!venueId) fail("No managed venue was found for this account.");

  const name = readField(formData, "name");
  const city = readField(formData, "city");
  const postalCode = readField(formData, "postalCode").toUpperCase();
  const contactPhone = readField(formData, "contactPhone");
  const capacityRaw = readField(formData, "capacity");
  const capacity = parseInt(capacityRaw, 10);

  if (!name) fail("Venue name is required.");
  if (isNaN(capacity) || capacity < 1) fail("Capacity must be at least 1.");
  if (postalCode && !/^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/.test(postalCode)) {
    fail("Please enter a valid UK postcode.");
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("venues")
    .update({
      capacity,
      city: city || null,
      contact_phone: contactPhone || null,
      name,
      postal_code: postalCode || null,
    })
    .eq("id", venueId);

  if (error) fail("Could not update venue details. Please try again.");

  revalidatePath("/venuesettings");
  revalidatePath("/venuedashboard");
  finish("Venue details updated.");
}

// ─── Update my profile ─────────────────────────────────────────────────────────

export async function updateMyProfile(formData: FormData) {
  const guard = await requireVenueAccess("/venuesettings");

  if (guard.status !== "authorized" || !isSupabaseAdminConfigured()) {
    fail("Profile updates are temporarily unavailable.");
  }

  const fullName = readField(formData, "fullName");
  const phone = readField(formData, "phone");

  if (!fullName) fail("Full name is required.");

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("profiles")
    .update({ full_name: fullName, phone: phone || null })
    .eq("id", guard.userId);

  if (error) fail("Could not update your profile. Please try again.");

  revalidatePath("/venuesettings");
  finish("Profile updated.");
}

// ─── Change password ───────────────────────────────────────────────────────────

export async function changeMyPassword(formData: FormData) {
  const guard = await requireVenueAccess("/venuesettings");

  if (guard.status !== "authorized" || !isSupabaseAdminConfigured()) {
    fail("Password changes are temporarily unavailable.");
  }

  const newPassword = readField(formData, "newPassword");
  const confirmPassword = readField(formData, "confirmPassword");

  if (newPassword.length < 8) fail("New password must be at least 8 characters.");
  if (newPassword !== confirmPassword) fail("Passwords do not match.");

  // Use the user-scoped client so we update the currently authenticated user
  const authClient = await createClient();
  const { error } = await authClient.auth.updateUser({ password: newPassword });

  if (error) fail("Could not change password. Please try again.");

  finish("Password changed successfully.");
}
