# Friday Cab Management System

A full-stack web platform to run **weekly Friday prayer transportation** end-to-end: from trip creation and bookings to optimization-based cab allocation, QR/passkey boarding validation, notifications, and post-trip financial reporting.

---

## Why this project exists

Managing Friday prayer transportation manually causes demand uncertainty, over/under-allocation of cabs, boarding confusion, and revenue leakage from unpaid riders. This system solves that with a unified workflow for:

- **Students**: browse active trips, book with payment, track status, view QR/cab details.
- **Admins**: create and manage trips, monitor demand, run allocation, manage users, track journeys, send announcements/reminders, and generate financial reports.
- **Drivers**: validate boarding in browser using student QR + 4-digit passkey.

---

## Core Features

### 1) Authentication & Access Control

- Google OAuth login flow for users.
- JWT-backed authenticated API access.
- Route-level role-based separation in frontend (`public`, `guest`, `user`, `admin`).
- Admin-only controls for operational modules.

### 2) Trip Lifecycle Management

- Admin CRUD for trips with booking/departure/prayer/end timelines.
- Public + authenticated discovery for active and upcoming trips.
- Per-trip demand and journey analytics endpoints.

### 3) Booking + Payment Flow

- Checkout with hall selection and phone capture (if missing).
- Server-verified payment flow (Razorpay adapter + mock adapter support).
- Idempotent verify/webhook handling to prevent duplicate bookings.
- Payment status, fee/tax/net tracking, webhook verification support.

### 4) Allocation Engine

- Linear-programming based solver to allocate students to cabs.
- Hall-to-region mapping for optimization cost model.
- Suggested allocation preview + admin submission.
- Cab metadata management: number, capacity, driver info, passkey.
- Notify allocated users after finalization.

### 5) QR Boarding Validation (Driver + Admin)

- Driver scans student QR and validates via passkey.
- **Outbound rule**: student must board assigned cab.
- **Return rule**: student can board any valid trip cab.
- Duplicate scan prevention per journey type.
- Capacity protection (no over-boarding beyond cab capacity).
- Admin manual board/unboard fallback workflows.

### 6) Notifications + Email Queue

- In-app notification center for users.
- Email queue with provider abstraction (`console`, `smtp`, `resend`).
- Cron processing endpoint for queued emails.
- Admin announcements and booking reminders.
- Template-based email rendering using React Email components.

### 7) Reporting Module

- Per-trip financial report creation and updates.
- Income/expense adjustments.
- Report edit history auditing.
- Aggregated summary and pending-trips-without-report views.

---

## Tech Stack

### Frontend

- React + TypeScript + Vite
- React Router (modular route config + guards)
- Tailwind CSS + shadcn/ui + Radix primitives
- Sonner toasts, Recharts/TanStack Table in management UIs

### Backend

- Node.js + Express + TypeScript
- PostgreSQL (`pg`) with SQL migrations
- Passport Google OAuth
- JWT auth middleware
- Payment gateway abstraction (Razorpay + mock)
- Notification/email queue services

---

## Architecture Overview

```text
frontend (React)
   │
   ├─ Auth + role-guarded routes
   ├─ User flows (trips/bookings/checkout/profile)
   ├─ Admin ops (users/trips/allocation/journeys/reports)
   └─ Driver validation page (/driver-scan)

backend (Express API)
   │
   ├─ Auth, trip, booking, payment, QR, allocation, notification, report routes
   ├─ Service layer (payments, notifications, email queue, templates)
   ├─ LP allocation solver
   └─ Migration runner on startup

postgresql
   ├─ users/admins/trips/payments/trip_users
   ├─ cabs/cab_allocations/journeys
   ├─ notifications/email_queue
   ├─ reports/report_adjustments/report_history
   └─ migrations tracker
```

---

## Repository Structure

```text
.
├── backend/
│   ├── migrations/                 # SQL schema/data evolution
│   ├── src/
│   │   ├── config/                 # db, passport, email providers, migrations
│   │   ├── controllers/            # HTTP handlers
│   │   ├── middleware/             # auth, validation, webhook, cron guards
│   │   ├── routes/                 # API route modules
│   │   ├── services/               # payment, notifications, queue, reporting
│   │   ├── emails/                 # React Email templates/components
│   │   └── utils/                  # solver, JWT helpers
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── routes/                 # route groups by access level
│   │   ├── pages/                  # user/admin/driver/legal pages
│   │   ├── services/               # API client wrappers
│   │   ├── providers/              # Auth/Theme providers
│   │   ├── hooks/                  # custom hooks
│   │   └── components/             # layout + shared UI
│   └── package.json
└── docs/                           # PRD, schema docs, ER and routing notes
```

