import express from 'express';
import prisma from '../db';
import { authenticate } from '../middleware/auth';
import { uniqueSchoolCode } from './auth';

const router = express.Router();

// Get all schools
router.get('/', authenticate, async (req, res) => {
  try {
    const schools = await prisma.school.findMany({
      include: { classes: true, teachers: true, programmes: true },
    });
    res.json(schools);
  } catch (error) {
    console.error('Get schools error:', error);
    res.status(500).json({ error: 'Failed to fetch schools' });
  }
});

// Create school — auto-generates a school code
router.post('/', authenticate, async (req, res) => {
  try {
    const { name, address, phone, principal, email } = req.body;
    const schoolCode = await uniqueSchoolCode();
    const school = await prisma.school.create({
      data: { name, address, phone, principal, email, schoolCode },
      include: { classes: true },
    });
    res.status(201).json(school);
  } catch (error) {
    console.error('Create school error:', error);
    res.status(400).json({ error: 'Failed to create school' });
  }
});

// Get school by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const school = await prisma.school.findUnique({
      where: { id: req.params.id },
      include: {
        classes: true, teachers: true, programmes: true,
        bookings: { include: { coach: true } },
      },
    });
    if (!school) return res.status(404).json({ error: 'School not found' });
    res.json(school);
  } catch (error) {
    console.error('Get school error:', error);
    res.status(500).json({ error: 'Failed to fetch school' });
  }
});

// Update school
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { name, address, phone, principal, email } = req.body;
    const school = await prisma.school.update({
      where: { id: req.params.id },
      data: { name, address, phone, principal, email },
      include: { classes: true },
    });
    res.json(school);
  } catch (error) {
    console.error('Update school error:', error);
    res.status(400).json({ error: 'Failed to update school' });
  }
});

// Regenerate school code (admin only)
router.post('/:id/regenerate-code', authenticate, async (req: any, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
  try {
    const schoolCode = await uniqueSchoolCode();
    const school = await prisma.school.update({
      where: { id: req.params.id },
      data: { schoolCode },
    });
    res.json({ schoolCode: school.schoolCode });
  } catch {
    res.status(400).json({ error: 'Failed to regenerate code' });
  }
});

// Delete school
router.delete('/:id', authenticate, async (req, res) => {
  try {
    await prisma.school.delete({ where: { id: req.params.id } });
    res.json({ message: 'School deleted' });
  } catch (error) {
    console.error('Delete school error:', error);
    res.status(500).json({ error: 'Failed to delete school' });
  }
});

export default router;
