import express from 'express';
import prisma from '../db';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Get all FMS skills (with relations)
router.get('/', authenticate, async (req, res) => {
  try {
    const { category } = req.query;
    const skills = await prisma.fMSSkill.findMany({
      where: category ? { category: category as string } : {},
      include: {
        progressions: { orderBy: { order: 'asc' } },
        cues: true,
        errors: true,
      },
      orderBy: { name: 'asc' },
    });
    res.json(skills);
  } catch (error) {
    console.error('Get FMS skills error:', error);
    res.status(500).json({ error: 'Failed to fetch FMS skills' });
  }
});

// Get single FMS skill by slug
router.get('/:slug', authenticate, async (req, res) => {
  try {
    const skill = await prisma.fMSSkill.findUnique({
      where: { slug: req.params.slug },
      include: {
        progressions: { orderBy: [{ direction: 'asc' }, { order: 'asc' }] },
        cues: true,
        errors: true,
      },
    });
    if (!skill) return res.status(404).json({ error: 'Skill not found' });
    res.json(skill);
  } catch (error) {
    console.error('Get FMS skill error:', error);
    res.status(500).json({ error: 'Failed to fetch skill' });
  }
});

// Create FMS skill (admin)
router.post('/', authenticate, async (req, res) => {
  try {
    const { name, slug, category, description, ageGroups, equipment, spaceNeeded, tags, isScoilnet } = req.body;
    const skill = await prisma.fMSSkill.create({
      data: {
        name, slug, category, description,
        ageGroups: typeof ageGroups === 'string' ? ageGroups : JSON.stringify(ageGroups),
        equipment: typeof equipment === 'string' ? equipment : JSON.stringify(equipment),
        spaceNeeded: spaceNeeded || 'both',
        tags: typeof tags === 'string' ? tags : JSON.stringify(tags),
        isScoilnet: isScoilnet ?? true,
      },
    });
    res.status(201).json(skill);
  } catch (error) {
    console.error('Create FMS skill error:', error);
    res.status(400).json({ error: 'Failed to create skill' });
  }
});

// Add a cue to a skill
router.post('/:skillId/cues', authenticate, async (req, res) => {
  try {
    const { cue, ageGroup, cueType } = req.body;
    const created = await prisma.fMSCue.create({
      data: { skillId: req.params.skillId, cue, ageGroup, cueType: cueType || 'verbal' },
    });
    res.status(201).json(created);
  } catch (error) {
    res.status(400).json({ error: 'Failed to add cue' });
  }
});

// Add a progression/regression to a skill
router.post('/:skillId/progressions', authenticate, async (req, res) => {
  try {
    const { direction, description, ageGroup, difficulty, notes, order } = req.body;
    const created = await prisma.fMSProgression.create({
      data: {
        skillId: req.params.skillId,
        direction, description, ageGroup,
        difficulty: difficulty || 3,
        notes,
        order: order || 0,
      },
    });
    res.status(201).json(created);
  } catch (error) {
    res.status(400).json({ error: 'Failed to add progression' });
  }
});

// Add a common error to a skill
router.post('/:skillId/errors', authenticate, async (req, res) => {
  try {
    const { error, correction, ageGroup } = req.body;
    const created = await prisma.fMSCommonError.create({
      data: { skillId: req.params.skillId, error, correction, ageGroup },
    });
    res.status(201).json(created);
  } catch (error) {
    res.status(400).json({ error: 'Failed to add error entry' });
  }
});

export default router;
