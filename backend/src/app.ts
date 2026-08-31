import express, { Router } from 'express';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import {
  securityHeadersMiddleware,
  sanitizeNoSqlMiddleware,
  rateLimitMiddleware,
  errorHandler,
  notFoundHandler,
} from './middlewares/security.middleware.js';
import { authRouter } from './routes/auth.routes.js';
import { vehiclesRouter } from './routes/vehicle.routes.js';
import { couponsRouter } from './routes/coupon.routes.js';
import { bookingsRouter } from './routes/booking.routes.js';
import { enquiriesRouter } from './routes/enquiries.routes.js';
import { adminRouter } from './routes/admin.routes.js';
import { publicRouter } from './routes/public.routes.js';

const app = express();

// ── 1. Security Headers & Payload Compression ──
app.use(securityHeadersMiddleware);
app.use(compression({ threshold: 1024 }));

// ── 2. Rate Limiting Protection ──
app.use(rateLimitMiddleware(120, 60));

// ── 3. Strict CORS Origin Allow-List ──
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:8000',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:8000',
  'https://cabcastlegoa.com',
  'https://www.cabcastlegoa.com',
  'https://cabcastle.in',
  'https://coastalcabsgoa.com',
  'https://www.coastalcabsgoa.com',
  ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim()) : []),
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        allowedOrigins.includes('*') ||
        process.env.NODE_ENV !== 'production' ||
        origin.includes('ngrok') ||
        origin.includes('loca.lt') ||
        origin.includes('192.168.') ||
        origin.includes('10.') ||
        origin.includes('172.')
      ) {
        return callback(null, true);
      }
      return callback(new Error('Blocked by CORS policy: Origin not allowed'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'ngrok-skip-browser-warning'],
    exposedHeaders: ['Content-Disposition'],
    maxAge: 86400, // Preflight cache 24h
  })
);

// ── 4. Body Parsing & NoSQL Operator Sanitization ──
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(sanitizeNoSqlMiddleware);

// ── 5. Master API Router Wiring ──
const apiRouter = Router();
apiRouter.use(authRouter);
apiRouter.use(vehiclesRouter);
apiRouter.use(couponsRouter);
apiRouter.use(bookingsRouter);
apiRouter.use(enquiriesRouter);
apiRouter.use(adminRouter);
apiRouter.use(publicRouter);

app.use('/api', apiRouter);

// ── 6. Root Health & Meta Endpoint ──
app.get('/', (_req, res) => {
  return res.json({
    status: 'online',
    service: 'Cab Castle Goa API',
    version: '2.0.0',
    health: '/api/healthz',
    timestamp: new Date().toISOString(),
  });
});

// ── 7. Centralized Error & 404 Handlers ──
app.use(notFoundHandler);
app.use(errorHandler);

export { app };
