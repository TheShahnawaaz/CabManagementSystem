import { parseISO } from 'date-fns';

export const sampleTrip = {
  id: 'friday-prayer',
  hall: 'LBS Hall',
  returnTime: '2024-01-05T13:30:00.000Z',
  closeTime: '2024-01-05T14:00:00.000Z',
};

export const determineScanDirection = (trip, scanTimestamp) => {
  const scanTime = typeof scanTimestamp === 'string' ? parseISO(scanTimestamp) : scanTimestamp;
  const returnTime = parseISO(trip.returnTime);
  const closeTime = parseISO(trip.closeTime);

  if (scanTime > closeTime) {
    return 'no-show';
  }

  return scanTime < returnTime ? 'outbound' : 'return';
};
