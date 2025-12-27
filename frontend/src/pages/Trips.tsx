import { useState, useEffect } from 'react';
import { Calendar, Clock, IndianRupee, Users, MapPin, Check } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { tripApi } from '@/services/trip.service';
import { bookingApi } from '@/services/booking.service';
import type { Trip } from '@/types/trip.types';
import type { Hall } from '@/types/booking.types';
import { HALLS } from '@/types/booking.types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function TripsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [selectedHall, setSelectedHall] = useState<Hall>('RK');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchActiveTrips();
  }, []);

  const fetchActiveTrips = async () => {
    try {
      setLoading(true);
      const response = await tripApi.getActiveTrips();
      if (response.success && response.data) {
        setTrips(response.data);
      }
    } catch (error) {
      console.error('Error fetching trips:', error);
      toast.error('Failed to load trips');
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy • HH:mm');
    } catch {
      return dateString;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'EEEE, MMMM do, yyyy');
    } catch {
      return dateString;
    }
  };

  const getBookingStatus = (bookingEndTime: string) => {
    const now = new Date();
    const end = new Date(bookingEndTime);
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) {
      return { text: 'Booking closed', color: 'bg-gray-500' };
    }
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
      return { text: `${days} day${days > 1 ? 's' : ''} left`, color: 'bg-green-500' };
    }
    if (hours > 0) {
      return { text: `${hours} hour${hours > 1 ? 's' : ''} left`, color: 'bg-yellow-500' };
    }
    return { text: 'Closing soon', color: 'bg-orange-500' };
  };

  const canBook = (bookingEndTime: string) => {
    const now = new Date();
    const end = new Date(bookingEndTime);
    return now < end;
  };

  const handleBookNowClick = (trip: Trip) => {
    setSelectedTrip(trip);
    setSelectedHall('RK'); // Default hall
    setIsBookingModalOpen(true);
  };

  const handleConfirmBooking = async () => {
    if (!selectedTrip) return;

    try {
      setSubmitting(true);
      const response = await bookingApi.createBooking({
        trip_id: selectedTrip.id,
        hall: selectedHall,
      });

      if (response.success) {
        toast.success('Booking confirmed!', {
          description: `You have successfully booked ${selectedTrip.trip_title}. Check "My Bookings" for details.`,
          duration: 5000,
        });
        setIsBookingModalOpen(false);
        setSelectedTrip(null);
        // Optionally refresh trips to update booking count
        fetchActiveTrips();
      }
    } catch (error: unknown) {
      console.error('Booking failed:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Handle specific errors
      if (errorMessage.includes('already booked')) {
        toast.error('Already Booked', {
          description: 'You have already booked this trip.',
          duration: 5000,
        });
      } else if (errorMessage.includes('booking window is closed')) {
        toast.error('Booking Closed', {
          description: 'The booking window for this trip has closed.',
          duration: 5000,
        });
      } else {
        toast.error('Booking Failed', {
          description: errorMessage || 'Failed to create booking. Please try again.',
          duration: 5000,
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelBooking = () => {
    setIsBookingModalOpen(false);
    setSelectedTrip(null);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-6 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="p-6">
              <Skeleton className="h-6 w-32 mb-4" />
              <Skeleton className="h-8 w-48 mb-4" />
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
              <Skeleton className="h-10 w-full mt-6" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Active Trips</h1>
        <p className="text-muted-foreground">
          View active trips and book your seat for upcoming Friday prayer journeys
        </p>
      </div>

      {/* Trips Grid */}
      {trips.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Active Trips</h3>
            <p className="text-muted-foreground mb-4">
              There are currently no trips available for booking. Please check back later.
            </p>
            <p className="text-sm text-muted-foreground">
              Booking windows open a few days before the trip date.
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((trip) => {
            const bookingStatus = getBookingStatus(trip.booking_end_time);
            const isBookable = canBook(trip.booking_end_time);
            
            return (
            <Card key={trip.id} className="p-6 hover:shadow-lg transition-shadow">
              {/* Trip Badge */}
              <div className="flex items-center justify-between mb-4">
                <Badge className={bookingStatus.color}>
                  {bookingStatus.text}
                </Badge>
                <Badge variant="outline">
                  {trip.booking_count || 0} booked
                </Badge>
              </div>

              {/* Trip Title */}
              <h3 className="text-xl font-bold mb-2">{trip.trip_title}</h3>

              {/* Trip Date */}
              <div className="flex items-start gap-2 mb-3 text-sm">
                <Calendar className="w-4 h-4 mt-0.5 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {formatDate(trip.trip_date)}
                </span>
              </div>

              {/* Booking Window */}
              <div className="flex items-start gap-2 mb-3 text-sm">
                <Clock className="w-4 h-4 mt-0.5 text-muted-foreground" />
                <div className="text-muted-foreground">
                  {isBookable ? (
                    <div>Book until: {formatDateTime(trip.booking_end_time)}</div>
                  ) : (
                    <div className="text-orange-600 dark:text-orange-400 font-medium">
                      Booking closed
                    </div>
                  )}
                </div>
              </div>

              {/* Return Time */}
              <div className="flex items-start gap-2 mb-3 text-sm">
                <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground" />
                <div className="text-muted-foreground">
                  <div>Departs: {formatDateTime(trip.return_time)}</div>
                </div>
              </div>

              {/* Amount */}
              <div className="flex items-center gap-2 mb-6">
                <IndianRupee className="w-5 h-5 text-primary" />
                <span className="text-2xl font-bold">₹{trip.amount_per_person}</span>
                <span className="text-sm text-muted-foreground">per person</span>
              </div>

              {/* Book Button */}
              <Button 
                className="w-full" 
                size="lg"
                disabled={!isBookable}
                onClick={() => handleBookNowClick(trip)}
              >
                <Users className="w-4 h-4 mr-2" />
                {isBookable ? 'Book Now' : 'Booking Closed'}
              </Button>
            </Card>
          )})}
        </div>
      )}

      {/* Booking Confirmation Modal */}
      <Dialog open={isBookingModalOpen} onOpenChange={setIsBookingModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Booking</DialogTitle>
            <DialogDescription>
              Complete your booking for {selectedTrip?.trip_title}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Trip Details */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Trip Date:</span>
                <span className="font-medium">
                  {selectedTrip && formatDate(selectedTrip.trip_date)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Departure:</span>
                <span className="font-medium">
                  {selectedTrip && formatDateTime(selectedTrip.return_time)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Amount:</span>
                <span className="font-medium text-lg">
                  ₹{selectedTrip?.amount_per_person}
                </span>
              </div>
            </div>

            {/* Hall Selection */}
            <div className="space-y-2">
              <Label htmlFor="hall">Select Your Hostel Hall *</Label>
              <Select value={selectedHall} onValueChange={(value) => setSelectedHall(value as Hall)}>
                <SelectTrigger id="hall">
                  <SelectValue placeholder="Select your hall" />
                </SelectTrigger>
                <SelectContent>
                  {HALLS.map((hall) => (
                    <SelectItem key={hall.value} value={hall.value}>
                      <div className="flex flex-col">
                        <span className="font-medium">{hall.label}</span>
                        <span className="text-xs text-muted-foreground">
                          {hall.description}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Terms */}
            <div className="rounded-md bg-muted p-3 text-sm">
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 mt-0.5 text-green-600" />
                <div className="space-y-1">
                  <p className="font-medium">Booking Confirmation</p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Payment will be processed instantly (mock mode)</li>
                    <li>• You will receive cab details after allocation</li>
                    <li>• Cancellation allowed before trip starts</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={handleCancelBooking}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmBooking}
              disabled={submitting}
            >
              {submitting ? 'Processing...' : `Confirm Booking (₹${selectedTrip?.amount_per_person})`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Info Banner */}
      {trips.length > 0 && (
        <Card className="mt-8 p-6 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-1">How to Book</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Select a trip and click "Book Now"</li>
                <li>• Choose your hostel hall</li>
                <li>• Complete the payment</li>
                <li>• Receive your QR code after cab allocation</li>
              </ul>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
