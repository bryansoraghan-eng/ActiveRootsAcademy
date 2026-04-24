import express from 'express';
import prisma from '../db';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Get all coaches
router.get('/', authenticate, async (req, res) => {
  try {
    const coaches = await prisma.coach.findMany({
      include: {
        placements: { include: { school: true } },
        bookings: { include: { class: true, school: true } },
        assessments: true,
      },
    });
    res.json(coaches);
  } catch (error) {
    console.error('Get coaches error:', error);
    res.status(500).json({ error: 'Failed to fetch coaches' });
  }
});

// Create coach
router.post('/', authenticate, async (req, res) => {
  try {
    const { name, email, phone, specialisation, isPlacement } = req.body;
    const coach = await prisma.coach.create({
      data: { name, email, phone, specialisation, isPlacement: isPlacement || false },
      include: { placements: true },
    });
    res.status(201).json(coach);
  } catch (error) {
    console.error('Create coach error:', error);
    res.status(400).json({ error: 'Failed to create coach' });
  }
});

// Get coach by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const coach = await prisma.coach.findUnique({
      where: { id: req.params.id },
      include: {
        placements: { include: { school: true } },
        bookings: { include: { class: true, school: true, programme: true } },
        assessments: { include: { class: true } },
      },
    });
    if (!coach) return res.status(404).json({ error: 'Coach not found' });
    res.json(coach);
  } catch (error) {
    console.error('Get coach error:', error);
    res.status(500).json({ error: 'Failed to fetch coach' });
  }
});

// Update coach
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { name, email, phone, specialisation, isPlacement } = req.body;
    const coach = await prisma.coach.update({
      where: { id: req.params.id },
      data: { name, email, phone, specialisation, isPlacement },
      include: { placements: true },
    });
    res.json(coach);
  } catch (error) {
    console.error('Update coach error:', error);
    res.status(400).json({ error: 'Failed to update coach' });
  }
});

// Delete coach
router.delete('/:id', authenticate, async (req, res) => {
  try {
    await prisma.coach.delete({ where: { id: req.params.id } });
    res.json({ message: 'Coach deleted' });
  } catch (error) {
    console.error('Delete coach error:', error);
    res.status(500).json({ error: 'Failed to delete coach' });
  }
});

export default router;
