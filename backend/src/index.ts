// Load environment variables FIRST (must be at the very top)
import dotenv from 'dotenv';

// In production (Render), env vars are injected by the platform
// In development, load from .env file
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import session from 'express-session';
import morgan from 'morgan';
import passport from './config/passport';
import authRoutes from './routes/auth.routes';
import tripRoutes from './routes/trip.routes';
import bookingRoutes from './routes/booking.routes';
import allocationRoutes from './routes/allocation.routes';
import userRoutes from './routes/user.routes';
import qrRoutes from './routes/qr.routes';
import { runMigrations } from './config/migrations';

const app: Application = express();
const PORT = process.env.PORT || 3000;

// HTTP Request Logger (Morgan)
// Logs all incoming requests with method, URL, status, response time
if (process.env.NODE_ENV === 'development') {
  // Detailed logging in development
  app.use(morgan('dev')); // Format: :method :url :status :response-time ms - :res[content-length]
} else {
  // Concise logging in production
  app.use(morgan('combined')); // Apache combined log format
}

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration (required for Passport OAuth flow)
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-session-secret-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Basic route
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Friday Cab Project API',
    version: '1.0.0',
    status: 'running'
  });
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api', tripRoutes);
app.use('/api', bookingRoutes);
app.use('/api', allocationRoutes);
app.use('/api', userRoutes);
app.use('/api', qrRoutes);

// Start server with migrations
async function startServer() {
  try {
    // Run database migrations first
    await runMigrations();
    
    // Then start the server
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();


export default app;

