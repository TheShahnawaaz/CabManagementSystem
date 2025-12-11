import { useEffect, useState } from 'react';
import Hero from './sections/Hero.jsx';
import BookingStatus from './sections/BookingStatus.jsx';
import AdminPanel from './sections/AdminPanel.jsx';
import DriverPanel from './sections/DriverPanel.jsx';
import { getPublicConfig } from './lib/api.js';

const App = () => {
  const [config, setConfig] = useState(null);
  const [configError, setConfigError] = useState('');

  useEffect(() => {
    getPublicConfig()
      .then(setConfig)
      .catch((error) => setConfigError(error.message));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2 text-primary">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white">CC</div>
          <div>
            <p className="text-sm text-slate-500">Campus Cab System</p>
            <h1 className="text-xl font-semibold">Friday Prayer Logistics</h1>
          </div>
        </div>
        <nav className="hidden gap-4 text-sm font-medium text-slate-600 sm:flex">
          <a href="#booking">Booking</a>
          <a href="#driver">Driver</a>
          <a href="#admin">Admin</a>
        </nav>
      </header>
      <main className="space-y-12 bg-gradient-to-b from-slate-50 to-white pb-16">
        <Hero config={config} error={configError} />
        <BookingStatus />
        <DriverPanel />
        <AdminPanel />
      </main>
    </div>
  );
};

export default App;
