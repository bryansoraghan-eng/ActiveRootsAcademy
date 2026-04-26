export interface BreakActivity {
  id: number;
  title: string;
  cat: 'Movement' | 'Calming' | 'Focus';
  age: string;
  mins: number;
  desc: string;
  fmsTags: string[]; // matched against programme type/name keywords
}

export const BREAKS: BreakActivity[] = [
  { id: 1, title: 'Tree pose & wobble',  cat: 'Calming',  age: '5–8',  mins: 2, desc: 'A balance reset — stand on one foot and sway like branches in a breeze.',            fmsTags: ['balance', 'stability'] },
  { id: 2, title: 'Count the clouds',    cat: 'Focus',    age: '7–10', mins: 3, desc: 'Outdoor scanning activity — notice five things in the sky.',                          fmsTags: ['focus', 'attention'] },
  { id: 3, title: 'Star jumps in four',  cat: 'Movement', age: '5–12', mins: 4, desc: 'Four rounds of eight. Rest, repeat. Good after a long sit.',                          fmsTags: ['jumping', 'locomotor', 'locomotion', 'cardio'] },
  { id: 4, title: 'Shake it out',        cat: 'Movement', age: '4–7',  mins: 2, desc: 'Wiggle one limb at a time. Finish with a deep breath.',                               fmsTags: ['warm', 'general', 'movement'] },
  { id: 5, title: 'Quiet roots',         cat: 'Calming',  age: '8–12', mins: 3, desc: 'Grounding pose — feet flat, eyes closed, slow count to 20.',                          fmsTags: ['stability', 'balance', 'mindfulness'] },
  { id: 6, title: 'Yard loop',           cat: 'Movement', age: '7–12', mins: 5, desc: 'One loop of the yard at your own pace. Outdoor only.',                                 fmsTags: ['running', 'locomotor', 'locomotion'] },
  { id: 7, title: 'Shoulder rolls',      cat: 'Calming',  age: '5–12', mins: 2, desc: 'Roll shoulders forward and back, ten times each. Release neck tension.',               fmsTags: ['manipulative', 'upper body', 'throwing', 'catching'] },
  { id: 8, title: 'Mirror mirror',       cat: 'Focus',    age: '6–10', mins: 3, desc: 'Pairs activity — mirror your partner\'s slow movements exactly.',                     fmsTags: ['coordination', 'agility', 'dodging'] },
  { id: 9, title: 'Frog jumps',          cat: 'Movement', age: '5–9',  mins: 3, desc: 'Crouch low, spring up, land soft. Great for energy release.',                         fmsTags: ['jumping', 'leaping', 'locomotor', 'locomotion'] },
];

export const CAT_TONE: Record<string, string> = {
  Calming:  'ara-tag-success',
  Focus:    'ara-tag-warning',
  Movement: 'ara-tag-brand',
};

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
