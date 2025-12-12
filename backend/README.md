# Friday Cab Project - Backend API

Backend API for the Friday Cab Allocation System built with Node.js, Express.js, and TypeScript.

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Google OAuth + JWT

## Project Structure

```
backend/
├── src/
│   ├── config/         # Configuration files
│   ├── controllers/    # Route controllers
│   ├── middleware/     # Custom middleware
│   ├── routes/         # API routes
│   ├── utils/          # Utility functions
│   └── index.ts        # Entry point
├── dist/               # Compiled JavaScript (generated)
├── .env                # Environment variables
├── .env.example        # Environment variables template
├── package.json        # Dependencies and scripts
└── tsconfig.json       # TypeScript configuration
```

## Getting Started

### Prerequisites

- Node.js 20.x or higher
- npm or yarn
- Supabase account (for database)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env and add your configuration
```

3. Start the development server:
```bash
npm run dev
```

The server will start on `http://localhost:5000`

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm test` - Run tests

## API Endpoints

### Health Check
- `GET /` - API information
- `GET /health` - Health check

### Authentication (Coming Soon)
- `POST /api/auth/student/google` - Student Google OAuth
- `POST /api/auth/admin/login` - Admin login

### More endpoints to be added...

## Environment Variables

See `.env.example` for required environment variables.

## Documentation

For detailed API documentation, see `/docs/BE.md` in the root directory.

## License

ISC

