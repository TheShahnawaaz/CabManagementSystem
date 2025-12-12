# Campus Cab System

Campus Friday Prayer Cab System described in `docs/PRD.md`. The repo now ships a runnable Express API (Supabase-aware) and
a Vite + React frontend with shadcn-inspired UI primitives.

## Project structure

- `backend/` — Express server exposing health checks, booking creation, mock Razorpay payments, admin demand + allocations,
  and QR scan timing rules. Supabase client is initialized via environment variables.
- `frontend/` — Vite + React + Tailwind frontend with shadcn-style components, live booking form, driver scan simulator,
  and admin demand/allocation widgets.
- `docs/` — PRD and supporting design docs.

## Getting started

### Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

The API starts on `http://localhost:4000`. Update the `.env` to point at your Supabase project and set admin credentials.

### Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

The app runs on `http://localhost:5173` and can call the backend using `VITE_API_BASE` (defaults to `http://localhost:4000`).

## Key endpoints

- `GET /health` — basic status.
- `GET /api/bookings/halls` and `/api/bookings/trips` — discover halls and sample trips.
- `POST /api/bookings` — create a confirmed booking (mock payment) and issue a QR token.
- `POST /api/payments/mock` — mock Razorpay payment response (toggle with `MOCK_PAYMENT_MODE`).
- `POST /api/admin/login` — password-only admin sign-in.
- `GET /api/admin/demand` — demand summary derived from created bookings.
- `POST /api/admin/allocations` — simple allocation model that assigns seeded cabs to halls by demand.
- `GET /api/admin/allocations` — view the current allocation set.
- `GET /api/scans/:tripId/rule` — expose scan-direction rules for a trip.
- `POST /api/scans/:tripId/scan` — classify outbound vs return vs no-show using configured return/close times.

## Tech choices

- Backend: Node.js (Express), Supabase client, dotenv, date-fns for scan rules, faker for demo IDs, and morgan for logging.
- Frontend: React 18, Vite, Tailwind, class-variance-authority/tailwind-merge for shadcn-style components.
- Hosting targets: Vercel (frontend) and Azure (backend), with Supabase-managed Postgres/auth.

## Next steps

- Wire Supabase auth (Google for students) and database entities.
- Implement real Razorpay integration and replace mock payment flow.
- Persist bookings/payments/allocations in Supabase and expose QR/passkey validation pages.
