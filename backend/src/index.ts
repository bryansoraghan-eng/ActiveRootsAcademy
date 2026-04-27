import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/auth';
import schoolRoutes from './routes/schools';
import classRoutes from './routes/classes';
import assessmentRoutes from './routes/assessments';
import bookingRoutes from './routes/bookings';
import coachRoutes from './routes/coaches';
import placementRoutes from './routes/placements';
import nutritionRoutes from './routes/nutrition';
import programmesRoutes from './routes/programmes';
import teacherRoutes from './routes/teachers';
import fmsRoutes from './routes/fms';
import lessonPlanRoutes from './routes/lessonPlans';
import userRoutes from './routes/users';
import adminRoutes from './routes/admin';
import movementBreakSchedulerRoutes from './routes/movementBreakScheduler';
import breakCompletionsRoutes from './routes/breakCompletions';
import coachingClientsRoutes from './routes/coaching/clients';
import coachingTrainingRoutes from './routes/coaching/training';
import coachingNutritionRoutes from './routes/coaching/nutrition';
import coachingCheckinsRoutes from './routes/coaching/checkins';
import coachingProgressRoutes from './routes/coaching/progress';
import coachingGoalsRoutes from './routes/coaching/goals';

dotenv.config();

const app = express();
const prisma = new PrismaClient();

const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? '')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

app.use(cors({
  origin: allowedOrigins.length > 0
    ? (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error(`CORS: origin ${origin} not allowed`));
        }
      }
    : true,
  credentials: true,
}));
app.use(express.json());

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts. Please try again in 15 minutes.' },
});

const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many AI requests. Please wait a moment.' },
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running' });
});

// Routes
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/register-teacher', authLimiter);
app.use('/api/nutrition/generate', aiLimiter);
app.use('/api/lesson-plans/generate', aiLimiter);
app.use('/api/auth', authRoutes);
app.use('/api/schools', schoolRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/coaches', coachRoutes);
app.use('/api/placements', placementRoutes);
app.use('/api/nutrition', nutritionRoutes);
app.use('/api/programmes', programmesRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/fms', fmsRoutes);
app.use('/api/lesson-plans', lessonPlanRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/movement-breaks-scheduler', movementBreakSchedulerRoutes);
app.use('/api/break-completions', breakCompletionsRoutes);
app.use('/api/coaching/clients', coachingClientsRoutes);
app.use('/api/coaching/training', coachingTrainingRoutes);
app.use('/api/coaching/nutrition', coachingNutritionRoutes);
app.use('/api/coaching/checkins', coachingCheckinsRoutes);
app.use('/api/coaching/progress', coachingProgressRoutes);
app.use('/api/coaching/goals', coachingGoalsRoutes);

// Test endpoint
app.get("/", (req, res) => {
  res.json({ message: "Backend is working!" });
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});