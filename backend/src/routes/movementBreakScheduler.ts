import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import prisma from '../db';
import { authenticate } from '../middleware/auth';

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const AGE_BREAKS: Record<string, any[]> = {
  default: [
    { name: 'Star Jump Challenge', steps: ['Stand behind your chair', 'Do 20 star jumps', 'Finish with 5 big stretches to the sky'], fmsFocus: 'coordination', popupMessage: 'Moving helps your brain wake up and focus better!' },
    { name: 'Freeze Dance Stretch', steps: ['Stand up and shake out your arms and legs', 'Stretch as tall as you can, then as wide as you can', 'Take 3 big deep breaths and sit back down'], fmsFocus: 'balance', popupMessage: 'A quick stretch helps your body feel strong and ready for learning!' },
    { name: 'March on the Spot', steps: ['Stand beside your chair', 'March on the spot lifting your knees high — 20 times', 'Swing your arms front and back as you march'], fmsFocus: 'locomotion', popupMessage: 'Moving gives you more energy for the rest of the day!' },
    { name: 'Balance Challenge', steps: ['Stand on one foot and count to 10', 'Swap to the other foot and count to 10', 'Try with your eyes closed for extra challenge'], fmsFocus: 'balance', popupMessage: 'Balance practice helps your brain and body work as a team!' },
    { name: 'Shoulder Roll Circuit', steps: ['Roll both shoulders forward 5 times', 'Roll both shoulders backward 5 times', 'Reach both arms overhead and hold for 5 seconds'], fmsFocus: 'stability', popupMessage: 'Posture breaks help you sit comfortably and concentrate!' },
    { name: 'Jumping Jacks', steps: ['Stand with feet together and arms at your sides', 'Jump feet out wide and clap arms above your head', 'Jump back to start — repeat 15 times'], fmsFocus: 'coordination', popupMessage: 'Heart-pumping movement sends more oxygen to your brain!' },
    { name: 'Slow Squat Hold', steps: ['Stand with feet shoulder-width apart', 'Slowly lower yourself into a squat — count to 5', 'Slowly rise back up — count to 5. Repeat 5 times'], fmsFocus: 'strength', popupMessage: 'Strong legs help you run, jump and play better in PE!' },
    { name: 'Animal Moves', steps: ['Pretend to be a bear — walk on hands and feet for 10 steps', 'Be a crab — walk sideways on hands and feet for 10 steps', 'Stand up and roar like a lion — take a big breath in and out'], fmsFocus: 'locomotion', popupMessage: 'Moving like animals builds strength and coordination!' },
    { name: 'Neck and Wrist Rolls', steps: ['Slowly roll your head to one side and hold — 5 seconds each side', 'Roll both wrists in circles — 5 times each way', 'Shrug your shoulders up to your ears — hold 3 seconds then drop'], fmsFocus: 'stability', popupMessage: 'Gentle movements help your body relax and refocus!' },
    { name: 'High Knees Sprint', steps: ['Stand beside your chair', 'Run on the spot lifting knees as high as you can — 20 seconds', 'Slow down and walk on the spot for 10 seconds to cool down'], fmsFocus: 'locomotion', popupMessage: 'Sprint bursts boost your heart rate and sharpen your focus!' },
  ],
};

function pickBreak(usedNames: Set<string>, ageRange: string): any {
  const pool = AGE_BREAKS.default;
  const available = pool.filter(b => !usedNames.has(b.name));
  const pick = available.length > 0 ? available[Math.floor(Math.random() * available.length)] : pool[Math.floor(Math.random() * pool.length)];
  usedNames.add(pick.name);
  return pick;
}

