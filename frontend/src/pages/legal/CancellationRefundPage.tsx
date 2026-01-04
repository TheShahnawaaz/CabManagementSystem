import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const timelines = [
  {
    label: "Before booking window closes",
    policy:
      "Cancellations made before the booking window ends are eligible for a refund per the trip-specific rules.",
  },
  {
    label: "After booking window closes",
    policy:
      "Cancellations after the window closes may be partially or fully ineligible, depending on cab commitments already made.",
  },
  {
    label: "No-shows on trip day",
    policy:
      "If you do not board during the outbound window, refunds are typically not available because capacity is held for you.",
  },
];

const processing = [
  "Refunds, when approved, are issued to the original payment method where feasible.",
  "Processing times depend on the payment gateway and bank; allow standard settlement timelines.",
  "Gateway or banking fees may be non-refundable where applicable.",
];

const howTo = [
  "Use the Contact Us page or the booking portal (when enabled) to request a cancellation.",
  "Include your registered email, trip date, hall, and payment reference.",
  "Requests are processed in the order received; response times may vary near trip day.",
];

export default function CancellationRefundPage() {
  return (
    <div className="container mx-auto max-w-5xl px-4 py-10 space-y-8">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">Public</Badge>
          <Badge variant="secondary">Policy</Badge>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">
          Cancellation &amp; Refunds
        </h1>
        <p className="text-muted-foreground max-w-3xl">
          Guidance on cancelling a booking and how refunds are handled for
          Friday Cab Allocation trips. Trip-specific terms may refine these
          rules based on operational constraints.
        </p>
      </div>

      <Separator />

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>When you can cancel</CardTitle>
            <CardDescription>Aligned to booking windows and cab commitments.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <ul className="list-disc space-y-2 pl-4">
              {timelines.map((item) => (
                <li key={item.label}>
                  <span className="font-medium text-foreground">{item.label}:</span>{" "}
                  {item.policy}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Refund method & timing</CardTitle>
            <CardDescription>What to expect after approval.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <ul className="list-disc space-y-2 pl-4">
              {processing.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>How to request a cancellation</CardTitle>
          <CardDescription>Give us enough detail to act quickly.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <ul className="list-disc space-y-2 pl-4">
            {howTo.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Alert>
        <AlertTitle>Organizer-initiated changes</AlertTitle>
        <AlertDescription className="text-sm text-muted-foreground">
          If a trip is cancelled or rescheduled by organizers, affected bookings
          will be notified. Applicable refunds will follow the original payment
          channel where feasible.
        </AlertDescription>
      </Alert>
    </div>
  );
}
