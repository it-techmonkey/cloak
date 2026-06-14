import "server-only";

import { Resend } from "resend";
import type { ReactElement } from "react";

const FROM = "Cloak <noreply@cloakqr.com>";

function getClient(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  return new Resend(process.env.RESEND_API_KEY);
}

export function getSiteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "https://cloakqr.com").replace(/\/$/, "");
}

/**
 * Send a transactional email. Fails silently — an email error must never
 * interrupt a user-facing action.
 */
export async function sendEmail({
  to,
  subject,
  react,
}: {
  to: string | string[];
  subject: string;
  react: ReactElement;
}) {
  const client = getClient();
  if (!client) return;

  try {
    await client.emails.send({ from: FROM, to, subject, react });
  } catch (err) {
    console.error("[email]", subject, err);
  }
}
