import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import prisma from '../db';
import { authenticate } from '../middleware/auth';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const router = express.Router();

// ── Normalise form allergen labels to raw DB values ──────────────────────────
// Form sends "nut-free", "dairy-free" etc. — DB stores "nut", "dairy" etc.
const ALLERGEN_MAP: Record<string, string> = {
  'nut-free': 'nut',
  'dairy-free': 'dairy',
  'gluten-free': 'gluten',
  'egg-free': 'egg',
  'soy-free': 'soy',
  'fish-free': 'fish',
  'sesame-free': 'sesame',
  'shellfish-free': 'shellfish',
  'celery-free': 'celery',
};
function toRawAllergens(allergies: string[]): string[] {
  return allergies.map(a => ALLERGEN_MAP[a.toLowerCase()] ?? a.replace('-free', '').toLowerCase());
}

// ── Generate "why these foods are important" bullets ──────────────────────────
function buildWhyReasons(goals: string[], ageRange: string): string[] {
  const reasons: string[] = [];

  const goalReasons: Record<string, string> = {
    'energy boost':           'Wholegrains, oats, and fruit give steady energy that lasts through the whole school day',
    'focus & concentration':  'Protein and iron-rich foods help the brain stay alert and focused in class',
    'trying new foods':       'Trying one new food each week helps taste buds grow and discover new favourites',
    'healthier snacks':       'Swapping sugary snacks for fruit or veg gives the body nutrients and keeps energy stable',
    'balanced diet':          'Eating a mix of colours from different food groups gives the body everything it needs to grow',
    'hydration':              'Water helps the brain work at full power — even mild thirst can make it harder to concentrate',
  };

  for (const g of (goals || [])) {
    if (goalReasons[g]) reasons.push(goalReasons[g]);
  }

  const base = [
    'Protein helps muscles grow strong and repair after activity',
    'Fibre keeps the digestive system healthy and comfortable',
    'Fruit and vegetables provide vitamins that help the body fight germs',
    'Wholegrains release energy slowly — perfect for long school mornings',
  ];

  if (ageRange === '4-5' || ageRange === '6-7') {
    reasons.push('Calcium and vitamin D build strong bones during the most important years of growth');
  } else if (ageRange === '10-11' || ageRange === '12+') {
    reasons.push('Iron is especially important at this age to support growth and maintain energy levels');
  }

  for (const r of base) {
    if (reasons.length >= 4) break;
    if (!reasons.includes(r)) reasons.push(r);
  }

  return reasons.slice(0, 4);
}

