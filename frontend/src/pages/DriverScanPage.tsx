import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { format } from "date-fns";
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  User,
  MapPin,
  Car,
  Calendar,
  Clock,
  ArrowUp,
  ArrowDown,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { qrApi } from "@/services/qr.service";
import type {
  QRAllocationData,
  QRValidationSuccess,
  QRValidationError,
} from "@/services/qr.service";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { REGEXP_ONLY_DIGITS } from "input-otp";

type ValidationState =
  | "loading"
  | "display"
  | "validating"
  | "success"
  | "error";

export default function DriverScanPage() {
  const [searchParams] = useSearchParams();
  const allocationId = searchParams.get("id");

  const [state, setState] = useState<ValidationState>("loading");
  const [allocationData, setAllocationData] = useState<QRAllocationData | null>(
    null
  );
  const [passkey, setPasskey] = useState("");
  const [validationResult, setValidationResult] =
    useState<QRValidationSuccess | null>(null);
  const [validationError, setValidationError] =
    useState<QRValidationError | null>(null);

  // Fetch allocation data on mount
  useEffect(() => {
    if (!allocationId) {
      setState("error");
      setValidationError({
        error: "invalid_format",
        message: "No allocation ID provided in URL",
      });
      return;
    }

    fetchAllocationData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allocationId]);

  const fetchAllocationData = async () => {
    if (!allocationId) return;

    try {
      setState("loading");
      const response = await qrApi.getQRData(allocationId);

      if (response.success && response.data) {
        setAllocationData(response.data);
        setState("display");
      } else {
        setState("error");
        setValidationError({
          error: "not_found",
          message: "Invalid QR code or allocation not found",
        });
      }
    } catch (error) {
      console.error("Error fetching QR data:", error);
      setState("error");
      setValidationError({
        error: "server_error",
        message:
          error instanceof Error
            ? error.message
            : "Failed to load allocation data",
      });
    }
  };

  const handlePasskeyComplete = (value: string) => {
    if (value.length === 4) {
      handleValidate(value);
    }
  };

  const handleValidate = async (passkeyValue?: string) => {
    if (!allocationId) return;

    const fullPasskey = passkeyValue || passkey;
    if (fullPasskey.length !== 4) {
      toast.error("Please enter all 4 digits");
      return;
    }

    try {
      setState("validating");
      const response = await qrApi.validateQR({
        allocation_id: allocationId,
        passkey: fullPasskey,
      });

      if (response.success) {
        if (!response.data) {
          throw new Error("Invalid response structure - missing data");
        }

        setValidationResult(response);
        setState("success");
      } else {
        setValidationError({
          error: "server_error",
          message: "Invalid response from server",
        });
        setState("error");
      }
    } catch (error) {
      console.error("Validation error:", error);

      // Parse error response
      const errorData =
        (
          error as {
            data?: {
              error?:
                | "not_found"
                | "invalid_passkey"
                | "wrong_cab"
                | "already_boarded"
                | "payment_pending"
                | "invalid_format"
                | "missing_fields"
                | "server_error";
              details?: {
                assigned_cab?: string;
                assigned_pickup?: string;
                your_cab?: string;
                previous_scan_time?: string;
                attempts_remaining?: number | null;
              };
            };
          }
        )?.data || {};

      setValidationError({
        error: errorData.error || "server_error",
        message: error instanceof Error ? error.message : "Validation failed",
        details: errorData.details,
      });
      setState("error");
    }
  };

  const handleReset = () => {
    setPasskey("");
    setValidationResult(null);
    setValidationError(null);
    setState("display");
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "EEEE, MMMM do, yyyy");
    } catch {
      return dateString;
    }
  };

  const formatTime = (dateString: string) => {
    try {
      return format(new Date(dateString), "h:mm a");
    } catch {
      return dateString;
    }
  };

  // Loading State
  if (state === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <h2 className="text-xl font-semibold">Loading...</h2>
            <p className="text-sm text-muted-foreground text-center">
              Fetching allocation details
            </p>
          </div>
        </Card>
      </div>
    );
  }

  // Success State
  if (state === "success") {
    // Safety check
    if (!validationResult?.data) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-8">
            <div className="flex flex-col items-center gap-4">
              <XCircle className="w-12 h-12 text-red-600" />
              <h2 className="text-xl font-semibold">Error</h2>
              <p className="text-sm text-muted-foreground text-center">
                Invalid state - please try again
              </p>
              <Button onClick={() => window.location.reload()}>Reload</Button>
            </div>
          </Card>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8">
          <div className="flex flex-col items-center gap-6">
            <CheckCircle2 className="w-20 h-20 text-green-600 dark:text-green-400" />

            <div className="text-center">
              <h1 className="text-3xl font-bold text-green-900 dark:text-green-100 mb-2">
                ✅ SUCCESS
              </h1>
              <p className="text-xl font-semibold text-green-800 dark:text-green-200">
                {validationResult.journey_type === "pickup"
                  ? "BOARD THIS CAB"
                  : "RETURN AUTHORIZED"}
              </p>
            </div>

            <Separator />

            <div className="w-full space-y-3 text-center">
              <div>
                <p className="text-2xl font-bold">
                  {validationResult.data.student_name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {validationResult.data.student_hall} Hall
                </p>
              </div>

              <div className="text-sm text-muted-foreground">
                {formatTime(validationResult.data.scan_time)}
              </div>

              <div className="space-y-1 pt-4">
                <p className="text-sm flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span>Cab Match Verified</span>
                </p>
                <p className="text-sm flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span>Payment Confirmed</span>
                </p>
                <p className="text-sm flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span>Boarding Logged</span>
                </p>
              </div>
            </div>

            <Separator />

            <Button
              className="w-full"
              size="lg"
              onClick={() => window.location.reload()}
            >
              🔄 Scan Next Student
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Error State
  if (state === "error") {
    // Safety check
    if (!validationError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-8">
            <div className="flex flex-col items-center gap-4">
              <XCircle className="w-12 h-12 text-red-600" />
              <h2 className="text-xl font-semibold">Error</h2>
              <p className="text-sm text-muted-foreground text-center">
                Something went wrong - please try again
              </p>
              <Button onClick={() => window.location.reload()}>Reload</Button>
            </div>
          </Card>
        </div>
      );
    }

    const isWrongCab = validationError.error === "wrong_cab";
    const isInvalidPasskey = validationError.error === "invalid_passkey";
    const isAlreadyBoarded = validationError.error === "already_boarded";
    const isNotFound = validationError.error === "not_found";

    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8">
          <div className="flex flex-col items-center gap-6">
            {isAlreadyBoarded ? (
              <AlertCircle className="w-20 h-20 text-yellow-600 dark:text-yellow-400" />
            ) : (
              <XCircle className="w-20 h-20 text-red-600 dark:text-red-400" />
            )}

            <div className="text-center">
              <h1 className="text-3xl font-bold text-red-900 dark:text-red-100 mb-2">
                {isWrongCab && "❌ WRONG CAB"}
                {isInvalidPasskey && "❌ INVALID PASSKEY"}
                {isAlreadyBoarded && "⚠️ ALREADY BOARDED"}
                {isNotFound && "❌ INVALID QR CODE"}
                {!isWrongCab &&
                  !isInvalidPasskey &&
                  !isAlreadyBoarded &&
                  !isNotFound &&
                  "❌ ERROR"}
              </h1>
            </div>

            <Separator />

            <div className="w-full space-y-3">
              {/* Wrong Cab Details */}
              {isWrongCab && validationError.details && (
                <>
                  {allocationData && (
                    <div className="text-center">
                      <p className="font-semibold">
                        {allocationData.student_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {allocationData.student_hall} Hall
                      </p>
                    </div>
                  )}

                  <div className="p-4 bg-red-100 dark:bg-red-950/30 rounded-md">
                    <p className="text-sm font-semibold text-red-900 dark:text-red-100 mb-2">
                      ⚠️ This student is assigned to:
                    </p>
                    <div className="space-y-1 text-sm">
                      <p>
                        <span className="text-muted-foreground">
                          Cab Number:{" "}
                        </span>
                        <span className="font-medium">
                          {validationError.details.assigned_cab}
                        </span>
                      </p>
                      <p>
                        <span className="text-muted-foreground">Pickup: </span>
                        <span className="font-medium">
                          {validationError.details.assigned_pickup}
                        </span>
                      </p>
                      <p className="mt-2">
                        <span className="text-muted-foreground">
                          Your Cab:{" "}
                        </span>
                        <span className="font-medium">
                          {validationError.details.your_cab}
                        </span>
                      </p>
                    </div>
                  </div>

                  <p className="text-sm text-center text-muted-foreground">
                    📢 Please direct this student to their assigned cab.
                  </p>
                </>
              )}

              {/* Invalid Passkey */}
              {isInvalidPasskey && (
                <div className="text-center space-y-2">
                  <p className="text-sm">
                    The passkey you entered is incorrect.
                  </p>
                  <p className="text-sm font-semibold">
                    🔐 Please check your passkey and try again.
                  </p>
                </div>
              )}

              {/* Already Boarded */}
              {isAlreadyBoarded && validationError.details && (
                <>
                  {allocationData && (
                    <div className="text-center">
                      <p className="font-semibold">
                        {allocationData.student_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {allocationData.student_hall} Hall
                      </p>
                    </div>
                  )}

                  <div className="p-4 bg-yellow-100 dark:bg-yellow-950/30 rounded-md space-y-1 text-sm">
                    <p>✓ Already scanned for {allocationData?.journey_type}</p>
                    {validationError.details.previous_scan_time && (
                      <p>
                        <span className="text-muted-foreground">
                          Boarded at:{" "}
                        </span>
                        <span className="font-medium">
                          {formatTime(
                            validationError.details.previous_scan_time
                          )}
                        </span>
                      </p>
                    )}
                  </div>

                  <p className="text-sm text-center text-muted-foreground">
                    This student has already boarded.
                  </p>
                </>
              )}

              {/* Not Found */}
              {isNotFound && (
                <div className="text-center space-y-2">
                  <p className="text-sm">
                    This QR code is not valid or has expired.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Possible reasons:
                    <br />• Allocation has been cancelled
                    <br />• Invalid or corrupted QR code
                    <br />• Trip has been deleted
                  </p>
                  <p className="text-sm font-semibold">
                    Please contact the student or admin.
                  </p>
                </div>
              )}

              {/* Generic Error */}
              {!isWrongCab &&
                !isInvalidPasskey &&
                !isAlreadyBoarded &&
                !isNotFound && (
                  <p className="text-sm text-center">
                    {validationError.message}
                  </p>
                )}
            </div>

            <Separator />

            <div className="flex gap-2 w-full">
              {isInvalidPasskey && (
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleReset}
                >
                  ⬅️ Try Again
                </Button>
              )}
              <Button
                variant="default"
                className="flex-1"
                onClick={() => window.location.reload()}
              >
                🔄 Scan Next Student
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Display State (Default - Passkey Input)
  if (!allocationData) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-6">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold mb-1 flex items-center justify-center gap-2">
            <Car className="w-6 h-6 text-primary" />
            Friday Cab - Driver Validation
          </h1>
          <Badge variant="default" className="mt-2">
            ✅ VALID BOOKING
          </Badge>
        </div>

        <Separator className="my-4" />

        {/* Student Details */}
        <div className="space-y-3 mb-6">
          <h3 className="font-semibold flex items-center gap-2">
            <User className="w-4 h-4" />
            Student Details
          </h3>
          <div className="space-y-1 text-sm">
            <p>
              <span className="text-muted-foreground">Name: </span>
              <span className="font-medium">{allocationData.student_name}</span>
            </p>
            <p>
              <span className="text-muted-foreground">Hall: </span>
              <span className="font-medium">{allocationData.student_hall}</span>
            </p>
            <p>
              <span className="text-muted-foreground">Email: </span>
              <span className="font-medium text-xs">
                {allocationData.student_email}
              </span>
            </p>
          </div>
        </div>

        {/* Cab Assignment */}
        <div className="space-y-3 mb-6">
          <h3 className="font-semibold flex items-center gap-2">
            <Car className="w-4 h-4" />
            Cab Assignment
          </h3>
          <div className="space-y-1 text-sm">
            <p>
              <span className="text-muted-foreground">Cab Number: </span>
              <span className="font-medium">{allocationData.cab_number}</span>
            </p>
            <p>
              <span className="text-muted-foreground">Pickup Region: </span>
              <span className="font-medium">
                {allocationData.pickup_region}
              </span>
            </p>
          </div>
        </div>

        {/* Trip Details */}
        <div className="space-y-3 mb-6">
          <h3 className="font-semibold flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Trip Details
          </h3>
          <div className="space-y-1 text-sm">
            <p>
              <span className="text-muted-foreground">Trip: </span>
              <span className="font-medium">{allocationData.trip_title}</span>
            </p>
            <p>
              <span className="text-muted-foreground">Date: </span>
              <span className="font-medium">
                {formatDate(allocationData.trip_date)}
              </span>
            </p>
            <p>
              <span className="text-muted-foreground">Departure: </span>
              <span className="font-medium">
                {formatTime(allocationData.return_time)}
              </span>
            </p>
          </div>
        </div>

        {/* Journey Type */}
        <div className="mb-6 p-3 rounded-md bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900">
          <h3 className="font-semibold flex items-center gap-2 mb-2">
            <MapPin className="w-4 h-4" />
            Journey Type
          </h3>
          <div className="flex items-center gap-2 text-lg font-bold text-blue-900 dark:text-blue-100">
            {allocationData.journey_type === "pickup" ? (
              <>
                <ArrowUp className="w-5 h-5" />
                <span>OUTBOUND (Campus → Mosque)</span>
              </>
            ) : (
              <>
                <ArrowDown className="w-5 h-5" />
                <span>RETURN (Mosque → Campus)</span>
              </>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            <Clock className="w-3 h-3 inline mr-1" />
            Current Time: {formatTime(allocationData.current_time)}
          </p>
        </div>

        <Separator className="my-6" />

        {/* Passkey Input */}
        <div className="space-y-4">
          <h3 className="font-semibold text-center">🔐 Driver Verification</h3>
          <p className="text-sm text-muted-foreground text-center">
            Enter your 4-digit passkey:
          </p>

          <div className="flex justify-center">
            <InputOTP
              maxLength={4}
              value={passkey}
              onChange={setPasskey}
              onComplete={handlePasskeyComplete}
              pattern={REGEXP_ONLY_DIGITS}
              disabled={state === "validating"}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
              </InputOTPGroup>
            </InputOTP>
          </div>

          <Button
            className="w-full"
            size="lg"
            onClick={() => handleValidate()}
            disabled={passkey.length !== 4 || state === "validating"}
          >
            {state === "validating" ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Validating...
              </>
            ) : (
              <>✓ Validate & Board Student</>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
}
