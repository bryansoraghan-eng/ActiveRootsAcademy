import express from 'express';
import bcrypt from 'bcrypt';
import prisma from '../db';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Get all teachers
router.get('/', authenticate, async (req: any, res) => {
  try {
    const effectiveSchoolId = req.user.role !== 'admin'
      ? req.user.schoolId
      : (req.query.schoolId as string | undefined);
    const teachers = await prisma.teacher.findMany({
      where: effectiveSchoolId ? { schoolId: effectiveSchoolId } : {},
      include: { school: true },
    });
    res.json(teachers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch teachers' });
  }
});

// Create teacher
router.post('/', authenticate, async (req: any, res) => {
  try {
    const { email, name, password } = req.body;
    const effectiveSchoolId = req.user.role === 'admin' ? (req.body.schoolId ?? req.user.schoolId) : req.user.schoolId;
    const [existingTeacher, existingUser] = await Promise.all([
      prisma.teacher.findUnique({ where: { email } }),
      prisma.user.findUnique({ where: { email } }),
    ]);
    if (existingTeacher || existingUser) {
      return res.status(400).json({ error: 'An account with this email already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const teacher = await prisma.teacher.create({
      data: { email, name, password: hashedPassword, schoolId: effectiveSchoolId },
      include: { school: true },
    });
    res.status(201).json(teacher);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create teacher' });
  }
});

// Get teacher by ID
router.get('/:id', authenticate, async (req: any, res) => {
  try {
    const teacher = await prisma.teacher.findUnique({
      where: { id: req.params.id },
      include: { school: true, classes: true },
    });
    if (!teacher) return res.status(404).json({ error: 'Teacher not found' });
    if (req.user.role !== 'admin' && teacher.schoolId !== req.user.schoolId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    res.json(teacher);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch teacher' });
  }
});

// Update teacher
router.put('/:id', authenticate, async (req: any, res) => {
  try {
    const existing = await prisma.teacher.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: 'Teacher not found' });
    if (req.user.role !== 'admin' && existing.schoolId !== req.user.schoolId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const { email, name } = req.body;
    const schoolId = req.user.role === 'admin' ? req.body.schoolId : undefined;
    const teacher = await prisma.teacher.update({
      where: { id: req.params.id },
      data: { email, name, ...(schoolId !== undefined ? { schoolId } : {}) },
      include: { school: true },
    });
    res.json(teacher);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update teacher' });
  }
});

// Delete teacher
router.delete('/:id', authenticate, async (req: any, res) => {
  try {
    const existing = await prisma.teacher.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: 'Teacher not found' });
    if (req.user.role !== 'admin' && existing.schoolId !== req.user.schoolId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    await prisma.teacher.delete({ where: { id: req.params.id } });
    res.json({ message: 'Teacher deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete teacher' });
  }
});

// GET permissions for a teacher (admin only)
router.get('/:id/permissions', authenticate, async (req: any, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
  try {
    const teacher = await prisma.teacher.findUnique({
      where: { id: req.params.id },
      select: { permissions: true },
    });
    if (!teacher) return res.status(404).json({ error: 'Teacher not found' });
    try {
      res.json(JSON.parse(teacher.permissions || '{}'));
    } catch {
      console.error(`[TEACHERS] Malformed permissions JSON for teacher ${req.params.id} — returning empty`);
      res.json({});
    }
  } catch {
    res.status(500).json({ error: 'Failed to fetch permissions' });
  }
});

// PUT permissions for a teacher (admin only)
router.put('/:id/permissions', authenticate, async (req: any, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
  const { permissions } = req.body;
  try {
    const teacher = await prisma.teacher.update({
      where: { id: req.params.id },
      data: { permissions: JSON.stringify(permissions ?? {}) },
      select: { id: true, permissions: true },
    });
    res.json({ id: teacher.id, permissions: JSON.parse(teacher.permissions) });
  } catch {
    res.status(400).json({ error: 'Failed to update permissions' });
  }
});

export default router;