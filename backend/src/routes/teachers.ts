import express from 'express';
import bcrypt from 'bcrypt';
import prisma from '../db';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Get all teachers
router.get('/', authenticate, async (req, res) => {
  try {
    const teachers = await prisma.teacher.findMany({ include: { school: true } });
    res.json(teachers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch teachers' });
  }
});

// Create teacher
router.post('/', authenticate, async (req, res) => {
  try {
    const { email, name, password, schoolId } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const teacher = await prisma.teacher.create({
      data: { email, name, password: hashedPassword, schoolId },
      include: { school: true },
    });
    res.status(201).json(teacher);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create teacher' });
  }
});

// Get teacher by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const teacher = await prisma.teacher.findUnique({
      where: { id: req.params.id },
      include: { school: true, classes: true },
    });
    if (!teacher) return res.status(404).json({ error: 'Teacher not found' });
    res.json(teacher);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch teacher' });
  }
});

// Update teacher
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { email, name, schoolId } = req.body;
    const teacher = await prisma.teacher.update({
      where: { id: req.params.id },
      data: { email, name, schoolId },
      include: { school: true },
    });
    res.json(teacher);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update teacher' });
  }
});

// Delete teacher
router.delete('/:id', authenticate, async (req, res) => {
  try {
    await prisma.teacher.delete({ where: { id: req.params.id } });
    res.json({ message: 'Teacher deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete teacher' });
  }
});

export default router;