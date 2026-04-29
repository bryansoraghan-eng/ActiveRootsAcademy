import express from 'express';
import prisma from '../../db';
import { authenticate } from '../../middleware/auth';

const router = express.Router();

router.get('/', authenticate, async (req: any, res) => {
  const { role, id: userId } = req.user;
  try {
    let goals;
    if (role === 'client') {
      const client = await prisma.coachingClient.findUnique({ where: { userId } });
      if (!client) return res.status(404).json({ error: 'Client not found' });
      goals = await prisma.coachingGoal.findMany({
        where: { clientId: client.id },
        orderBy: { createdAt: 'desc' },
      });
    } else if (role === 'online_coach') {
      const { clientId } = req.query;
      goals = await prisma.coachingGoal.findMany({
        where: { coachId: userId, ...(clientId ? { clientId: clientId as string } : {}) },
        include: { client: { include: { user: { select: { name: true } } } } },
        orderBy: { createdAt: 'desc' },
      });
    } else if (role === 'admin') {
      const { clientId } = req.query;
      goals = await prisma.coachingGoal.findMany({
        where: clientId ? { clientId: clientId as string } : {},
        include: { client: { include: { user: { select: { name: true } } } } },
        orderBy: { createdAt: 'desc' },
      });
    } else {
      return res.status(403).json({ error: 'Forbidden' });
    }
    res.json(goals);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/', authenticate, async (req: any, res) => {
  const { role, id: coachId } = req.user;
  if (!['admin', 'online_coach'].includes(role)) return res.status(403).json({ error: 'Forbidden' });
  const { clientId, type, title, description, startValue, targetValue, unit, deadline, trainingPlanId } = req.body;
  if (!clientId || !type || !title || startValue === undefined || targetValue === undefined || !unit) {
    return res.status(400).json({ error: 'clientId, type, title, startValue, targetValue, unit required' });
  }
  try {
    const goal = await prisma.coachingGoal.create({
      data: {
        clientId, type, title, description,
        startValue: parseFloat(startValue),
        targetValue: parseFloat(targetValue),
        currentValue: parseFloat(startValue),
        unit,
        deadline: deadline ? new Date(deadline) : undefined,
        trainingPlanId: trainingPlanId || undefined,
        coachId: role === 'online_coach' ? coachId : (req.body.coachId || coachId),
      },
    });
    res.status(201).json(goal);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Update goal progress (coach updates currentValue)
router.put('/:id/progress', authenticate, async (req: any, res) => {
  const { role, id: userId } = req.user;
  if (!['admin', 'online_coach'].includes(role)) return res.status(403).json({ error: 'Forbidden' });
  const { currentValue } = req.body;
  if (currentValue === undefined) return res.status(400).json({ error: 'currentValue required' });
  try {
    const goal = await prisma.coachingGoal.findUnique({ where: { id: req.params.id } });
    if (!goal) return res.status(404).json({ error: 'Goal not found' });
    if (role === 'online_coach' && goal.coachId !== userId) return res.status(403).json({ error: 'Forbidden' });

    const newValue = parseFloat(currentValue);
    const isComplete = newValue >= goal.targetValue;

    const updated = await prisma.coachingGoal.update({
      where: { id: req.params.id },
      data: {
        currentValue: newValue,
        status: isComplete ? 'completed' : 'active',
        completedAt: isComplete ? new Date() : null,
      },
    });
    res.json({ ...updated, justCompleted: isComplete && goal.status !== 'completed' });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Mark goal as completed manually
router.put('/:id/complete', authenticate, async (req: any, res) => {
  const { role, id: userId } = req.user;
  if (!['admin', 'online_coach'].includes(role)) return res.status(403).json({ error: 'Forbidden' });
  try {
    const goal = await prisma.coachingGoal.findUnique({ where: { id: req.params.id } });
    if (!goal) return res.status(404).json({ error: 'Goal not found' });
    if (role === 'online_coach' && goal.coachId !== userId) return res.status(403).json({ error: 'Forbidden' });
    const updated = await prisma.coachingGoal.update({
      where: { id: req.params.id },
      data: { status: 'completed', completedAt: new Date(), currentValue: goal.targetValue },
    });
    res.json(updated);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.delete('/:id', authenticate, async (req: any, res) => {
  const { role, id: userId } = req.user;
  if (!['admin', 'online_coach'].includes(role)) return res.status(403).json({ error: 'Forbidden' });
  try {
    const goal = await prisma.coachingGoal.findUnique({ where: { id: req.params.id } });
    if (!goal) return res.status(404).json({ error: 'Goal not found' });
    if (role === 'online_coach' && goal.coachId !== userId) return res.status(403).json({ error: 'Forbidden' });
    await prisma.coachingGoal.delete({ where: { id: req.params.id } });
    res.json({ message: 'Goal deleted' });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
