import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { generalLimiter, authLimiter } from './shared/middleware/ratelimit.middleware.js';
import authRoutes from './features/auth/auth.routes.js';
import listingsRouter from './features/listings/listings.routes.js';
import requestRouter from './features/requests/request.routes.js';
import staffRouter from './features/staff/staff.routes.js';
import mediaRouter from './features/media/media.routes.js';
import inernalOffers from './features/internalOffers/internalOffers.routes.js';
import settings from './features/setting/settings.routes.js';
import { startCronJobs } from './shared/cron/jobs.js';
import { errorMiddleware } from './shared/middleware/Error.middleware.js';
import contactRouter from './features/contact/contact.routes.js';
import locationsRouter from './features/locations/locations.routes.js'
import dashboardRouter from './features/dashboard/dashboard.routes.js'
import { prisma } from "./shared/config/prisma.js";




const app = express();


app.set('trust proxy', 1);
// Security headers
app.use(helmet());

// CORS
app.use(cors());

// Parse JSON body
app.use(express.json());

// Rate limiting
app.use('/api', generalLimiter);
app.use('/api/auth/login', authLimiter);


// Routes
app.use('/api/auth', authRoutes);
app.use('/api/listings', listingsRouter);
app.use('/api/requests', requestRouter);
app.use('/api/staff', staffRouter);
app.use('/api/media', mediaRouter);
app.use('/api/internalOffers', inernalOffers);
app.use('/api/settings', settings);
app.use('/api/contact', contactRouter);
app.use('/api/locations', locationsRouter)
app.use('/api/dashboard', dashboardRouter)
app.get('/robots.txt', (_req, res) => {
  res.type('text/plain').send('User-agent: *\nDisallow: /\n');
});

//health
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});
app.get("/health/db", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.status(200).json({
      status: "ok",
      database: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch {
    res.status(503).json({
      status: "error",
      database: "disconnected",
      timestamp: new Date().toISOString(),
    });
  }
});

// Start cron jobs
startCronJobs();

// Error handler — must be last
app.use(errorMiddleware);

export default app;