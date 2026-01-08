/**
 * Checkout Page
 *
 * Dedicated page for trip booking with:
 * - Trip summary
 * - Hall selection
 * - Phone number collection (if missing)
 * - Razorpay payment integration
 */

import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  Calendar,
  Clock,
  IndianRupee,
  MapPin,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  Shield,
  Phone,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

import { useAuth } from "@/hooks";
import { isValidIndianPhone } from "@/lib/utils";
import { tripApi } from "@/services/trip.service";
import { userApi } from "@/services/user.service";
import {
  paymentApi,
  loadRazorpayScript,
  openRazorpayCheckout,
  type CheckoutData,
  type RazorpayResponse,
  type RazorpayError,
} from "@/services/payment.service";
import type { Trip } from "@/types/trip.types";
import { HALLS, type Hall } from "@/types/booking.types";

export default function CheckoutPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, refetchUser } = useAuth();

  // Get trip from router state (passed from trips page) or fetch it
  const tripFromState = location.state?.trip as Trip | undefined;

  const [trip, setTrip] = useState<Trip | null>(tripFromState || null);
  const [loading, setLoading] = useState(!tripFromState);
  const [selectedHall, setSelectedHall] = useState<Hall | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStep, setPaymentStep] = useState<
    "idle" | "initiating" | "paying" | "verifying"
  >("idle");

  // Phone number state (for users without phone)
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const needsPhone = !user?.phone_number;

  // Fetch trip if not passed via state
  useEffect(() => {
    if (!tripFromState && tripId) {
      fetchTrip();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripId, tripFromState]);

  // Load Razorpay script on mount
  useEffect(() => {
    loadRazorpayScript().then((loaded) => {
      if (!loaded) {
        toast.error("Failed to load payment gateway");
      }
    });
  }, []);

  const fetchTrip = async () => {
    try {
      setLoading(true);
      // Fetch active trips and find the one we need
      const response = await tripApi.getActiveTripsForMe();
      if (response.success && response.data) {
        const foundTrip = response.data.find((t) => t.id === tripId);
        if (foundTrip) {
          // Check if already booked
          if (foundTrip.has_booked) {
            toast.info("You have already booked this trip");
            navigate("/bookings");
            return;
          }
          setTrip(foundTrip);
        } else {
          toast.error("Trip not found or booking window is closed");
          navigate("/trips");
        }
      }
    } catch (error) {
      console.error("Error fetching trip:", error);
      toast.error("Failed to load trip details");
      navigate("/trips");
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!trip || !selectedHall) {
      toast.error("Please select a pickup location");
      return;
    }

    // Validate phone number if user needs to provide one
    if (needsPhone) {
      if (!phoneNumber.trim()) {
        setPhoneError("Phone number is required");
        return;
      }
      if (!isValidIndianPhone(phoneNumber)) {
        setPhoneError("Please enter a valid 10-digit mobile number");
        return;
      }
      setPhoneError(null);
    }

    setIsProcessing(true);
    setPaymentStep("initiating");

    try {
      // Step 0: Update profile with phone number if needed
      if (needsPhone && phoneNumber) {
        const cleanedPhone = phoneNumber.replace(/\D/g, "");
        const updateResponse = await userApi.updateProfile({
          phone_number: cleanedPhone,
        });

        if (!updateResponse.success) {
          throw new Error("Failed to save phone number. Please try again.");
        }

        // Refresh user data so phone is available for Razorpay prefill
        await refetchUser();
      }

      // Step 1: Initiate payment (create order)
      const initiateResponse = await paymentApi.initiatePayment(
        trip.id,
        selectedHall
      );

      if (!initiateResponse.success || !initiateResponse.data) {
        throw new Error(initiateResponse.error || "Failed to initiate payment");
      }

      const checkoutData: CheckoutData = initiateResponse.data;
      setPaymentStep("paying");

      // Step 2: Open Razorpay checkout
      openRazorpayCheckout(
        checkoutData,
        // On Success
        async (response: RazorpayResponse) => {
          setPaymentStep("verifying");
          await handlePaymentSuccess(checkoutData.paymentId, response);
        },
        // On Error
        (error: RazorpayError) => {
          console.error("Payment failed:", error);
          toast.error("Payment failed", {
            description: error.description || "Please try again",
          });
          setIsProcessing(false);
          setPaymentStep("idle");
        },
        // On Dismiss
        () => {
          toast.info("Payment cancelled");
          setIsProcessing(false);
          setPaymentStep("idle");
        }
      );
    } catch (error) {
      console.error("Payment initiation error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to initiate payment"
      );
      setIsProcessing(false);
      setPaymentStep("idle");
    }
  };

  const handlePaymentSuccess = async (
    paymentId: string,
    response: RazorpayResponse
  ) => {
    try {
      // Verify payment with backend
      const verifyResponse = await paymentApi.verifyPayment(
        paymentId,
        response.razorpay_order_id,
        response.razorpay_payment_id,
        response.razorpay_signature
      );

      if (verifyResponse.success && verifyResponse.data?.booking_id) {
        toast.success("Booking confirmed!", {
          description: "Your trip has been booked successfully.",
        });
        navigate(`/booking/success/${verifyResponse.data.booking_id}`);
      } else {
        throw new Error(verifyResponse.error || "Payment verification failed");
      }
    } catch (error) {
      console.error("Payment verification error:", error);
      toast.error("Payment verification failed", {
        description: "Please contact support if amount was deducted.",
      });
      navigate("/booking/failed");
    } finally {
      setIsProcessing(false);
      setPaymentStep("idle");
    }
  };

  // Format helpers
  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "EEEE, MMMM do, yyyy");
    } catch {
      return dateStr;
    }
  };

  const formatTime = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "h:mm a");
    } catch {
      return dateStr;
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="container max-w-2xl mx-auto px-4 py-8">
        <Skeleton className="h-8 w-32 mb-6" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-6">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-12 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!trip) {
    return null;
  }

  return (
    <div className="container max-w-2xl mx-auto px-4 py-8">
      {/* Back Button */}
      <Button
        variant="ghost"
        className="mb-6 -ml-2"
        onClick={() => navigate("/trips")}
        disabled={isProcessing}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Trips
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Complete Your Booking</CardTitle>
          <CardDescription>
            Review trip details and select your pickup location
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Trip Summary */}
          <div className="rounded-lg border bg-muted/50 p-4 space-y-3">
            <h3 className="font-semibold text-lg">{trip.trip_title}</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(trip.trip_date)}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>
                  {formatTime(trip.return_time)} - {formatTime(trip.end_time)}
                </span>
              </div>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Amount</span>
              <span className="text-xl font-bold flex items-center">
                <IndianRupee className="h-5 w-5" />
                {trip.amount_per_person}
              </span>
            </div>
          </div>

          {/* Hall Selection */}
          <div className="space-y-3">
            <Label className="text-base font-medium flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Select Pickup Location
            </Label>

            <RadioGroup
              value={selectedHall || ""}
              onValueChange={(value: string) => setSelectedHall(value as Hall)}
              className="grid grid-cols-1 gap-3"
              disabled={isProcessing}
            >
              {HALLS.map((hall) => (
                <div key={hall.value}>
                  <RadioGroupItem
                    value={hall.value}
                    id={hall.value}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={hall.value}
                    className="flex items-center justify-between rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-colors"
                  >
                    <div className="space-y-1">
                      <span className="font-medium">{hall.label}</span>
                      <p className="text-sm text-muted-foreground">
                        {hall.description}
                      </p>
                    </div>
                    {selectedHall === hall.value && (
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    )}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Phone Number Input (if missing) */}
          {needsPhone && (
            <div className="space-y-3">
              <Label
                htmlFor="phone"
                className="text-base font-medium flex items-center gap-2"
              >
                <Phone className="h-4 w-4" />
                Mobile Number
                <span className="text-xs text-muted-foreground font-normal">
                  (required for booking)
                </span>
              </Label>

              <div className="space-y-2">
                <div className="flex gap-2">
                  <div className="flex items-center px-3 border rounded-md bg-muted text-muted-foreground text-sm">
                    +91
                  </div>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter 10-digit mobile number"
                    value={phoneNumber}
                    onChange={(e) => {
                      // Only allow digits, max 10
                      const value = e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 10);
                      setPhoneNumber(value);

                      // Real-time validation: show error when 10 digits entered but invalid
                      if (value.length === 10 && !isValidIndianPhone(value)) {
                        setPhoneError(
                          "Phone number must start with 6, 7, 8, or 9"
                        );
                      } else if (phoneError) {
                        setPhoneError(null);
                      }
                    }}
                    disabled={isProcessing}
                    className={phoneError ? "border-red-500" : ""}
                    maxLength={10}
                  />
                </div>
                {phoneError ? (
                  <p className="text-sm text-red-500">{phoneError}</p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Your phone number will be saved to your profile for future
                    bookings.
                  </p>
                )}
              </div>
            </div>
          )}

          <Separator />

          {/* Security Badge */}
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Shield className="h-4 w-4" />
            <span>Secured by Razorpay</span>
          </div>

          {/* Pay Button */}
          <Button
            size="lg"
            className="w-full"
            onClick={handlePayment}
            disabled={
              !selectedHall ||
              isProcessing ||
              (needsPhone && !isValidIndianPhone(phoneNumber))
            }
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {paymentStep === "initiating" && "Preparing payment..."}
                {paymentStep === "paying" && "Processing payment..."}
                {paymentStep === "verifying" && "Verifying payment..."}
              </>
            ) : (
              <>
                <IndianRupee className="h-4 w-4 mr-1" />
                Pay ₹{trip.amount_per_person}
              </>
            )}
          </Button>

          {/* Terms */}
          <p className="text-xs text-center text-muted-foreground">
            By proceeding, you agree to the booking terms. Cancellation policy
            applies.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
