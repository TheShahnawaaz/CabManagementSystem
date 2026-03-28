# Friday Cab Management System

A production-oriented web platform for managing **Friday prayer transportation** end to end: trip planning, paid bookings, cab allocation, QR/passkey boarding validation, notifications, and financial reporting.

🌐 **Live Application:** [cab-management-system-ochre.vercel.app](https://cab-management-system-ochre.vercel.app)

---

## Table of Contents

- [Overview](#overview)
- [What problems this solves](#what-problems-this-solves)
- [Core capabilities](#core-capabilities)
- [Architecture](#architecture)
- [Repository structure](#repository-structure)
- [Primary workflows](#primary-workflows)
- [Business rules and scenario handling](#business-rules-and-scenario-handling)
- [Local setup](#local-setup)
- [Environment variables](#environment-variables)
- [API surface (high level)](#api-surface-high-level)
- [Deployment notes](#deployment-notes)
- [Documentation index](#documentation-index)
- [Roadmap](#roadmap)

---

## Overview

This project is a full-stack monorepo with:

- **Frontend:** React + TypeScript + Vite
- **Backend:** Node.js + Express + TypeScript
- **Database:** PostgreSQL (migration-driven)

It supports three operational personas:

- **Students:** discover trips, pay, view booking and QR details
- **Admins:** manage users/trips, run allocation, track journeys, publish reports
- **Drivers:** validate boarding from a mobile browser using QR + passkey

---

## What problems this solves

Campus Friday transport operations are often manual and error-prone. This system provides:

- centralized demand capture
- paid-only booking enforcement
- optimization-assisted cab allocation
- fast boarding validation with audit logs
- post-trip operational + financial visibility

---

## Core capabilities

### 1) Authentication and authorization

- Google OAuth-based user sign-in
- JWT-protected backend APIs
- role-based route access (public/guest/user/admin)

### 2) Trip lifecycle management

- admin CRUD for trips and timing windows
- active/upcoming trip views for users
- per-trip demand and journey analytics

### 3) Booking and payment flow

- checkout flow with hall selection and phone capture when missing
- gateway abstraction (`razorpay` + `mock` adapter)
- idempotent payment verification/webhook handling
- payment status + fee/tax/net tracking

### 4) Allocation engine

- linear programming solver for student-to-cab distribution
- admin review and submission of suggested allocation
- cab metadata + passkey management
- user notifications after allocation

### 5) QR validation and boarding

- public driver scan page (`/driver-scan?id=<allocationId>`)
- passkey validation per trip
- outbound and return journey rule enforcement
- duplicate scan prevention and cab capacity checks
- admin manual board/unboard overrides

### 6) Notifications and email queue

- in-app notifications
- provider-based email sending (`console`, `smtp`, `resend`)
- queued email processing through cron endpoints
- admin announcements and booking reminders

### 7) Reporting module

- trip-wise financial reports
- adjustment tracking (income/expense)
- report edit-history logging
- aggregate summary metrics

---

## Architecture

```text
Frontend (React)
  ├─ Auth + route guards
  ├─ User pages (trips, bookings, profile, checkout)
  ├─ Admin pages (users, trips, allocation, journeys, reports)
  └─ Driver scan page

Backend (Express API)
  ├─ Routes + controllers
  ├─ Middleware (auth, validation, cron/webhook guards)
  ├─ Services (payment, notifications, email queue, reporting)
  ├─ Email templates (React Email)
  └─ Migration runner at startup

PostgreSQL
  ├─ users, trips, payments, trip_users
  ├─ cabs, cab_allocations, journeys
  ├─ notifications, email_queue
  ├─ reports, report_adjustments, report_history
  └─ migrations tracker
```

---

## Repository structure

```text
.
├── backend/
│   ├── migrations/            # SQL migrations (auto-run on backend startup)
│   ├── src/
│   │   ├── config/            # db, passport, email, migrations
│   │   ├── controllers/       # request handlers
│   │   ├── middleware/        # auth, validation, webhook, cron
│   │   ├── routes/            # API route modules
│   │   ├── services/          # payment/notification/report internals
│   │   ├── emails/            # email components + templates
│   │   └── utils/             # solver/JWT/utilities
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── routes/            # route groups and guard metadata
│   │   ├── pages/             # user/admin/driver/legal pages
│   │   ├── services/          # typed API wrappers
│   │   ├── providers/         # Auth + Theme providers
│   │   ├── hooks/             # reusable hooks
│   │   └── components/        # shared and layout UI
│   └── package.json
└── docs/                      # PRD, schema, ER, FE/BE notes
```

---

## Primary workflows

### Student

1. Sign in via Google.
2. Browse active/upcoming trips.
3. Complete payment at checkout.
4. View booking status in **My Bookings**.
5. After allocation, view QR + cab details.
6. Present QR for pickup and return validation.

### Admin

1. Create and schedule trips.
2. Monitor hall-wise demand.
3. Run solver and finalize allocations.
4. Notify allocated users.
5. Track journey boarding/no-show data.
6. Create and maintain trip financial reports.

### Driver

1. Scan student QR.
2. Open driver validation page.
3. Enter 4-digit passkey.
4. Board/deny based on validation result.

---

## Business rules and scenario handling

- booking is confirmed only after successful payment verification
- one user cannot hold duplicate confirmed bookings for the same trip
- pending payments are reused until expiry; expired pending records are failed
- webhook and verify flows are idempotent to prevent duplicate booking side effects
- **pickup** requires assigned-cab match
- **dropoff** accepts any valid trip cab passkey
- duplicate boarding for the same user and journey type is blocked
- cab journey scans are capped by cab capacity
- admin manual boarding/unboarding is available for exception handling

---

## Local setup

## Prerequisites

- Node.js 20+
- npm
- PostgreSQL (or Supabase PostgreSQL)
- Google OAuth credentials
- Razorpay credentials (or use mock gateway)

### 1) Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Notes:

- migrations execute automatically when backend starts
- default backend URL: `http://localhost:3000`

### 2) Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Default frontend URL: `http://localhost:5173`

### 3) Health check

```bash
curl http://localhost:3000/health
```

---

## Environment variables

### Backend (`backend/.env`)

| Area | Variables |
|---|---|
| Core | `PORT`, `NODE_ENV`, `FRONTEND_URL`, `DATABASE_URL` |
| Auth | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL`, `JWT_SECRET`, `SESSION_SECRET` |
| Payment | `PAYMENT_GATEWAY`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET` |
| Email | `EMAIL_PROVIDER`, `SMTP_*` / `RESEND_*`, `EMAIL_FROM`, `EMAIL_REPLY_TO` |
| Cron | `CRON_SECRET` |

> See `backend/.env.example` for a starter template.

### Frontend (`frontend/.env`)

- `VITE_API_BASE_URL` (for example: `http://localhost:3000/api`)

> See `frontend/.env.example`.

---

## API surface (high level)

- **Auth:** `/api/auth/*`
- **Trips:** `/api/trips/*`, `/api/admin/trips/*`
- **Bookings:** `/api/bookings/*`
- **Payments:** `/api/payments/*`
- **Webhooks:** `/api/webhooks/razorpay`
- **Allocation:** `/api/admin/trips/:tripId/allocation*`
- **QR:** `/api/qr/*`
- **Notifications:** `/api/notifications*`, `/api/admin/notifications/*`
- **Reports:** `/api/admin/reports*`
- **Cron/Email processing:** `/api/cron/*`

---

## Deployment notes

- configure production DB and secrets before first startup
- set secure cookie/session settings in production
- register Razorpay webhook endpoint + webhook secret
- schedule email-queue processing against `/api/cron/process-emails` with `CRON_SECRET`

---

## Documentation index

- Product requirements: `docs/PRD.md`
- Backend notes: `docs/BE.md`
- Frontend notes: `docs/FE.md`
- Routing docs: `docs/ROUTING.md`
- DB schema: `docs/DATABASE_SCHEMA.md`
- ER diagram: `docs/ER_DIAGRAM.md`

---

## Roadmap

Recommended next improvements:

- automated tests (unit + integration + e2e)
- OpenAPI/Swagger spec generation
- observability dashboards and alerting
- CI pipeline checks for lint/build/test/migrations

---

## License

ISC
