import * as React from "react";
import { EmailLayout, Heading, Subheading, P, Divider, Button } from "./layout";

export type VenueApprovedEmailProps = {
  contactName: string;
  venueName: string;
  loginUrl: string;
};

export function VenueApprovedEmail({
  contactName,
  venueName,
  loginUrl,
}: VenueApprovedEmailProps) {
  return (
    <EmailLayout preview={`${venueName} has been approved on Cloak`}>
      <Heading>You're approved.</Heading>
      <Subheading>
        Congratulations {contactName} — {venueName} is now live on Cloak.
      </Subheading>

      <P>
        Your venue has been reviewed and approved. You can now log in to your dashboard to
        set up your cloakroom, manage staff accounts, and start accepting guests.
      </P>

      <Button href={loginUrl}>Go to my dashboard</Button>

      <Divider />

      <P style={{ color: "#71717a", fontSize: 13 } as React.CSSProperties}>
        If you have any questions, reply to this email or contact us at hello@cloakqr.com.
      </P>
    </EmailLayout>
  );
}
