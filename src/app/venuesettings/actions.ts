"use server";

import { redirect } from "next/navigation";
import { requireVenueAccess } from "@/lib/auth/guards";
import { createAdminClient, isSupabaseAdminConfigured } from "@/lib/supabase/admin";

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
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: 100,
    });

    if (error) {
      throw error;
    }

    const user = data.users.find((item) => item.email?.toLowerCase() === normalizedEmail);

    if (user) {
      return user;
    }

    if (data.users.length < 100) {
      return null;
    }
  }

  return null;
}

export async function createVenueStaffAccount(formData: FormData) {
  const guard = await requireVenueAccess("/venuesettings", ["manager"]);
  const fullName = readField(formData, "fullName");
  const email = readField(formData, "email").toLowerCase();
  const password = readField(formData, "password");

  if (guard.status !== "authorized" || !isSupabaseAdminConfigured()) {
    fail("Staff account creation is temporarily unavailable.");
  }

  const venueId = guard.venueRoles.find((venueRole) => venueRole.role === "manager")?.venueId;

  if (!venueId) {
    fail("No managed venue was found for this account.");
  }

  if (!fullName || !email || !password) {
    fail("Please complete all staff account details.");
  }

  if (!email.includes("@") || !email.includes(".")) {
    fail("Please enter a valid staff email address.");
  }

  if (password.length < 8) {
    fail("Staff password must be at least 8 characters.");
  }

  const supabase = createAdminClient();
  let user = await findUserByEmail(email);

  if (!user) {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      email_confirm: true,
      password,
      user_metadata: { full_name: fullName },
    });

    if (error || !data.user) {
      fail("We could not create the staff account. Please try again.");
    }

    user = data.user;
  } else {
    const { error } = await supabase.auth.admin.updateUserById(user.id, {
      password,
      user_metadata: {
        full_name: fullName,
      },
    });

    if (error) {
      fail("We could not update the staff account. Please try again.");
    }
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

  if (profileError) {
    fail("We could not prepare the staff profile. Please try again.");
  }

  const { data: existingStaff } = await supabase
    .from("venue_staff")
    .select("id")
    .eq("venue_id", venueId)
    .eq("profile_id", user.id)
    .maybeSingle();

  if (existingStaff) {
    await supabase
      .from("venue_staff")
      .update({
        accepted_at: new Date().toISOString(),
        role: "staff",
      })
      .eq("id", existingStaff.id);
  } else {
    const { error: staffError } = await supabase.from("venue_staff").insert({
      accepted_at: new Date().toISOString(),
      profile_id: user.id,
      role: "staff",
      venue_id: venueId,
    });

    if (staffError) {
      fail("We could not attach the staff account to this venue.");
    }
  }

  finish("Staff account created.");
}
