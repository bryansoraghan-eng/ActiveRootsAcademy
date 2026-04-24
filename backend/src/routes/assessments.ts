import express from 'express';
import prisma from '../db';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Get all assessments
router.get('/', authenticate, async (req, res) => {
  try {
    const { classId, coachId } = req.query;
    const assessments = await prisma.assessment.findMany({
      where: {
        ...(classId ? { classId: classId as string } : {}),
        ...(coachId ? { coachId: coachId as string } : {}),
      },
      include: {
        class: { include: { school: true } },
        coach: true,
      },
      orderBy: { date: 'desc' },
    });
    res.json(assessments);
  } catch (error) {
    console.error('Get assessments error:', error);
    res.status(500).json({ error: 'Failed to fetch assessments' });
  }
});

// Create assessment
router.post('/', authenticate, async (req, res) => {
  try {
    const { classId, coachId, date, notes, fmsScores } = req.body;
    const assessment = await prisma.assessment.create({
      data: {
        class: { connect: { id: classId } },
        coach: coachId ? { connect: { id: coachId } } : undefined,
        date: date ? new Date(date) : undefined,
        notes,
        fmsScores: typeof fmsScores === 'string' ? fmsScores : JSON.stringify(fmsScores),
      },
      include: { class: true, coach: true },
    });
    res.status(201).json(assessment);
  } catch (error) {
    console.error('Create assessment error:', error);
    res.status(400).json({ error: 'Failed to create assessment' });
  }
});

// Get assessment by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const assessment = await prisma.assessment.findUnique({
      where: { id: req.params.id },
      include: {
        class: { include: { school: true } },
        coach: true,
      },
    });
    if (!assessment) return res.status(404).json({ error: 'Assessment not found' });
    res.json(assessment);
  } catch (error) {
    console.error('Get assessment error:', error);
    res.status(500).json({ error: 'Failed to fetch assessment' });
  }
});

// Update assessment
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { date, notes, fmsScores } = req.body;
    const assessment = await prisma.assessment.update({
      where: { id: req.params.id },
      data: {
        date: date ? new Date(date) : undefined,
        notes,
        fmsScores: fmsScores ? (typeof fmsScores === 'string' ? fmsScores : JSON.stringify(fmsScores)) : undefined,
      },
      include: { class: true, coach: true },
    });
    res.json(assessment);
  } catch (error) {
    console.error('Update assessment error:', error);
    res.status(400).json({ error: 'Failed to update assessment' });
  }
});

// Delete assessment
router.delete('/:id', authenticate, async (req, res) => {
  try {
    await prisma.assessment.delete({ where: { id: req.params.id } });
    res.json({ message: 'Assessment deleted' });
  } catch (error) {
    console.error('Delete assessment error:', error);
    res.status(500).json({ error: 'Failed to delete assessment' });
  }
});

export default router;