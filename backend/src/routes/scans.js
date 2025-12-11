import { Router } from 'express';
import { loadConfig } from '../utils/config.js';
import { hydrateTripsFromEnv, classifyScan, findTrip } from '../data/store.js';

const router = Router();
const config = loadConfig();

router.get('/:tripId/rule', (req, res) => {
  const trips = hydrateTripsFromEnv(config.tripTiming);
  const trip = trips.find((item) => item.id === req.params.tripId);

  if (!trip) {
    return res.status(404).json({ message: 'Trip not found' });
  }

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

  const trip = findTrip(req.params.tripId);

  if (!trip) {
    return res.status(404).json({ message: 'Trip not found' });
  }

  const scan = classifyScan({ tripId: trip.id, scanTime });

  res.json(scan);
});

export default router;
