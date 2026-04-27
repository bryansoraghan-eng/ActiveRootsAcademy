import express from 'express';
import prisma from '../db';
import { authenticate } from '../middleware/auth';

const router = express.Router();

function adminOnly(req: any, res: any): boolean {
  if (req.user.role !== 'admin') {
    res.status(403).json({ error: 'Admin only' });
    return false;
  }
  return true;
}

// Get all classes
router.get('/', authenticate, async (req: any, res) => {
  try {
    const { schoolId } = req.query;
    const effectiveSchoolId = req.user.role !== 'admin'
      ? req.user.schoolId
      : (schoolId as string | undefined);
    const classes = await prisma.class.findMany({
      where: effectiveSchoolId ? { schoolId: effectiveSchoolId } : {},
      include: {
        school: true,
        teacher: true,
        assessments: true,
        bookings: true,
      },
    });
    res.json(classes);
  } catch (error) {
    console.error('Get classes error:', error);
    res.status(500).json({ error: 'Failed to fetch classes' });
  }
});

// Create class
router.post('/', authenticate, async (req: any, res) => {
  if (!adminOnly(req, res)) return;
  try {
    const { name, yearGroup, schoolId, teacherId } = req.body;
    const class_ = await prisma.class.create({
      data: {
        name,
        yearGroup,
        school: { connect: { id: schoolId } },
        teacher: teacherId ? { connect: { id: teacherId } } : undefined,
      },
      include: { school: true, teacher: true },
    });
    res.status(201).json(class_);
  } catch (error) {
    console.error('Create class error:', error);
    res.status(400).json({ error: 'Failed to create class' });
  }
});

// Get class by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const class_ = await prisma.class.findUnique({
      where: { id: req.params.id },
      include: {
        school: true,
        teacher: true,
        assessments: { include: { coach: true } },
        bookings: { include: { programme: true, coach: true } },
      },
    });
    if (!class_) return res.status(404).json({ error: 'Class not found' });
    res.json(class_);
  } catch (error) {
    console.error('Get class error:', error);
    res.status(500).json({ error: 'Failed to fetch class' });
  }
});

// Update class
router.put('/:id', authenticate, async (req: any, res) => {
  if (!adminOnly(req, res)) return;
  try {
    const { name, yearGroup, teacherId } = req.body;
    const class_ = await prisma.class.update({
      where: { id: req.params.id },
      data: {
        name,
        yearGroup,
        teacher: teacherId ? { connect: { id: teacherId } } : undefined,
      },
      include: { school: true, teacher: true },
    });
    res.json(class_);
  } catch (error) {
    console.error('Update class error:', error);
    res.status(400).json({ error: 'Failed to update class' });
  }
});

// Delete class
router.delete('/:id', authenticate, async (req: any, res) => {
  if (!adminOnly(req, res)) return;
  try {
    await prisma.class.delete({ where: { id: req.params.id } });
    res.json({ message: 'Class deleted' });
  } catch (error) {
    console.error('Delete class error:', error);
    res.status(500).json({ error: 'Failed to delete class' });
  }
});

export default router;