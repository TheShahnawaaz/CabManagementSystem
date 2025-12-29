import { QRCodeSVG } from "qrcode.react";
import { format } from "date-fns";
import html2canvas from "html2canvas";
import { X, Download, Ticket, User, MapPin, Car, Clock } from "lucide-react";
import type { Booking } from "@/types/booking.types";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface QRCardModalProps {
  booking: Booking;
  open: boolean;
  onClose: () => void;
}

export function QRCardModal({ booking, open, onClose }: QRCardModalProps) {
  if (!booking.allocation_id) {
    return null;
  }

  // Generate QR code URL
  const qrUrl = `${window.location.origin}/driver-scan?id=${booking.allocation_id}`;

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

  // Download entire boarding pass as PNG
  const handleDownload = async () => {
    const boardingPass = document.getElementById("boarding-pass-content");
    if (!boardingPass) return;

    try {
      // Clone the element to avoid affecting the original
      const clone = boardingPass.cloneNode(true) as HTMLElement;

      // Style the clone for proper rendering
      clone.style.position = "absolute";
      clone.style.left = "-9999px";
      clone.style.top = "0";
      clone.style.width = "600px";
      clone.style.backgroundColor = "#ffffff";
      clone.style.padding = "24px";
      clone.style.display = "block";
      clone.style.overflow = "visible";
      clone.style.color = "#000000"; // Force black text

      // Show the hidden download header
      const downloadHeader = clone.querySelector(
        "#download-header"
      ) as HTMLElement;
      if (downloadHeader) {
        downloadHeader.style.display = "block";
      }

      // Force light mode styles on all child elements
      const allElements = clone.querySelectorAll("*");
      allElements.forEach((el) => {
        const htmlEl = el as HTMLElement;
        // Remove dark mode classes
        htmlEl.classList.remove("dark");

        // Force text colors based on element type
        const tagName = htmlEl.tagName.toLowerCase();
        if (
          tagName === "h2" ||
          tagName === "h3" ||
          htmlEl.classList.contains("font-semibold") ||
          htmlEl.classList.contains("font-bold")
        ) {
          htmlEl.style.color = "#000000";
          htmlEl.style.fontWeight = tagName === "h2" ? "700" : "600";
        } else if (htmlEl.classList.contains("text-muted-foreground")) {
          htmlEl.style.color = "#6b7280";
        } else if (tagName === "span" || tagName === "div" || tagName === "p") {
          if (!htmlEl.style.color || htmlEl.style.color.includes("white")) {
            htmlEl.style.color = "#000000";
          }
        }

        // Fix backgrounds
        if (htmlEl.classList.contains("bg-white")) {
          htmlEl.style.backgroundColor = "#ffffff";
        }
        if (
          htmlEl.classList.contains("dark:bg-gray-100") ||
          htmlEl.classList.contains("dark:bg-gray-950")
        ) {
          htmlEl.style.backgroundColor = "#f3f4f6";
        }
        if (htmlEl.classList.contains("border-gray-200")) {
          htmlEl.style.borderColor = "#e5e7eb";
        }
        // Style separators
        if (
          htmlEl.getAttribute("data-radix-collection-item") !== null ||
          htmlEl.classList.contains("border-t")
        ) {
          htmlEl.style.borderColor = "#e5e7eb";
        }

        // Ensure icons are visible
        if (htmlEl.tagName.toLowerCase() === "svg") {
          // Ticket icon in header should be black, others gray
          const parent = htmlEl.parentElement;
          if (
            parent &&
            (parent.tagName.toLowerCase() === "h2" ||
              parent.classList.contains("text-2xl"))
          ) {
            htmlEl.style.color = "#000000";
          } else {
            htmlEl.style.color = "#6b7280";
          }
        }
      });

      // Append to body temporarily
      document.body.appendChild(clone);

      // Wait a moment for rendering
      await new Promise((resolve) => setTimeout(resolve, 150));

      // Capture the clone
      const canvas = await html2canvas(clone, {
        scale: 2,
        backgroundColor: "#ffffff",
        logging: false,
        useCORS: true,
        allowTaint: true,
      });

      // Remove the clone
      document.body.removeChild(clone);

      // Convert to blob and download
      canvas.toBlob((blob) => {
        if (!blob) return;
        const link = document.createElement("a");
        link.download = `boarding-pass-${booking.trip_title.replace(/\s+/g, "-")}.png`;
        link.href = URL.createObjectURL(blob);
        link.click();
        URL.revokeObjectURL(link.href);
      });
    } catch (error) {
      console.error("Error downloading boarding pass:", error);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-2xl">
            <Ticket className="w-6 h-6 text-primary" />
            Your Boarding Pass
          </SheetTitle>
          <SheetDescription>{booking.trip_title}</SheetDescription>
        </SheetHeader>

        <Separator className="my-4" />

        {/* Boarding Pass Content - This will be captured for download */}
        <div
          id="boarding-pass-content"
          className="space-y-4 p-4 bg-white dark:bg-gray-950"
        >
          {/* Header - For Download Only (hidden in UI) */}
          <div className="hidden space-y-3 pb-4" id="download-header">
            <h2 className="flex items-center gap-2 text-2xl font-bold">
              <Ticket className="w-6 h-6" />
              Your Boarding Pass
            </h2>
            <p className="text-muted-foreground text-sm">
              {booking.trip_title}
            </p>
            <Separator className="my-4" />
          </div>

          {/* QR Code Display */}
          <div className="flex justify-center items-center py-6 bg-white dark:bg-gray-100 rounded-lg border-2 border-gray-200">
            <QRCodeSVG
              id="qr-code-svg"
              value={qrUrl}
              size={250}
              level="H"
              includeMargin={true}
            />
          </div>

          {/* Trip Details */}
          <div className="space-y-3 mt-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Trip Details
            </h3>

            <div className="space-y-2 text-sm">
              {/* Student Name */}
              <div className="flex items-start gap-2">
                <User className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div>
                  <span className="text-muted-foreground">Student: </span>
                  <span className="font-medium">You</span>
                </div>
              </div>

              {/* Hall */}
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div>
                  <span className="text-muted-foreground">Hall: </span>
                  <span className="font-medium">{booking.hall}</span>
                </div>
              </div>

              {/* Cab Number */}
              {booking.cab_number && (
                <div className="flex items-start gap-2">
                  <Car className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div>
                    <span className="text-muted-foreground">Cab Number: </span>
                    <span className="font-medium">{booking.cab_number}</span>
                  </div>
                </div>
              )}

              {/* Pickup Region */}
              {booking.pickup_region && (
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div>
                    <span className="text-muted-foreground">
                      Pickup Region:{" "}
                    </span>
                    <span className="font-medium">{booking.pickup_region}</span>
                  </div>
                </div>
              )}

              {/* Departure Time */}
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div>
                  <span className="text-muted-foreground">Departure: </span>
                  <span className="font-medium">
                    {formatTime(booking.return_time)}
                  </span>
                </div>
              </div>

              {/* Trip Date */}
              <div className="text-xs text-muted-foreground mt-2">
                {formatDate(booking.trip_date)}
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-md border border-blue-200 dark:border-blue-900">
            <p className="text-sm text-blue-900 dark:text-blue-100 flex items-start gap-2">
              <span className="text-lg">ℹ️</span>
              <span>
                Show this QR code to your driver for boarding verification.
              </span>
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-6">
          <Button variant="outline" className="w-full" onClick={handleDownload}>
            <Download className="w-4 h-4 mr-2" />
            Download Boarding Pass
          </Button>
        </div>

        {/* Close Button */}
        <Button variant="ghost" className="w-full mt-2" onClick={onClose}>
          <X className="w-4 h-4 mr-2" />
          Close
        </Button>
      </SheetContent>
    </Sheet>
  );
}
