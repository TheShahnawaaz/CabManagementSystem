import PropTypes from 'prop-types';
import Button from '../components/ui/button.jsx';
import Card from '../components/ui/card.jsx';

const Hero = ({ config, error }) => (
  <section className="mx-auto mt-4 grid max-w-6xl grid-cols-1 gap-6 px-6 md:grid-cols-2">
    <div className="space-y-4">
      <p className="text-sm font-semibold text-accent">Supabase + Express + Vercel/Azure</p>
      <h2 className="text-3xl font-bold text-primary sm:text-4xl">
        Smooth Friday prayer cab bookings with QR validation and passkeys.
      </h2>
      <p className="text-slate-600">
        Students sign in with Google, pay securely, receive a QR boarding pass, and drivers validate with cab-specific
        passkeys. Admins control allocations and fleet from a single dashboard.
      </p>
      <div className="flex flex-wrap gap-3">
        <Button size="lg">Student sign-in with Google</Button>
        <Button variant="outline" size="lg">Admin login</Button>
      </div>
      <div className="flex flex-wrap gap-3 text-xs text-slate-600">
        <span className="rounded-full bg-slate-100 px-3 py-1">Mock Razorpay ready</span>
        <span className="rounded-full bg-slate-100 px-3 py-1">QR + passkey validation</span>
        <span className="rounded-full bg-slate-100 px-3 py-1">Supabase sessions</span>
      </div>
      <div className="rounded-lg bg-white p-4 text-sm shadow-sm ring-1 ring-slate-200">
        {error ? (
          <p className="text-red-600">Config error: {error}</p>
        ) : (
          <ul className="space-y-1 text-slate-700">
            <li><strong>Supabase URL:</strong> {config?.supabaseUrl || 'not set'}</li>
            <li><strong>Google Client ID:</strong> {config?.googleClientId || 'not set'}</li>
            <li><strong>Mock payments:</strong> {config?.mockPayment ? 'enabled' : 'disabled'}</li>
          </ul>
        )}
      </div>
    </div>
    <div className="grid gap-4 md:grid-cols-2">
      <Card title="Outbound vs Return" description="Auto-classified using scheduled return time">
        <p><strong>Outbound:</strong> QR scanned before return time.</p>
        <p><strong>Return:</strong> QR scanned after return time.</p>
        <p><strong>No-show:</strong> Not scanned before trip closure.</p>
      </Card>
      <Card title="Fleet snapshot" description="Demo data for quick testing">
        <ul className="list-disc pl-5 text-sm">
          <li>Halls: LBS, MMM, VS</li>
          <li>Cab seats: 7 per cab</li>
          <li>Admin demand view ready</li>
        </ul>
      </Card>
    </div>
  </section>
);

Hero.propTypes = {
  config: PropTypes.object,
  error: PropTypes.string,
};

Hero.defaultProps = {
  config: null,
  error: '',
};

export default Hero;
