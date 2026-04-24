import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const skills = [
  {
    name: 'Running',
    slug: 'running',
    category: 'locomotion',
    description: 'Running is a basic locomotor skill involving an alternating leg action with a brief flight phase where both feet leave the ground simultaneously.',
    ageGroups: JSON.stringify(['infants', '1st-2nd', '3rd-4th', '5th-6th']),
    equipment: JSON.stringify(['cones', 'bibs', 'whistle']),
    spaceNeeded: 'both',
    tags: JSON.stringify(['locomotion', 'speed', 'cardiovascular', 'outdoor', 'indoor']),
    progressions: [
      { direction: 'regression', description: 'Walk-jog intervals — alternate walking and slow jogging over 15m', ageGroup: 'infants', difficulty: 1, order: 1 },
      { direction: 'regression', description: 'Slow jog around a large circle holding hands with a partner', ageGroup: 'infants', difficulty: 1, order: 2 },
      { direction: 'progression', description: 'Sprint between two cones 20m apart with focus on arm drive', ageGroup: '3rd-4th', difficulty: 3, order: 3 },
      { direction: 'progression', description: 'Acceleration runs — build from walk to jog to sprint over 30m', ageGroup: '3rd-4th', difficulty: 4, order: 4 },
      { direction: 'progression', description: 'Sprint mechanics drills: A-skips, B-skips, high knees', ageGroup: '5th-6th', difficulty: 5, order: 5 },
    ],
    cues: [
      { cue: 'Drive your arms like pistons — elbows at 90°', ageGroup: null, cueType: 'verbal' },
      { cue: 'Tall posture — imagine a string pulling the top of your head up', ageGroup: null, cueType: 'visual' },
      { cue: 'Land on the balls of your feet, not your heels', ageGroup: '3rd-4th', cueType: 'kinaesthetic' },
      { cue: 'Pretend you are running through puddles — lift your knees!', ageGroup: 'infants', cueType: 'verbal' },
      { cue: 'Relax your hands — pretend you are carrying crisps without crushing them', ageGroup: '5th-6th', cueType: 'verbal' },
    ],
    errors: [
      { error: 'Arms crossing the midline of the body', correction: 'Keep arms moving forward and back, not side to side. Check elbow angle is 90°.', ageGroup: null },
      { error: 'Landing on heels (overstriding)', correction: 'Cue "run quietly" — heel striking creates noise. Land mid-foot under the hips.', ageGroup: '3rd-4th' },
      { error: 'Leaning too far forward or backward', correction: 'Slight forward lean from the ankles, not the waist. Check head and hip alignment.', ageGroup: null },
    ],
  },
  {
    name: 'Jumping',
    slug: 'jumping',
    category: 'locomotion',
    description: 'Jumping involves a two-foot take-off and two-foot landing, requiring coordinated arm swing and absorption on landing through ankles, knees, and hips.',
    ageGroups: JSON.stringify(['infants', '1st-2nd', '3rd-4th', '5th-6th']),
    equipment: JSON.stringify(['hoops', 'tape', 'low hurdles', 'mats']),
    spaceNeeded: 'hall',
    tags: JSON.stringify(['locomotion', 'power', 'landing', 'plyometric']),
    progressions: [
      { direction: 'regression', description: 'Two-foot jumps on the spot — focus on bending and straightening', ageGroup: 'infants', difficulty: 1, order: 1 },
      { direction: 'regression', description: 'Jump into a hoop from a standing position and land softly', ageGroup: 'infants', difficulty: 1, order: 2 },
      { direction: 'progression', description: 'Standing broad jump for distance, measuring landing point', ageGroup: '1st-2nd', difficulty: 3, order: 3 },
      { direction: 'progression', description: 'Box jumps or step-jump combinations (up then down)', ageGroup: '3rd-4th', difficulty: 4, order: 4 },
      { direction: 'progression', description: 'Plyometric counter-movement jump — dip then explode upward with maximum arm swing', ageGroup: '5th-6th', difficulty: 5, order: 5 },
    ],
    cues: [
      { cue: 'Bend your knees — crouch like a frog before you jump', ageGroup: 'infants', cueType: 'verbal' },
      { cue: 'Swing your arms up as you take off — arms give you lift!', ageGroup: null, cueType: 'kinaesthetic' },
      { cue: 'Land like a cat — soft and quiet, bend through ankles, knees, and hips', ageGroup: null, cueType: 'verbal' },
      { cue: 'Eyes on the landing spot before you take off', ageGroup: '3rd-4th', cueType: 'visual' },
    ],
    errors: [
      { error: 'Landing with straight/stiff legs', correction: 'Cue "squishy landing" — the knees must bend to absorb force. Demonstrate the noise difference.', ageGroup: null },
      { error: 'No arm swing — arms stay at sides', correction: 'Arms give ~30% of jumping power. Practise arm swing on the spot without jumping first.', ageGroup: null },
      { error: 'Landing on one foot only', correction: 'Place two feet target markers — both feet must hit simultaneously. Use tape X on the floor.', ageGroup: 'infants' },
    ],
  },
  {
    name: 'Hopping',
    slug: 'hopping',
    category: 'locomotion',
    description: 'Hopping is a one-foot take-off and one-foot landing on the same foot, requiring unilateral balance and rhythmic coordination.',
    ageGroups: JSON.stringify(['infants', '1st-2nd', '3rd-4th', '5th-6th']),
    equipment: JSON.stringify(['tape', 'hoops', 'cones']),
    spaceNeeded: 'hall',
    tags: JSON.stringify(['locomotion', 'balance', 'coordination', 'unilateral']),
    progressions: [
      { direction: 'regression', description: 'Stand on one foot and hold for 3 seconds — switch feet', ageGroup: 'infants', difficulty: 1, order: 1 },
      { direction: 'regression', description: 'One hop then hold balance — repeat 3 times each foot', ageGroup: 'infants', difficulty: 1, order: 2 },
      { direction: 'progression', description: 'Hop for distance — 5 consecutive hops on one foot in a line', ageGroup: '1st-2nd', difficulty: 3, order: 3 },
      { direction: 'progression', description: 'Hop into hoops in a pattern — increasing rhythm and speed', ageGroup: '3rd-4th', difficulty: 4, order: 4 },
      { direction: 'progression', description: 'Rhythmic hopping sequences: 3 right, 3 left, 2 right, 2 left, 1,1,1,1', ageGroup: '5th-6th', difficulty: 5, order: 5 },
    ],
    cues: [
      { cue: 'Lift the other foot up like a flamingo', ageGroup: 'infants', cueType: 'visual' },
      { cue: 'Hop like a bunny — light and springy', ageGroup: 'infants', cueType: 'verbal' },
      { cue: 'Use your arms to help drive upward on each hop', ageGroup: '3rd-4th', cueType: 'kinaesthetic' },
      { cue: 'Stay tall — do not lean to the side', ageGroup: null, cueType: 'verbal' },
    ],
    errors: [
      { error: 'Leaning heavily to the side of the hopping foot', correction: 'Core stability cue: "Belly button to spine." Arms out can help balance initially.', ageGroup: null },
      { error: 'Non-hopping foot touching the ground', correction: 'Bend the non-support knee higher — knee up, not foot dragging.', ageGroup: 'infants' },
      { error: 'Loss of rhythm and coordination after 2–3 hops', correction: 'Reduce to 2 hops with a pause. Build rhythm gradually before adding consecutive hops.', ageGroup: null },
    ],
  },
  {
    name: 'Skipping',
    slug: 'skipping',
    category: 'locomotion',
    description: 'Skipping is a rhythmic locomotor pattern combining a step and a hop on the same foot alternately, requiring coordination and rhythm.',
    ageGroups: JSON.stringify(['1st-2nd', '3rd-4th', '5th-6th']),
    equipment: JSON.stringify(['skip ropes', 'music', 'cones']),
    spaceNeeded: 'both',
    tags: JSON.stringify(['locomotion', 'rhythm', 'coordination', 'cardiovascular']),
    progressions: [
      { direction: 'regression', description: 'Step-hop pattern on the spot — step right, hop right, step left, hop left (slow)', ageGroup: '1st-2nd', difficulty: 1, order: 1 },
      { direction: 'regression', description: 'Walk with an exaggerated step-hop pattern across the hall', ageGroup: '1st-2nd', difficulty: 2, order: 2 },
      { direction: 'progression', description: 'Skip with arms swinging in opposition at full rhythm', ageGroup: '3rd-4th', difficulty: 3, order: 3 },
      { direction: 'progression', description: 'Skip rope — individual ropes, two-foot jump first then skip step', ageGroup: '3rd-4th', difficulty: 4, order: 4 },
      { direction: 'progression', description: 'Long rope skipping with rhymes and increasing rope speed', ageGroup: '5th-6th', difficulty: 5, order: 5 },
    ],
    cues: [
      { cue: 'Step and hop — say it out loud while you do it: step, hop, step, hop', ageGroup: '1st-2nd', cueType: 'verbal' },
      { cue: 'Make it bouncy — like you are walking on springs', ageGroup: null, cueType: 'verbal' },
      { cue: 'Swing the opposite arm to the hopping foot', ageGroup: '3rd-4th', cueType: 'kinaesthetic' },
    ],
    errors: [
      { error: 'Galloping instead of skipping (step on one side only)', correction: 'Use verbal rhythm cue. Mark right and left on floor. Alternate which foot leads every 2 steps.', ageGroup: '1st-2nd' },
      { error: 'No flight phase — just a shuffling walk', correction: 'Increase the hop height. "See daylight under your feet!" Use a low line to hop over.', ageGroup: null },
    ],
  },
  {
    name: 'Galloping',
    slug: 'galloping',
    category: 'locomotion',
    description: 'Galloping uses an asymmetrical lead-and-chase foot pattern — the lead foot steps forward and the trailing foot closes to meet it before the next step.',
    ageGroups: JSON.stringify(['infants', '1st-2nd', '3rd-4th']),
    equipment: JSON.stringify(['cones', 'music']),
    spaceNeeded: 'both',
    tags: JSON.stringify(['locomotion', 'rhythm', 'lateral', 'coordination']),
    progressions: [
      { direction: 'regression', description: 'Slide feet together on the spot — step right, slide left foot to meet, repeat', ageGroup: 'infants', difficulty: 1, order: 1 },
      { direction: 'progression', description: 'Gallop around a large circle keeping the same lead foot the whole way', ageGroup: 'infants', difficulty: 2, order: 2 },
      { direction: 'progression', description: 'Gallop relay — lead with right going one way, left coming back', ageGroup: '1st-2nd', difficulty: 3, order: 3 },
      { direction: 'progression', description: 'Apply gallop to sport: lateral defensive shuffle in basketball/GAA', ageGroup: '3rd-4th', difficulty: 4, order: 4 },
    ],
    cues: [
      { cue: 'Pretend you are a horse — clippety-clop!', ageGroup: 'infants', cueType: 'verbal' },
      { cue: 'Let one foot lead — the other just chases behind', ageGroup: null, cueType: 'verbal' },
      { cue: 'Stay facing the same direction the whole time', ageGroup: '1st-2nd', cueType: 'visual' },
    ],
    errors: [
      { error: 'Feet crossing over each other', correction: 'Slow down — over-crossing means the pattern is too fast. Practice at walking pace first.', ageGroup: null },
      { error: 'Changing lead foot mid-sequence without instruction', correction: 'Mark the lead foot with a coloured bib or cone marker. Reinforce which foot leads.', ageGroup: 'infants' },
    ],
  },
  {
    name: 'Leaping',
    slug: 'leaping',
    category: 'locomotion',
    description: 'Leaping is a one-foot take-off and opposite-foot landing, covering horizontal distance. It is an extension of the running stride with maximum flight time.',
    ageGroups: JSON.stringify(['1st-2nd', '3rd-4th', '5th-6th']),
    equipment: JSON.stringify(['low hurdles', 'ropes', 'tape', 'cones']),
    spaceNeeded: 'both',
    tags: JSON.stringify(['locomotion', 'power', 'flight', 'athletics']),
    progressions: [
      { direction: 'regression', description: 'Step over a low line or rope from a slow jog — focus on flight', ageGroup: '1st-2nd', difficulty: 2, order: 1 },
      { direction: 'progression', description: 'Leap over progressively wider ropes — increase flight distance', ageGroup: '3rd-4th', difficulty: 3, order: 2 },
      { direction: 'progression', description: 'Running leap over a low hurdle — penultimate step and drive', ageGroup: '5th-6th', difficulty: 5, order: 3 },
    ],
    cues: [
      { cue: 'Push off hard with one foot and reach forward with the opposite arm', ageGroup: null, cueType: 'kinaesthetic' },
      { cue: 'Hang in the air — try to stay up as long as possible', ageGroup: '3rd-4th', cueType: 'verbal' },
      { cue: 'The foot that lands is the one you did NOT push off from', ageGroup: null, cueType: 'verbal' },
    ],
    errors: [
      { error: 'Take-off and landing on the same foot (hop instead of leap)', correction: 'Place two differently coloured markers — take-off on red, land on blue. Reinforce the switch.', ageGroup: null },
      { error: 'Minimal flight phase — leaping flat', correction: 'Place a low obstacle (rope or hurdle) that must be cleared — forces upward drive.', ageGroup: null },
    ],
  },
  {
    name: 'Sliding',
    slug: 'sliding',
    category: 'locomotion',
    description: 'Sliding is a lateral locomotor pattern where the lead foot steps to the side and the trailing foot closes to it, maintaining a sideways-facing position.',
    ageGroups: JSON.stringify(['infants', '1st-2nd', '3rd-4th']),
    equipment: JSON.stringify(['cones', 'lines/tape', 'bibs']),
    spaceNeeded: 'hall',
    tags: JSON.stringify(['locomotion', 'lateral', 'agility', 'defence']),
    progressions: [
      { direction: 'regression', description: 'Slow step-together-step sideways across the hall, 5 steps each direction', ageGroup: 'infants', difficulty: 1, order: 1 },
      { direction: 'progression', description: 'Increase speed of the lateral slide — race a partner side by side', ageGroup: '1st-2nd', difficulty: 3, order: 2 },
      { direction: 'progression', description: 'Defensive slide drill: mirror a partner moving left and right rapidly', ageGroup: '3rd-4th', difficulty: 4, order: 3 },
    ],
    cues: [
      { cue: 'Stay low in a slight squat — do not stand tall', ageGroup: null, cueType: 'kinaesthetic' },
      { cue: 'Keep facing forward the whole time — eyes stay on your target', ageGroup: null, cueType: 'visual' },
      { cue: 'Feet should never cross — one leads, one follows', ageGroup: null, cueType: 'verbal' },
    ],
    errors: [
      { error: 'Feet crossing over each other', correction: 'Slow down. Use verbal count: 1=step, 2=close. Never let the feet cross.', ageGroup: null },
      { error: 'Standing too upright with no knee bend', correction: 'Lower body = better balance and speed. Cue "pretend you are sitting on a low stool."', ageGroup: null },
    ],
  },
  {
    name: 'Dodging',
    slug: 'dodging',
    category: 'locomotion',
    description: 'Dodging is a quick change of direction while moving, involving planting the outside foot and pushing off explosively to change direction.',
    ageGroups: JSON.stringify(['infants', '1st-2nd', '3rd-4th', '5th-6th']),
    equipment: JSON.stringify(['cones', 'bibs']),
    spaceNeeded: 'both',
    tags: JSON.stringify(['locomotion', 'agility', 'change-of-direction', 'sport']),
    progressions: [
      { direction: 'regression', description: 'Walk and change direction around cones — slow and controlled', ageGroup: 'infants', difficulty: 1, order: 1 },
      { direction: 'regression', description: 'Jog and react to a teacher cue (clap = change direction)', ageGroup: '1st-2nd', difficulty: 2, order: 2 },
      { direction: 'progression', description: 'Tag game dodging with 2 taggers in a small area', ageGroup: '3rd-4th', difficulty: 3, order: 3 },
      { direction: 'progression', description: '1v1 dodging drill — attacker tries to pass a stationary then mobile defender', ageGroup: '5th-6th', difficulty: 5, order: 4 },
    ],
    cues: [
      { cue: 'Plant the outside foot and push off hard in the new direction', ageGroup: '3rd-4th', cueType: 'kinaesthetic' },
      { cue: 'Drop your hips low as you change direction — low centre of gravity', ageGroup: '5th-6th', cueType: 'verbal' },
      { cue: 'Look where you are going, not at your feet', ageGroup: null, cueType: 'verbal' },
    ],
    errors: [
      { error: 'Slowing to a near stop before changing direction', correction: 'The plant foot brakes AND redirects in one motion. Practise the cut at slower speeds first.', ageGroup: null },
      { error: 'Changing direction without lowering centre of gravity', correction: 'Players who stay tall fall or stumble. Cue the knee bend before the cut.', ageGroup: null },
    ],
  },
  {
    name: 'Throwing',
    slug: 'throwing',
    category: 'object_control',
    description: 'Throwing involves projecting an object away from the body using one or both hands. The overarm throw is the primary pattern, involving hip and shoulder rotation.',
    ageGroups: JSON.stringify(['infants', '1st-2nd', '3rd-4th', '5th-6th']),
    equipment: JSON.stringify(['beanbags', 'tennis balls', 'soft balls', 'targets', 'hoops']),
    spaceNeeded: 'both',
    tags: JSON.stringify(['object_control', 'hand-eye', 'partner', 'targeting']),
    progressions: [
      { direction: 'regression', description: 'Underarm toss of a beanbag into a hoop on the floor (1m)', ageGroup: 'infants', difficulty: 1, order: 1 },
      { direction: 'regression', description: 'Two-hand chest push to a partner 2m away', ageGroup: 'infants', difficulty: 1, order: 2 },
      { direction: 'progression', description: 'Overarm throw at a wall target — focus on side-on stance and step', ageGroup: '1st-2nd', difficulty: 3, order: 3 },
      { direction: 'progression', description: 'Overarm throw for distance — measuring and competing', ageGroup: '3rd-4th', difficulty: 4, order: 4 },
      { direction: 'progression', description: 'Throwing under pressure: pass to a moving partner in a game context', ageGroup: '5th-6th', difficulty: 5, order: 5 },
    ],
    cues: [
      { cue: 'Stand sideways to your target — throwing shoulder back', ageGroup: null, cueType: 'visual' },
      { cue: 'Point your non-throwing arm at the target first', ageGroup: '3rd-4th', cueType: 'kinaesthetic' },
      { cue: 'Step with the opposite foot to your throwing arm', ageGroup: null, cueType: 'verbal' },
      { cue: 'Follow through — let your arm swing all the way across your body', ageGroup: '5th-6th', cueType: 'verbal' },
    ],
    errors: [
      { error: 'Pushing the ball forward with no rotation (front-on throw)', correction: 'Rotate to side-on. Use a wall or target that can only be hit with a proper arm path.', ageGroup: null },
      { error: 'No step — feet stay stationary when throwing', correction: 'Tape a footprint on the floor for the opposition foot to land on. Step before throw.', ageGroup: null },
      { error: 'Ball release too early or too late — poor direction', correction: 'Focus on the target. Release at the highest point of the arm swing for overarm throws.', ageGroup: null },
    ],
  },
  {
    name: 'Catching',
    slug: 'catching',
    category: 'object_control',
    description: 'Catching requires tracking a moving object and closing the hands at the right moment to secure it, using soft hands and watching the ball all the way in.',
    ageGroups: JSON.stringify(['infants', '1st-2nd', '3rd-4th', '5th-6th']),
    equipment: JSON.stringify(['beanbags', 'balloons', 'soft balls', 'tennis balls']),
    spaceNeeded: 'hall',
    tags: JSON.stringify(['object_control', 'hand-eye', 'reaction', 'partner']),
    progressions: [
      { direction: 'regression', description: 'Self-toss and catch a beanbag — throw up 20cm and catch with both hands', ageGroup: 'infants', difficulty: 1, order: 1 },
      { direction: 'regression', description: 'Catch a balloon (slower flight) — track and close hands', ageGroup: 'infants', difficulty: 1, order: 2 },
      { direction: 'progression', description: 'Partner throw-and-catch at 3–5m with a soft ball', ageGroup: '1st-2nd', difficulty: 3, order: 3 },
      { direction: 'progression', description: 'Catch while moving — receive a pass while jogging to a cone', ageGroup: '3rd-4th', difficulty: 4, order: 4 },
      { direction: 'progression', description: 'One-handed catch at varying heights — high, mid, low', ageGroup: '5th-6th', difficulty: 5, order: 5 },
    ],
    cues: [
      { cue: 'Watch the ball all the way into your hands — eyes on it!', ageGroup: null, cueType: 'verbal' },
      { cue: 'Make a basket with your hands — little fingers together for a low catch, thumbs together for a high catch', ageGroup: null, cueType: 'visual' },
      { cue: 'Give with the catch — let your hands travel back with the ball to absorb it', ageGroup: '3rd-4th', cueType: 'kinaesthetic' },
    ],
    errors: [
      { error: 'Looking away or closing eyes just before the catch', correction: 'Use a high-contrast ball or balloon. Praise explicitly when eyes stay on the ball.', ageGroup: null },
      { error: 'Arms rigid, no give on contact — ball bounces out', correction: 'Cue "soft hands." Show the difference between stiff and relaxed hands receiving a ball.', ageGroup: null },
    ],
  },
  {
    name: 'Kicking',
    slug: 'kicking',
    category: 'object_control',
    description: 'Kicking propels a stationary or moving ball with the foot. Key patterns include the instep kick (power) and inside-foot kick (accuracy).',
    ageGroups: JSON.stringify(['infants', '1st-2nd', '3rd-4th', '5th-6th']),
    equipment: JSON.stringify(['footballs', 'soft balls', 'cones', 'mini goals']),
    spaceNeeded: 'both',
    tags: JSON.stringify(['object_control', 'foot-eye', 'GAA', 'soccer', 'sport']),
    progressions: [
      { direction: 'regression', description: 'Gently roll the ball forward with the sole of the foot — control focus', ageGroup: 'infants', difficulty: 1, order: 1 },
      { direction: 'regression', description: 'Kick a stationary ball with inside of foot to a partner 2m away', ageGroup: 'infants', difficulty: 2, order: 2 },
      { direction: 'progression', description: 'Instep kick at target from 6m — focus on hip-through and follow-through', ageGroup: '3rd-4th', difficulty: 4, order: 3 },
      { direction: 'progression', description: 'Kicking a moving ball — pass and receive from a slow roll', ageGroup: '3rd-4th', difficulty: 4, order: 4 },
      { direction: 'progression', description: 'Kick under pressure — 1v1 to mini goal with a goalkeeper', ageGroup: '5th-6th', difficulty: 5, order: 5 },
    ],
    cues: [
      { cue: 'Plant your standing foot beside the ball, not behind it', ageGroup: null, cueType: 'kinaesthetic' },
      { cue: 'Kick through the ball — let your leg swing all the way through', ageGroup: null, cueType: 'verbal' },
      { cue: 'Head over the ball — lean forward slightly or the ball will rise too high', ageGroup: '3rd-4th', cueType: 'verbal' },
    ],
    errors: [
      { error: 'Using toes instead of instep or inside of foot', correction: 'Mark the contact zone on the foot with a sticker or chalk dot. Cue the specific foot surface.', ageGroup: null },
      { error: 'Kicking the top of the ball — ball stays on the ground or rolls weakly', correction: 'Lower approach angle. Knee must be over the ball at contact.', ageGroup: null },
    ],
  },
  {
    name: 'Striking',
    slug: 'striking',
    category: 'object_control',
    description: 'Striking uses an implement (bat, hurley, racket) or the hand to hit a moving or stationary object. Core mechanics include grip, stance, swing path, and contact point.',
    ageGroups: JSON.stringify(['1st-2nd', '3rd-4th', '5th-6th']),
    equipment: JSON.stringify(['short-handled bats', 'balloons', 'foam balls', 'hurleys', 'tennis racquets']),
    spaceNeeded: 'hall',
    tags: JSON.stringify(['object_control', 'hand-eye', 'GAA', 'tennis', 'rounders']),
    progressions: [
      { direction: 'regression', description: 'Strike a stationary balloon with an open hand — focus on watching contact', ageGroup: '1st-2nd', difficulty: 1, order: 1 },
      { direction: 'regression', description: 'Bat a balloon upward continuously without it touching the floor', ageGroup: '1st-2nd', difficulty: 2, order: 2 },
      { direction: 'progression', description: 'Strike a ball from a tee with a short bat — stance and swing focus', ageGroup: '3rd-4th', difficulty: 3, order: 3 },
      { direction: 'progression', description: 'Rally with a partner using short bats and a light ball', ageGroup: '3rd-4th', difficulty: 4, order: 4 },
      { direction: 'progression', description: 'Striking a moving tossed ball — timing and weight transfer', ageGroup: '5th-6th', difficulty: 5, order: 5 },
    ],
    cues: [
      { cue: 'Watch the ball all the way onto the bat', ageGroup: null, cueType: 'verbal' },
      { cue: 'Swing level — like sweeping a table', ageGroup: '1st-2nd', cueType: 'visual' },
      { cue: 'Rotate your hips as you swing — power comes from the body, not just the arms', ageGroup: '5th-6th', cueType: 'kinaesthetic' },
    ],
    errors: [
      { error: 'Swinging before the ball arrives — early contact', correction: 'Slow the feed down. Use a balloon or slow ball. Focus on the moment of contact.', ageGroup: null },
      { error: 'Arms only — no hip rotation', correction: 'Practise swinging without a ball — hip turn drill. Feel the rotation before adding the ball.', ageGroup: null },
    ],
  },
  {
    name: 'Bouncing/Dribbling',
    slug: 'bouncing-dribbling',
    category: 'object_control',
    description: 'Bouncing/dribbling involves controlled repetitive contact with a ball using the fingertips to keep it moving at a consistent height while potentially travelling.',
    ageGroups: JSON.stringify(['infants', '1st-2nd', '3rd-4th', '5th-6th']),
    equipment: JSON.stringify(['basketballs', 'footballs', 'playground balls', 'cones']),
    spaceNeeded: 'hall',
    tags: JSON.stringify(['object_control', 'hand-eye', 'basketball', 'coordination']),
    progressions: [
      { direction: 'regression', description: 'Drop and catch — drop ball from waist height and catch with both hands', ageGroup: 'infants', difficulty: 1, order: 1 },
      { direction: 'regression', description: 'Two-hand dribble on the spot — push down and let it return', ageGroup: 'infants', difficulty: 2, order: 2 },
      { direction: 'progression', description: 'One-hand dribble on the spot — dominant hand then non-dominant', ageGroup: '1st-2nd', difficulty: 3, order: 3 },
      { direction: 'progression', description: 'Dribble while walking through a cone slalom', ageGroup: '3rd-4th', difficulty: 4, order: 4 },
      { direction: 'progression', description: 'Dribble at jogging pace with head up — eyes off the ball', ageGroup: '5th-6th', difficulty: 5, order: 5 },
    ],
    cues: [
      { cue: 'Fingertips, not palm — push, do not slap the ball', ageGroup: null, cueType: 'kinaesthetic' },
      { cue: 'Keep the ball below your waist', ageGroup: null, cueType: 'verbal' },
      { cue: 'Look up — where are you going? Not at your feet!', ageGroup: '3rd-4th', cueType: 'verbal' },
    ],
    errors: [
      { error: 'Using palm instead of fingertips — no control', correction: 'Show hand position clearly. Practise pushing ball with fingertip pads against the wall.', ageGroup: null },
      { error: 'Ball bouncing too high — rising above head', correction: 'Lower the push point. Ball should bounce to waist height. Mark waist height with a cone.', ageGroup: null },
    ],
  },
  {
    name: 'Rolling',
    slug: 'rolling',
    category: 'stability',
    description: 'Rolling includes log rolls, forward rolls, and ball rolling. In FMS contexts, it develops body awareness, spatial orientation, and ground-based movement.',
    ageGroups: JSON.stringify(['infants', '1st-2nd', '3rd-4th', '5th-6th']),
    equipment: JSON.stringify(['PE mats', 'soft balls', 'ramps', 'bowling pins']),
    spaceNeeded: 'hall',
    tags: JSON.stringify(['stability', 'body-awareness', 'floor-work', 'safety']),
    progressions: [
      { direction: 'regression', description: 'Log roll — lying on back, arms overhead, roll sideways across a mat', ageGroup: 'infants', difficulty: 1, order: 1 },
      { direction: 'regression', description: 'Rocking on the back (egg shape) to build spinal awareness', ageGroup: 'infants', difficulty: 1, order: 2 },
      { direction: 'progression', description: 'Forward roll from a crouch — chin in, round back, hands on mat', ageGroup: '1st-2nd', difficulty: 3, order: 3 },
      { direction: 'progression', description: 'Ball rolling with accuracy — target bowling at cones, varying distance', ageGroup: '3rd-4th', difficulty: 4, order: 4 },
    ],
    cues: [
      { cue: 'Tuck your chin to your chest — look at your tummy button', ageGroup: null, cueType: 'kinaesthetic' },
      { cue: 'Round your back like a wheel — wheels roll smoothly', ageGroup: 'infants', cueType: 'verbal' },
      { cue: 'For ball rolling: get low, follow through toward the target', ageGroup: '3rd-4th', cueType: 'kinaesthetic' },
    ],
    errors: [
      { error: 'Head not tucked in forward rolls — landing on crown of head', correction: 'Safety first — reinforce chin-tuck before any rolling. Use a tactile cue (touch chin to chest before starting).', ageGroup: null },
      { error: 'Arms not supporting in forward rolls — collapsing forward', correction: 'Build shoulder strength with plank holds first. Arms must be bent and controlled as weight transfers.', ageGroup: null },
    ],
  },
  {
    name: 'Balancing',
    slug: 'balancing',
    category: 'stability',
    description: 'Balancing involves maintaining the body\'s centre of mass over its base of support, both statically (held positions) and dynamically (while moving).',
    ageGroups: JSON.stringify(['infants', '1st-2nd', '3rd-4th', '5th-6th']),
    equipment: JSON.stringify(['balance beams', 'wobble boards', 'hoops', 'mats', 'cones']),
    spaceNeeded: 'hall',
    tags: JSON.stringify(['stability', 'core', 'proprioception', 'posture']),
    progressions: [
      { direction: 'regression', description: 'Stand on one foot for 3 seconds with eyes open — both sides', ageGroup: 'infants', difficulty: 1, order: 1 },
      { direction: 'regression', description: 'Balance on two body parts other than two feet (hands and one knee, etc.)', ageGroup: 'infants', difficulty: 2, order: 2 },
      { direction: 'progression', description: 'Single-leg balance for 10s eyes open, then 5s eyes closed', ageGroup: '3rd-4th', difficulty: 3, order: 3 },
      { direction: 'progression', description: 'Balance beam walk — forward, backward, sideways', ageGroup: '3rd-4th', difficulty: 4, order: 4 },
      { direction: 'progression', description: 'Dynamic balance: single-leg landing from a hop and hold 3 seconds', ageGroup: '5th-6th', difficulty: 5, order: 5 },
    ],
    cues: [
      { cue: 'Find a still point to stare at — a fixed focus helps balance', ageGroup: null, cueType: 'visual' },
      { cue: 'Spread your toes in your shoes to grip the floor', ageGroup: null, cueType: 'kinaesthetic' },
      { cue: 'Squeeze your core — belly button pulled inward', ageGroup: '3rd-4th', cueType: 'kinaesthetic' },
      { cue: 'Arms out help — use them like a tightrope walker', ageGroup: 'infants', cueType: 'visual' },
    ],
    errors: [
      { error: 'Looking at the floor when balancing — increases sway', correction: 'Pick a spot at eye level to focus on. Floor-gazing removes the vestibular reference point.', ageGroup: null },
      { error: 'Standing hip pushing out to the side on the standing leg', correction: 'Core alignment cue: hips level, weight centred over the standing foot.', ageGroup: null },
    ],
  },
];

async function main() {
  console.log('🌱 Seeding FMS Knowledge Base...');

  for (const skill of skills) {
    const { progressions, cues, errors, ...skillData } = skill;

    const existing = await prisma.fMSSkill.findUnique({ where: { slug: skillData.slug } });
    if (existing) {
      console.log(`⏭  Skipping ${skillData.name} (already exists)`);
      continue;
    }

    const created = await prisma.fMSSkill.create({
      data: {
        ...skillData,
        progressions: {
          create: progressions,
        },
        cues: {
          create: cues,
        },
        errors: {
          create: errors,
        },
      },
    });

    console.log(`✅ Seeded: ${created.name}`);
  }

  console.log('🎉 FMS Knowledge Base seeding complete!');
}

main()
  .catch(e => {
    console.error('❌ FMS seeding failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
