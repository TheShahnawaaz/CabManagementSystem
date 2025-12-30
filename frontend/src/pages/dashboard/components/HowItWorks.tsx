/**
 * How It Works Component
 *
 * Collapsible accordion explaining the booking process
 * Closed by default to save space
 */

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import { HelpCircle } from "lucide-react";

export function HowItWorks() {
  return (
    <Card>
      <Accordion type="single" collapsible>
        <AccordionItem value="how-it-works" className="border-none">
          <AccordionTrigger className="px-6 py-3 hover:no-underline">
            <div className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">How It Works</h2>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6 pt-0">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="step-1">
                <AccordionTrigger>1. Browse & Book Trips</AccordionTrigger>
                <AccordionContent>
                  Browse available Friday prayer trips and book your seat. Pay
                  the fare through the secure payment gateway. Your booking is
                  confirmed once payment is successful.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="step-2">
                <AccordionTrigger>2. Wait for Cab Allocation</AccordionTrigger>
                <AccordionContent>
                  After the booking window closes, the admin will allocate cabs
                  based on your hall. You'll be notified once your cab is
                  assigned. This usually happens 1-2 days before the trip.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="step-3">
                <AccordionTrigger>3. Receive QR Code</AccordionTrigger>
                <AccordionContent>
                  Once your cab is allocated, you'll receive a unique QR code.
                  You can view it anytime from "My Bookings" or download it for
                  offline access. This QR code is your boarding pass.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="step-4">
                <AccordionTrigger>4. Show at Pickup Point</AccordionTrigger>
                <AccordionContent>
                  On the trip day, arrive at your pickup point 10 minutes early.
                  Show your QR code to the driver for scanning. The driver will
                  verify your booking and allow you to board. Safe journey! 🚗
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
}
