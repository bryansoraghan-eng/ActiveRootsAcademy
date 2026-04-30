import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../../db';
import { authenticate } from '../../middleware/auth';

const router = express.Router();

// GET all clients — admin sees all, coach sees their own
router.get('/', authenticate, async (req: any, res) => {
  const { role, id } = req.user;
  if (!['admin', 'online_coach'].includes(role)) return res.status(403).json({ error: 'Forbidden' });
  try {
    const where = role === 'online_coach' ? { coachId: id } : {};
    const clients = await prisma.coachingClient.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
        trainingPlans: { where: { isActive: true }, take: 1 },
        clientGoals: { where: { status: 'active' } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(clients);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// GET /me — client gets own profile; admin can pass ?clientId=xxx to preview
router.get('/me', authenticate, async (req: any, res) => {
  const { role, id: userId } = req.user;
  const previewId = req.query.clientId as string | undefined;
  if (role !== 'client' && !(role === 'admin' && previewId)) return res.status(403).json({ error: 'Forbidden' });
  try {
    const where = role === 'admin' && previewId ? { id: previewId } : { userId };
    const client = await prisma.coachingClient.findUnique({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
        trainingPlans: { where: { isActive: true }, include: { days: { include: { exercises: { orderBy: { order: 'asc' } } }, orderBy: { order: 'asc' } } } },
        clientGoals: { where: { status: 'active' } },
        nutritionTargets: { orderBy: { effectiveFrom: 'desc' }, take: 1 },
      },
    });
    if (!client) return res.status(404).json({ error: 'Client profile not found' });
    res.json(client);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// PUT /me — client updates their own profile
router.put('/me', authenticate, async (req: any, res) => {
  if (req.user.role !== 'client') return res.status(403).json({ error: 'Forbidden' });
  const { age, startingWeight, height, goals } = req.body;
  try {
    const client = await prisma.coachingClient.update({
      where: { userId: req.user.id },
      data: {
        age: age !== undefined ? parseInt(age) : undefined,
        startingWeight: startingWeight !== undefined ? parseFloat(startingWeight) : undefined,
        height: height !== undefined ? parseFloat(height) : undefined,
        goals,
      },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
    res.json(client);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// POST /preview-token — coach gets a short-lived client-scoped JWT for preview
router.post('/preview-token', authenticate, async (req: any, res) => {
  if (req.user.role !== 'online_coach') return res.status(403).json({ error: 'Forbidden' });
  const { clientId } = req.body;
  if (!clientId) return res.status(400).json({ error: 'clientId required' });
  try {
    const client = await prisma.coachingClient.findUnique({
      where: { id: clientId },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
    if (!client) return res.status(404).json({ error: 'Client not found' });
    if (client.coachId !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
    const previewToken = jwt.sign(
      { id: client.userId, role: 'client', isPreview: true },
      process.env.JWT_SECRET!,
      { expiresIn: '8h' }
    );
    res.json({ token: previewToken, user: client.user });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// GET /:id — admin or coach gets a specific client
router.get('/:id', authenticate, async (req: any, res) => {
  const { role, id: userId } = req.user;
  if (!['admin', 'online_coach'].includes(role)) return res.status(403).json({ error: 'Forbidden' });
  try {
    const client = await prisma.coachingClient.findUnique({
      where: { id: req.params.id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        trainingPlans: { include: { days: { include: { exercises: { orderBy: { order: 'asc' } } }, orderBy: { order: 'asc' } } }, orderBy: { createdAt: 'desc' } },
        clientGoals: true,
        nutritionTargets: { orderBy: { effectiveFrom: 'desc' }, take: 1 },
        checkIns: { orderBy: { date: 'desc' }, take: 5 },
        progressEntries: { orderBy: { date: 'desc' }, take: 10 },
        personalRecords: { orderBy: { loggedAt: 'desc' }, take: 20 },
      },
    });
    if (!client) return res.status(404).json({ error: 'Client not found' });
    if (role === 'online_coach' && client.coachId !== userId) return res.status(403).json({ error: 'Forbidden' });
    res.json(client);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// POST — admin or coach creates a client (creates User + CoachingClient)
router.post('/', authenticate, async (req: any, res) => {
  const { role, id: coachId } = req.user;
  if (!['admin', 'online_coach'].includes(role)) return res.status(403).json({ error: 'Forbidden' });
  const { name, email, password, age, startingWeight, height, goals } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'name, email and password required' });
  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ error: 'Email already in use' });
    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashed, role: 'client', status: 'active' },
    });
    const client = await prisma.coachingClient.create({
      data: {
        userId: user.id,
        coachId: role === 'online_coach' ? coachId : (req.body.coachId || coachId),
        age: age ? parseInt(age) : undefined,
        startingWeight: startingWeight ? parseFloat(startingWeight) : undefined,
        height: height ? parseFloat(height) : undefined,
        goals: goals || undefined,
      },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
    res.status(201).json(client);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// PUT /:id — update client profile
router.put('/:id', authenticate, async (req: any, res) => {
  const { role, id: userId } = req.user;
  if (!['admin', 'online_coach'].includes(role)) return res.status(403).json({ error: 'Forbidden' });
  try {
    const existing = await prisma.coachingClient.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: 'Client not found' });
    if (role === 'online_coach' && existing.coachId !== userId) return res.status(403).json({ error: 'Forbidden' });
    const { age, startingWeight, height, goals, status } = req.body;
    const client = await prisma.coachingClient.update({
      where: { id: req.params.id },
      data: {
        age: age !== undefined ? parseInt(age) : undefined,
        startingWeight: startingWeight !== undefined ? parseFloat(startingWeight) : undefined,
        height: height !== undefined ? parseFloat(height) : undefined,
        goals, status,
      },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
    res.json(client);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE /:id — admin only
router.delete('/:id', authenticate, async (req: any, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
  try {
    await prisma.coachingClient.delete({ where: { id: req.params.id } });
    res.json({ message: 'Client deleted' });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
