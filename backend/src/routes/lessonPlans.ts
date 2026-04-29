import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import prisma from '../db';
import { authenticate } from '../middleware/auth';

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const LEVEL_DESCRIPTIONS: Record<string, string> = {
  'Infants':  'Junior and Senior Infants (ages 4–6). Very short attention spans. Play-based, exploratory, minimal instructions. Use imagination and animal themes.',
  '1st-2nd':  '1st and 2nd class (ages 6–8). Simple rules, partner work, building patterns. Still very play-based but can follow 2-step instructions.',
  '3rd-4th':  '3rd and 4th class (ages 8–10). More complex patterns, small group tasks, beginning to apply skills in game-like situations.',
  '5th-6th':  '5th and 6th class (ages 10–12). Skill refinement, tactical awareness, competitive and cooperative activities, leadership opportunities.',
};

// ─── Fallback: single lesson plan from FMS database ────────────────────────
async function buildFallbackPlan(classLevel: string, duration: number, skillFocus: string[], equipment: string[]) {
  const skills = await prisma.fMSSkill.findMany({
    where: { name: { in: skillFocus } },
    include: {
      cues: true,
      progressions: { orderBy: { difficulty: 'asc' } },
      errors: true,
    },
  });

  const usedSkills = skills.length > 0 ? skills : await prisma.fMSSkill.findMany({
    take: skillFocus.length || 2,
    include: { cues: true, progressions: { orderBy: { difficulty: 'asc' } }, errors: true },
  });

  const primary = usedSkills[0];
  const secondary = usedSkills[1];
  const isYoung = classLevel === 'Infants' || classLevel === '1st-2nd';
  const warmMins = Math.round(duration * 0.15);
  const mainMins = Math.round(duration * 0.60);
  const coolMins = duration - warmMins - mainMins;

  const primaryCues = primary?.cues.map(c => c.cue) ?? [];
  const secondaryCues = secondary?.cues.map(c => c.cue) ?? [];
  const allCues = [...primaryCues, ...secondaryCues].slice(0, 4);
  const regressions = primary?.progressions.filter(p => p.direction === 'regression') ?? [];
  const progressions = primary?.progressions.filter(p => p.direction === 'progression') ?? [];
  const topError = primary?.errors[0];

  const availableEquip = equipment.filter(e => e !== 'None (classroom/minimal space)');
  const allEquipment = availableEquip.length > 0 ? availableEquip.slice(0, 4) : ['Cones', 'Open floor space'];

  const skillNames = usedSkills.map(s => s.name);

  return {
    title: `${skillNames.join(' & ')} — ${classLevel} (${duration} min)`,
    classLevel,
    duration,
    skillFocus: skillNames,
    warmUp: {
      duration: `${warmMins} mins`,
      activity: isYoung ? `Movement Exploration — "${primary?.name ?? 'Movement'} Animals"` : `Dynamic ${primary?.name ?? 'Movement'} Warm-Up`,
      description: isYoung
        ? `Children move around the space in different ways — galloping like horses, hopping like frogs, or sliding like penguins. Teacher calls out an animal and children change their movement. Focus on spatial awareness and listening. Gradually increase the pace.`
        : `Begin with a light jog around the space. Teacher calls "freeze" and demonstrates a ${primary?.name ?? 'movement'} action — children copy and hold the position for 3 seconds. Repeat with increasing intensity. Finish with dynamic stretches targeting legs and arms.`,
      coachingPoints: allCues.slice(0, 2).length > 0 ? allCues.slice(0, 2) : [`Keep your eyes up and be aware of other children`, `Land softly and stay in control`],
      diagram: `→ → [CONE] → →\n↑  Jog freely  ↓\n← ← [CONE] ← ←\nFreeze on signal`,
    },
    mainActivity: {
      duration: `${mainMins} mins`,
      activity: secondary ? `${primary.name} & ${secondary.name} Circuit` : `${primary?.name ?? 'FMS'} Skills Station`,
      description: secondary
        ? `Set up 4 stations around the hall — two focusing on ${primary.name} and two on ${secondary.name}. Groups of 4–5 rotate every ${Math.round(mainMins / 4)} minutes. At each station a task card shows the challenge. Teacher circulates to observe and give individual feedback.`
        : `Children work in pairs to practise ${primary?.name ?? 'the skill'} using available space. Partner A performs the skill while Partner B watches and gives one piece of feedback. Switch roles after 90 seconds. Progress to a challenge using the skill after 2 rounds.`,
      coachingPoints: allCues.slice(0, 3).length > 0 ? allCues.slice(0, 3) : [`Watch your partner and give specific feedback`, `Quality over speed — do it right first`, `Challenge yourself to try the harder version`],
      differentiation: {
        easier: regressions[0]?.description ?? `Reduce the distance or height. Allow extra time. Use a larger, slower ball if equipment is involved.`,
        harder: progressions[progressions.length - 1]?.description ?? `Add a second skill, increase speed, reduce recovery time, or introduce a competitive element between pairs.`,
      },
      diagram: secondary
        ? `[ST.1]──────[ST.2]\n  ${primary.name}    ${secondary.name}\n[ST.4]──────[ST.3]\n  ${secondary.name}    ${primary.name}\n→ Rotate every ${Math.round(mainMins / 4)} mins`
        : `[PLAYER A] ←→ [PLAYER B]\n      ↑ [BALL/CONE] ↑\n    Work in pairs`,
    },
    coolDown: {
      duration: `${coolMins} mins`,
      activity: 'Reflection Circle & Stretch',
      description: `Bring the class together in a circle. Teacher leads 3–4 static stretches targeting muscles used in the lesson. Ask children: "What did we practise today?" and "What was tricky?" Finish with a breathing exercise — breathe in for 4 counts, hold for 2, out for 4.`,
    },
    equipment: allEquipment,
    safetyNotes: topError
      ? `Watch for: ${topError.error}. Correction: ${topError.correction}. Ensure adequate space between children and remove trip hazards before the session.`
      : `Ensure adequate space between children. Check the floor is dry and free of hazards. Remind children of stop signals before activity begins.`,
    teacherTips: `This plan was built from the Active Roots FMS knowledge base. ${isYoung ? 'Keep instructions short and use visual demonstrations — young children learn through watching and doing, not listening.' : 'Use peer coaching to develop both skill and communication. Children explaining a skill to each other reinforces their own understanding.'}`,
    generatedBy: 'database',
  };
}

