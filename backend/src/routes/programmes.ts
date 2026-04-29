import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import prisma from '../db';
import { authenticate } from '../middleware/auth';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const router = express.Router();

// Get all programme blocks
router.get('/', authenticate, async (req: any, res) => {
  try {
    const { type } = req.query;
    const effectiveSchoolId = req.user.role !== 'admin'
      ? req.user.schoolId
      : (req.query.schoolId as string | undefined);
    const programmes = await prisma.programmeBlock.findMany({
      where: {
        ...(effectiveSchoolId ? { schoolId: effectiveSchoolId } : {}),
        ...(type ? { type: type as string } : {}),
      },
      include: {
        school: true,
        bookings: { include: { class: true, coach: true } },
      },
    });
    res.json(programmes);
  } catch (error) {
    console.error('Get programmes error:', error);
    res.status(500).json({ error: 'Failed to fetch programmes' });
  }
});

// Create programme block
router.post('/', authenticate, async (req: any, res) => {
  try {
    const { name, description, duration, type } = req.body;
    const effectiveSchoolId = req.user.role === 'admin' ? (req.body.schoolId ?? req.user.schoolId) : req.user.schoolId;
    const programme = await prisma.programmeBlock.create({
      data: {
        name,
        description,
        duration,
        type,
        school: { connect: { id: effectiveSchoolId } },
      },
      include: { school: true },
    });
    res.status(201).json(programme);
  } catch (error) {
    console.error('Create programme error:', error);
    res.status(400).json({ error: 'Failed to create programme' });
  }
});

// Get programme by ID
router.get('/:id', authenticate, async (req: any, res) => {
  try {
    const programme = await prisma.programmeBlock.findUnique({
      where: { id: req.params.id },
      include: {
        school: true,
        bookings: {
          include: {
            class: { include: { school: true } },
            coach: true,
          },
        },
      },
    });
    if (!programme) return res.status(404).json({ error: 'Programme not found' });
    if (req.user.role !== 'admin' && programme.schoolId !== req.user.schoolId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    res.json(programme);
  } catch (error) {
    console.error('Get programme error:', error);
    res.status(500).json({ error: 'Failed to fetch programme' });
  }
});

// Update programme
router.put('/:id', authenticate, async (req: any, res) => {
  try {
    const existing = await prisma.programmeBlock.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: 'Programme not found' });
    if (req.user.role !== 'admin' && existing.schoolId !== req.user.schoolId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const { name, description, duration, type } = req.body;
    const programme = await prisma.programmeBlock.update({
      where: { id: req.params.id },
      data: { name, description, duration, type },
      include: { school: true },
    });
    res.json(programme);
  } catch (error) {
    console.error('Update programme error:', error);
    res.status(400).json({ error: 'Failed to update programme' });
  }
});

// Delete programme
router.delete('/:id', authenticate, async (req: any, res) => {
  try {
    const existing = await prisma.programmeBlock.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: 'Programme not found' });
    if (req.user.role !== 'admin' && existing.schoolId !== req.user.schoolId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    await prisma.programmeBlock.delete({ where: { id: req.params.id } });
    res.json({ message: 'Programme deleted' });
  } catch (error) {
    console.error('Delete programme error:', error);
    res.status(500).json({ error: 'Failed to delete programme' });
  }
});

// Generate a 6-week PE programme using Claude
router.post('/generate', authenticate, async (req, res) => {
  const { classLevel } = req.body;

  if (!classLevel) {
    return res.status(400).json({ error: 'classLevel is required' });
  }

  const levelDescriptions: Record<string, string> = {
    'Infants':  'Junior and Senior Infants (ages 4–6). Activities should be simple, playful, and focus on basic movement exploration. Short attention spans — keep instructions minimal.',
    '1st-2nd':  '1st and 2nd class (ages 6–8). Building on basics with slightly more structured tasks. Still very play-based but can follow simple rules.',
    '3rd-4th':  '3rd and 4th class (ages 8–10). Developing more complex movement patterns and beginning to apply skills in game-like situations.',
    '5th-6th':  '5th and 6th class (ages 10–12). More advanced skill refinement, tactics, and cooperative or competitive activities.',
  };

  const prompt = `You are a primary school PE specialist in Ireland. Generate a 6-week PE programme for ${classLevel} (${levelDescriptions[classLevel] || classLevel}).

The programme must cover the 15 Active Roots Academy Fundamental Movement Skills (FMS):
Running, Jumping, Hopping, Skipping, Galloping, Leaping, Sliding, Throwing, Catching, Kicking, Striking, Bouncing/Dribbling, Rolling, Balancing, Dodging.

Each week should focus on 1–2 FMS skills. Vary the skills across the 6 weeks.

Return ONLY a valid JSON object in this exact format, no other text:
{
  "title": "6-Week PE Programme – ${classLevel}",
  "classLevel": "${classLevel}",
  "weeks": [
    {
      "week": 1,
      "skillFocus": ["Skill1", "Skill2"],
      "warmUp": "Description of warm-up activity (2-3 sentences)",
      "skillFocusDescription": "How to teach and practise the skill focus this week (3-4 sentences, age-appropriate)",
      "activity1": { "name": "Activity name", "description": "Full description (3-4 sentences)", "duration": "10 mins" },
      "activity2": { "name": "Activity name", "description": "Full description (3-4 sentences)", "duration": "10 mins" },
      "coolDown": "Description of cool-down activity (2 sentences)",
      "equipment": ["item1", "item2", "item3"]
    }
  ]
}`;

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return res.status(500).json({ error: 'Failed to parse AI response' });
    }

    const programme = JSON.parse(jsonMatch[0]);
    res.json(programme);
  } catch (error: any) {
    console.error('Generate programme error:', error);
    if (error?.status === 400 || error?.message?.includes('API key')) {
      return res.status(500).json({ error: 'Invalid Gemini API key. Add GEMINI_API_KEY to your .env file.' });
    }
    res.status(500).json({ error: 'Failed to generate programme' });
  }
});

export default router;
