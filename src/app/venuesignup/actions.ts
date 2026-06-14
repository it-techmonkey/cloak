"use server";

import crypto from "node:crypto";
import { redirect } from "next/navigation";
import { createAdminClient, isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import {
  clearDraftVenueSignup,
  getDraftVenueSignup,
  setDraftVenueSignup,
  setSubmittedVenueId,
  type VenueSignupDraft,
} from "@/lib/venue-signup-session";
import { slugifyVenueName, type VenuePlanId, venuePlans } from "@/lib/venues";
import { isValidEmail } from "@/lib/validation";
import { sendEmail, getSiteUrl } from "@/lib/email";
import { NewVenuePendingEmail } from "@/lib/emails/NewVenuePendingEmail";

function readField(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function fail(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}

function isPlanId(value: string): value is VenuePlanId {
  return venuePlans.some((plan) => plan.id === value);
}

function validateVenueDetails(draft: VenueSignupDraft) {
  if (
    !draft.venueName ||
    !draft.addressLine1 ||
    !draft.city ||
    !draft.country ||
    !draft.postalCode ||
    !draft.contactEmail ||
    !draft.contactPhone ||
    !draft.capacity
  ) {
    fail("/venuesignup", "Please complete all required venue details.");
  }

  if (!isValidEmail(draft.contactEmail)) {
    fail("/venuesignup", "Please enter a valid contact email address.");
  }

  if (!Number.isInteger(draft.capacity) || draft.capacity < 1) {
    fail("/venuesignup", "Capacity must be at least one slot.");
  }

  if (!/^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/.test(draft.postalCode)) {
    fail("/venuesignup", "Please enter a valid UK postcode.");
  }
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

export async function createVenueSignup(formData: FormData) {
  const latRaw = readField(formData, "latitude");
  const lngRaw = readField(formData, "longitude");
  const draft: VenueSignupDraft = {
    addressLine1: readField(formData, "addressLine1"),
    addressLine2: readField(formData, "addressLine2"),
    capacity: Number(readField(formData, "capacity")),
    city: readField(formData, "city"),
    contactEmail: readField(formData, "contactEmail").toLowerCase(),
    contactPhone: readField(formData, "contactPhone"),
    country: readField(formData, "country"),
    latitude: latRaw ? Number(latRaw) : null,
    longitude: lngRaw ? Number(lngRaw) : null,
    postalCode: readField(formData, "postalCode").toUpperCase(),
    venueName: readField(formData, "venueName"),
  };

  if (!isSupabaseAdminConfigured()) {
    fail("/venuesignup", "Venue registration is temporarily unavailable.");
  }

  validateVenueDetails(draft);

  await setDraftVenueSignup(draft);
  redirect("/venuesignup");
}

export async function selectVenuePlan(formData: FormData) {
  const draft = await getDraftVenueSignup();
  const plan = readField(formData, "plan");

  if (!isSupabaseAdminConfigured()) {
    fail("/venuesignup", "Plan selection is temporarily unavailable.");
  }

  if (!draft || !isPlanId(plan)) {
    fail("/venuesignup", "Please complete the venue details before selecting a plan.");
  }

  await setDraftVenueSignup({
    ...draft,
    billingPlan: plan,
  });

  redirect("/venuesignup");
}

export async function finishVenueSignup(formData: FormData) {
  const draft = await getDraftVenueSignup();
  const password = readField(formData, "password");
  const confirmPassword = readField(formData, "confirmPassword");

  if (!draft) {
    redirect("/venuependingapproval");
  }

  if (!isSupabaseAdminConfigured()) {
    fail("/venuesignup", "Venue registration is temporarily unavailable.");
  }

  validateVenueDetails(draft);

  if (!draft.billingPlan) {
    fail("/venuesignup", "Please select an operating plan before submitting.");
  }

  if (password.length < 8) {
    fail("/venuesignup", "Manager password must be at least 8 characters.");
  }

  if (password !== confirmPassword) {
    fail("/venuesignup", "Manager passwords do not match.");
  }

  const supabase = createAdminClient();
  const recentDuplicateWindow = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data: duplicateVenue } = await supabase
    .from("venues")
    .select("id")
    .eq("approval_status", "pending")
    .eq("contact_email", draft.contactEmail)
    .gte("created_at", recentDuplicateWindow)
    .not("submitted_at", "is", null)
    .order("created_at", { ascending: false })
    .limit(1);

  if (duplicateVenue?.[0]) {
    await setSubmittedVenueId(duplicateVenue[0].id);
    await clearDraftVenueSignup();
    redirect("/venuependingapproval");
  }

  let manager = await findUserByEmail(draft.contactEmail);

  if (!manager) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: draft.contactEmail,
      email_confirm: true,
      password,
      user_metadata: {
        full_name: `${draft.venueName} Manager`,
      },
    });

    if (error || !data.user) {
      fail("/venuesignup", "We could not create the manager account. Please try again.");
    }

    manager = data.user;
  } else {
    const { error } = await supabase.auth.admin.updateUserById(manager.id, {
      password,
      user_metadata: {
        full_name: manager.user_metadata?.full_name ?? `${draft.venueName} Manager`,
      },
    });

    if (error) {
      fail("/venuesignup", "We could not update the manager account. Please try again.");
    }
  }

  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", manager.id)
    .maybeSingle();

  const { error: profileError } = await supabase.from("profiles").upsert({
    email: draft.contactEmail,
    full_name: `${draft.venueName} Manager`,
    id: manager.id,
    phone: draft.contactPhone,
    role: existingProfile?.role ?? "guest",
  });

  if (profileError) {
    fail("/venuesignup", "We could not prepare the manager profile. Please try again.");
  }

  const address = [draft.addressLine1, draft.addressLine2].filter(Boolean).join(", ");
  const { data: venue, error: venueError } = await supabase
    .from("venues")
    .insert({
      address,
      billing_plan: draft.billingPlan,
      billing_status: "trialing",
      capacity: draft.capacity,
      city: draft.city,
      contact_email: draft.contactEmail,
      contact_phone: draft.contactPhone,
      country: draft.country,
      created_by: manager.id,
      latitude: draft.latitude ?? null,
      longitude: draft.longitude ?? null,
      name: draft.venueName,
      postal_code: draft.postalCode,
      slug: slugifyVenueName(draft.venueName),
      stripe_customer_id: `sample_${crypto.randomUUID()}`,
      stripe_price_id: `sample_${draft.billingPlan}`,
      submitted_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (venueError || !venue) {
    fail("/venuesignup", "We could not create the venue registration. Please try again.");
  }

  const { error: staffError } = await supabase.from("venue_staff").insert({
    accepted_at: new Date().toISOString(),
    profile_id: manager.id,
    role: "manager",
    venue_id: venue.id,
  });

  if (staffError) {
    fail("/venuesignup", "We could not assign the venue manager. Please try again.");
  }

  await clearDraftVenueSignup();

  const adminEmail = process.env.PLATFORM_ADMIN_EMAIL;
  if (adminEmail) {
    void sendEmail({
      to: adminEmail,
      subject: `New venue pending review: ${draft.venueName}`,
      react: NewVenuePendingEmail({
        billingPlan: draft.billingPlan ?? "unknown",
        capacity: draft.capacity,
        city: draft.city,
        contactEmail: draft.contactEmail,
        contactName: `${draft.venueName} Manager`,
        dashboardUrl: `${getSiteUrl()}/masterdashboard`,
        venueName: draft.venueName,
      }),
    });
  }

  // Sign the new manager in so they land on the dashboard
  const { createClient: createBrowserServer } = await import("@/lib/supabase/server");
  const serverClient = await createBrowserServer();
  await serverClient.auth.signInWithPassword({
    email: draft.contactEmail,
    password,
  });

  redirect("/venuedashboard");
}
