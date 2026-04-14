# Copilot Instructions for FridayCabProject

## Build, Test, and Lint Commands

### Backend (Node.js/Express/TypeScript)
- Install dependencies: `npm install` (in `backend/`)
- Start dev server: `npm run dev`
- Build: `npm run build`
- Start production: `npm start`
- Run tests: `npm test` (no tests currently implemented)
- Trigger cron: `npm run trigger-cron`

### Frontend (React/Vite/TypeScript)
- Install dependencies: `npm install` (in `frontend/`)
- Start dev server: `npm run dev`
- Build: `npm run build`
- Preview build: `npm run preview`
- Lint: `npm run lint`
- Format: `npm run format`
- Check formatting: `npm run format:check`

#### Running a Single Test
- No single test command is currently implemented in backend or frontend scripts.

## High-Level Architecture

- **Backend**: Node.js + Express.js (TypeScript), organized by `src/` (config, controllers, middleware, routes, utils). Uses Supabase (PostgreSQL) for data, Google OAuth + JWT for auth, Razorpay for payments, and supports cron jobs. Environment variables are managed via `.env` (see `.env.example`).
- **Frontend**: React (TypeScript) with Vite, Tailwind CSS, and Radix UI. Uses alias `@/` for `src/`. TypeScript config split for app and node. Linting via ESLint, formatting via Prettier. Theming and custom color system via Tailwind config.

## Key Conventions

- **Backend**
  - Environment variables are required for DB, OAuth, JWT, session, email, and payment (see `.env.example`).
  - Cron endpoints authenticate using the `x-cron-secret` header or `?secret=` query param, checked against `CRON_SECRET`.
  - API endpoints are organized under `/api/`.
  - Use TypeScript throughout, with strict settings in `tsconfig.json`.

- **Frontend**
  - Uses `@/` alias for imports from `src/`.
  - Tailwind CSS is configured for custom color tokens and dark mode via class.
  - ESLint and Prettier are enforced via scripts.
  - TypeScript strict mode is enabled.

- **General**
  - All scripts and commands are run from their respective `backend/` or `frontend/` directories.
  - No monorepo tooling; backend and frontend are managed independently.

---

This file summarizes build/test/lint commands, architecture, and key conventions for Copilot and future contributors. If you want to adjust coverage or add more details, let me know!
