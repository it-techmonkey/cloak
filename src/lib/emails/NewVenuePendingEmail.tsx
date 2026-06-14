import * as React from "react";
import { EmailLayout, Heading, Subheading, P, Divider, Field, Button } from "./layout";

export type NewVenuePendingEmailProps = {
  venueName: string;
  contactName: string;
  contactEmail: string;
  city: string;
  capacity: number;
  billingPlan: string;
  dashboardUrl: string;
};

export function NewVenuePendingEmail({
  venueName,
  contactName,
  contactEmail,
  city,
  capacity,
  billingPlan,
  dashboardUrl,
}: NewVenuePendingEmailProps) {
  return (
    <EmailLayout preview={`New venue pending review: ${venueName}`}>
      <Heading>New venue pending review.</Heading>
      <Subheading>A new venue has completed registration and is awaiting your approval.</Subheading>

      <table cellPadding={0} cellSpacing={0} style={{ width: "100%" }}>
        <tbody>
          <Field label="Venue" value={venueName} />
          <Field label="City" value={city} />
          <Field label="Manager" value={contactName} />
          <Field label="Email" value={contactEmail} />
          <Field label="Capacity" value={`${capacity} slots`} />
          <Field label="Plan" value={billingPlan} />
        </tbody>
      </table>

      <Divider />

      <P>Review the application and approve, query, or reject it from the admin dashboard.</P>

      <Button href={dashboardUrl}>Go to admin dashboard</Button>
    </EmailLayout>
  );
}
