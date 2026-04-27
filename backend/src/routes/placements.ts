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

// Get all placements
router.get('/', authenticate, async (req: any, res) => {
  try {
    const { coachId, schoolId } = req.query;
    const effectiveSchoolId = req.user.role !== 'admin'
      ? req.user.schoolId
      : (schoolId as string | undefined);
    const placements = await prisma.placement.findMany({
      where: {
        ...(coachId ? { coachId: coachId as string } : {}),
        ...(effectiveSchoolId ? { schoolId: effectiveSchoolId } : {}),
      },
      include: { coach: true, school: true },
    });
    res.json(placements);
  } catch (error) {
    console.error('Get placements error:', error);
    res.status(500).json({ error: 'Failed to fetch placements' });
  }
});

// Create placement
router.post('/', authenticate, async (req: any, res) => {
  if (!adminOnly(req, res)) return;
  try {
    const { coachId, schoolId, hours, notes } = req.body;
    const placement = await prisma.placement.create({
      data: {
        coach: { connect: { id: coachId } },
        school: { connect: { id: schoolId } },
        hours: hours || 0,
        notes,
      },
      include: { coach: true, school: true },
    });
    res.status(201).json(placement);
  } catch (error) {
    console.error('Create placement error:', error);
    res.status(400).json({ error: 'Failed to create placement' });
  }
});

// Get placement by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const placement = await prisma.placement.findUnique({
      where: { id: req.params.id },
      include: { coach: true, school: true },
    });
    if (!placement) return res.status(404).json({ error: 'Placement not found' });
    res.json(placement);
  } catch (error) {
    console.error('Get placement error:', error);
    res.status(500).json({ error: 'Failed to fetch placement' });
  }
});

// Update placement
router.put('/:id', authenticate, async (req: any, res) => {
  if (!adminOnly(req, res)) return;
  try {
    const { hours, notes } = req.body;
    const placement = await prisma.placement.update({
      where: { id: req.params.id },
      data: { hours, notes },
      include: { coach: true, school: true },
    });
    res.json(placement);
  } catch (error) {
    console.error('Update placement error:', error);
    res.status(400).json({ error: 'Failed to update placement' });
  }
});

// Delete placement
router.delete('/:id', authenticate, async (req: any, res) => {
  if (!adminOnly(req, res)) return;
  try {
    await prisma.placement.delete({ where: { id: req.params.id } });
    res.json({ message: 'Placement deleted' });
  } catch (error) {
    console.error('Delete placement error:', error);
    res.status(500).json({ error: 'Failed to delete placement' });
  }
});

export default router;
