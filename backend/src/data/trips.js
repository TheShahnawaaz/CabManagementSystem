import { parseISO, isAfter, isBefore } from 'date-fns';

export const determineScanDirection = (trip, scanTimestamp) => {
  const scanTime = typeof scanTimestamp === 'string' ? parseISO(scanTimestamp) : scanTimestamp;
  const returnTime = parseISO(trip.returnTime);
  const closeTime = parseISO(trip.closeTime);

  if (isAfter(scanTime, closeTime)) {
    return 'no-show';
  }

  return isBefore(scanTime, returnTime) ? 'outbound' : 'return';
};
