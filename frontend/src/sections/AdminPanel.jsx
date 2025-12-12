import { useState } from 'react';
import Card from '../components/ui/card.jsx';
import Button from '../components/ui/button.jsx';
import { adminLogin, getAllocations, getDemand, runAllocations } from '../lib/api.js';

const AdminPanel = () => {
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('changeme');
  const [token, setToken] = useState(false);
  const [demand, setDemand] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [status, setStatus] = useState('');

  const handleLogin = async () => {
    setStatus('');
    try {
      await adminLogin({ email, password });
      setToken(true);
      setStatus('Authenticated');
    } catch (err) {
      setStatus(err.message);
    }
  };

  const loadDemand = async () => {
    setStatus('Loading demand...');
    const data = await getDemand();
    setDemand(data.demand);
    setStatus('');
  };

  const allocate = async () => {
    setStatus('Running allocation...');
    const { allocations: nextAllocations } = await runAllocations();
    setAllocations(nextAllocations);
    setStatus('Allocations updated');
  };

  const refreshAllocations = async () => {
    const { allocations: latest } = await getAllocations();
    setAllocations(latest);
  };

  return (
    <section id="admin" className="mx-auto max-w-6xl px-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Card title="Admin controls" description="Demand dashboard, allocations, and fleet">
          <div className="space-y-2 text-sm text-slate-700">
            <p>
              Admins sign in with provisioned credentials, view hall-level demand, and trigger cab allocation. Fleet
              management stores cab numbers, driver contacts, and passkeys generated per cab.
            </p>
            <div className="grid gap-3 md:grid-cols-2">
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border border-slate-200 px-3 py-2"
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md border border-slate-200 px-3 py-2"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={handleLogin}>Admin login</Button>
              <Button variant="outline" onClick={loadDemand} disabled={!token}>
                View demand
              </Button>
              <Button variant="outline" onClick={allocate} disabled={!token}>
                Run allocation model
              </Button>
              <Button variant="ghost" onClick={refreshAllocations} disabled={!token}>
                Refresh allocations
              </Button>
            </div>
            {status && <p className="text-xs text-slate-600">{status}</p>}
          </div>
          {demand.length > 0 && (
            <div className="mt-3 rounded-md bg-slate-50 p-3 text-xs ring-1 ring-slate-200">
              <p className="font-semibold">Demand</p>
              <ul className="mt-2 space-y-1">
                {demand.map((item) => (
                  <li key={item.tripId} className="flex justify-between">
                    <span>
                      {item.hall} ({item.tripId})
                    </span>
                    <span className="font-semibold">{item.confirmedStudents} students</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {allocations.length > 0 && (
            <div className="mt-3 rounded-md bg-emerald-50 p-3 text-xs ring-1 ring-emerald-200">
              <p className="font-semibold text-emerald-700">Allocations</p>
              <ul className="mt-2 space-y-1 text-emerald-800">
                {allocations.map((item) => (
                  <li key={`${item.cabId}-${item.tripId}`} className="flex justify-between">
                    <span>
                      {item.hall} → {item.registration} ({item.driver})
                    </span>
                    <span className="font-semibold">Passkey {item.passkey}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>
        <Card title="Deployment plan" description="Vercel frontend + Azure backend + Supabase">
          <ul className="list-disc space-y-2 pl-5 text-sm text-slate-700">
            <li>Frontend ready for Vercel deployment (Vite + Tailwind + shadcn-inspired UI).</li>
            <li>Backend Express server exposed on port 4000 by default.</li>
            <li>Supabase connection injected via env for auth and data.</li>
          </ul>
        </Card>
      </div>
    </section>
  );
};

export default AdminPanel;
