# Campus Cab System

Early scaffolding for the Campus Friday Prayer Cab System described in `docs/PRD.md`. The repo now includes an Express API
(backed by Supabase) and a Vite + React frontend with shadcn-inspired UI primitives.

## Project structure

- `backend/` — Express server exposing health checks, booking stubs, mock Razorpay payments, admin demand view, and QR scan
  timing rules. Supabase client is initialized via environment variables.
- `frontend/` — Vite + React + Tailwind frontend with lightweight shadcn-style components and landing sections for students,
  drivers, and admins.
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

The app runs on `http://localhost:5173` and can call the backend using `VITE_BACKEND_URL`.

## Key endpoints (development stubs)

- `GET /health` — basic status
- `POST /api/bookings` — create a confirmed booking after mock payment
- `POST /api/payments/mock` — mock Razorpay payment response (toggle with `MOCK_PAYMENT_MODE`)
- `POST /api/admin/login` — password-only admin sign-in
- `GET /api/admin/demand` — example demand summary for halls
- `GET /api/scans/:tripId/rule` — expose scan-direction rules for a trip
- `POST /api/scans/:tripId/scan` — classify outbound vs return vs no-show using configured return/close times

## Tech choices

- Backend: Node.js (Express), Supabase client, dotenv, and morgan for logging
- Frontend: React 18, Vite, Tailwind, class-variance-authority/tailwind-merge for shadcn-style components
- Hosting targets: Vercel (frontend) and Azure (backend), with Supabase-managed Postgres/auth

## Next steps

- Wire Supabase auth (Google for students) and database entities
- Implement real Razorpay integration and replace mock payment flow
- Build allocation model execution and admin fleet management UI
