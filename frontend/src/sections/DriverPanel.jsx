import Card from '../components/ui/card.jsx';
import Button from '../components/ui/button.jsx';

const DriverPanel = () => (
  <section id="driver" className="mx-auto max-w-6xl px-6">
    <div className="grid gap-6 md:grid-cols-2">
      <Card title="Driver validation" description="QR + passkey for outbound and return">
        <p className="text-sm text-slate-700">
          Each driver receives a unique 4-digit passkey for their cab. Scanning a student QR opens a browser page where the
          driver inputs the passkey and the backend validates direction (outbound vs return) using the trip’s scheduled
          return time.
        </p>
        <div className="mt-3 flex gap-2">
          <Button>Open scan page</Button>
          <Button variant="outline">Preview validation flow</Button>
        </div>
      </Card>
      <Card title="No-show handling" description="Protect seats for students who boarded">
        <p className="text-sm text-slate-700">
          If a QR is not scanned before the trip closes, the student is marked as no-show. The same logic applies for return
          journeys: unscanned return QRs after closure flag a missed trip.
        </p>
      </Card>
    </div>
  </section>
);

export default DriverPanel;