// ─── Fallback: multi-week programme from FMS database ──────────────────────
async function buildFallbackProgramme(classLevel: string, weeks: number, skillFocus: string[], equipment: string[]) {
  const skills = await prisma.fMSSkill.findMany({
    where: skillFocus.length > 0 ? { name: { in: skillFocus } } : {},
    include: { cues: true, progressions: { orderBy: { difficulty: 'asc' } }, errors: true },
    take: Math.max(skillFocus.length || 3, 3),
  });

  const usedSkills = skills.length > 0 ? skills : await prisma.fMSSkill.findMany({
    take: 3,
    include: { cues: true, progressions: { orderBy: { difficulty: 'asc' } }, errors: true },
  });

  const isYoung = classLevel === 'Infants' || classLevel === '1st-2nd';
  const availableEquip = equipment.filter(e => e !== 'None (classroom/minimal space)');
  const baseEquip = availableEquip.length > 0 ? availableEquip : ['Cones', 'Open floor space'];

  const weekPlans = [];
  for (let w = 1; w <= weeks; w++) {
    const skillIdx = (w - 1) % usedSkills.length;
    const skill = usedSkills[skillIdx];
    const nextSkill = usedSkills[(skillIdx + 1) % usedSkills.length];
    const phase = w <= Math.floor(weeks * 0.33) ? 'introduce' : w <= Math.floor(weeks * 0.66) ? 'develop' : 'apply';
    const cues = skill.cues.map(c => c.cue).slice(0, 3);
    const progressions = skill.progressions.filter(p => p.direction === 'progression');
    const regressions = skill.progressions.filter(p => p.direction === 'regression');
    const weekEquip = baseEquip.slice(0, 3);

    weekPlans.push({
      weekNumber: w,
      theme: phase === 'introduce'
        ? `Introduction: ${skill.name}`
        : phase === 'develop'
        ? `Development: ${skill.name} & ${nextSkill.name}`
        : `Application: ${skill.name} in Games`,
      skillFocus: phase === 'develop' ? [skill.name, nextSkill.name] : [skill.name],
      warmUp: {
        activity: isYoung ? `${skill.name} Exploration Game` : `Dynamic ${skill.name} Warm-Up`,
        description: isYoung
          ? `Children move around the space exploring ${skill.name.toLowerCase()} in different ways. Use animal characters and call-and-response to keep energy high.`
          : `Jog around the space. On "freeze", perform a ${skill.name.toLowerCase()} action and hold. Increase intensity over 5 minutes.`,
        coachingPoints: cues.slice(0, 2).length > 0 ? cues.slice(0, 2) : ['Stay aware of others in the space', 'Land softly and stay in control'],
        duration: '5 mins',
        diagram: `→ → [CONE] → →\n↑  Move freely  ↓\n← ← [CONE] ← ←\nFreeze on signal`,
      },
      mainActivity: {
        activity: phase === 'apply'
          ? `${skill.name} Team Challenge`
          : phase === 'develop'
          ? `${skill.name} & ${nextSkill.name} Rotation`
          : `${skill.name} Partner Practice`,
        description: phase === 'introduce'
          ? `Pairs practise ${skill.name.toLowerCase()} — one performs, one observes and gives feedback. Switch every 90 seconds. Focus on quality over speed.`
          : phase === 'develop'
          ? `3-station rotation: Station 1 focuses on ${skill.name}, Station 2 on ${nextSkill.name}, Station 3 combines both. Groups rotate every 5 minutes.`
          : `Small teams apply ${skill.name.toLowerCase()} in a modified game. Score points by demonstrating the skill correctly. Increase challenge as confidence grows.`,
        coachingPoints: cues.length > 0 ? cues : ['Quality over speed', 'Encourage and support your partner', 'Challenge yourself with the harder version'],
        differentiation: {
          easier: regressions[0]?.description ?? 'Reduce distance, slow pace, use larger equipment, work with a partner for support.',
          harder: progressions[progressions.length - 1]?.description ?? 'Add speed, reduce space, combine skills, introduce light competition.',
        },
        duration: '25 mins',
        diagram: phase === 'develop'
          ? `[ST.1: ${skill.name}]─→─[ST.2: ${nextSkill.name}]\n           ↓               ↑\n     [ST.3: Combined]──→──`
          : phase === 'apply'
          ? `[TEAM A] ←─── GAME ───→ [TEAM B]\n         Use ${skill.name}`
          : `[A] ↔ [B]  [C] ↔ [D]\n  Pairs practice`,
      },
      coolDown: {
        activity: 'Reflection Circle & Stretch',
        description: `Circle up. 3–4 static stretches for muscles used. Ask: "What improved today?" and "What will we focus on next time?" Close with 4-count breathing.`,
        duration: '5 mins',
      },
      equipment: weekEquip,
      teacherTips: `Week ${w}/${weeks} · ${phase}: ${
        phase === 'introduce' ? 'Focus on exploration and confidence. Correct form matters but keep energy positive and fun.'
        : phase === 'develop' ? 'Look for children ready for the harder variation. Use peer assessment to deepen understanding.'
        : 'Apply skills in game situations. Children who struggle should revisit the development activities.'
      }`,
    });
  }

  return {
    title: `${usedSkills.map(s => s.name).slice(0, 2).join(' & ')} — ${classLevel} (${weeks} Weeks)`,
    classLevel,
    totalWeeks: weeks,
    skillFocus: usedSkills.map(s => s.name),
    equipment: baseEquip,
    weeks: weekPlans,
    generatedBy: 'database',
  };
}

