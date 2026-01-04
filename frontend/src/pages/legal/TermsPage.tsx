import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const sections = [
  {
    title: "Service Scope",
    points: [
      "Friday Cab Allocation System is built for campus Friday prayer transportation, including demand capture, cab allocation, QR-based boarding, and return journey validation.",
      "The platform is web-based and optimized for mobile browsers for both students and drivers—no native app installation is required.",
    ],
  },
  {
    title: "Eligibility & Accounts",
    points: [
      "Students must authenticate with a unique email address. Account sharing is not permitted.",
      "Admins manage trips, allocations, and validation rules. Drivers receive passkeys for their assigned cabs and do not need separate accounts unless specified.",
    ],
  },
  {
    title: "Bookings, Payments, and Confirmation",
    points: [
      "A booking is considered complete only after successful payment through the designated payment gateway.",
      "Booking windows, fares, and hall pickup options are defined per trip. Attempting to board without a confirmed booking or valid QR is not allowed.",
      "Allocation outcomes (cab number, pickup hall/time) may change based on demand or operational factors; affected students will see updated details in the portal.",
    ],
  },
  {
    title: "QR Codes, Passkeys, and Validation",
    points: [
      "Each confirmed student receives a unique QR pass. The QR must be presented for both outbound (campus → mosque) and return (mosque → campus) validation.",
      "Drivers validate QR passes using their cab-specific 4-digit passkey. Outbound validation requires matching the allocated cab; return validation accepts any hired cab with a valid passkey.",
      "Tampering with, sharing, or reusing QR tokens or passkeys is prohibited and may void travel eligibility.",
    ],
  },
  {
    title: "Conduct and Safety",
    points: [
      "Follow pickup schedules, queueing instructions, and driver/admin guidance at halls and the mosque.",
      "Hazardous items, misconduct, or actions that delay departures can lead to boarding denial.",
    ],
  },
  {
    title: "Cancellations and Refunds",
    points: [
      "Refunds and cancellation windows follow the published cancellation & refunds policy for each trip. No-shows may be ineligible for refunds.",
      "If a trip is cancelled by organizers, applicable refunds will be issued to the original payment method where feasible.",
    ],
  },
  {
    title: "Liability and Service Changes",
    points: [
      "Operational delays may occur due to traffic, safety checks, or weather. The service does not cover indirect losses resulting from delays.",
      "Route, cab allocation, and timing may be adjusted for safety or capacity reasons.",
    ],
  },
  {
    title: "Data and Privacy",
    points: [
      "We collect identity, hall selection, booking, and validation data to operate the service. See the Privacy Policy for details on usage, retention, and sharing.",
    ],
  },
  {
    title: "Contact",
    points: [
      "For questions or disputes, reach out via the Contact Us page. Provide your registered email and booking details for faster resolution.",
    ],
  },
];

export default function TermsPage() {
  return (
    <div className="container mx-auto max-w-5xl px-4 py-10 space-y-8">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">Public</Badge>
          <Badge variant="secondary">Updated</Badge>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">
          Terms &amp; Conditions
        </h1>
        <p className="text-muted-foreground max-w-3xl">
          Please read these terms carefully. By using the Friday Cab Allocation
          System, you agree to the operational rules for Friday prayer
          transportation, including booking, payment, allocation, and boarding.
        </p>
      </div>

      <Separator />

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Who should read this?</CardTitle>
            <CardDescription>
              Students booking seats, drivers validating QR passes, and admins
              running operations.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              The system manages hall-wise demand, assigns students to cabs, and
              secures boarding using QR + passkey validation.
            </p>
            <p>
              Outbound rides require boarding the allocated cab; return rides
              allow any hired cab with a valid driver passkey.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fair use</CardTitle>
            <CardDescription>
              Keep bookings accurate and present your own QR code.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              Do not share QR codes or passkeys. Tampering, spoofing, or
              bypassing validation may result in denied boarding.
            </p>
            <p>
              Follow driver/admin guidance at pickup points to keep the flow
              quick for everyone.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        {sections.map((section) => (
          <Card key={section.title}>
            <CardHeader>
              <CardTitle className="text-xl">{section.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <ul className="list-disc space-y-2 pl-4 text-muted-foreground">
                {section.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
