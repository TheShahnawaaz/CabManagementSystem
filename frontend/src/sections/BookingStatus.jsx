import Card from '../components/ui/card.jsx';
import Button from '../components/ui/button.jsx';

const BookingStatus = () => (
  <section id="booking" className="mx-auto max-w-6xl px-6">
    <div className="grid gap-6 md:grid-cols-2">
      <Card
        title="Student booking"
        description="Google sign-in, hall selection, mock Razorpay payment, and QR boarding pass."
      >
        <ol className="space-y-2 text-sm text-slate-700">
          <li>1. Sign in with Google (Supabase OAuth).</li>
          <li>2. Choose your hall; confirm the fixed fare.</li>
          <li>3. Complete mock Razorpay payment during development.</li>
          <li>4. Get a confirmed booking plus a QR boarding pass.</li>
          <li>5. Status shows "Awaiting cab allocation" until admin assigns.</li>
        </ol>
        <Button className="mt-3" variant="outline">View sample QR</Button>
      </Card>
      <Card title="Trip timing rules" description="Outbound vs return vs no-show">
        <p className="text-sm text-slate-700">
          The backend exposes `/api/scans/:tripId/rule` for drivers, and `/api/scans/:tripId/scan` to classify any timestamp.
          It relies on the configured return and close times.
        </p>
        <p className="text-sm text-slate-700">
          You can adjust these values in the backend `.env` to mirror actual Friday schedules.
        </p>
      </Card>
    </div>
  </section>
);

export default BookingStatus;
