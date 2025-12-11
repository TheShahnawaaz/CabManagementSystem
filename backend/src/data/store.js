import { faker } from '@faker-js/faker/locale/en';
import { parseISO } from 'date-fns';
import { determineScanDirection } from './trips.js';

export const trips = [
  {
    id: 'trip-lbs-2024-08-09',
    hall: 'LBS Hall',
    departureTime: '2024-08-09T11:45:00.000Z',
    returnTime: '2024-08-09T13:30:00.000Z',
    closeTime: '2024-08-09T14:00:00.000Z',
    fare: 120,
    capacityPerCab: 7,
  },
  {
    id: 'trip-mmm-2024-08-09',
    hall: 'MMM Hall',
    departureTime: '2024-08-09T12:00:00.000Z',
    returnTime: '2024-08-09T13:30:00.000Z',
    closeTime: '2024-08-09T14:00:00.000Z',
    fare: 110,
    capacityPerCab: 7,
  },
  {
    id: 'trip-vs-2024-08-09',
    hall: 'VS Hall',
    departureTime: '2024-08-09T12:15:00.000Z',
    returnTime: '2024-08-09T13:30:00.000Z',
    closeTime: '2024-08-09T14:00:00.000Z',
    fare: 100,
    capacityPerCab: 7,
  },
];

const cabs = [
  { id: 'cab-lbs-1', registration: 'KA-01-1111', seats: 7, hall: 'LBS Hall', driver: 'Ahmed', passkey: '1843' },
  { id: 'cab-lbs-2', registration: 'KA-01-2222', seats: 7, hall: 'LBS Hall', driver: 'Iqbal', passkey: '4920' },
  { id: 'cab-mmm-1', registration: 'KA-02-3333', seats: 7, hall: 'MMM Hall', driver: 'Sameer', passkey: '9031' },
  { id: 'cab-vs-1', registration: 'KA-03-4444', seats: 7, hall: 'VS Hall', driver: 'Rahul', passkey: '6502' },
];

let bookings = [];
let payments = [];
let allocations = [];

export const getHalls = () => Array.from(new Set(trips.map((trip) => trip.hall)));

export const findTrip = (tripId) => trips.find((trip) => trip.id === tripId);

export const createBooking = ({ userId, hall, tripId, paymentMethod }) => {
  const trip = findTrip(tripId);

  if (!trip) {
    throw new Error('Unknown trip');
  }

  if (trip.hall !== hall) {
    throw new Error('Hall does not match trip');
  }

  const booking = {
    id: faker.string.alphanumeric(10).toUpperCase(),
    userId,
    hall,
    tripId,
    paymentMethod,
    status: 'confirmed',
    qr: faker.string.alphanumeric(16).toUpperCase(),
    amount: trip.fare,
    createdAt: new Date().toISOString(),
  };

  bookings.push(booking);
  return booking;
};

export const getBooking = (bookingId) => bookings.find((booking) => booking.id === bookingId);

export const getBookingsForUser = (userId) => bookings.filter((booking) => booking.userId === userId);

export const recordPayment = ({ bookingId, amount, currency }) => {
  const booking = getBooking(bookingId);
  const payment = {
    id: faker.string.alphanumeric(12),
    bookingId,
    amount,
    currency,
    status: 'succeeded',
    provider: 'razorpay-mock',
    createdAt: new Date().toISOString(),
  };

  payments.push(payment);

  if (booking) {
    booking.status = 'paid';
  }

  return payment;
};

export const summarizeDemand = () => {
  const summary = new Map();

  bookings.forEach((booking) => {
    const trip = findTrip(booking.tripId);
    const key = `${trip.hall}-${trip.id}`;
    const current = summary.get(key) || { hall: trip.hall, tripId: trip.id, students: 0 };
    current.students += 1;
    summary.set(key, current);
  });

  return Array.from(summary.values());
};

export const runAllocation = () => {
  const demand = summarizeDemand();
  const newAllocations = [];

  demand.forEach((item) => {
    const trip = findTrip(item.tripId);
    const hallCabs = cabs.filter((cab) => cab.hall === item.hall);

    const neededCabs = Math.ceil(item.students / trip.capacityPerCab) || 1;
    const selected = hallCabs.slice(0, neededCabs);

    selected.forEach((cab) => {
      newAllocations.push({
        cabId: cab.id,
        tripId: trip.id,
        hall: trip.hall,
        driver: cab.driver,
        registration: cab.registration,
        passkey: cab.passkey,
        seats: cab.seats,
      });
    });
  });

  allocations = newAllocations;
  return allocations;
};

export const listAllocations = () => allocations;

export const classifyScan = ({ tripId, scanTime }) => {
  const trip = findTrip(tripId);

  if (!trip) {
    throw new Error('Trip not found');
  }

  const direction = determineScanDirection(trip, scanTime);

  return { tripId: trip.id, direction, scanTime, returnTime: trip.returnTime, closeTime: trip.closeTime };
};

export const hydrateTripsFromEnv = ({ returnTime, closeTime }) => {
  if (!returnTime && !closeTime) return trips;

  return trips.map((trip) => ({
    ...trip,
    returnTime: returnTime || trip.returnTime,
    closeTime: closeTime || trip.closeTime,
  }));
};

export const resetStore = () => {
  bookings = [];
  payments = [];
  allocations = [];
};

export const listPayments = () => payments;

export const listBookings = () => bookings;

export const timelineForTrip = (tripId) => {
  const trip = findTrip(tripId);

  if (!trip) return null;

  return {
    tripId,
    departure: parseISO(trip.departureTime),
    returnTime: parseISO(trip.returnTime),
    closeTime: parseISO(trip.closeTime),
  };
};
