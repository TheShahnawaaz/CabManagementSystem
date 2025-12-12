import { useEffect, useMemo, useState } from 'react';
import Card from '../components/ui/card.jsx';
import Button from '../components/ui/button.jsx';
import { createBooking, getHalls, getTrips } from '../lib/api.js';

const BookingStatus = () => {
  const [halls, setHalls] = useState([]);
  const [trips, setTrips] = useState([]);
  const [userId, setUserId] = useState('');
  const [hall, setHall] = useState('');
  const [tripId, setTripId] = useState('');
  const [status, setStatus] = useState('');
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getHalls().then((data) => {
      setHalls(data.halls);
      setHall(data.halls[0]);
    });
    getTrips().then((data) => {
      setTrips(data.trips);
      setTripId(data.trips[0]?.id || '');
    });
  }, []);

  const selectedTrip = useMemo(() => trips.find((t) => t.id === tripId), [trips, tripId]);

  const handleBooking = async (event) => {
    event.preventDefault();
    setLoading(true);
    setStatus('');
    setBooking(null);

    try {
      const response = await createBooking({ userId, hall, tripId, paymentMethod: 'mock' });
      setBooking(response);
      setStatus('Booking confirmed. Mock payment marked as paid.');
    } catch (error) {
      setStatus(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="booking" className="mx-auto max-w-6xl px-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Card
          title="Student booking"
          description="Google sign-in, hall selection, mock Razorpay payment, and QR boarding pass."
        >
          <form className="space-y-3 text-sm" onSubmit={handleBooking}>
            <label className="block space-y-1">
              <span className="text-slate-600">User ID (supabase UID)</span>
              <input
                required
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="w-full rounded-md border border-slate-200 px-3 py-2 focus:border-primary focus:outline-none"
                placeholder="uuid-from-google"
              />
            </label>
            <label className="block space-y-1">
              <span className="text-slate-600">Hall</span>
              <select
                value={hall}
                onChange={(e) => setHall(e.target.value)}
                className="w-full rounded-md border border-slate-200 px-3 py-2"
              >
                {halls.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
            <label className="block space-y-1">
              <span className="text-slate-600">Trip</span>
              <select
                value={tripId}
                onChange={(e) => setTripId(e.target.value)}
                className="w-full rounded-md border border-slate-200 px-3 py-2"
              >
                {trips
                  .filter((trip) => !hall || trip.hall === hall)
                  .map((trip) => (
                    <option key={trip.id} value={trip.id}>
                      {trip.id} — {trip.hall}
                    </option>
                  ))}
              </select>
            </label>
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span>Fare</span>
              <span className="font-semibold text-primary">₹{selectedTrip?.fare ?? '—'}</span>
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Creating booking…' : 'Create booking with mock payment'}
            </Button>
          </form>
          {status && <p className="mt-3 text-xs text-slate-600">{status}</p>}
          {booking && (
            <div className="mt-3 rounded-md bg-slate-50 p-3 text-xs ring-1 ring-slate-200">
              <p>
                <strong>Booking ID:</strong> {booking.id}
              </p>
              <p>
                <strong>Trip:</strong> {booking.trip?.id}
              </p>
              <p>
                <strong>QR:</strong> {booking.qr}
              </p>
            </div>
          )}
        </Card>
        <Card title="Trip timing rules" description="Outbound vs return vs no-show">
          <p className="text-sm text-slate-700">
            The backend exposes `/api/scans/:tripId/rule` for drivers, and `/api/scans/:tripId/scan` to classify any
            timestamp. It relies on the configured return and close times.
          </p>
          <p className="text-sm text-slate-700">
            You can adjust these values in the backend `.env` to mirror actual Friday schedules.
          </p>
          <div className="mt-3 rounded-md bg-slate-50 p-3 text-xs ring-1 ring-slate-200">
            <p><strong>Halls:</strong> {halls.join(', ') || 'Loading…'}</p>
            <p><strong>Trips:</strong> {trips.length}</p>
          </div>
        </Card>
      </div>
    </section>
  );
};

export default BookingStatus;
