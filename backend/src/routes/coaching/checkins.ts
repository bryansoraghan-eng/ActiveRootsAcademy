import express from 'express';
import prisma from '../../db';
import { authenticate } from '../../middleware/auth';

const router = express.Router();

router.get('/', authenticate, async (req: any, res) => {
  const { role, id: userId } = req.user;
  try {
    let checkins;
    if (role === 'client') {
      const client = await prisma.coachingClient.findUnique({ where: { userId } });
      if (!client) return res.status(404).json({ error: 'Client not found' });
      checkins = await prisma.coachingCheckIn.findMany({
        where: { clientId: client.id },
        orderBy: { date: 'desc' },
      });
    } else if (role === 'online_coach') {
      const { clientId } = req.query;
      checkins = await prisma.coachingCheckIn.findMany({
        where: clientId ? { clientId: clientId as string, coachId: userId } : { coachId: userId },
        include: { client: { include: { user: { select: { name: true } } } } },
        orderBy: { date: 'desc' },
      });
    } else if (role === 'admin') {
      const { clientId } = req.query;
      checkins = await prisma.coachingCheckIn.findMany({
        where: clientId ? { clientId: clientId as string } : {},
        include: { client: { include: { user: { select: { name: true } } } } },
        orderBy: { date: 'desc' },
      });
    } else {
      return res.status(403).json({ error: 'Forbidden' });
    }
    res.json(checkins);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/', authenticate, async (req: any, res) => {
  if (req.user.role !== 'client') return res.status(403).json({ error: 'Clients only' });
  const { date, weight, bodyFat, energyLevel, sleepQuality, mood, notes } = req.body;
  if (!date) return res.status(400).json({ error: 'date required' });
  try {
    const client = await prisma.coachingClient.findUnique({ where: { userId: req.user.id } });
    if (!client) return res.status(404).json({ error: 'Client not found' });
    const checkin = await prisma.coachingCheckIn.create({
      data: {
        clientId: client.id,
        coachId: client.coachId,
        date,
        weight: weight ? parseFloat(weight) : undefined,
        bodyFat: bodyFat ? parseFloat(bodyFat) : undefined,
        energyLevel: energyLevel ? parseInt(energyLevel) : undefined,
        sleepQuality: sleepQuality ? parseInt(sleepQuality) : undefined,
        mood: mood ? parseInt(mood) : undefined,
        notes,
      },
    });

    // Auto-create a progress entry from the check-in weight
    if (weight) {
      await prisma.coachingProgressEntry.create({
        data: { clientId: client.id, date, weight: parseFloat(weight), bodyFat: bodyFat ? parseFloat(bodyFat) : undefined, notes },
      });
    }

    res.status(201).json(checkin);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Coach adds notes to a check-in
router.put('/:id/notes', authenticate, async (req: any, res) => {
  const { role, id: userId } = req.user;
  if (!['admin', 'online_coach'].includes(role)) return res.status(403).json({ error: 'Forbidden' });
  try {
    const checkin = await prisma.coachingCheckIn.findUnique({ where: { id: req.params.id } });
    if (!checkin) return res.status(404).json({ error: 'Check-in not found' });
    if (role === 'online_coach' && checkin.coachId !== userId) return res.status(403).json({ error: 'Forbidden' });
    const updated = await prisma.coachingCheckIn.update({
      where: { id: req.params.id },
      data: { notes: req.body.notes },
    });
    res.json(updated);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
