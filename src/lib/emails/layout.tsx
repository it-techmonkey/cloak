import * as React from "react";

/**
 * Shared wrapper for all transactional emails.
 * Keeps a consistent look: white card on light-zinc background, zinc footer.
 */
export function EmailLayout({
  preview,
  children,
}: {
  preview: string;
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <title>{preview}</title>
      </head>
      <body style={{ margin: 0, padding: 0, backgroundColor: "#f4f4f5", fontFamily: "system-ui, -apple-system, sans-serif" }}>
        {/* Preview text (hidden in email client, shown as snippet) */}
        <div style={{ display: "none", maxHeight: 0, overflow: "hidden", color: "#f4f4f5" }}>
          {preview}
        </div>

        <table width="100%" cellPadding={0} cellSpacing={0} style={{ backgroundColor: "#f4f4f5", padding: "40px 16px" }}>
          <tbody>
            <tr>
              <td align="center">
                <table width="100%" cellPadding={0} cellSpacing={0} style={{ maxWidth: 560 }}>
                  {/* Logo bar */}
                  <tbody>
                    <tr>
                      <td style={{ paddingBottom: 24, textAlign: "center" }}>
                        <table cellPadding={0} cellSpacing={0} style={{ display: "inline-table" }}>
                          <tbody>
                            <tr>
                              <td style={{
                                width: 32, height: 32, borderRadius: 8,
                                backgroundColor: "#09090b", textAlign: "center",
                                verticalAlign: "middle", color: "#fff",
                                fontSize: 11, fontWeight: 700, letterSpacing: 1,
                              }}>
                                CL
                              </td>
                              <td style={{ paddingLeft: 10, fontSize: 14, fontWeight: 600, color: "#09090b" }}>
                                Cloak
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>

                    {/* Card */}
                    <tr>
                      <td style={{
                        backgroundColor: "#fff",
                        borderRadius: 12,
                        border: "1px solid #e4e4e7",
                        padding: "36px 40px",
                      }}>
                        {children}
                      </td>
                    </tr>

                    {/* Footer */}
                    <tr>
                      <td style={{ paddingTop: 24, textAlign: "center", fontSize: 12, color: "#a1a1aa" }}>
                        © {new Date().getFullYear()} Cloak · cloakqr.com
                        <br />
                        <span style={{ fontSize: 11 }}>Digital cloakroom management</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>
      </body>
    </html>
  );
}

/** Reusable heading */
export function Heading({ children }: { children: React.ReactNode }) {
  return (
    <h1 style={{ margin: "0 0 8px", fontSize: 22, fontWeight: 700, color: "#09090b", lineHeight: 1.2 }}>
      {children}
    </h1>
  );
}

/** Muted subheading below the main heading */
export function Subheading({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ margin: "0 0 28px", fontSize: 14, color: "#71717a", lineHeight: 1.5 }}>
      {children}
    </p>
  );
}

/** Body paragraph */
export function P({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <p style={{ margin: "0 0 16px", fontSize: 14, color: "#3f3f46", lineHeight: 1.6, ...style }}>
      {children}
    </p>
  );
}

/** Divider */
export function Divider() {
  return <hr style={{ border: "none", borderTop: "1px solid #e4e4e7", margin: "24px 0" }} />;
}

/** Key/value row for data tables */
export function Field({ label, value }: { label: string; value: string }) {
  return (
    <tr>
      <td style={{ padding: "8px 0", fontSize: 13, color: "#71717a", width: 140, verticalAlign: "top" }}>
        {label}
      </td>
      <td style={{ padding: "8px 0", fontSize: 13, color: "#09090b", fontWeight: 500, verticalAlign: "top" }}>
        {value}
      </td>
    </tr>
  );
}

/** Primary CTA button */
export function Button({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      style={{
        display: "inline-block",
        backgroundColor: "#09090b",
        color: "#fff",
        fontSize: 14,
        fontWeight: 600,
        textDecoration: "none",
        borderRadius: 8,
        padding: "12px 24px",
        marginTop: 8,
      }}
    >
      {children}
    </a>
  );
}
