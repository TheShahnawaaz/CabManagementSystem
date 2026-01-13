import * as React from "react";
import {
  Html,
  Head,
  Preview,
  Body,
  Section,
  Text,
  Link,
  Img,
} from "@react-email/components";

// Config from environment
const SUPPORT_EMAIL = process.env.EMAIL_SUPPORT || "support@fridaycab.com";
const BRAND_NAME = process.env.EMAIL_BRAND_NAME || "IITKGP Cabs";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const UNSUBSCRIBE_URL = `${FRONTEND_URL}/profile`;

// Logo as base64 encoded SVG (works in all email clients)
const LOGO_BASE64 =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDMyIDMyIiBmaWxsPSJub25lIj48cmVjdCB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHJ4PSI2IiBmaWxsPSJoc2woMCwgMCUsIDg4JSkiLz48ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgyLCAxKSBzY2FsZSgxLjE3KSI+PHBhdGggZD0iTTE5IDE3aDJjLjYgMCAxLS40IDEtMXYtM2MwLS45LS43LTEuNy0xLjUtMS45QzE4LjcgMTAuNiAxNiAxMCAxNiAxMHMtMS4zLTEuNC0yLjItMi4zYy0uNS0uNC0xLjEtLjctMS44LS43SDVjLS42IDAtMS4xLjQtMS40LjlsLTEuNCAyLjlBMy43IDMuNyAwIDAgMCAyIDEydjRjMCAuNi40IDEgMSAxaDIiIHN0cm9rZT0iIzE4MTgxYiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48Y2lyY2xlIGN4PSI3IiBjeT0iMTciIHI9IjIiIHN0cm9rZT0iIzE4MTgxYiIgc3Ryb2tlLXdpZHRoPSIyIi8+PHBhdGggZD0iTTkgMTdoNiIgc3Ryb2tlPSIjMTgxODFiIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjxjaXJjbGUgY3g9IjE3IiBjeT0iMTciIHI9IjIiIHN0cm9rZT0iIzE4MTgxYiIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9nPjwvc3ZnPg==";

interface EmailLayoutProps {
  preview: string;
  children: React.ReactNode;
}