// ── Fallback: build a nutrition plan from the food database ────────────────
async function buildFallbackNutritionPlan(
  ageRange: string,
  preferences: string[],
  allergies: string[],
  pickyEaterLevel: string,
  favouriteFoods: string,
  goals: string[],
) {
  const rawAllergies = toRawAllergens(allergies || []);

  // Strict allergen filter — exclude ANY food whose allergen list overlaps with selected allergens
  const allFoods = await prisma.foodItem.findMany();

  const safe = allFoods.filter(f => {
    const foodAllergens: string[] = JSON.parse(f.allergens || '[]').map((a: string) => a.toLowerCase().trim());
    return !foodAllergens.some(a => rawAllergies.includes(a));
  });

  // Score foods by preference match
  const score = (f: (typeof safe)[0]) => {
    const prefs: string[] = JSON.parse(f.preferences || '[]');
    const age: string[] = JSON.parse(f.ageGroups || '["all"]');
    let s = 0;
    if (preferences.length) s += prefs.filter(p => preferences.includes(p)).length * 2;
    if (age.includes('all') || age.includes(ageRange)) s += 1;
    return s;
  };

  const ranked = [...safe].sort((a, b) => score(b) - score(a));

  const pick = (mealType: string, n: number) =>
    ranked
      .filter(f => {
        const mt: string[] = JSON.parse(f.mealTypes || '[]');
        return mt.includes(mealType);
      })
      .slice(0, n)
      .map(f => `${f.name} — ${f.description}`);

  const breakfastIdeas = pick('breakfast', 5);
  const lunchboxIdeas = pick('lunchbox', 5);
  const snackOptions = pick('snack', 6);

  // Hydration — pull drinks
  const drinks = ranked.filter(f => {
    const mt: string[] = JSON.parse(f.mealTypes || '[]');
    return f.category === 'drink' || mt.includes('drink');
  }).slice(0, 3).map(f => f.description);

  // Picky eater strategies based on level
  const pickyStrategies: Record<string, string[]> = {
    mild: [
      'Offer 1–2 new foods alongside familiar favourites',
      'Let children help prepare meals to build curiosity',
      'Use dips like hummus or yogurt to make vegetables more appealing',
      'Keep portions small when introducing new foods',
    ],
    moderate: [
      'Serve a "bridge food" — something similar in colour or texture to a favourite',
      'Deconstruct meals so foods do not touch each other on the plate',
      'Use fun shapes and colours to make meals visually engaging',
      'Praise all tasting attempts, even tiny bites, without pressure',
      'Repeat exposure is key — offer a new food 10–15 times before concluding they dislike it',
    ],
    severe: [
      'Work with very small portions of 1–2 preferred foods alongside a single new item',
      'Try food chaining — slowly modify a favourite food (e.g. add a new flavour gradually)',
      'Involve the child in shopping and choosing their vegetables',
      'Use visual plates or divided containers so foods are clearly separated',
      'Consider referring to a specialist dietitian if meals cause significant family stress',
    ],
  };

  // Allergy alternatives
  const allergyAlternatives = allergies.map(a => {
    const map: Record<string, string> = {
      dairy: 'Replace dairy with fortified oat milk, coconut yogurt, or dairy-free cheese',
      gluten: 'Use rice cakes, corn wraps, gluten-free bread, or rice and potato as carbohydrate bases',
      nut: 'Replace nut butters with sunflower seed butter or pumpkin seed butter',
      egg: 'Use chia seeds or flaxseed mixed with water as an egg substitute in cooking',
      soy: 'Choose pea protein, oat milk, or rice milk instead of soy-based products',
      fish: 'Replace omega-3 from fish with flaxseed, chia seeds, and hemp seeds',
      sesame: 'Use olive oil-based dips instead of tahini or sesame-containing hummus',
      shellfish: 'Use chicken, turkey, or plant-based protein as alternatives',
    };
    return map[a] || `For ${a} allergy: always check food labels and choose certified ${a}-free products`;
  });

  if (allergyAlternatives.length === 0) allergyAlternatives.push('No specific allergens listed — serve a varied, balanced diet');

  const picky = pickyEaterLevel || 'mild';

  // All items in breakfastIdeas / lunchboxIdeas / snackOptions already come from `safe` (allergen-filtered)
  const safeMain = (ideas: string[], fallback: string) => ideas[0] ?? fallback;
  const safeAlts = (ideas: string[]) => ideas.slice(1, 3).map(s => s.split(' — ')[0]);

  const bf = safeMain(breakfastIdeas, 'Porridge oats with banana — Fibre + Iron');
  const lb = safeMain(lunchboxIdeas, 'Wholegrain bread with hummus and cucumber — Fibre + Calcium');
  const sn = safeMain(snackOptions, 'Apple slices — Vitamin C + Fibre');

  return {
    breakfast: {
      main: bf.split(' — ')[0] ?? bf,
      macroTag: bf.split(' — ')[1] ?? 'Fibre + Energy',
      alternatives: safeAlts(breakfastIdeas),
    },
    lunchbox: {
      main: lb.split(' — ')[0] ?? lb,
      macroTag: lb.split(' — ')[1] ?? 'Protein + Fibre',
      alternatives: safeAlts(lunchboxIdeas),
    },
    snack: {
      main: sn.split(' — ')[0] ?? sn,
      macroTag: sn.split(' — ')[1] ?? 'Vitamin C',
      alternatives: safeAlts(snackOptions),
    },
    hydration: {
      recommendation: ageRange === '4-5' || ageRange === '6-7'
        ? 'Aim for about 5 glasses (1 litre) of water throughout the school day.'
        : 'Aim for 6–8 glasses (1.2–1.5 litres) of water throughout the school day.',
      encouragement: 'Try to drink a glass of water at each meal and snack — keep a water bottle on the desk!',
    },
    pickyEaterStrategy: pickyStrategies[picky]?.slice(0, 2) ?? pickyStrategies.mild.slice(0, 2),
    whyFoodsAreImportant: buildWhyReasons(goals, ageRange),
    generatedBy: 'database',
  };
}

