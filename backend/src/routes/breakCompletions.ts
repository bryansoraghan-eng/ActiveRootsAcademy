import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function calcStreak(dates: string[]): { current: number; longest: number } {
  if (dates.length === 0) return { current: 0, longest: 0 };

  const sorted = [...new Set(dates)].sort().reverse(); // unique, desc
  const today = todayISO();
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  // Current streak — must include today or yesterday to still be alive
  let current = 0;
  if (sorted[0] === today || sorted[0] === yesterday) {
    let prev = sorted[0];
    current = 1;
    for (let i = 1; i < sorted.length; i++) {
      const expected = new Date(new Date(prev).getTime() - 86400000).toISOString().slice(0, 10);
      if (sorted[i] === expected) { current++; prev = sorted[i]; }
      else break;
    }
  }

  // Longest streak
  let longest = 1;
  let run = 1;
  const asc = [...sorted].reverse();
  for (let i = 1; i < asc.length; i++) {
    const expected = new Date(new Date(asc[i - 1]).getTime() + 86400000).toISOString().slice(0, 10);
    if (asc[i] === expected) { run++; if (run > longest) longest = run; }
    else run = 1;
  }

  return { current, longest };
}

const MILESTONES = [1, 3, 5, 7, 14, 21, 30, 50, 100];

// GET /api/break-completions/streak
router.get('/streak', authenticate, async (req: any, res) => {
  const teacherId = req.user.id;
  try {
    const completions = await prisma.breakCompletion.findMany({ where: { teacherId } });
    const dates = completions.map(c => c.date);
    const { current, longest } = calcStreak(dates);
    const today = completions.find(c => c.date === todayISO());
    res.json({ currentStreak: current, longestStreak: longest, totalDays: completions.length, todayCount: today?.count ?? 0 });
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch streak' });
  }
});

// POST /api/break-completions  — record one completion for today
router.post('/', authenticate, async (req: any, res) => {
  const teacherId = req.user.id;
  const date = todayISO();
  try {
    const record = await prisma.breakCompletion.upsert({
      where: { teacherId_date: { teacherId, date } },
      update: { count: { increment: 1 } },
      create: { teacherId, date, count: 1 },
    });

    const completions = await prisma.breakCompletion.findMany({ where: { teacherId } });
    const dates = completions.map(c => c.date);
    const { current, longest } = calcStreak(dates);

    const milestone = MILESTONES.includes(current) ? current : null;

    res.json({ currentStreak: current, longestStreak: longest, totalDays: completions.length, todayCount: record.count, milestone });
  } catch (e) {
    res.status(500).json({ error: 'Failed to record completion' });
  }
});

export default router;