// ── GET settings for a school ──────────────────────────────────────────────
router.get('/settings/:schoolId', authenticate, async (req: any, res) => {
  if (req.user.role !== 'admin' && req.params.schoolId !== req.user.schoolId) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  try {
    const settings = await prisma.movementBreakSettings.findUnique({ where: { schoolId: req.params.schoolId } });
    res.json(settings ?? { schoolId: req.params.schoolId, minBreaks: 4, duration: 2, isEnabled: true });
  } catch {
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// ── PUT update settings (admin only) ──────────────────────────────────────
router.put('/settings/:schoolId', authenticate, async (req: any, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'school_admin') {
    return res.status(403).json({ error: 'Admin only' });
  }
  if (req.user.role !== 'admin' && req.params.schoolId !== req.user.schoolId) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  const { minBreaks, duration, isEnabled } = req.body;
  try {
    const settings = await prisma.movementBreakSettings.upsert({
      where: { schoolId: req.params.schoolId },
      update: { minBreaks: minBreaks ?? 4, duration: duration ?? 2, isEnabled: isEnabled ?? true },
      create: { schoolId: req.params.schoolId, minBreaks: minBreaks ?? 4, duration: duration ?? 2, isEnabled: isEnabled ?? true },
    });
    res.json(settings);
  } catch {
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// ── GET current schedule for a teacher/school ─────────────────────────────
router.get('/schedule', authenticate, async (req: any, res) => {
  try {
    const { teacherId } = req.query;
    const effectiveSchoolId = req.user.role !== 'admin' ? req.user.schoolId : (req.query.schoolId as string | undefined);
    const schedule = await prisma.movementBreakSchedule.findFirst({
      where: {
        ...(effectiveSchoolId ? { schoolId: effectiveSchoolId } : {}),
        ...(teacherId ? { teacherId: teacherId as string } : {}),
      },
      orderBy: { updatedAt: 'desc' },
    });
    res.json(schedule ?? null);
  } catch {
    res.status(500).json({ error: 'Failed to fetch schedule' });
  }
});

// ── POST generate a full schedule ─────────────────────────────────────────
router.post('/generate', authenticate, async (req: any, res) => {
  const { slots, mode, ageRange, minBreaks } = req.body;
  const effectiveSchoolId = req.user.role === 'admin' ? (req.body.schoolId ?? undefined) : req.user.schoolId;
  // slots: [{time: "10:00", isManual: false, customBreakName?: string}]

  if (!slots?.length) return res.status(400).json({ error: 'At least one time slot is required' });

  const effectiveMin = minBreaks ?? 4;
  let allSlots = [...slots];

  // Auto-fill missing slots up to minimum
  if (allSlots.length < effectiveMin) {
    const schoolHours = ['09:30', '10:30', '11:30', '12:30', '13:30', '14:00', '14:30', '15:00'];
    const existingTimes = new Set(allSlots.map((s: any) => s.time));
    for (const t of schoolHours) {
      if (allSlots.length >= effectiveMin) break;
      if (!existingTimes.has(t)) {
        allSlots.push({ time: t, isManual: false });
        existingTimes.add(t);
      }
    }
  }

  // Sort by time
  allSlots.sort((a: any, b: any) => a.time.localeCompare(b.time));

  const hasApiKey = process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_api_key_here';
  const generated: any[] = [];
  const usedNames = new Set<string>();

  if (hasApiKey && (mode === 'random' || mode === 'mixed')) {
    // Build one AI call for all random breaks
    const randomSlots = allSlots.filter((s: any) => !s.isManual || mode === 'random');
    if (randomSlots.length > 0) {
      try {
        const prompt = `Generate ${randomSlots.length} classroom movement breaks for Irish primary school children aged ${ageRange || '6-8'}.
Each break: 2 minutes, no equipment, classroom safe, fun and inclusive.
Support FMS skills: balance, agility, coordination, locomotion, stability.

Return ONLY a JSON array with exactly ${randomSlots.length} objects:
[{
  "name": "break name",
  "steps": ["step 1", "step 2", "step 3"],
  "fmsFocus": "balance|agility|coordination|locomotion|stability",
  "popupMessage": "One child-friendly sentence explaining why movement is good right now",
  "duration": 2
}]`;
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const match = text.match(/\[[\s\S]*\]/);
        if (match) {
          const aiBreaks: any[] = JSON.parse(match[0]);
          let aiIdx = 0;
          for (const slot of allSlots) {
            if (!slot.isManual || mode === 'random') {
              const b = aiBreaks[aiIdx++] ?? pickBreak(usedNames, ageRange);
              generated.push({ ...slot, ...b, isGenerated: true });
            } else {
              generated.push({ ...slot, ...pickBreak(usedNames, ageRange), isGenerated: false });
            }
          }
        } else {
          throw new Error('No JSON array in AI response');
        }
      } catch {
        // Fall back to DB breaks
        for (const slot of allSlots) {
          generated.push({ ...slot, ...pickBreak(usedNames, ageRange), isGenerated: false });
        }
      }
    }
  } else {
    // Full DB fallback
    for (const slot of allSlots) {
      generated.push({ ...slot, ...pickBreak(usedNames, ageRange), isGenerated: false });
    }
  }

  // Save schedule
  try {
    const saved = await prisma.movementBreakSchedule.create({
      data: {
        schoolId: effectiveSchoolId || undefined,
        teacherId: req.user.id,
        ageRange: ageRange || '6-8',
        mode: mode || 'mixed',
        slots: JSON.stringify(slots),
        generated: JSON.stringify(generated),
      },
    });
    res.json({ id: saved.id, generated, mode, ageRange });
  } catch {
    // Return even if save fails
    res.json({ generated, mode, ageRange });
  }
});

export default router;