// ===== NUTRITION LESSONS =====
// Get all nutrition lessons
router.get('/lessons', authenticate, async (req, res) => {
  try {
    const lessons = await prisma.nutritionLesson.findMany();
    res.json(lessons);
  } catch (error) {
    console.error('Get lessons error:', error);
    res.status(500).json({ error: 'Failed to fetch lessons' });
  }
});

// Create nutrition lesson
router.post('/lessons', authenticate, async (req, res) => {
  try {
    const { title, description, resources } = req.body;
    const lesson = await prisma.nutritionLesson.create({
      data: {
        title,
        description,
        resources: typeof resources === 'string' ? resources : JSON.stringify(resources),
      },
    });
    res.status(201).json(lesson);
  } catch (error) {
    console.error('Create lesson error:', error);
    res.status(400).json({ error: 'Failed to create lesson' });
  }
});

// ===== NUTRITION RESOURCES =====
// Get all nutrition resources
router.get('/resources', authenticate, async (req, res) => {
  try {
    const resources = await prisma.nutritionResource.findMany();
    res.json(resources);
  } catch (error) {
    console.error('Get resources error:', error);
    res.status(500).json({ error: 'Failed to fetch resources' });
  }
});

// Create nutrition resource
router.post('/resources', authenticate, async (req, res) => {
  try {
    const { title, type, url, content } = req.body;
    const resource = await prisma.nutritionResource.create({
      data: { title, type, url, content },
    });
    res.status(201).json(resource);
  } catch (error) {
    console.error('Create resource error:', error);
    res.status(400).json({ error: 'Failed to create resource' });
  }
});

// ===== MOVEMENT BREAKS =====
// Get all movement breaks
router.get('/movement-breaks', authenticate, async (req, res) => {
  try {
    const { ageGroup } = req.query;
    const breaks = await prisma.movementBreak.findMany({
      where: ageGroup ? { ageGroup: ageGroup as string } : {},
    });
    res.json(breaks);
  } catch (error) {
    console.error('Get movement breaks error:', error);
    res.status(500).json({ error: 'Failed to fetch movement breaks' });
  }
});

// Create movement break
router.post('/movement-breaks', authenticate, async (req, res) => {
  try {
    const { title, description, duration, ageGroup, instructions } = req.body;
    const breakItem = await prisma.movementBreak.create({
      data: { title, description, duration, ageGroup, instructions },
    });
    res.status(201).json(breakItem);
  } catch (error) {
    console.error('Create movement break error:', error);
    res.status(400).json({ error: 'Failed to create movement break' });
  }
});

// ===== PLACEMENT STUDENTS =====
// Get all placement students
router.get('/placement-students', authenticate, async (req: any, res) => {
  try {
    const effectiveSchoolId = req.user.role !== 'admin' ? req.user.schoolId : (req.query.schoolId as string | undefined);
    const students = await prisma.placementStudent.findMany({
      where: effectiveSchoolId ? { schoolId: effectiveSchoolId } : {},
      include: { school: true },
    });
    res.json(students);
  } catch (error) {
    console.error('Get placement students error:', error);
    res.status(500).json({ error: 'Failed to fetch placement students' });
  }
});

// Create placement student
router.post('/placement-students', authenticate, async (req: any, res) => {
  try {
    const { name, yeartarget, collegeTarget, notes } = req.body;
    const effectiveSchoolId = req.user.role === 'admin' ? (req.body.schoolId ?? req.user.schoolId) : req.user.schoolId;
    const student = await prisma.placementStudent.create({
      data: {
        name,
        school: { connect: { id: effectiveSchoolId } },
        yeartarget,
        collegeTarget,
        notes,
      },
      include: { school: true },
    });
    res.status(201).json(student);
  } catch (error) {
    console.error('Create placement student error:', error);
    res.status(400).json({ error: 'Failed to create placement student' });
  }
});