// ─── Routes ───────────────────────────────────────────────────────────────────

router.get('/', authenticate, async (req: any, res) => {
  try {
    const { classLevel } = req.query;
    const effectiveSchoolId = req.user.role !== 'admin' ? req.user.schoolId : (req.query.schoolId as string | undefined);
    const plans = await prisma.lessonPlan.findMany({
      where: {
        ...(effectiveSchoolId ? { schoolId: effectiveSchoolId } : {}),
        ...(classLevel ? { classLevel: classLevel as string } : {}),
      },
      include: { school: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(plans);
  } catch (error) {
    console.error('Get lesson plans error:', error);
    res.status(500).json({ error: 'Failed to fetch lesson plans' });
  }
});

// Must be before /:id to avoid route conflict
router.get('/programmes', authenticate, async (req: any, res) => {
  try {
    const effectiveSchoolId = req.user.role !== 'admin' ? req.user.schoolId : (req.query.schoolId as string | undefined);
    const programmes = await prisma.generatedProgramme.findMany({
      where: effectiveSchoolId ? { schoolId: effectiveSchoolId } : {},
      orderBy: { createdAt: 'desc' },
    });
    res.json(programmes);
  } catch {
    res.status(500).json({ error: 'Failed to fetch programmes' });
  }
});

router.delete('/programmes/:id', authenticate, async (req: any, res) => {
  try {
    const existing = await prisma.generatedProgramme.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: 'Programme not found' });
    if (req.user.role !== 'admin' && existing.schoolId !== req.user.schoolId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    await prisma.generatedProgramme.delete({ where: { id: req.params.id } });
    res.json({ message: 'Programme deleted' });
  } catch {
    res.status(500).json({ error: 'Failed to delete programme' });
  }
});

router.post('/generate-programme', authenticate, async (req: any, res) => {
  const { classLevel, weeks, skillFocus, equipment } = req.body;
  const effectiveSchoolId = req.user.role === 'admin' ? (req.body.schoolId ?? undefined) : req.user.schoolId;

  if (!classLevel || !weeks || !skillFocus?.length) {
    return res.status(400).json({ error: 'classLevel, weeks, and skillFocus are required' });
  }

  const totalWeeks = Math.min(Math.max(Number(weeks) || 6, 1), 24);
  const hasApiKey = process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_api_key_here';

  const skills = await prisma.fMSSkill.findMany({
    where: { name: { in: skillFocus } },
    include: {
      cues: true,
      progressions: { where: { direction: 'progression' }, orderBy: { difficulty: 'asc' }, take: 2 },
      errors: { take: 1 },
    },
  });

  const skillContext = skills.map(s => `
Skill: ${s.name} (${s.category})
Cues: ${s.cues.slice(0, 3).map(c => c.cue).join(' | ')}
Progressions: ${s.progressions.map(p => p.description).join(' | ')}
  `).join('\n').trim();

  const equipList = (equipment as string[] || []).filter(e => e !== 'None (classroom/minimal space)');
  const equipText = equipList.length > 0 ? equipList.join(', ') : 'minimal equipment (cones, open space)';

  let generated: any = null;
  let source: 'ai' | 'database' = 'ai';

  if (hasApiKey) {
    try {
      const prompt = `You are a PE specialist for Irish primary schools. Generate a ${totalWeeks}-week PE programme for ${classLevel}: ${LEVEL_DESCRIPTIONS[classLevel] || classLevel}

Skill focus: ${skillFocus.join(', ')}
Available equipment ONLY (use nothing else): ${equipText}
FMS knowledge:
${skillContext || 'Use best-practice FMS methodology.'}

Rules:
- Progress difficulty gradually across ${totalWeeks} weeks (introduce → develop → apply)
- Only use listed equipment
- Be concise — each section 2-3 sentences
- Diagrams: 2-3 lines of text using → ← ↑ ↓ [CONE] [PLAYER] [BALL] [HOOP] symbols

Return ONLY valid JSON:
{
  "title": "Programme title",
  "classLevel": "${classLevel}",
  "totalWeeks": ${totalWeeks},
  "weeks": [
    {
      "weekNumber": 1,
      "theme": "Week theme",
      "skillFocus": ["skill"],
      "warmUp": {
        "activity": "name",
        "description": "2-3 sentences",
        "duration": "5 mins",
        "coachingPoints": ["p1", "p2"],
        "diagram": "2-3 line text diagram"
      },
      "mainActivity": {
        "activity": "name",
        "description": "3-4 sentences",
        "duration": "25 mins",
        "coachingPoints": ["p1", "p2", "p3"],
        "differentiation": { "easier": "...", "harder": "..." },
        "diagram": "2-3 line text diagram"
      },
      "coolDown": {
        "activity": "name",
        "description": "2 sentences",
        "duration": "5 mins"
      },
      "equipment": ["item"],
      "teacherTips": "1 practical tip"
    }
  ]
}`;

      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        generated = JSON.parse(jsonMatch[0]);
        source = 'ai';
      }
    } catch (aiError: any) {
      const isQuota = aiError?.status === 429 || aiError?.message?.includes('quota') || aiError?.message?.includes('RESOURCE_EXHAUSTED');
      const isKeyError = aiError?.status === 400 || aiError?.message?.includes('API key');
      if (isKeyError) {
        return res.status(500).json({ error: 'Invalid Gemini API key.' });
      }
      if (!isQuota) console.error('AI programme error:', aiError);
    }
  }

  if (!generated) {
    try {
      generated = await buildFallbackProgramme(classLevel, totalWeeks, skillFocus, equipment || []);
      source = 'database';
    } catch (dbError) {
      console.error('Fallback programme error:', dbError);
      return res.status(500).json({ error: 'Failed to generate programme' });
    }
  }

  try {
    const saved = await prisma.generatedProgramme.create({
      data: {
        title: generated.title,
        classLevel: generated.classLevel,
        totalWeeks: generated.totalWeeks ?? totalWeeks,
        skillFocus: JSON.stringify(generated.weeks?.[0]?.skillFocus ?? skillFocus),
        equipment: JSON.stringify(equipList),
        weeks: JSON.stringify(generated.weeks),
        schoolId: effectiveSchoolId || undefined,
        generatedBy: source,
      },
    });
    res.json({ ...generated, id: saved.id, createdAt: saved.createdAt, generatedBy: source });
  } catch {
    res.json({ ...generated, generatedBy: source });
  }
});

router.get('/:id', authenticate, async (req: any, res) => {
  try {
    const plan = await prisma.lessonPlan.findUnique({
      where: { id: req.params.id },
      include: { school: true },
    });
    if (!plan) return res.status(404).json({ error: 'Lesson plan not found' });
    if (req.user.role !== 'admin' && plan.schoolId !== req.user.schoolId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    res.json(plan);
  } catch {
    res.status(500).json({ error: 'Failed to fetch lesson plan' });
  }
});

router.delete('/:id', authenticate, async (req: any, res) => {
  try {
    const existing = await prisma.lessonPlan.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: 'Lesson plan not found' });
    if (req.user.role !== 'admin' && existing.schoolId !== req.user.schoolId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    await prisma.lessonPlan.delete({ where: { id: req.params.id } });
    res.json({ message: 'Lesson plan deleted' });
  } catch {
    res.status(500).json({ error: 'Failed to delete lesson plan' });
  }
});

router.post('/generate', authenticate, async (req: any, res) => {
  const { classLevel, duration, skillFocus, equipment } = req.body;
  const effectiveSchoolId = req.user.role === 'admin' ? (req.body.schoolId ?? undefined) : req.user.schoolId;

  if (!classLevel || !duration || !skillFocus?.length) {
    return res.status(400).json({ error: 'classLevel, duration, and skillFocus are required' });
  }

  const hasApiKey = process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_api_key_here';

  const skills = await prisma.fMSSkill.findMany({
    where: { name: { in: skillFocus } },
    include: {
      cues: true,
      progressions: { where: { direction: 'progression' }, orderBy: { difficulty: 'asc' }, take: 3 },
      errors: true,
    },
  });

  const skillContext = skills.map(s => `
Skill: ${s.name} (${s.category})
Teaching cues: ${s.cues.map(c => c.cue).join(' | ')}
Common errors to avoid: ${s.errors.map(e => `${e.error} → ${e.correction}`).join(' | ')}
Progressions available: ${s.progressions.map(p => p.description).join(' | ')}
  `).join('\n');

  const equipList = (equipment as string[] || []).filter(e => e !== 'None (classroom/minimal space)');
  const equipText = equipList.length > 0 ? equipList.join(', ') : 'minimal/no equipment';

  let generated: any = null;
  let source: 'ai' | 'database' = 'ai';

  if (hasApiKey) {
    try {
      const prompt = `You are a primary school PE specialist in Ireland with deep knowledge of Fundamental Movement Skills (FMS) and physical literacy.

Generate a ${duration}-minute PE lesson plan for ${classLevel}: ${LEVEL_DESCRIPTIONS[classLevel] || classLevel}

SKILL FOCUS: ${skillFocus.join(', ')}
AVAILABLE EQUIPMENT ONLY (do not use other equipment): ${equipText}

INTERNAL KNOWLEDGE BASE FOR THESE SKILLS:
${skillContext || 'Use best-practice FMS teaching methodology.'}

REQUIREMENTS:
- Align with the Active Roots Academy FMS framework and the Irish Primary PE curriculum.
- Only use equipment from the list above.
- Include simple text diagrams (2-3 lines using → ← ↑ ↓ [CONE] [PLAYER] [BALL] [HOOP]).
- Be inclusive and differentiated.
- Equipment must match what was listed.

Return ONLY valid JSON in this exact format, no extra text:
{
  "title": "Descriptive lesson title",
  "classLevel": "${classLevel}",
  "duration": ${duration},
  "skillFocus": ${JSON.stringify(skillFocus)},
  "warmUp": {
    "duration": "5 mins",
    "activity": "Name",
    "description": "Full teacher instructions (3-4 sentences)",
    "coachingPoints": ["point 1", "point 2"],
    "diagram": "2-3 line text diagram"
  },
  "mainActivity": {
    "duration": "${Math.round(duration * 0.55)} mins",
    "activity": "Name",
    "description": "Full description (4-5 sentences)",
    "coachingPoints": ["point 1", "point 2", "point 3"],
    "differentiation": {
      "easier": "How to make it easier",
      "harder": "How to challenge those who are ready"
    },
    "diagram": "2-3 line text diagram"
  },
  "coolDown": {
    "duration": "5 mins",
    "activity": "Name",
    "description": "Full description (2-3 sentences)"
  },
  "equipment": ["item1", "item2"],
  "safetyNotes": "Key safety considerations",
  "teacherTips": "1-2 practical tips"
}`;

      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        generated = JSON.parse(jsonMatch[0]);
        source = 'ai';
      }
    } catch (aiError: any) {
      const isQuota = aiError?.status === 429 || aiError?.message?.includes('quota') || aiError?.message?.includes('RESOURCE_EXHAUSTED');
      const isKeyError = aiError?.status === 400 || aiError?.message?.includes('API key');
      if (isKeyError) return res.status(500).json({ error: 'Invalid Gemini API key.' });
      if (!isQuota) console.error('AI generation error:', aiError);
    }
  }

  if (!generated) {
    try {
      generated = await buildFallbackPlan(classLevel, duration, skillFocus, equipment || []);
      source = 'database';
    } catch (dbError) {
      console.error('Fallback generation error:', dbError);
      return res.status(500).json({ error: 'Failed to generate lesson plan' });
    }
  }

  try {
    const saved = await prisma.lessonPlan.create({
      data: {
        title: generated.title,
        classLevel: generated.classLevel,
        duration: generated.duration,
        skillFocus: JSON.stringify(generated.skillFocus),
        warmUp: JSON.stringify(generated.warmUp),
        mainActivity: JSON.stringify(generated.mainActivity),
        coolDown: JSON.stringify(generated.coolDown),
        equipment: JSON.stringify(generated.equipment),
        notes: JSON.stringify({ safetyNotes: generated.safetyNotes, teacherTips: generated.teacherTips }),
        schoolId: effectiveSchoolId || undefined,
        generatedBy: source,
      },
      include: { school: true },
    });
    res.json({ ...generated, id: saved.id, createdAt: saved.createdAt, generatedBy: source });
  } catch (saveError) {
    console.error('Save lesson plan error:', saveError);
    res.status(500).json({ error: 'Failed to save lesson plan' });
  }
});

export default router;
