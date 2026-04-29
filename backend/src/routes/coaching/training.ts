import express from 'express';
import prisma from '../../db';
import { authenticate } from '../../middleware/auth';

const router = express.Router();

// ── Training Plans ────────────────────────────────────────────────────────────

router.get('/plans', authenticate, async (req: any, res) => {
  const { role, id } = req.user;
  try {
    let plans;
    if (role === 'client') {
      const client = await prisma.coachingClient.findUnique({ where: { userId: id } });
      if (!client) return res.status(404).json({ error: 'Client not found' });
      plans = await prisma.trainingPlan.findMany({
        where: { clientId: client.id },
        include: { days: { include: { exercises: { orderBy: { order: 'asc' } } }, orderBy: { order: 'asc' } } },
        orderBy: { createdAt: 'desc' },
      });
    } else if (role === 'online_coach') {
      plans = await prisma.trainingPlan.findMany({
        where: { coachId: id },
        include: { days: { include: { exercises: { orderBy: { order: 'asc' } } }, orderBy: { order: 'asc' } }, client: { include: { user: { select: { name: true } } } } },
        orderBy: { createdAt: 'desc' },
      });
    } else if (role === 'admin') {
      const { clientId } = req.query;
      plans = await prisma.trainingPlan.findMany({
        where: clientId ? { clientId: clientId as string } : {},
        include: { days: { include: { exercises: { orderBy: { order: 'asc' } } }, orderBy: { order: 'asc' } }, client: { include: { user: { select: { name: true } } } } },
        orderBy: { createdAt: 'desc' },
      });
    } else {
      return res.status(403).json({ error: 'Forbidden' });
    }
    res.json(plans);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/plans/:id', authenticate, async (req: any, res) => {
  const { role, id: userId } = req.user;
  if (!['admin', 'online_coach', 'client'].includes(role)) return res.status(403).json({ error: 'Forbidden' });
  try {
    const plan = await prisma.trainingPlan.findUnique({
      where: { id: req.params.id },
      include: { days: { include: { exercises: { orderBy: { order: 'asc' } } }, orderBy: { order: 'asc' } } },
    });
    if (!plan) return res.status(404).json({ error: 'Plan not found' });
    if (role === 'online_coach' && plan.coachId !== userId) return res.status(403).json({ error: 'Forbidden' });
    if (role === 'client') {
      const client = await prisma.coachingClient.findUnique({ where: { userId } });
      if (!client || plan.clientId !== client.id) return res.status(403).json({ error: 'Forbidden' });
    }
    res.json(plan);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/plans', authenticate, async (req: any, res) => {
  const { role, id: coachId } = req.user;
  if (!['admin', 'online_coach'].includes(role)) return res.status(403).json({ error: 'Forbidden' });
  const { clientId, name, startDate, endDate, notes } = req.body;
  if (!clientId || !name) return res.status(400).json({ error: 'clientId and name required' });
  try {
    if (role === 'online_coach') {
      await prisma.trainingPlan.updateMany({ where: { clientId, isActive: true }, data: { isActive: false } });
    }
    const plan = await prisma.trainingPlan.create({
      data: {
        clientId, name, notes,
        coachId: role === 'online_coach' ? coachId : (req.body.coachId || coachId),
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
      },
      include: { days: { include: { exercises: true } } },
    });
    res.status(201).json(plan);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.put('/plans/:id', authenticate, async (req: any, res) => {
  const { role, id: userId } = req.user;
  if (!['admin', 'online_coach'].includes(role)) return res.status(403).json({ error: 'Forbidden' });
  try {
    const existing = await prisma.trainingPlan.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: 'Plan not found' });
    if (role === 'online_coach' && existing.coachId !== userId) return res.status(403).json({ error: 'Forbidden' });
    const { name, startDate, endDate, notes, isActive } = req.body;
    const plan = await prisma.trainingPlan.update({
      where: { id: req.params.id },
      data: { name, notes, isActive, startDate: startDate ? new Date(startDate) : undefined, endDate: endDate ? new Date(endDate) : undefined },
      include: { days: { include: { exercises: { orderBy: { order: 'asc' } } }, orderBy: { order: 'asc' } } },
    });
    res.json(plan);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.delete('/plans/:id', authenticate, async (req: any, res) => {
  const { role, id: userId } = req.user;
  if (!['admin', 'online_coach'].includes(role)) return res.status(403).json({ error: 'Forbidden' });
  try {
    const existing = await prisma.trainingPlan.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: 'Plan not found' });
    if (role === 'online_coach' && existing.coachId !== userId) return res.status(403).json({ error: 'Forbidden' });
    await prisma.trainingPlan.delete({ where: { id: req.params.id } });
    res.json({ message: 'Plan deleted' });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ── Training Days ─────────────────────────────────────────────────────────────

router.post('/plans/:planId/days', authenticate, async (req: any, res) => {
  const { role, id: userId } = req.user;
  if (!['admin', 'online_coach'].includes(role)) return res.status(403).json({ error: 'Forbidden' });
  const { dayOfWeek, name, notes, order } = req.body;
  if (dayOfWeek === undefined || !name) return res.status(400).json({ error: 'dayOfWeek and name required' });
  try {
    const plan = await prisma.trainingPlan.findUnique({ where: { id: req.params.planId } });
    if (!plan) return res.status(404).json({ error: 'Plan not found' });
    if (role === 'online_coach' && plan.coachId !== userId) return res.status(403).json({ error: 'Forbidden' });
    const day = await prisma.trainingDay.create({
      data: { planId: req.params.planId, dayOfWeek: parseInt(dayOfWeek), name, notes, order: order ?? 0 },
      include: { exercises: true },
    });
    res.status(201).json(day);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.put('/days/:id', authenticate, async (req: any, res) => {
  const { role, id: userId } = req.user;
  if (!['admin', 'online_coach'].includes(role)) return res.status(403).json({ error: 'Forbidden' });
  try {
    const day = await prisma.trainingDay.findUnique({ where: { id: req.params.id }, include: { plan: true } });
    if (!day) return res.status(404).json({ error: 'Day not found' });
    if (role === 'online_coach' && day.plan.coachId !== userId) return res.status(403).json({ error: 'Forbidden' });
    const { name, dayOfWeek, notes, order } = req.body;
    const updated = await prisma.trainingDay.update({
      where: { id: req.params.id },
      data: { name, dayOfWeek: dayOfWeek !== undefined ? parseInt(dayOfWeek) : undefined, notes, order },
      include: { exercises: { orderBy: { order: 'asc' } } },
    });
    res.json(updated);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.delete('/days/:id', authenticate, async (req: any, res) => {
  const { role, id: userId } = req.user;
  if (!['admin', 'online_coach'].includes(role)) return res.status(403).json({ error: 'Forbidden' });
  try {
    const day = await prisma.trainingDay.findUnique({ where: { id: req.params.id }, include: { plan: true } });
    if (!day) return res.status(404).json({ error: 'Day not found' });
    if (role === 'online_coach' && day.plan.coachId !== userId) return res.status(403).json({ error: 'Forbidden' });
    await prisma.trainingDay.delete({ where: { id: req.params.id } });
    res.json({ message: 'Day deleted' });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ── Exercises ─────────────────────────────────────────────────────────────────

router.post('/days/:dayId/exercises', authenticate, async (req: any, res) => {
  const { role, id: userId } = req.user;
  if (!['admin', 'online_coach'].includes(role)) return res.status(403).json({ error: 'Forbidden' });
  const { name, sets, reps, weight, rpe, notes, videoUrl, order } = req.body;
  if (!name || !sets || !reps) return res.status(400).json({ error: 'name, sets, reps required' });
  try {
    const day = await prisma.trainingDay.findUnique({ where: { id: req.params.dayId }, include: { plan: true } });
    if (!day) return res.status(404).json({ error: 'Day not found' });
    if (role === 'online_coach' && day.plan.coachId !== userId) return res.status(403).json({ error: 'Forbidden' });
    const exercise = await prisma.exercise.create({
      data: { dayId: req.params.dayId, name, sets: parseInt(sets), reps, weight, rpe: rpe ? parseInt(rpe) : undefined, notes, videoUrl, order: order ?? 0 },
    });
    res.status(201).json(exercise);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.put('/exercises/:id', authenticate, async (req: any, res) => {
  const { role, id: userId } = req.user;
  if (!['admin', 'online_coach'].includes(role)) return res.status(403).json({ error: 'Forbidden' });
  try {
    const ex = await prisma.exercise.findUnique({ where: { id: req.params.id }, include: { day: { include: { plan: true } } } });
    if (!ex) return res.status(404).json({ error: 'Exercise not found' });
    if (role === 'online_coach' && ex.day.plan.coachId !== userId) return res.status(403).json({ error: 'Forbidden' });
    const { name, sets, reps, weight, rpe, notes, videoUrl, order } = req.body;
    const updated = await prisma.exercise.update({
      where: { id: req.params.id },
      data: { name, sets: sets ? parseInt(sets) : undefined, reps, weight, rpe: rpe ? parseInt(rpe) : undefined, notes, videoUrl, order },
    });
    res.json(updated);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.delete('/exercises/:id', authenticate, async (req: any, res) => {
  const { role, id: userId } = req.user;
  if (!['admin', 'online_coach'].includes(role)) return res.status(403).json({ error: 'Forbidden' });
  try {
    const ex = await prisma.exercise.findUnique({ where: { id: req.params.id }, include: { day: { include: { plan: true } } } });
    if (!ex) return res.status(404).json({ error: 'Exercise not found' });
    if (role === 'online_coach' && ex.day.plan.coachId !== userId) return res.status(403).json({ error: 'Forbidden' });
    await prisma.exercise.delete({ where: { id: req.params.id } });
    res.json({ message: 'Exercise deleted' });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ── Session Logs ──────────────────────────────────────────────────────────────

router.get('/sessions', authenticate, async (req: any, res) => {
  const { role, id: userId } = req.user;
  try {
    let sessions;
    if (role === 'client') {
      const client = await prisma.coachingClient.findUnique({ where: { userId } });
      if (!client) return res.status(404).json({ error: 'Client not found' });
      sessions = await prisma.coachingSessionLog.findMany({
        where: { clientId: client.id },
        include: { day: { select: { name: true } }, exerciseLogs: { include: { exercise: { select: { name: true } } } } },
        orderBy: { startedAt: 'desc' },
      });
    } else if (role === 'online_coach') {
      const { clientId } = req.query;
      sessions = await prisma.coachingSessionLog.findMany({
        where: clientId ? { clientId: clientId as string, plan: { coachId: userId } } : { plan: { coachId: userId } },
        include: { day: { select: { name: true } }, client: { include: { user: { select: { name: true } } } }, exerciseLogs: { include: { exercise: { select: { name: true } } } } },
        orderBy: { startedAt: 'desc' },
      });
    } else if (role === 'admin') {
      sessions = await prisma.coachingSessionLog.findMany({
        include: { day: { select: { name: true } }, client: { include: { user: { select: { name: true } } } }, exerciseLogs: { include: { exercise: { select: { name: true } } } } },
        orderBy: { startedAt: 'desc' },
        take: 100,
      });
    } else {
      return res.status(403).json({ error: 'Forbidden' });
    }
    res.json(sessions);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/sessions/start', authenticate, async (req: any, res) => {
  if (req.user.role !== 'client') return res.status(403).json({ error: 'Clients only' });
  const { planId, dayId } = req.body;
  if (!planId || !dayId) return res.status(400).json({ error: 'planId and dayId required' });
  try {
    const client = await prisma.coachingClient.findUnique({ where: { userId: req.user.id } });
    if (!client) return res.status(404).json({ error: 'Client not found' });
    const session = await prisma.coachingSessionLog.create({
      data: { clientId: client.id, planId, dayId, status: 'started' },
      include: { day: { include: { exercises: { orderBy: { order: 'asc' } } } } },
    });
    res.status(201).json(session);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.put('/sessions/:id/complete', authenticate, async (req: any, res) => {
  if (req.user.role !== 'client') return res.status(403).json({ error: 'Clients only' });
  const { notes } = req.body;
  try {
    const client = await prisma.coachingClient.findUnique({ where: { userId: req.user.id } });
    if (!client) return res.status(404).json({ error: 'Client not found' });
    const session = await prisma.coachingSessionLog.findUnique({ where: { id: req.params.id } });
    if (!session || session.clientId !== client.id) return res.status(403).json({ error: 'Forbidden' });
    const updated = await prisma.coachingSessionLog.update({
      where: { id: req.params.id },
      data: { status: 'completed', completedAt: new Date(), notes },
    });
    res.json(updated);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ── Exercise Logs (auto-save during session) ──────────────────────────────────

router.post('/sessions/:sessionId/log', authenticate, async (req: any, res) => {
  if (req.user.role !== 'client') return res.status(403).json({ error: 'Clients only' });
  const { exerciseId, sets, notes } = req.body;
  if (!exerciseId || !sets) return res.status(400).json({ error: 'exerciseId and sets required' });
  try {
    const client = await prisma.coachingClient.findUnique({ where: { userId: req.user.id } });
    if (!client) return res.status(404).json({ error: 'Client not found' });
    const session = await prisma.coachingSessionLog.findUnique({ where: { id: req.params.sessionId } });
    if (!session || session.clientId !== client.id) return res.status(403).json({ error: 'Forbidden' });

    const setsData = typeof sets === 'string' ? sets : JSON.stringify(sets);

    // Upsert the log for this exercise in this session
    const existing = await prisma.coachingExerciseLog.findFirst({ where: { sessionId: req.params.sessionId, exerciseId } });
    let log;
    if (existing) {
      log = await prisma.coachingExerciseLog.update({ where: { id: existing.id }, data: { sets: setsData, notes } });
    } else {
      log = await prisma.coachingExerciseLog.create({
        data: { sessionId: req.params.sessionId, exerciseId, clientId: client.id, sets: setsData, notes },
      });
    }

    // PR detection — find max weight in this log
    const parsedSets: { reps: number; weight: number }[] = JSON.parse(setsData);
    const maxWeight = Math.max(...parsedSets.map(s => s.weight ?? 0));
    const exercise = await prisma.exercise.findUnique({ where: { id: exerciseId } });
    if (exercise && maxWeight > 0) {
      const existingPR = await prisma.coachingPersonalRecord.findFirst({
        where: { clientId: client.id, exerciseName: exercise.name },
        orderBy: { weight: 'desc' },
      });
      if (!existingPR || maxWeight > existingPR.weight) {
        const bestReps = parsedSets.find(s => s.weight === maxWeight)?.reps ?? 1;
        await prisma.coachingPersonalRecord.create({
          data: { clientId: client.id, exerciseName: exercise.name, weight: maxWeight, reps: bestReps },
        });
        return res.json({ log, newPR: true, prWeight: maxWeight });
      }
    }

    res.json({ log, newPR: false });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