// Get placement student by ID
router.get('/placement-students/:id', authenticate, async (req: any, res) => {
  try {
    const student = await prisma.placementStudent.findUnique({
      where: { id: req.params.id },
      include: { school: true },
    });
    if (!student) return res.status(404).json({ error: 'Student not found' });
    if (req.user.role !== 'admin' && student.schoolId !== req.user.schoolId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    res.json(student);
  } catch (error) {
    console.error('Get placement student error:', error);
    res.status(500).json({ error: 'Failed to fetch student' });
  }
});

// Update placement student
router.put('/placement-students/:id', authenticate, async (req: any, res) => {
  try {
    const existing = await prisma.placementStudent.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: 'Student not found' });
    if (req.user.role !== 'admin' && existing.schoolId !== req.user.schoolId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const { name, yeartarget, collegeTarget, notes } = req.body;
    const student = await prisma.placementStudent.update({
      where: { id: req.params.id },
      data: { name, yeartarget, collegeTarget, notes },
      include: { school: true },
    });
    res.json(student);
  } catch (error) {
    console.error('Update placement student error:', error);
    res.status(400).json({ error: 'Failed to update student' });
  }
});

// Delete placement student
router.delete('/placement-students/:id', authenticate, async (req: any, res) => {
  try {
    const existing = await prisma.placementStudent.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: 'Student not found' });
    if (req.user.role !== 'admin' && existing.schoolId !== req.user.schoolId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    await prisma.placementStudent.delete({ where: { id: req.params.id } });
    res.json({ message: 'Student deleted' });
  } catch (error) {
    console.error('Delete placement student error:', error);
    res.status(500).json({ error: 'Failed to delete student' });
  }
});

// ===== AI NUTRITION EXPERT =====

const VALID_AGE_RANGES = ['4-5', '6-7', '8-9', '10-11', '12+'];
const VALID_PICKY_LEVELS = ['mild', 'moderate', 'severe'];
const VALID_PREFERENCES = ['sweet', 'savoury', 'crunchy', 'soft', 'fruity', 'veggie-based', 'vegetarian', 'vegan'];
const VALID_ALLERGIES = ['nut-free', 'dairy-free', 'gluten-free', 'egg-free', 'soy-free', 'fish-free', 'sesame-free', 'shellfish-free', 'celery-free'];
const VALID_GOALS = ['energy boost', 'focus & concentration', 'trying new foods', 'healthier snacks', 'balanced diet', 'hydration'];

function sanitizeFreeText(value: unknown, maxLength = 200): string {
  if (typeof value !== 'string') return '';
  return value
    .replace(/[<>{}[\]\\]/g, '')
    .replace(/\b(ignore|forget|disregard|override|system|prompt|instruction|jailbreak)\b/gi, '')
    .trim()
    .slice(0, maxLength);
}

function allowList(value: unknown, valid: string[]): string[] {
  if (!Array.isArray(value)) return [];
  return (value as unknown[]).filter((v): v is string => typeof v === 'string' && valid.includes(v));
}

