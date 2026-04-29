import express from 'express';
import prisma from '../../db';
import { authenticate } from '../../middleware/auth';

const router = express.Router();

// ── Nutrition Targets (coach sets these) ──────────────────────────────────────

router.get('/targets/:clientId', authenticate, async (req: any, res) => {
  const { role, id: userId } = req.user;
  if (!['admin', 'online_coach'].includes(role)) return res.status(403).json({ error: 'Forbidden' });
  try {
    const targets = await prisma.coachingNutritionTarget.findMany({
      where: { clientId: req.params.clientId },
      orderBy: { effectiveFrom: 'desc' },
    });
    res.json(targets);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/targets/me/current', authenticate, async (req: any, res) => {
  const { role, id: userId } = req.user;
  const previewId = req.query.clientId as string | undefined;
  if (role !== 'client' && !(role === 'admin' && previewId)) return res.status(403).json({ error: 'Clients only' });
  try {
    const client = role === 'admin' && previewId
      ? await prisma.coachingClient.findUnique({ where: { id: previewId } })
      : await prisma.coachingClient.findUnique({ where: { userId } });
    if (!client) return res.status(404).json({ error: 'Client not found' });
    const target = await prisma.coachingNutritionTarget.findFirst({
      where: { clientId: client.id },
      orderBy: { effectiveFrom: 'desc' },
    });
    res.json(target ?? null);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/targets', authenticate, async (req: any, res) => {
  const { role, id: coachId } = req.user;
  if (!['admin', 'online_coach'].includes(role)) return res.status(403).json({ error: 'Forbidden' });
  const { clientId, calories, protein, carbs, fats, water, notes } = req.body;
  if (!clientId || !calories || !protein || !carbs || !fats) {
    return res.status(400).json({ error: 'clientId, calories, protein, carbs, fats required' });
  }
  try {
    const target = await prisma.coachingNutritionTarget.create({
      data: {
        clientId, calories: parseInt(calories), protein: parseInt(protein),
        carbs: parseInt(carbs), fats: parseInt(fats),
        water: water ? parseFloat(water) : 2.5,
        notes,
        coachId: role === 'online_coach' ? coachId : (req.body.coachId || coachId),
      },
    });
    res.status(201).json(target);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ── Nutrition Logs (client logs daily intake) ─────────────────────────────────

router.get('/logs', authenticate, async (req: any, res) => {
  const { role, id: userId } = req.user;
  try {
    let logs;
    if (role === 'client') {
      const client = await prisma.coachingClient.findUnique({ where: { userId } });
      if (!client) return res.status(404).json({ error: 'Client not found' });
      logs = await prisma.coachingNutritionLog.findMany({
        where: { clientId: client.id },
        orderBy: { date: 'desc' },
        take: 90,
      });
    } else if (role === 'online_coach') {
      const { clientId } = req.query;
      if (!clientId) return res.status(400).json({ error: 'clientId required' });
      logs = await prisma.coachingNutritionLog.findMany({
        where: { clientId: clientId as string },
        orderBy: { date: 'desc' },
        take: 90,
      });
    } else if (role === 'admin') {
      const { clientId } = req.query;
      logs = await prisma.coachingNutritionLog.findMany({
        where: clientId ? { clientId: clientId as string } : {},
        orderBy: { date: 'desc' },
        take: 90,
      });
    } else {
      return res.status(403).json({ error: 'Forbidden' });
    }
    res.json(logs);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/logs', authenticate, async (req: any, res) => {
  if (req.user.role !== 'client') return res.status(403).json({ error: 'Clients only' });
  const { date, calories, protein, carbs, fats, water, notes } = req.body;
  if (!date) return res.status(400).json({ error: 'date required' });
  try {
    const client = await prisma.coachingClient.findUnique({ where: { userId: req.user.id } });
    if (!client) return res.status(404).json({ error: 'Client not found' });
    const log = await prisma.coachingNutritionLog.upsert({
      where: { clientId_date: { clientId: client.id, date } },
      update: {
        calories: calories ? parseInt(calories) : 0,
        protein: protein ? parseFloat(protein) : 0,
        carbs: carbs ? parseFloat(carbs) : 0,
        fats: fats ? parseFloat(fats) : 0,
        water: water ? parseFloat(water) : 0,
        notes,
      },
      create: {
        clientId: client.id, date,
        calories: calories ? parseInt(calories) : 0,
        protein: protein ? parseFloat(protein) : 0,
        carbs: carbs ? parseFloat(carbs) : 0,
        fats: fats ? parseFloat(fats) : 0,
        water: water ? parseFloat(water) : 0,
        notes,
      },
    });
    res.json(log);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
