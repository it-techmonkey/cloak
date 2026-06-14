"use server";

import { redirect } from "next/navigation";
import { createAdminClient, isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import { sendEmail, getSiteUrl } from "@/lib/email";
import { LeadNotificationEmail, LeadAutoReplyEmail } from "@/lib/emails/LeadReceivedEmail";

export async function submitLeadForm(formData: FormData) {
  const venueName = String(formData.get("venueName") ?? "").trim();
  const contactName = String(formData.get("contactName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const capacity = String(formData.get("capacity") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!venueName || !contactName || !email) {
    redirect("/register-interest?error=Please+fill+in+all+required+fields.");
  }

  if (isSupabaseAdminConfigured()) {
    const supabase = createAdminClient();
    await supabase.from("leads").insert({
      capacity_estimate: capacity || null,
      contact_email: email,
      contact_name: contactName,
      message: message || null,
      venue_name: venueName,
    });
  }

  const adminEmail = process.env.PLATFORM_ADMIN_EMAIL;
  await Promise.all([
    adminEmail
      ? sendEmail({
          to: adminEmail,
          subject: `New enquiry: ${venueName}`,
          react: LeadNotificationEmail({
            capacity,
            contactEmail: email,
            contactName,
            dashboardUrl: `${getSiteUrl()}/masterdashboard`,
            message,
            venueName,
          }),
        })
      : Promise.resolve(),
    sendEmail({
      to: email,
      subject: "We've received your Cloak enquiry",
      react: LeadAutoReplyEmail({ contactName, venueName }),
    }),
  ]);

  redirect("/register-interest?success=1");
}