router.post('/generate', authenticate, async (req, res) => {
  const raw = req.body;

  const ageRange       = VALID_AGE_RANGES.includes(raw.ageRange) ? raw.ageRange : '';
  const pickyEaterLevel = VALID_PICKY_LEVELS.includes(raw.pickyEaterLevel) ? raw.pickyEaterLevel : 'mild';
  const preferences    = allowList(raw.preferences, VALID_PREFERENCES);
  const allergies      = allowList(raw.allergies, VALID_ALLERGIES);
  const goals          = allowList(raw.goals, VALID_GOALS);
  const favouriteFoods = sanitizeFreeText(raw.favouriteFoods);

  const hasApiKey = process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_api_key_here';
  if (!hasApiKey) {
    return res.status(503).json({ error: 'AI nutrition expert is not configured (missing API key).' });
  }

  const inputSummary = [
    ageRange ? `Age Range: ${ageRange}` : null,
    preferences.length ? `Food Preferences: ${preferences.join(', ')}` : null,
    allergies.length ? `Allergies / dietary requirements: ${allergies.join(', ')}` : null,
    pickyEaterLevel ? `Picky Eater Level: ${pickyEaterLevel}` : null,
    favouriteFoods ? `Favourite Foods: ${favouriteFoods}` : null,
    goals.length ? `Goals: ${goals.join(', ')}` : null,
  ].filter(Boolean).join('\n');

  const systemPrompt = `You are the Active Roots Child Health Expert, specialising in nutrition, hydration, and movement for Irish primary school children aged 4–12.
Generate simple, safe, personalised, age-appropriate recommendations.

STRICT ALLERGEN FILTERING — NON-NEGOTIABLE:
If an allergen is listed, you MUST NOT suggest that allergen ANYWHERE:
- Main options AND every alternative for ALL meals (breakfast, lunchbox, snack)
- Spreads, sauces, dressings, condiments (e.g. butter, mayo, pesto)
- Compound foods and hidden ingredients (e.g. "ham sandwich" → no cheese if dairy-free)
- Cross-contamination risks ("may contain" items)
Key mappings: nut-free → no nuts, nut butter, peanuts, marzipan, praline
dairy-free → no milk, cheese, butter, cream, yogurt, whey, casein, lactose
gluten-free → no wheat, barley, rye, spelt, regular oats, most bread/wraps/pasta
egg-free → no eggs, mayonnaise, most shop cakes
soy-free → no tofu, edamame, soy sauce, most processed meat
If no safe option exists for a category → use fruit, vegetable sticks, rice cakes, or plain oat-based options that are confirmed safe.

CORE RULES:
- Avoid moral language ("good/bad foods"). Never mention calories.
- Keep tone friendly, simple, and practical for Irish school context.
- Lunchbox options must be cold-serve only (no reheating).
- Always nut-free unless user has explicitly allowed nuts.
- Include a macronutrient/micronutrient tag for each main food (e.g. "Protein + Iron").
- Use favourite foods to create bridge foods where safe.
- Picky eater strategies: 1-2 only, gentle, non-judgmental.
- whyFoodsAreImportant: 3-4 bullet points explaining WHY the recommended foods support energy, focus, growth or wellbeing. Child-friendly language. No medical claims. No calorie talk.`;

  const userPrompt = `${inputSummary || 'No specific inputs provided — generate a safe, general plan for a primary school child in Ireland.'}

Return ONLY valid JSON with this exact structure, no extra text:
{
  "breakfast": {
    "main": "One specific breakfast option",
    "macroTag": "e.g. Protein + Iron",
    "alternatives": ["alternative 1", "alternative 2"]
  },
  "lunchbox": {
    "main": "One specific lunchbox option (cold only)",
    "macroTag": "e.g. Fibre + Calcium",
    "alternatives": ["alternative 1", "alternative 2"]
  },
  "snack": {
    "main": "One specific snack option",
    "macroTag": "e.g. Vitamin C",
    "alternatives": ["alternative 1", "alternative 2"]
  },
  "hydration": {
    "recommendation": "Age-appropriate water intake recommendation",
    "encouragement": "One simple, positive tip to encourage drinking water"
  },
  "pickyEaterStrategy": ["strategy 1", "strategy 2"],
  "whyFoodsAreImportant": [
    "Reason 1 — child-friendly explanation of nutritional value",
    "Reason 2 — how it supports energy, focus, or growth",
    "Reason 3 — another benefit",
    "Reason 4 — optional fourth point"
  ]
}`;

  let plan: any = null;
  let source: 'ai' | 'database' = 'ai';

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: systemPrompt,
    });
    const result = await Promise.race([
      model.generateContent(userPrompt),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('AI request timed out')), 10_000)
      ),
    ]);
    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      plan = JSON.parse(jsonMatch[0]);
      source = 'ai';
    }
  } catch (err: any) {
    const isQuota = err?.status === 429 || err?.message?.includes('quota') || err?.message?.includes('RESOURCE_EXHAUSTED');
    if (isQuota) {
      console.log('Nutrition AI quota exceeded — falling back to food database');
    } else {
      console.error('Nutrition AI error:', err);
    }
    // Fall through to database fallback
  }

  if (!plan) {
    try {
      plan = await buildFallbackNutritionPlan(ageRange, preferences, allergies, pickyEaterLevel, favouriteFoods, goals);
      source = 'database';
    } catch (dbErr) {
      console.error('Nutrition fallback error:', dbErr);
      return res.status(500).json({ error: 'Failed to generate nutrition plan.' });
    }
  }

  res.json({ ...plan, generatedBy: source });
});

export default router;
