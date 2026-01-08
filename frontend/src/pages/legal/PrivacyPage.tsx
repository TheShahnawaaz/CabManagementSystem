import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const dataUses = [
  "Enable authentication, booking, cab allocation, and QR/passkey validation for outbound and return journeys.",
  "Communicate booking status, allocation details, and operational updates (pickup hall, cab number, timing).",
  "Detect misuse (QR/passkey tampering, duplicate scans) and safeguard system integrity.",
  "Improve reliability through aggregated analytics (demand per hall, validation success rates).",
];

const sharing = [
  "Drivers: Receive only the data needed to validate boarding (QR payload outcome and allocation info as applicable).",
  "Payment gateway: Receives necessary payment metadata for processing and reconciliation.",
  "Service operators/admins: Access booking, allocation, and journey data to run trips safely.",
];

const retention = [
  "Booking and allocation data: Retained for operational and audit purposes for the active trip lifecycle and reasonable record-keeping thereafter.",
  "Payment references: Retained per legal and financial compliance requirements.",
  "Validation/scan logs: Retained to investigate disputes and improve reliability.",
];

export default function PrivacyPage() {
  return (
    <div className="container mx-auto max-w-5xl px-4 py-10 space-y-8">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">Public</Badge>
          <Badge variant="secondary">Privacy</Badge>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">
          Privacy Policy
        </h1>
        <p className="text-muted-foreground max-w-3xl">
          This policy explains what we collect, why we collect it, and how we
          use information to operate the Friday Cab Allocation System for Friday
          prayer transport.
        </p>
      </div>

      <Separator />

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>What we collect</CardTitle>
            <CardDescription>
              Minimal data to run booking, allocation, and validation.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <ul className="list-disc space-y-2 pl-4">
              <li>
                Identity: name, email, profile photo (from authentication).
              </li>
              <li>Hall selection and trip choices for allocation.</li>
              <li>
                Booking, payment metadata (status, amount, method), and QR
                issuance records.
              </li>
              <li>
                Validation events (QR scans, passkey checks) for outbound and
                return journeys.
              </li>
              <li>Device/browser data needed for secure session management.</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>How we use data</CardTitle>
            <CardDescription>
              To deliver safe, validated transport for Friday prayers.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <ul className="list-disc space-y-2 pl-4">
              {dataUses.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Sharing</CardTitle>
            <CardDescription>
              Only what is necessary to operate trips.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <ul className="list-disc space-y-2 pl-4">
              {sharing.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Retention</CardTitle>
            <CardDescription>
              Kept only as long as needed for operations/compliance.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <ul className="list-disc space-y-2 pl-4">
              {retention.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
          <CardDescription>
            Protecting validation and booking data.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <ul className="list-disc space-y-2 pl-4">
            <li>
              QR validation is checked server-side and paired with driver
              passkeys.
            </li>
            <li>Sessions are managed with secure cookies where applicable.</li>
            <li>
              Input validation and basic rate limiting protect the API surface.
            </li>
            <li>
              Payment card/UPI details are handled by the payment gateway; we do
              not store sensitive card data.
            </li>
          </ul>
        </CardContent>
      </Card>

      <Alert>
        <AlertTitle>Contact</AlertTitle>
        <AlertDescription className="text-sm text-muted-foreground">
          For privacy questions or data requests, use the Contact Us page with
          your registered email so we can locate your booking quickly.
        </AlertDescription>
      </Alert>
    </div>
  );
}
