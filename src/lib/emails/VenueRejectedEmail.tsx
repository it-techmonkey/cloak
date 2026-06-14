import * as React from "react";
import { EmailLayout, Heading, Subheading, P, Divider } from "./layout";

export type VenueRejectedEmailProps = {
  contactName: string;
  venueName: string;
  reason: string;
  /** If true, renders as a query (needs more info) rather than a final rejection. */
  isQuery?: boolean;
};

export function VenueRejectedEmail({
  contactName,
  venueName,
  reason,
  isQuery = false,
}: VenueRejectedEmailProps) {
  return (
    <EmailLayout
      preview={
        isQuery
          ? `We have a question about your ${venueName} application`
          : `Update on your ${venueName} application`
      }
    >
      <Heading>{isQuery ? "We have a question for you." : "Application update."}</Heading>
      <Subheading>
        Hi {contactName} — regarding your Cloak application for {venueName}.
      </Subheading>

      {isQuery ? (
        <P>
          We've reviewed your application and have a question before we can proceed.
          Please reply to this email with the information below so we can continue the review.
        </P>
      ) : (
        <P>
          Thank you for applying to Cloak. After reviewing your application for{" "}
          <strong>{venueName}</strong>, we're unable to approve it at this time.
        </P>
      )}

      <div
        style={{
          backgroundColor: "#fafafa",
          border: "1px solid #e4e4e7",
          borderRadius: 8,
          padding: "16px 20px",
          margin: "16px 0",
          fontSize: 14,
          color: "#3f3f46",
          lineHeight: 1.6,
        }}
      >
        {reason}
      </div>

      <Divider />

      <P style={{ color: "#71717a", fontSize: 13 } as React.CSSProperties}>
        {isQuery
          ? "Reply to this email and we'll get back to you as soon as possible."
          : "If you believe this decision was made in error or your circumstances have changed, reply to this email and we'll be happy to take another look."}
      </P>
    </EmailLayout>
  );
}
