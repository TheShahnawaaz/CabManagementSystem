import { Router } from 'express';
import { findTrip, createBooking, getHalls, getBooking, getBookingsForUser, listTrips } from '../data/store.js';

const router = Router();

router.get('/halls', (_req, res) => {
  res.json({ halls: getHalls() });
});

router.get('/trips', (_req, res) => {
  res.json({ trips: listTrips() });
});

router.post('/', (req, res) => {
  const { userId, hall, tripId, paymentMethod = 'mock' } = req.body;

  if (!userId || !hall || !tripId) {
    return res.status(400).json({ message: 'userId, hall, and tripId are required' });
  }

  try {
    const trip = findTrip(tripId);

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    const booking = createBooking({ userId, hall, tripId, paymentMethod });
    return res.status(201).json({
      ...booking,
      trip,
      message: 'Booking confirmed, awaiting cab allocation',
    });
  } catch (error) {
    return res.status(422).json({ message: 'Unknown hall selection' });
  }
});

router.get('/:bookingId', (req, res) => {
  const booking = getBooking(req.params.bookingId);

  if (!booking) {
    return res.status(404).json({ message: 'Booking not found' });
  }

  return res.json(booking);
});

router.get('/user/:userId', (req, res) => {
  const userBookings = getBookingsForUser(req.params.userId);
  res.json({ bookings: userBookings });
});

export default router;
