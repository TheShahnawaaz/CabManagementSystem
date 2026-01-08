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
import { Mail, Phone, Clock, MapPin } from "lucide-react";

const contacts = [
  {
    label: "Support Email",
    value: "support@campuscab.example.com",
    icon: Mail,
    helper: "Share your registered email and booking/trip ID for faster help.",
  },
  {
    label: "Support Phone",
    value: "+91-00000-00000",
    icon: Phone,
    helper: "Available during booking windows and trip operations.",
  },
  {
    label: "Hours (example)",
    value: "Mon–Fri, 9:00 AM – 6:00 PM IST",
    icon: Clock,
    helper: "Extended coverage on Fridays during prayer trips.",
  },
  {
    label: "Office/Helpdesk",
    value: "Campus Transport Desk, Main Hall",
    icon: MapPin,
    helper: "Confirm the exact helpdesk location before trip day.",
  },
];

export default function ContactPage() {
  return (
    <div className="container mx-auto max-w-5xl px-4 py-10 space-y-8">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">Public</Badge>
          <Badge variant="secondary">Support</Badge>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">Contact Us</h1>
        <p className="text-muted-foreground max-w-3xl">
          Reach the Friday Cab Allocation team for booking, payment, allocation,
          or QR validation questions. Use your registered email so we can locate
          your account quickly.
        </p>
      </div>

      <Separator />

      <div className="grid gap-4 md:grid-cols-2">
        {contacts.map((contact) => (
          <Card key={contact.label}>
            <CardHeader className="flex flex-row items-start gap-3">
              <div className="mt-1 rounded-full border bg-muted/50 p-2">
                <contact.icon className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-lg">{contact.label}</CardTitle>
                <CardDescription>{contact.value}</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {contact.helper}
            </CardContent>
          </Card>
        ))}
      </div>

      <Alert>
        <AlertTitle>What to include</AlertTitle>
        <AlertDescription className="space-y-1 text-sm text-muted-foreground">
          <p>• Your name and registered email</p>
          <p>• Trip date and hall</p>
          <p>• Booking or payment reference (if available)</p>
          <p>
            • A brief description of the issue (e.g., QR not loading, cab
            mismatch)
          </p>
        </AlertDescription>
      </Alert>
    </div>
  );
}
