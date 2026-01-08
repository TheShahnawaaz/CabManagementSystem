/**
 * Booking Failed Page
 *
 * Shown when payment fails or verification fails.
 */

import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { XCircle, ArrowLeft, RefreshCcw, HelpCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function BookingFailed() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const reason = searchParams.get("reason") || "unknown";

  const getErrorMessage = () => {
    switch (reason) {
      case "verification_failed":
        return "Payment verification failed. If amount was deducted, please contact support.";
      case "payment_failed":
        return "Payment was not successful. Please try again.";
      case "expired":
        return "The booking session expired. Please start again.";
      default:
        return "Something went wrong with your booking. Please try again.";
    }
  };

  return (
    <div className="container max-w-lg mx-auto px-4 py-12">
      {/* Error Icon & Message */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
          <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Booking Failed</h1>
        <p className="text-muted-foreground">{getErrorMessage()}</p>
      </div>

      {/* Action Card */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">What can you do?</CardTitle>
          <CardDescription>Here are your options</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted">
            <RefreshCcw className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium text-sm">Try Again</p>
              <p className="text-xs text-muted-foreground">
                Go back to trips and try booking again
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted">
            <HelpCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium text-sm">Contact Support</p>
              <p className="text-xs text-muted-foreground">
                If amount was deducted, contact admin for help
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="space-y-3">
        <Button className="w-full" size="lg" onClick={() => navigate("/trips")}>
          <RefreshCcw className="h-4 w-4 mr-2" />
          Try Again
        </Button>

        <Button variant="outline" className="w-full" size="lg" asChild>
          <Link to="/dashboard">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go to Dashboard
          </Link>
        </Button>
      </div>

      {/* Support Note */}
      <p className="text-xs text-center text-muted-foreground mt-6">
        Need help? Contact the admin or check your email for payment
        confirmation.
      </p>
    </div>
  );
}