---

## Main User Journeys

### Student Journey

1. Login via Google.
2. View active/upcoming trips.
3. Select trip and pickup hall, pay via gateway.
4. Booking appears under **My Bookings**.
5. After allocation, view QR + cab details.
6. Show QR to driver for pickup/return validation.

### Admin Journey

1. Create trip with booking and travel timings.
2. Monitor hall-wise demand.
3. Run allocation solver, review and submit final mapping.
4. Notify allocated users.
5. Monitor journey scan analytics + no-shows.
6. Create financial report and adjustments after trip completion.

### Driver Journey

1. Scan student QR.
2. Open `/driver-scan?id=<allocationId>`.
3. Enter 4-digit passkey.
4. Receive immediate board/deny response.

---

## Important Business Rules (How scenarios are handled)

- Booking is valid only after confirmed payment.
- A user cannot create duplicate confirmed bookings for the same trip.
- Existing pending payments are reused until expiry; expired ones are failed.
- Webhook + verify flows are idempotent and safe against duplicate processing.
- Outbound boarding requires assigned cab match.
- Return boarding accepts any valid cab passkey for the trip.
- A student can only be scanned once per journey type (pickup/dropoff).
- Cab scan count cannot exceed cab capacity.
- Admin can manually board/unboard students to handle operational exceptions.

---

## Local Development Setup

## Prerequisites

- Node.js 20+
- npm
- PostgreSQL (or Supabase Postgres)
- Google OAuth credentials
- Razorpay credentials (or mock payment adapter)

### 1) Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Update `.env` with database, OAuth, JWT/session, payment, and email credentials.

Run backend:

```bash
npm run dev
```

> Migrations run automatically on startup.

### 2) Frontend setup

```bash
cd frontend
npm install
cp .env.example .env
```

Set API base URL (default `http://localhost:3000/api`) and run:

```bash
npm run dev
```

### 3) Access

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000`
- Health check: `GET /health`

---

## Environment Variables

### Backend (`backend/.env`)

- `PORT`, `NODE_ENV`, `FRONTEND_URL`
- `DATABASE_URL`
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL`
- `JWT_SECRET`, `SESSION_SECRET`
- `PAYMENT_GATEWAY` (`razorpay` or `mock`)
- `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`
- `EMAIL_PROVIDER` (`console`, `smtp`, `resend`) and provider-specific credentials
- `CRON_SECRET`

### Frontend (`frontend/.env`)

- `VITE_API_BASE_URL`

---

## API Surface (high-level)

- Auth: `/api/auth/*`
- Trips: `/api/trips/*`, `/api/admin/trips/*`
- Bookings: `/api/bookings/*`
- Payments: `/api/payments/*`, webhooks at `/api/webhooks/razorpay`
- Allocation: `/api/admin/trips/:tripId/allocation*`
- QR: `/api/qr/*`
- Notifications: `/api/notifications*`, `/api/admin/notifications/*`
- Reports: `/api/admin/reports*`
- Cron/email ops: `/api/cron/*`

For detailed contract references, see `docs/` and route/controller modules.

---

## Deployment Notes

- Backend supports environments like Render/Vercel-compatible Node hosting.
- Ensure HTTPS and secure cookie/session settings in production.
- Configure webhook endpoint and secret in Razorpay dashboard.
- Configure periodic cron call to `/api/cron/process-emails` with `CRON_SECRET` header.

---

## Documentation Index

- Product requirements: `docs/PRD.md`
- Backend notes: `docs/BE.md`
- Frontend notes: `docs/FE.md`
- Routing docs: `docs/ROUTING.md`
- DB schema docs: `docs/DATABASE_SCHEMA.md`, `docs/ER_DIAGRAM.md`

---

## Current Maturity

The project already contains production-style modules for booking, payment verification, allocation, journey validation, notifications, and reporting. The best next improvements would be:

- automated test coverage (unit/integration/e2e)
- stronger API docs generation (OpenAPI/Swagger)
- observability dashboards and alerting
- CI checks for lint/build/test/migration validation

---

## License

ISC (as configured in package metadata).
