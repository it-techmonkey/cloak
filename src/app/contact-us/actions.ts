"use server";

import { redirect } from "next/navigation";
import { createAdminClient, isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import { sendEmail, getSiteUrl } from "@/lib/email";
import { LeadNotificationEmail, LeadAutoReplyEmail } from "@/lib/emails/LeadReceivedEmail";

export async function submitLeadForm(formData: FormData) {
  const contactName = String(formData.get("contactName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const venueName = String(formData.get("venueName") ?? "").trim();
  const phone = String(formData.get("capacity") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!contactName || !email || !message) {
    redirect("/contact-us?error=Please+fill+in+all+required+fields.");
  }

  if (isSupabaseAdminConfigured()) {
    const supabase = createAdminClient();
    await supabase.from("leads").insert({
      capacity_estimate: phone || null,
      contact_email: email,
      contact_name: contactName,
      message: message || null,
      venue_name: venueName || "",
    });
  }

  const adminEmail = process.env.PLATFORM_ADMIN_EMAIL;
  await Promise.all([
    adminEmail
      ? sendEmail({
          to: adminEmail,
          subject: `New contact: ${contactName}`,
          react: LeadNotificationEmail({
            capacity: phone,
            contactEmail: email,
            contactName,
            dashboardUrl: `${getSiteUrl()}/masterdashboard`,
            message,
            venueName: venueName || "Not provided",
          }),
        })
      : Promise.resolve(),
    sendEmail({
      to: email,
      subject: "We've received your message",
      react: LeadAutoReplyEmail({ contactName, venueName: venueName || "Cloak" }),
    }),
  ]);

  redirect("/contact-us?success=1");
}
