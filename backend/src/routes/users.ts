import express from 'express';
import bcrypt from 'bcrypt';
import prisma from '../db';
import { authenticate } from '../middleware/auth';

const router = express.Router();

const USER_SELECT = {
  id: true, name: true, email: true, role: true,
  status: true, school: true, permissions: true, createdAt: true,
} as const;

// GET all active users (admin only)
router.get('/', authenticate, async (req: any, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
  try {
    const users = await prisma.user.findMany({
      where: { status: 'active' },
      select: USER_SELECT,
      orderBy: { name: 'asc' },
    });
    res.json(users);
  } catch {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// GET pending approval requests (admin only)
router.get('/pending', authenticate, async (req: any, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
  try {
    const pending = await prisma.user.findMany({
      where: { status: 'pending' },
      select: USER_SELECT,
      orderBy: { createdAt: 'asc' },
    });
    res.json(pending);
  } catch {
    res.status(500).json({ error: 'Failed to fetch pending users' });
  }
});

// POST create user (admin only)
router.post('/', authenticate, async (req: any, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
  const { name, email, password, role, schoolId } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'Name, email, and password are required' });

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ error: 'Email already in use' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name, email,
        password: hashed,
        role: role || 'teacher',
        status: 'active',
        schoolId: schoolId || undefined,
      },
      select: USER_SELECT,
    });
    res.status(201).json(user);
  } catch {
    res.status(400).json({ error: 'Failed to create user' });
  }
});

// PUT approve a pending user (admin only)
router.put('/:id/approve', authenticate, async (req: any, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
  try {
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { status: 'active' },
      select: USER_SELECT,
    });
    res.json(user);
  } catch {
    res.status(400).json({ error: 'Failed to approve user' });
  }
});

// DELETE reject/remove a pending user (admin only)
router.delete('/:id/reject', authenticate, async (req: any, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
  try {
    await prisma.user.delete({ where: { id: req.params.id } });
    res.json({ message: 'Request rejected and removed' });
  } catch {
    res.status(400).json({ error: 'Failed to reject user' });
  }
});

// PUT update user permissions (admin only)
router.put('/:id/permissions', authenticate, async (req: any, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
  const { permissions } = req.body;
  try {
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { permissions: JSON.stringify(permissions ?? {}) },
      select: USER_SELECT,
    });
    res.json(user);
  } catch {
    res.status(400).json({ error: 'Failed to update permissions' });
  }
});

// PUT update user role/school (admin only)
router.put('/:id', authenticate, async (req: any, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
  const { role, schoolId, name } = req.body;
  try {
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: {
        ...(role ? { role } : {}),
        ...(name ? { name } : {}),
        ...(schoolId !== undefined ? { schoolId: schoolId || null } : {}),
      },
      select: USER_SELECT,
    });
    res.json(user);
  } catch {
    res.status(400).json({ error: 'Failed to update user' });
  }
});

// DELETE user (admin only, cannot delete self)
router.delete('/:id', authenticate, async (req: any, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
  if (req.user.id === req.params.id) return res.status(400).json({ error: 'Cannot delete your own account' });
  try {
    await prisma.user.delete({ where: { id: req.params.id } });
    res.json({ message: 'User deleted' });
  } catch {
    res.status(400).json({ error: 'Failed to delete user' });
  }
});

export default router;
