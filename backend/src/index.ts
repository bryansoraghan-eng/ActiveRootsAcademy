import express from 'express';
import cors from 'cors';
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
import movementBreakSchedulerRoutes from './routes/movementBreakScheduler';
import breakCompletionsRoutes from './routes/breakCompletions';

dotenv.config();

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running' });
});

// Routes
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
app.use('/api/movement-breaks-scheduler', movementBreakSchedulerRoutes);
app.use('/api/break-completions', breakCompletionsRoutes);

// Test endpoint
app.get("/", (req, res) => {
  res.json({ message: "Backend is working!" });
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});