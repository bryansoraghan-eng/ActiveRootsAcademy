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

// Get all bookings
router.get('/', authenticate, async (req: any, res) => {
  try {
    const { schoolId, classId, status } = req.query;
    const effectiveSchoolId = req.user.role !== 'admin'
      ? req.user.schoolId
      : (schoolId as string | undefined);
    const bookings = await prisma.booking.findMany({
      where: {
        ...(effectiveSchoolId ? { schoolId: effectiveSchoolId } : {}),
        ...(classId ? { classId: classId as string } : {}),
        ...(status ? { status: status as string } : {}),
      },
      include: {
        school: true,
        class: { include: { teacher: true } },
        programme: true,
        coach: true,
      },
      orderBy: { startDate: 'asc' },
    });
    res.json(bookings);
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// Create booking (book a programme for a class)
router.post('/', authenticate, async (req: any, res) => {
  if (!adminOnly(req, res)) return;
  try {
    const { schoolId, classId, programmeId, coachId, startDate, endDate, status } = req.body;
    const booking = await prisma.booking.create({
      data: {
        school: { connect: { id: schoolId } },
        class: { connect: { id: classId } },
        programme: { connect: { id: programmeId } },
        coach: coachId ? { connect: { id: coachId } } : undefined,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        status: status || 'pending',
      },
      include: {
        school: true,
        class: true,
        programme: true,
        coach: true,
      },
    });
    res.status(201).json(booking);
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(400).json({ error: 'Failed to create booking' });
  }
});

// Get booking by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: req.params.id },
      include: {
        school: true,
        class: { include: { teacher: true, school: true } },
        programme: true,
        coach: true,
      },
    });
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    res.json(booking);
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({ error: 'Failed to fetch booking' });
  }
});

// Update booking
router.put('/:id', authenticate, async (req: any, res) => {
  if (!adminOnly(req, res)) return;
  try {
    const { coachId, startDate, endDate, status } = req.body;
    const booking = await prisma.booking.update({
      where: { id: req.params.id },
      data: {
        coach: coachId ? { connect: { id: coachId } } : undefined,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        status,
      },
      include: {
        school: true,
        class: true,
        programme: true,
        coach: true,
      },
    });
    res.json(booking);
  } catch (error) {
    console.error('Update booking error:', error);
    res.status(400).json({ error: 'Failed to update booking' });
  }
});

// Delete booking
router.delete('/:id', authenticate, async (req: any, res) => {
  if (!adminOnly(req, res)) return;
  try {
    await prisma.booking.delete({ where: { id: req.params.id } });
    res.json({ message: 'Booking deleted' });
  } catch (error) {
    console.error('Delete booking error:', error);
    res.status(500).json({ error: 'Failed to delete booking' });
  }
});

export default router;
