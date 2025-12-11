import { Router } from 'express';
import { sampleTrip, determineScanDirection } from '../data/trips.js';
import { loadConfig } from '../utils/config.js';

const router = Router();
const config = loadConfig();

router.get('/:tripId/rule', (req, res) => {
  if (req.params.tripId !== sampleTrip.id) {
    return res.status(404).json({ message: 'Trip not found' });
  }

  const trip = {
    ...sampleTrip,
    returnTime: config.tripTiming.returnTime || sampleTrip.returnTime,
    closeTime: config.tripTiming.closeTime || sampleTrip.closeTime,
  };

  res.json({
    tripId: trip.id,
    returnTime: trip.returnTime,
    closeTime: trip.closeTime,
    rule: 'Scans before return time are outbound; scans after are return; scans after close are no-show.',
  });
});

router.post('/:tripId/scan', (req, res) => {
  const { scanTime } = req.body;

  if (!scanTime) {
    return res.status(400).json({ message: 'scanTime is required' });
  }

  if (req.params.tripId !== sampleTrip.id) {
    return res.status(404).json({ message: 'Trip not found' });
  }

  const trip = {
    ...sampleTrip,
    returnTime: config.tripTiming.returnTime || sampleTrip.returnTime,
    closeTime: config.tripTiming.closeTime || sampleTrip.closeTime,
  };

  const direction = determineScanDirection(trip, scanTime);

  res.json({
    tripId: trip.id,
    direction,
    scanTime,
    returnTime: trip.returnTime,
    closeTime: trip.closeTime,
  });
});

export default router;
