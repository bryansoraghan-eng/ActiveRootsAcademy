import express from 'express';
import prisma from '../db';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// POST /admin/impersonate/:userId?type=teacher|coach|user
router.post('/impersonate/:userId', authenticate, async (req: any, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
  const { type = 'user' } = req.query;
  const { userId } = req.params;

  try {
    if (type === 'teacher') {
      const teacher = await prisma.teacher.findUnique({
        where: { id: userId },
        select: { id: true, name: true },
      });
      if (!teacher) return res.status(404).json({ error: 'Teacher not found' });
      return res.json({ id: teacher.id, name: teacher.name, role: 'teacher' });
    }

    if (type === 'coach') {
      const coach = await prisma.coach.findUnique({
        where: { id: userId },
        select: { id: true, name: true },
      });
      if (!coach) return res.status(404).json({ error: 'Coach not found' });
      return res.json({ id: coach.id, name: coach.name, role: 'coach' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, role: true, permissions: true, schoolId: true },
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ id: user.id, name: user.name, role: user.role, permissions: user.permissions, schoolId: user.schoolId });
  } catch {
    res.status(500).json({ error: 'Failed to impersonate user' });
  }
});

export default router;
