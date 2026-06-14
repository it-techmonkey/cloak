import * as React from "react";
import { EmailLayout, Heading, Subheading, P, Divider, Field, Button } from "./layout";

/** Sent to the platform admin when a lead submits the register-interest form. */
export type LeadNotificationEmailProps = {
  venueName: string;
  contactName: string;
  contactEmail: string;
  capacity: string;
  message: string;
  dashboardUrl: string;
};

export function LeadNotificationEmail({
  venueName,
  contactName,
  contactEmail,
  capacity,
  message,
  dashboardUrl,
}: LeadNotificationEmailProps) {
  return (
    <EmailLayout preview={`New enquiry from ${contactName} at ${venueName}`}>
      <Heading>New enquiry received.</Heading>
      <Subheading>Someone filled in the register-interest form on cloakqr.com.</Subheading>

      <table cellPadding={0} cellSpacing={0} style={{ width: "100%" }}>
        <tbody>
          <Field label="Venue" value={venueName} />
          <Field label="Name" value={contactName} />
          <Field label="Email" value={contactEmail} />
          {capacity ? <Field label="Capacity" value={capacity} /> : null}
        </tbody>
      </table>

      {message ? (
        <>
          <Divider />
          <div
            style={{
              backgroundColor: "#fafafa",
              border: "1px solid #e4e4e7",
              borderRadius: 8,
              padding: "16px 20px",
              fontSize: 14,
              color: "#3f3f46",
              lineHeight: 1.6,
            }}
          >
            {message}
          </div>
        </>
      ) : null}

      <Divider />

      <Button href={dashboardUrl}>View admin dashboard</Button>
    </EmailLayout>
  );
}

/** Auto-reply sent to the person who submitted the form. */
export type LeadAutoReplyEmailProps = {
  contactName: string;
  venueName: string;
};

export function LeadAutoReplyEmail({
  contactName,
  venueName,
}: LeadAutoReplyEmailProps) {
  return (
    <EmailLayout preview="We received your Cloak enquiry">
      <Heading>We've received your enquiry.</Heading>
      <Subheading>Thanks for getting in touch, {contactName}.</Subheading>

      <P>
        We've received your enquiry about bringing Cloak to <strong>{venueName}</strong>.
        Someone from our team will be in touch within 1 business day.
      </P>
      <P>
        In the meantime, if you have any questions you can reply directly to this email.
      </P>

      <Divider />

      <P style={{ color: "#71717a", fontSize: 13 } as React.CSSProperties}>
        Cloak is a digital cloakroom platform built for nightclubs, events, and venues.
        Paper-free from check-in to collection.
      </P>
    </EmailLayout>
  );
}
