import { useEffect, useState } from 'react';
import Card from '../components/ui/card.jsx';
import Button from '../components/ui/button.jsx';
import { classifyScan, getTrips } from '../lib/api.js';

const DriverPanel = () => {
  const [trips, setTrips] = useState([]);
  const [tripId, setTripId] = useState('');
  const [scanTime, setScanTime] = useState(new Date().toISOString());
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getTrips().then((data) => {
      setTrips(data.trips);
      setTripId(data.trips[0]?.id || '');
    });
  }, []);

  const handleScan = async () => {
    setError('');
    setResult(null);
    try {
      const classification = await classifyScan({ tripId, scanTime });
      setResult(classification);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <section id="driver" className="mx-auto max-w-6xl px-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Card title="Driver validation" description="QR + passkey for outbound and return">
          <p className="text-sm text-slate-700">
            Each driver receives a unique 4-digit passkey for their cab. Scanning a student QR opens a browser page where
            the driver inputs the passkey and the backend validates direction (outbound vs return) using the trip’s scheduled
            return time.
          </p>
          <div className="mt-3 space-y-3 text-sm">
            <label className="block space-y-1">
              <span className="text-slate-600">Trip</span>
              <select
                value={tripId}
                onChange={(e) => setTripId(e.target.value)}
                className="w-full rounded-md border border-slate-200 px-3 py-2"
              >
                {trips.map((trip) => (
                  <option key={trip.id} value={trip.id}>
                    {trip.id} ({trip.hall})
                  </option>
                ))}
              </select>
            </label>
            <label className="block space-y-1">
              <span className="text-slate-600">Scan timestamp (ISO)</span>
              <input
                value={scanTime}
                onChange={(e) => setScanTime(e.target.value)}
                className="w-full rounded-md border border-slate-200 px-3 py-2"
              />
            </label>
            <Button onClick={handleScan}>Classify scan</Button>
          </div>
          {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
          {result && (
            <div className="mt-3 rounded-md bg-slate-50 p-3 text-xs ring-1 ring-slate-200">
              <p>
                <strong>Direction:</strong> {result.direction}
              </p>
              <p>
                <strong>Return time:</strong> {result.returnTime}
              </p>
              <p>
                <strong>Close time:</strong> {result.closeTime}
              </p>
            </div>
          )}
        </Card>
        <Card title="No-show handling" description="Protect seats for students who boarded">
          <p className="text-sm text-slate-700">
            If a QR is not scanned before the trip closes, the student is marked as no-show. The same logic applies for
            return journeys: unscanned return QRs after closure flag a missed trip.
          </p>
        </Card>
      </div>
    </section>
  );
};

export default DriverPanel;
