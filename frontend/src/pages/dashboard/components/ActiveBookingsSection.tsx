/**
 * Active Bookings Section Component
 *
 * Case 1: User has active bookings
 * Shows all active booking cards with full functionality
 */

import { useState } from "react";
import { BookingCard } from "@/pages/bookings/BookingCard";
import { QRCardModal } from "@/components/QRCardModal";
import { CabDetailsSheet } from "@/components/CabDetailsSheet";
import type { Booking } from "@/types/booking.types";

interface ActiveBookingsSectionProps {
  bookings: Booking[];
}

export function ActiveBookingsSection({
  bookings,
}: ActiveBookingsSectionProps) {
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [cabDetailsOpen, setCabDetailsOpen] = useState(false);

  const handleViewQR = (booking: Booking) => {
    setSelectedBooking(booking);
    setQrModalOpen(true);
  };

  const handleViewCab = (booking: Booking) => {
    setSelectedBooking(booking);
    setCabDetailsOpen(true);
  };

  const handleCloseModals = () => {
    setQrModalOpen(false);
    setCabDetailsOpen(false);
    setSelectedBooking(null);
  };

  return (
    <>
      <div>
        <h2 className="text-2xl font-bold mb-4">Your Active Bookings</h2>
        <p className="text-muted-foreground mb-6">
          View your active bookings and manage your trips
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookings.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              onViewQR={handleViewQR}
              onViewCab={handleViewCab}
            />
          ))}
        </div>
      </div>

      {/* Modals */}
      {selectedBooking && (
        <>
          <QRCardModal
            booking={selectedBooking}
            open={qrModalOpen}
            onClose={handleCloseModals}
          />
          <CabDetailsSheet
            booking={selectedBooking}
            open={cabDetailsOpen}
            onClose={handleCloseModals}
          />
        </>
      )}
    </>
  );
}
