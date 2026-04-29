import express from 'express';
import prisma from '../../db';
import { authenticate } from '../../middleware/auth';

const router = express.Router();

// Progress entries (body measurements over time)
router.get('/', authenticate, async (req: any, res) => {
  const { role, id: userId } = req.user;
  try {
    let entries;
    if (role === 'client') {
      const client = await prisma.coachingClient.findUnique({ where: { userId } });
      if (!client) return res.status(404).json({ error: 'Client not found' });
      entries = await prisma.coachingProgressEntry.findMany({
        where: { clientId: client.id },
        orderBy: { date: 'asc' },
      });
    } else if (['admin', 'online_coach'].includes(role)) {
      const { clientId } = req.query;
      if (!clientId) return res.status(400).json({ error: 'clientId required' });
      entries = await prisma.coachingProgressEntry.findMany({
        where: { clientId: clientId as string },
        orderBy: { date: 'asc' },
      });
    } else {
      return res.status(403).json({ error: 'Forbidden' });
    }
    res.json(entries);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/', authenticate, async (req: any, res) => {
  const { role, id: userId } = req.user;
  if (!['admin', 'online_coach', 'client'].includes(role)) return res.status(403).json({ error: 'Forbidden' });
  try {
    let clientId: string;
    if (role === 'client') {
      const client = await prisma.coachingClient.findUnique({ where: { userId } });
      if (!client) return res.status(404).json({ error: 'Client not found' });
      clientId = client.id;
    } else {
      clientId = req.body.clientId;
      if (!clientId) return res.status(400).json({ error: 'clientId required' });
    }
    const { date, weight, bodyFat, chest, waist, hips, notes } = req.body;
    if (!date) return res.status(400).json({ error: 'date required' });
    const entry = await prisma.coachingProgressEntry.create({
      data: {
        clientId, date,
        weight: weight ? parseFloat(weight) : undefined,
        bodyFat: bodyFat ? parseFloat(bodyFat) : undefined,
        chest: chest ? parseFloat(chest) : undefined,
        waist: waist ? parseFloat(waist) : undefined,
        hips: hips ? parseFloat(hips) : undefined,
        notes,
      },
    });
    res.status(201).json(entry);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Personal Records
router.get('/prs', authenticate, async (req: any, res) => {
  const { role, id: userId } = req.user;
  try {
    let prs;
    if (role === 'client') {
      const client = await prisma.coachingClient.findUnique({ where: { userId } });
      if (!client) return res.status(404).json({ error: 'Client not found' });
      prs = await prisma.coachingPersonalRecord.findMany({
        where: { clientId: client.id },
        orderBy: { loggedAt: 'desc' },
      });
    } else if (['admin', 'online_coach'].includes(role)) {
      const { clientId } = req.query;
      if (!clientId) return res.status(400).json({ error: 'clientId required' });
      prs = await prisma.coachingPersonalRecord.findMany({
        where: { clientId: clientId as string },
        orderBy: { loggedAt: 'desc' },
      });
    } else {
      return res.status(403).json({ error: 'Forbidden' });
    }
    res.json(prs);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
