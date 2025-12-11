import Card from '../components/ui/card.jsx';
import Button from '../components/ui/button.jsx';

const AdminPanel = () => (
  <section id="admin" className="mx-auto max-w-6xl px-6">
    <div className="grid gap-6 md:grid-cols-2">
      <Card title="Admin controls" description="Demand dashboard, allocations, and fleet">
        <p className="text-sm text-slate-700">
          Admins sign in with provisioned credentials, view hall-level demand, and trigger cab allocation. Fleet management
          stores cab numbers, driver contacts, and passkeys generated per cab.
        </p>
        <div className="mt-3 flex gap-2">
          <Button>Run allocation model</Button>
          <Button variant="outline">View demand</Button>
        </div>
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

export default AdminPanel;
