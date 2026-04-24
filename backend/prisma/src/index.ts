import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import { authRouter } from './routes/auth';
import { schoolsRouter } from './routes/schools';
import { classesRouter } from './routes/classes';
import { assessmentsRouter } from './routes/assessments';
import { bookingsRouter } from './routes/bookings';
import { coachesRouter } from './routes/coaches';
import { placementsRouter } from './routes/placements';
import { nutritionRouter } from './routes/nutrition';
import { aiRouter } from './routes/ai';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/auth', authRouter);
app.use('/schools', schoolsRouter);
app.use('/classes', classesRouter);
app.use('/assessments', assessmentsRouter);
app.use('/bookings', bookingsRouter);
app.use('/coaches', coachesRouter);
app.use('/placements', placementsRouter);
app.use('/nutrition', nutritionRouter);
app.use('/ai', aiRouter);

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Backend running on http://localhost:${port}`));
