export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { PKPass } from "passkit-generator";
import { getPublicTicketByCode, getPublicTicketByToken } from "@/lib/tickets";

function isConfigured() {
  return !!(
    process.env.APPLE_PASS_TYPE_ID &&
    process.env.APPLE_TEAM_ID &&
    process.env.APPLE_PASS_CERT_PEM &&
    process.env.APPLE_PASS_KEY_PEM &&
    process.env.APPLE_WWDR_PEM
  );
}

// Minimal 1x1 white PNG for required icon slots
const BLANK_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI6QAAAABJRU5ErkJggg==",
  "base64",
);

export async function GET(req: NextRequest) {
  if (!isConfigured()) {
    return NextResponse.json(
      { error: "Apple Wallet is not configured on this server." },
      { status: 503 },
    );
  }

  const { searchParams } = req.nextUrl;
  const code = searchParams.get("code");
  const token = searchParams.get("token");

  const result = code
    ? await getPublicTicketByCode(code)
    : token
      ? await getPublicTicketByToken(token)
      : { status: "invalid" as const, ticket: null };

  if (!result.ticket) {
    return NextResponse.json({ error: "Ticket not found." }, { status: 404 });
  }

  const t = result.ticket;
  const expiryDate = new Date(t.expiresAt);

  // Build the pass.json content
  const passJson = {
    formatVersion: 1,
    passTypeIdentifier: process.env.APPLE_PASS_TYPE_ID!,
    teamIdentifier: process.env.APPLE_TEAM_ID!,
    organizationName: "Cloak",
    description: "Cloak cloakroom ticket",
    serialNumber: t.ticketId,
    foregroundColor: "rgb(255, 255, 255)",
    backgroundColor: "rgb(24, 24, 27)",
    labelColor: "rgb(161, 161, 170)",
    expirationDate: expiryDate.toISOString(),
    generic: {
      primaryFields: [
        {
          key: "venue",
          label: "VENUE",
          value: t.venueName,
        },
      ],
      secondaryFields: [
        {
          key: "guest",
          label: "GUEST",
          value: t.guestName,
        },
        {
          key: "items",
          label: "ITEMS",
          value: t.itemType ?? "Items",
        },
      ],
      auxiliaryFields: [
        {
          key: "status",
          label: "STATUS",
          value:
            t.status === "active"
              ? "Stored"
              : t.status === "pending_activation"
                ? "Awaiting activation"
                : t.status === "collected"
                  ? "Collected"
                  : t.status,
        },
        ...(t.storageLocation
          ? [{ key: "cloak", label: "CLOAK NO.", value: t.storageLocation }]
          : []),
      ],
      backFields: [
        { key: "ticketId", label: "Ticket ID", value: t.ticketId },
        { key: "email", label: "Email", value: t.email },
        { key: "mobile", label: "Mobile", value: t.mobile },
        {
          key: "expires",
          label: "Expires",
          value: expiryDate.toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
          }),
        },
      ],
    },
    barcodes: [
      {
        message: t.ticketId,
        format: "PKBarcodeFormatQR",
        messageEncoding: "iso-8859-1",
        altText: t.ticketId,
      },
    ],
  };

  try {
    const fixPem = (s: string) => s.replace(/\\n/g, "\n");
    const pass = new PKPass(
      {
        "pass.json": Buffer.from(JSON.stringify(passJson)),
        "icon.png": BLANK_PNG,
        "icon@2x.png": BLANK_PNG,
        "icon@3x.png": BLANK_PNG,
      },
      {
        wwdr: fixPem(process.env.APPLE_WWDR_PEM!),
        signerCert: fixPem(process.env.APPLE_PASS_CERT_PEM!),
        signerKey: fixPem(process.env.APPLE_PASS_KEY_PEM!),
      },
    );

    const buffer = await pass.getAsBuffer();

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.apple.pkpass",
        "Content-Disposition": `attachment; filename="cloak-${t.ticketId}.pkpass"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("[apple-wallet]", err);
    return NextResponse.json({ error: "Failed to generate pass." }, { status: 500 });
  }
}