export const EmailLayout: React.FC<EmailLayoutProps> = ({
  preview,
  children,
}) => {
  return (
    <Html lang="en">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="color-scheme" content="light dark" />
        <meta name="supported-color-schemes" content="light dark" />
        <style>{`
          :root { color-scheme: light dark; }
          
          /* Mobile responsive */
          @media only screen and (max-width: 600px) {
            .email-wrapper { padding: 16px 12px !important; }
            .email-container { border-radius: 8px !important; }
            .email-header { padding: 20px 16px !important; }
            .email-logo { font-size: 26px !important; }
            .email-content { padding: 24px 20px !important; }
            .email-footer { padding: 20px 16px !important; }
            .email-title { font-size: 22px !important; }
            .details-card { padding: 4px 16px !important; }
          }
          
          /* Dark mode */
          @media (prefers-color-scheme: dark) {
            .email-body { background-color: #0a0a0a !important; }
            .email-container { background-color: #171717 !important; border-color: #262626 !important; }
            .email-content { background-color: #171717 !important; }
            .email-title { color: #fafafa !important; }
            .email-text { color: #d4d4d4 !important; }
            .email-muted { color: #737373 !important; }
            .details-card { background-color: #262626 !important; border-color: #404040 !important; }
            .detail-row { border-color: #404040 !important; }
            .detail-label { color: #a3a3a3 !important; }
            .detail-value { color: #fafafa !important; }
            .email-button { background-color: #fafafa !important; color: #171717 !important; }
            .email-footer { background-color: #0a0a0a !important; border-color: #262626 !important; }
            .footer-text { color: #737373 !important; }
            .badge-success { background-color: #14532d !important; color: #86efac !important; }
            .badge-warning { background-color: #78350f !important; color: #fcd34d !important; }
            .badge-danger { background-color: #7f1d1d !important; color: #fca5a5 !important; }
            .badge-info { background-color: #1e3a8a !important; color: #93c5fd !important; }
          }
        `}</style>
      </Head>
      <Preview>{preview}</Preview>
      <Body className="email-body" style={styles.body}>
        {/* Wrapper for centering */}
        <Section className="email-wrapper" style={styles.wrapper}>
          {/* Main container - uses table for email compatibility */}
          <table
            className="email-container"
            cellPadding="0"
            cellSpacing="0"
            style={styles.container}
          >
            <tbody>
              {/* Header */}
              <tr>
                <td className="email-header" style={styles.header}>
                  <table
                    cellPadding="0"
                    cellSpacing="0"
                    style={{ margin: "0 auto" }}
                  >
                    <tbody>
                      <tr>
                        <td
                          style={{
                            paddingRight: "12px",
                            verticalAlign: "middle",
                          }}
                        >
                          <Img
                            src={LOGO_BASE64}
                            alt={BRAND_NAME}
                            width="40"
                            height="40"
                            style={{ borderRadius: "8px" }}
                          />
                        </td>
                        <td style={{ verticalAlign: "middle" }}>
                          <Text className="email-logo" style={styles.logo}>
                            {BRAND_NAME}
                          </Text>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>

              {/* Content */}
              <tr>
                <td className="email-content" style={styles.content}>
                  {children}
                </td>
              </tr>

              {/* Footer */}
              <tr>
                <td className="email-footer" style={styles.footer}>
                  <table
                    cellPadding="0"
                    cellSpacing="0"
                    style={{ width: "100%" }}
                  >
                    <tbody>
                      <tr>
                        <td style={{ textAlign: "center" as const }}>
                          <span style={styles.footerText}>
                            Questions? Reply to this email or contact us at{" "}
                            <Link
                              href={`mailto:${SUPPORT_EMAIL}`}
                              style={styles.footerLink}
                            >
                              {SUPPORT_EMAIL}
                            </Link>
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td
                          style={{
                            textAlign: "center" as const,
                            paddingTop: "8px",
                          }}
                        >
                          <Link
                            href={UNSUBSCRIBE_URL}
                            style={styles.footerLink}
                          >
                            Manage notification preferences
                          </Link>
                        </td>
                      </tr>
                      <tr>
                        <td
                          style={{
                            textAlign: "center" as const,
                            paddingTop: "8px",
                          }}
                        >
                          <span style={styles.footerTextSmall}>
                            © {new Date().getFullYear()} {BRAND_NAME}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>
        </Section>
      </Body>
    </Html>
  );
};

const styles: Record<string, React.CSSProperties> = {
  body: {
    margin: 0,
    padding: 0,
    backgroundColor: "#f5f5f5",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    width: "100%",
  },
  wrapper: {
    padding: "32px 16px",
    width: "100%",
  },
  container: {
    width: "100%",
    maxWidth: "720px",
    margin: "0 auto",
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    border: "1px solid #e5e5e5",
    borderCollapse: "separate" as const,
    overflow: "hidden",
  },
  header: {
    background:
      "linear-gradient(135deg, #059669 0%, #10b981 50%, #34d399 100%)",
    padding: "28px 32px",
    textAlign: "center" as const,
  },
  logo: {
    fontSize: "32px",
    fontWeight: 700,
    color: "#ffffff",
    margin: 0,
    letterSpacing: "-0.5px",
    textShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  content: {
    padding: "40px 48px",
    backgroundColor: "#ffffff",
  },
  footer: {
    backgroundColor: "#fafafa",
    padding: "24px 40px",
    textAlign: "center" as const,
    borderTop: "1px solid #e5e5e5",
  },
  footerText: {
    fontSize: "13px",
    color: "#737373",
    lineHeight: 1.6,
  },
  footerTextSmall: {
    fontSize: "12px",
    color: "#a3a3a3",
  },
  footerLink: {
    color: "#059669",
    textDecoration: "underline",
  },
};

export default EmailLayout;
