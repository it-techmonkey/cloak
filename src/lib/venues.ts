import crypto from "node:crypto";
import { createAdminClient, isSupabaseAdminConfigured } from "@/lib/supabase/admin";

export type VenueSignupSummary = {
  billingPlan: "starter" | "professional" | "per_event" | null;
  billingStatus: string;
  city: string | null;
  contactEmail: string;
  id: string;
  name: string;
  slug: string;
};

export const venuePlans = [
  {
    id: "starter",
    name: "Starter",
    price: "Dummy plan",
    description: "For smaller cloakroom operations starting with one counter.",
  },
  {
    id: "professional",
    name: "Professional",
    price: "Dummy plan",
    description: "For busy venues that need higher capacity and team access.",
  },
  {
    id: "per_event",
    name: "Per event",
    price: "Dummy plan",
    description: "For occasional events and temporary cloakroom setups.",
  },
] as const;

export type VenuePlanId = (typeof venuePlans)[number]["id"];

export function slugifyVenueName(name: string) {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return `${base || "venue"}-${crypto.randomBytes(2).toString("hex")}`;
}

export async function getVenueSignupSummary(
  venueId?: string,
): Promise<VenueSignupSummary | null> {
  if (!venueId || !isSupabaseAdminConfigured()) {
    return null;
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("venues")
    .select("id, name, slug, city, contact_email, billing_plan, billing_status")
    .eq("id", venueId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return {
    billingPlan: data.billing_plan,
    billingStatus: data.billing_status,
    city: data.city,
    contactEmail: data.contact_email,
    id: data.id,
    name: data.name,
    slug: data.slug,
  };
}
