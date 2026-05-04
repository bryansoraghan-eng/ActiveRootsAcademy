export interface BreakActivity {
  id: number;
  title: string;
  cat: 'Movement' | 'Calming' | 'Focus';
  age: string;
  mins: number;
  desc: string;
  fmsTags: string[];
  teacherTip?: string;
}

export const BREAKS: BreakActivity[] = [
  {
    id: 1, title: 'Tree pose & wobble', cat: 'Calming', age: '5–8', mins: 2,
    desc: 'A balance reset — stand on one foot and sway like branches in a breeze.',
    fmsTags: ['balance', 'stability'],
    teacherTip: "You could say: 'Let's steady our bodies so our minds can settle back into learning.'",
  },
  {
    id: 2, title: 'Count the clouds', cat: 'Focus', age: '7–10', mins: 3,
    desc: 'Outdoor scanning activity — notice five things in the sky.',
    fmsTags: ['focus', 'attention'],
    teacherTip: "You could say: 'Let's give our eyes a rest and notice something beautiful outside.'",
  },
  {
    id: 3, title: 'Star jumps in four', cat: 'Movement', age: '5–12', mins: 4,
    desc: 'Four rounds of eight. Rest, repeat. Good after a long sit.',
    fmsTags: ['jumping', 'locomotor', 'locomotion', 'cardio'],
    teacherTip: "You could say: 'Let's wake our bodies up so we can bring our best energy back to our learning.'",
  },
  {
    id: 4, title: 'Shake it out', cat: 'Movement', age: '4–7', mins: 2,
    desc: 'Wiggle one limb at a time. Finish with a deep breath.',
    fmsTags: ['warm', 'general', 'movement'],
    teacherTip: "You could say: 'Let's shake out any wiggles so our bodies are ready to listen.'",
  },
  {
    id: 5, title: 'Quiet roots', cat: 'Calming', age: '8–12', mins: 3,
    desc: 'Grounding pose — feet flat, eyes closed, slow count to 20.',
    fmsTags: ['stability', 'balance', 'mindfulness'],
    teacherTip: "You could say: 'This helps us feel grounded and calm — like a big tree with roots going deep into the ground.'",
  },
  {
    id: 6, title: 'Yard loop', cat: 'Movement', age: '7–12', mins: 5,
    desc: 'One loop of the yard at your own pace. Outdoor only.',
    fmsTags: ['running', 'locomotor', 'locomotion'],
    teacherTip: "You could say: 'We're going to move our bodies and get some fresh air — follow me!'",
  },
  {
    id: 7, title: 'Shoulder rolls', cat: 'Calming', age: '5–12', mins: 2,
    desc: 'Roll shoulders forward and back, ten times each. Release neck tension.',
    fmsTags: ['manipulative', 'upper body', 'throwing', 'catching'],
    teacherTip: "You could say: 'We're letting go of any tightness so we can sit comfortably and concentrate.'",
  },
  {
    id: 8, title: 'Mirror mirror', cat: 'Focus', age: '6–10', mins: 3,
    desc: "Pairs activity — mirror your partner's slow movements exactly.",
    fmsTags: ['coordination', 'agility', 'dodging'],
    teacherTip: "You could say: 'This helps us practise listening with our whole body, not just our ears.'",
  },
  {
    id: 9, title: 'Frog jumps', cat: 'Movement', age: '5–9', mins: 3,
    desc: 'Crouch low, spring up, land soft. Great for energy release.',
    fmsTags: ['jumping', 'leaping', 'locomotor', 'locomotion'],
    teacherTip: "You could say: 'Ready to jump like frogs? Big crouch, big jump, soft landing!'",
  },
];

export const CAT_TONE: Record<string, string> = {
  Calming:  'ara-tag-success',
  Focus:    'ara-tag-warning',
  Movement: 'ara-tag-brand',
};

// ── Break slot types & storage ────────────────────────────────────────────────

export interface BreakSlot {
  name: string;
  time: string;    // "HH:MM" 24-hour format
  enabled: boolean;
}

export const DEFAULT_BREAK_SLOTS: BreakSlot[] = [
  { name: 'Morning',     time: '09:30', enabled: true },
  { name: 'Mid-morning', time: '11:00', enabled: true },
  { name: 'After lunch', time: '13:15', enabled: true },
  { name: 'Afternoon',   time: '14:30', enabled: true },
];

const SLOT_KEY = 'ara_break_slots';

export function getCustomSlots(): BreakSlot[] {
  try {
    const raw = localStorage.getItem(SLOT_KEY);
    if (raw) return JSON.parse(raw) as BreakSlot[];
  } catch { /* */ }
  return DEFAULT_BREAK_SLOTS;
}

export function saveCustomSlots(slots: BreakSlot[]): void {
  localStorage.setItem(SLOT_KEY, JSON.stringify(slots));
}

export function hasCustomSlots(): boolean {
  return !!localStorage.getItem(SLOT_KEY);
}

// ── Break pickers ─────────────────────────────────────────────────────────────

/** Pick a truly random break, optionally excluding one by id. */
export function pickRandomBreak(excludeId?: number): BreakActivity {
  const pool = excludeId != null ? BREAKS.filter(b => b.id !== excludeId) : [...BREAKS];
  return pool[Math.floor(Math.random() * pool.length)];
}

/** Pick the best break for a given programme name/type. Falls back to break #1. */
export function pickBreakForProgramme(programmeName: string, programmeType: string): BreakActivity {
  const haystack = `${programmeName} ${programmeType}`.toLowerCase();
  const scored = BREAKS.map(b => ({
    break: b,
    score: b.fmsTags.filter(tag => haystack.includes(tag)).length,
  }));
  const best = scored.sort((a, b) => b.score - a.score)[0];
  return best.score > 0 ? best.break : BREAKS[0];
}

// ── Slot detection ────────────────────────────────────────────────────────────

/** Returns the current time-of-day slot name based on custom (or default) slots. */
export function getCurrentSlot(): string | null {
  const slots = getCustomSlots().filter(s => s.enabled);
  if (slots.length === 0) return null;
  const now = new Date();
  const nowMins = now.getHours() * 60 + now.getMinutes();
  for (let i = 0; i < slots.length; i++) {
    const [sh, sm] = slots[i].time.split(':').map(Number);
    const slotMins = sh * 60 + sm;
    const nextMins = i + 1 < slots.length
      ? (() => { const [nh, nm] = slots[i + 1].time.split(':').map(Number); return nh * 60 + nm; })()
      : slotMins + 90;
    if (nowMins >= slotMins && nowMins < nextMins) return slots[i].name;
  }
  return null;
}
