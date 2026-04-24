interface Activity {
  name: string;
  description: string;
  duration: string;
}

interface Week {
  week: number;
  skillFocus: string[];
  warmUp: string;
  skillFocusDescription: string;
  activity1: Activity;
  activity2: Activity;
  coolDown: string;
  equipment: string[];
}

interface ProgrammeData {
  title: string;
  classLevel: string;
  weeks: Week[];
}

const infants: ProgrammeData = {
  title: '6-Week PE Programme – Infants',
  classLevel: 'Infants',
  weeks: [
    {
      week: 1,
      skillFocus: ['Running', 'Balancing'],
      warmUp: 'Play "Follow the Leader" around the hall — children copy the teacher jogging, skipping on the spot, and shaking their arms. Keep movements simple and fun, changing every 20 seconds.',
      skillFocusDescription: 'Focus on free running and basic balance. Encourage children to run lightly on their toes and stop still on a signal. Introduce balancing on one foot by counting to three together as a class.',
      activity1: {
        name: 'Traffic Lights',
        description: 'Children run freely around the space. When the teacher calls "Red" they freeze, "Orange" they slow to a walk, and "Green" they run again. Extend by asking them to freeze in a balance pose on "Red." Great for listening and body control.',
        duration: '8 mins',
      },
      activity2: {
        name: 'Stepping Stones',
        description: 'Lay out hoops or flat markers across the floor as "stepping stones." Children walk and then run from stone to stone without touching the floor between them. Encourage arms out for balance. Make it playful by pretending the floor is lava.',
        duration: '10 mins',
      },
      coolDown: 'Gather children in a circle. Take three big slow breaths together, arms rising on the inhale and lowering on the exhale. Then tiptoe quietly back to class.',
      equipment: ['Cones', 'Hoops', 'Flat markers'],
    },
    {
      week: 2,
      skillFocus: ['Jumping', 'Hopping'],
      warmUp: 'Animal moves warm-up — children move like rabbits (two-foot jumps), frogs (squat jumps), and kangaroos (big leaps) on teacher cues. Change animal every 15 seconds.',
      skillFocusDescription: 'Teach two-foot take-off and landing (jumping) and single-foot hopping. For jumps, cue "bend your knees and spring!" For hops, children hold one foot up and try 3 hops on the spot before swapping feet. Keep it playful.',
      activity1: {
        name: 'Puddle Jumping',
        description: 'Scatter hoops flat on the floor as "puddles." Children jump into and out of each puddle with two feet, travelling around the hall. Encourage soft landings by bending knees. Call "big puddle" for a longer jump challenge.',
        duration: '8 mins',
      },
      activity2: {
        name: 'Hopscotch Trail',
        description: 'Create a simple hopscotch path with chalk or tape markers: single squares for hopping and double squares for two-foot landing. Children take turns moving along the trail while others clap a rhythm. Repeat 2–3 times.',
        duration: '10 mins',
      },
      coolDown: 'Children lie on their backs, close their eyes, and wiggle their toes and fingers, then go completely still. Teacher counts slowly to 10 before sitting up.',
      equipment: ['Hoops', 'Chalk or tape markers'],
    },
    {
      week: 3,
      skillFocus: ['Rolling', 'Sliding'],
      warmUp: 'Stretching song or rhyme — children follow along touching toes, reaching up tall, and swinging arms. Transition into light jogging on the spot to music.',
      skillFocusDescription: 'Introduce forward log rolls on a mat and sideways rolling. For sliding, children practise sliding their feet sideways in a standing position, keeping toes pointed forward. Emphasise keeping chin tucked for rolling safety.',
      activity1: {
        name: 'Log Roll Race',
        description: 'Children lie on mats in pairs and practise rolling from one end to the other like a log. Remind them to keep arms overhead and body straight. Celebrate effort rather than speed. Progress to rolling down a gentle incline if mats allow.',
        duration: '8 mins',
      },
      activity2: {
        name: 'Side-Slide Relay',
        description: 'Mark two lines about 6 metres apart. Children slide sideways from one line to the other, facing the same direction throughout. On reaching the line they jump once and slide back. Run as pairs for fun without pressure.',
        duration: '10 mins',
      },
      coolDown: 'Seated stretches — children sit in a circle and reach forward to touch their toes, then sit tall and twist gently left and right. Finish with one big yawn stretch.',
      equipment: ['PE mats', 'Cones'],
    },
    {
      week: 4,
      skillFocus: ['Throwing', 'Catching'],
      warmUp: 'Shake and roll — children shake each body part in turn (hands, arms, legs, whole body) then roll their shoulders and neck gently. Finish with a short jog in a circle.',
      skillFocusDescription: 'Use large, soft balls or beanbags. For throwing, stand sideways and push the ball forward with one hand. For catching, make a basket shape with both hands and watch the ball all the way in. Start at close range and increase distance gradually.',
      activity1: {
        name: 'Beanbag Toss and Catch',
        description: 'In pairs, children stand facing each other about 1 metre apart. They gently toss a beanbag and their partner catches it. Every 3 successful catches they take one step back. Emphasise eye contact with the beanbag. Use large soft balls as an easier alternative.',
        duration: '10 mins',
      },
      activity2: {
        name: 'Target Throw',
        description: 'Set up large hoop targets on the floor at varying distances. Children throw beanbags underarm to land inside the hoops. Each hoop has a colour that scores differently to add excitement. Rotate positions after every 4 throws.',
        duration: '8 mins',
      },
      coolDown: 'Seated breathing — children sit cross-legged, place hands on tummy, and breathe in to make their tummy rise, then out slowly. Repeat 5 times. Finish with a quiet stretch up and down.',
      equipment: ['Beanbags', 'Soft balls', 'Hoops', 'Cones'],
    },
    {
      week: 5,
      skillFocus: ['Skipping', 'Galloping'],
      warmUp: 'Nursery rhyme movement warm-up — children act out movements to a rhyme (e.g., "Jack and Jill"). Walk, march, clap, and jump in response to words. Gets the body moving with rhythm.',
      skillFocusDescription: 'Galloping uses a lead-and-chase foot pattern — step forward with one foot and bring the other to meet it. Skipping adds a hop to each step. Practise galloping first as it is easier, then add the hop to transition toward skipping.',
      activity1: {
        name: 'Horse Race Gallop',
        description: 'Children gallop freely around the hall pretending to be horses. Teacher calls "change direction!" and they switch the leading foot and gallop the other way. Add sounds (clip-clop) to increase engagement. Repeat 3–4 times each direction.',
        duration: '8 mins',
      },
      activity2: {
        name: 'Skip the River',
        description: 'Lay two parallel ropes or lines about 30 cm apart as a "river." Children skip along one side, jump over the river, and skip back. Those still practising the skip can walk-hop instead. Encourage a bouncy, rhythmic pattern.',
        duration: '10 mins',
      },
      coolDown: 'Children find a space and do slow windmill arm circles forward and backward. Then gently hug their knees to their chest seated on the floor. Count 5 slow breaths.',
      equipment: ['Ropes', 'Cones', 'Flat markers'],
    },
    {
      week: 6,
      skillFocus: ['Dodging', 'Balancing'],
      warmUp: 'Free dance warm-up — play upbeat music and let children move freely for 2 minutes. Then guide them through shoulder rolls, knee lifts, and side steps.',
      skillFocusDescription: 'Dodging involves quick changes of direction to avoid something. Practise by having children swerve around cones. Combine with balance by asking children to freeze in a steady balance pose each time they dodge a cone.',
      activity1: {
        name: 'Zig-Zag Cones',
        description: 'Set up a line of cones about 1 metre apart. Children weave in and out (dodging) from one end to the other, then run straight back. Encourage them to stay low and use their arms for control. Progress to two lines racing side by side.',
        duration: '10 mins',
      },
      activity2: {
        name: 'Statue Balance',
        description: 'Children move around the hall to music. When the music stops they must freeze in a balance pose on one foot. Teacher looks around and names children holding a great balance. Vary by calling a pose (e.g., "hands out," "arms up," "one knee raised").',
        duration: '8 mins',
      },
      coolDown: 'Children lie on the floor in a star shape. Teacher leads a body scan — wiggle toes, flex ankles, squeeze legs, relax — moving up the whole body. Finish with 3 silent breaths.',
      equipment: ['Cones', 'Music player'],
    },
  ],
};

const firstSecond: ProgrammeData = {
  title: '6-Week PE Programme – 1st & 2nd Class',
  classLevel: '1st-2nd',
  weeks: [
    {
      week: 1,
      skillFocus: ['Running', 'Dodging'],
      warmUp: 'Jog freely around the hall for 1 minute, changing direction on whistle. Then perform 10 jumping jacks together and 10 arm circles each direction.',
      skillFocusDescription: 'Focus on running with good form — head up, arms bent at 90°, driving knees forward. Introduce dodging by practising side steps and sharp changes of direction. Combine both by weaving around cones at pace.',
      activity1: {
        name: 'Cone Weave Sprint',
        description: 'Set up two parallel lines of cones about 2 metres apart. Children weave in and out down one line, sprint around the end cone, and weave back up the other. Time optional. Emphasise low, agile movement when dodging. Run in pairs for motivation.',
        duration: '10 mins',
      },
      activity2: {
        name: 'Tail Tag',
        description: 'Each child tucks a bib into their waistband as a "tail." On the whistle, everyone tries to grab other tails while protecting their own. A child whose tail is taken keeps running and tries to reclaim a free tail. Great for dodging under pressure.',
        duration: '10 mins',
      },
      coolDown: 'Walk a slow lap of the hall, shaking out hands and arms. Finish with seated hamstring and quad stretches — hold each for 10 seconds.',
      equipment: ['Cones', 'Bibs', 'Whistle'],
    },
    {
      week: 2,
      skillFocus: ['Jumping', 'Hopping'],
      warmUp: 'Star jumps x10, tuck jumps x5, side-to-side hops x10 each foot. Then a light jog for 1 minute.',
      skillFocusDescription: 'Build on Infants work with more controlled take-off and landing. Jumping: two-foot take-off, two-foot land, absorb through ankles, knees, and hips. Hopping: 5 hops on each foot, working on rhythm and distance rather than just count.',
      activity1: {
        name: 'Long Jump Challenge',
        description: 'Mark a take-off line and a landing zone with tape. Children practise two-foot take-off long jumps. Encourage swinging arms forward for momentum. Measure distance informally using foot lengths. Children aim to beat their own previous jump.',
        duration: '10 mins',
      },
      activity2: {
        name: 'Hop Scotch Relay',
        description: 'Create 3 hopscotch grids with tape or chalk. Children hop through alone first to learn the pattern, then run as relay teams — one child completes the grid before the next goes. Focus on foot placement and balance at turns.',
        duration: '10 mins',
      },
      coolDown: 'Seated floor stretches — straddle stretch reaching to each foot, butterfly stretch, and forward fold. Each held for 8 seconds.',
      equipment: ['Tape or chalk', 'Cones', 'Measuring tape (optional)'],
    },
    {
      week: 3,
      skillFocus: ['Throwing', 'Catching'],
      warmUp: 'Partner warm-up: stand 1 metre apart and gently toss a beanbag back and forth 10 times. Progress to bouncing a ball to each other.',
      skillFocusDescription: 'Overarm throw: stand sideways, non-throwing arm points at target, throwing arm pulls back, rotate hips as arm comes through. Catching: watch the ball into the hands, give with the catch to absorb impact. Work on both in quick succession.',
      activity1: {
        name: 'Overarm Target Throw',
        description: 'Set up targets at different distances (hoops on floor, or cones to knock over). Children practise overarm throws at targets. Rotate through stations every 2 minutes. Encourage stepping into the throw. Score by number of targets hit in 5 attempts.',
        duration: '10 mins',
      },
      activity2: {
        name: 'Partner Throw and Catch',
        description: 'Pairs stand 3–5 metres apart throwing a tennis ball or small soft ball. Each successful consecutive catch scores a point. If the ball is dropped, return to zero. Pairs try to reach 10 consecutive catches. Gradually increase distance.',
        duration: '10 mins',
      },
      coolDown: 'Shake out arms from shoulder to fingertip. Gently roll neck side to side. Three deep breaths holding arms wide and releasing them slowly.',
      equipment: ['Beanbags', 'Tennis balls', 'Soft balls', 'Hoops', 'Cones'],
    },
    {
      week: 4,
      skillFocus: ['Kicking', 'Balancing'],
      warmUp: 'Dribble a ball around cones with feet for 2 minutes. Then balance on one foot for 10 seconds each side.',
      skillFocusDescription: 'Kicking: plant non-kicking foot beside the ball, swing kicking leg from hip, contact ball with instep for accuracy. Balancing: hold still positions on one foot, building core stability. Combine by balancing before each kick.',
      activity1: {
        name: 'Penalty Kick Targets',
        description: 'Divide the goal area (or a wall with marked targets) into zones. Children take turns kicking from a set distance, aiming for different zones. Count points scored. Progress to a short run-up before the kick. Encourage use of both feet.',
        duration: '10 mins',
      },
      activity2: {
        name: 'Balance and Kick Relay',
        description: 'Children line up behind a cone. They walk to a marker, balance on one foot for 3 seconds, then kick a stationary ball at a target. Retrieve the ball and jog back to tag the next person. Swap the kicking foot on each turn.',
        duration: '10 mins',
      },
      coolDown: 'Seated figure-four hip stretch (cross one ankle over opposite knee), hold 10 seconds each side. Finish with legs extended and gentle forward fold.',
      equipment: ['Footballs', 'Cones', 'Goal posts or wall targets', 'Tape'],
    },
    {
      week: 5,
      skillFocus: ['Skipping', 'Leaping'],
      warmUp: 'Skip rope warm-up — children skip freely in a space for 1 minute (with or without rope). Then high knees running on the spot x20.',
      skillFocusDescription: 'Skipping with a rope: turn the rope with wrists not whole arms, jump on two feet at first then progress to alternate feet. Leaping: push off one foot, fly through the air, and land on the opposite foot. Practise over low obstacles or marked lines.',
      activity1: {
        name: 'Individual Skip Rope Challenge',
        description: 'Each child has a skip rope. Begin with basic two-foot jumps, then practise skipping steps. Count consecutive skips. Teacher circulates helping with rope timing. Those comfortable can try backward skipping. Celebrate progress over perfection.',
        duration: '10 mins',
      },
      activity2: {
        name: 'Leap the River',
        description: 'Lay two ropes parallel as a "river" that widens at one end (20 cm at narrow end, 60 cm at wide end). Children practise leaping over the river at different widths. Encourage a strong push-off and arms forward. Children choose their challenge width.',
        duration: '10 mins',
      },
      coolDown: 'Walk slowly around the hall once. Then sit, cross legs, and take 5 slow belly breaths together. Gentle side neck stretch each side.',
      equipment: ['Skip ropes', 'Ropes or tape for river'],
    },
    {
      week: 6,
      skillFocus: ['Striking', 'Bouncing/Dribbling'],
      warmUp: 'Bounce and catch a ball on the spot 10 times. Then dribble freely around the hall for 1 minute.',
      skillFocusDescription: 'Striking with a bat or paddle: hold lightly, watch the ball, swing level. Dribbling: push the ball forward with fingertips, keep it close, look up. Combining both improves hand-eye coordination and object control.',
      activity1: {
        name: 'Bat and Ball Rally',
        description: 'In pairs, children use short-handled bats (or rolled-up newspaper bats) to rally a balloon or soft ball back and forth. Count consecutive hits. Focus on watching the ball and a flat, controlled swing. Progress to a larger space with more bounce.',
        duration: '10 mins',
      },
      activity2: {
        name: 'Dribble Slalom',
        description: 'Set up a cone slalom course. Children dribble a ball with their hands through the cones without losing control. First attempt: slow and careful. Second: try to be faster. Swap between dominant and non-dominant hands. Celebrate improvement.',
        duration: '10 mins',
      },
      coolDown: 'Seated wrist circles and shoulder shrugs. Roll down through the spine from seated, relax for 5 seconds, then slowly roll back up. Two big breaths.',
      equipment: ['Short-handled bats or paddles', 'Balloons', 'Soft balls', 'Cones'],
    },
  ],
};

const thirdFourth: ProgrammeData = {
  title: '6-Week PE Programme – 3rd & 4th Class',
  classLevel: '3rd-4th',
  weeks: [
    {
      week: 1,
      skillFocus: ['Running', 'Dodging'],
      warmUp: '2-minute jog, then dynamic stretches: leg swings x10 each, hip rotations, arm circles. Finish with 3 x 15-metre shuttle runs.',
      skillFocusDescription: 'Running mechanics: maintain posture, drive arms in opposition to legs, land mid-foot. Dodging: plant the outside foot and push off explosively to change direction. Combine in small-sided games where both are needed continuously.',
      activity1: {
        name: 'British Bulldog',
        description: 'One or two "bulldogs" stand in the middle of the hall. Others run from one end to the other without being tagged. Tagged players join the bulldogs. Last person standing wins. Emphasise explosive dodging and changes of pace to beat the bulldogs.',
        duration: '10 mins',
      },
      activity2: {
        name: 'Speed and Agility Circuit',
        description: 'Four stations in rotation (2 mins each): 1) sprint between two cones 10m apart, 2) zig-zag through a cone slalom, 3) side-step laterally over a line 10 times, 4) rest/water. Focus on quality movement and proper deceleration technique.',
        duration: '12 mins',
      },
      coolDown: 'Walk one lap, then static stretches: quad stretch standing (30s each), hamstring seated (30s), calf stretch against the wall.',
      equipment: ['Cones', 'Bibs', 'Whistle'],
    },
    {
      week: 2,
      skillFocus: ['Jumping', 'Leaping'],
      warmUp: 'Skip around the perimeter x2, then standing broad jump practice x5. Dynamic quad and hip flexor stretches.',
      skillFocusDescription: 'Jumping for height and distance: use a counter-movement (dip before jumping) and arm swing for power. Leaping for distance: aggressive push-off, full extension in flight, opposite arm to lead leg forward. Apply both in mini athletics contexts.',
      activity1: {
        name: 'Standing Broad Jump Measure',
        description: 'Mark a take-off line. Children perform standing broad jumps with arm swing, landing on two feet. Mark their landing point and repeat 3 times, recording best distance. Teach correct technique before measuring. Discuss how arm swing helps.',
        duration: '10 mins',
      },
      activity2: {
        name: 'Leap Frog Relay',
        description: 'Groups of 5 in lines. The back person leaps over each crouching teammate from back to front, then crouches at the front. Continue until the group has crossed the hall. Focus on a powerful push-off and safe landing. First team across wins.',
        duration: '12 mins',
      },
      coolDown: "Lying quad stretch on the floor (30s each). Seated forward fold with both legs out, hold 30s. Child's pose 30s.",
      equipment: ['Tape', 'Measuring tape', 'Cones'],
    },
    {
      week: 3,
      skillFocus: ['Throwing', 'Catching'],
      warmUp: 'Partner pass warm-up with a tennis ball — underarm, then overarm. Gradually increase distance. 3 minutes.',
      skillFocusDescription: 'Overarm throw: full wind-up, hip rotation leading the arm, wrist snap at release for spin and accuracy. Catching: early hand position, watch the ball in, absorb through shoulders and elbows. Introduce catching while moving.',
      activity1: {
        name: 'Accuracy Throw Challenge',
        description: 'Three target hoops at 5m, 8m, and 10m from a throw line. Children get 5 throws per round, choosing their target. Score 1 point for 5m, 2 for 8m, 3 for 10m. Three rounds total. Encourage stepping into the throw and full body rotation.',
        duration: '10 mins',
      },
      activity2: {
        name: 'End Zone Pass Game',
        description: 'Two teams. Pass a ball (no running with it) to move it down the court and land it in the end zone. A catch in the end zone scores. Defenders intercept passes. Rule: must pass within 3 seconds. Builds throwing under pressure and catching in motion.',
        duration: '12 mins',
      },
      coolDown: 'Slow arm circles forward and back. Doorframe chest stretch. Seated wrist and forearm stretch. 3 deep breaths.',
      equipment: ['Tennis balls', 'Footballs or netballs', 'Hoops', 'Cones', 'Bibs'],
    },
    {
      week: 4,
      skillFocus: ['Kicking', 'Striking'],
      warmUp: 'Ball each, dribble freely for 1 minute, then practise instep kick against a wall. 10 kicks each foot.',
      skillFocusDescription: 'Kicking: approach at slight angle, plant foot level with ball, strike with laces for power or inside for accuracy. Striking with a hurley/bat: grip firmly, watch the ball, swing through contact point. Contrast the two skills and identify similarities in body mechanics.',
      activity1: {
        name: 'Shooting Gallery',
        description: 'Set up 4 cones as a mini goal. Children take turns shooting from various angles and distances, trying to score in different zones of the goal. Introduce a basic goalkeeper rotation. Focus on accuracy before power. Each player gets 8 attempts.',
        duration: '10 mins',
      },
      activity2: {
        name: '2v2 Mini Football',
        description: 'Play 2v2 games on a small pitch with mini goals. Rotate teams every 3 minutes. Focus on passing accurately rather than shooting every time. Discuss when to pass vs shoot. Great for applying kicking in a real game context.',
        duration: '12 mins',
      },
      coolDown: 'Hip flexor lunge stretch (30s each side). Seated piriformis stretch. Spinal twist seated. Slow deep breathing x5.',
      equipment: ['Footballs', 'Cones', 'Mini goals or bibs as goal markers', 'Hurleys (optional)'],
    },
    {
      week: 5,
      skillFocus: ['Bouncing/Dribbling', 'Balancing'],
      warmUp: 'Dribble a basketball (or soft ball) on the spot for 30s, then while walking, then jogging. 3 minutes total.',
      skillFocusDescription: 'Dribbling: keep ball below waist, use fingertip pads not palm, eyes up not on ball. Balancing: focus on core engagement, small controlled movements to correct. Combine by dribbling along a balance beam or narrow taped path.',
      activity1: {
        name: 'Dribble Obstacle Course',
        description: 'Create a course with cones, hoops to dribble around, and a narrow taped path to dribble along. Children complete the course keeping ball control throughout. Add challenge by requiring non-dominant hand only on second attempt. Time optional.',
        duration: '12 mins',
      },
      activity2: {
        name: 'Balance Beam Challenge',
        description: 'Set up balance beams or taped floor lines. Children walk across, then sideways, then backwards, then with arms in different positions. Progress to walking while holding an object. Partners can spot each other on actual beams.',
        duration: '10 mins',
      },
      coolDown: "Tree pose (balance) on each foot for 30s. Seated forward fold. Child's pose. Roll up slowly to standing.",
      equipment: ['Basketballs or soft balls', 'Cones', 'Tape', 'Balance beams (optional)'],
    },
    {
      week: 6,
      skillFocus: ['Galloping', 'Skipping'],
      warmUp: 'Skip rope for 2 minutes (individual or with a long rope). Dynamic warm-up with high knees and butt kicks.',
      skillFocusDescription: 'Galloping: asymmetrical gait where the lead foot steps and the trailing foot closes to it, applied to sport (e.g., moving sideways in defence). Skipping: combine galloping rhythm with a small hop. Use both in team games to reinforce the skill in context.',
      activity1: {
        name: 'Gallop Relay Race',
        description: 'Mark a 15-metre relay course. Teams of 4 race using galloping instead of running. Alternate lead foot: first leg leads with right, second leg leads with left. Third leg may run normally, fourth gallops back. Laughter encouraged — focus on form.',
        duration: '10 mins',
      },
      activity2: {
        name: 'Skip Rope Long Rope Games',
        description: 'Groups of 6–8 with two turners and a long rope. Children jump in and out of the swinging rope. Vary with rhymes, increasing speed, or two jumpers at once. Individual ropes used by those waiting. Builds rhythm, timing, and coordination.',
        duration: '12 mins',
      },
      coolDown: 'Slow walk x2 laps. Seated butterfly stretch. Cross-body shoulder stretch. Three big breaths together.',
      equipment: ['Skip ropes', 'Long ropes', 'Cones', 'Bibs'],
    },
  ],
};

const fifthSixth: ProgrammeData = {
  title: '6-Week PE Programme – 5th & 6th Class',
  classLevel: '5th-6th',
  weeks: [
    {
      week: 1,
      skillFocus: ['Running', 'Dodging'],
      warmUp: '3-minute progressive jog, dynamic stretches (leg swings, hip circles, arm crosses), and 4 x 20m acceleration runs at 70% effort.',
      skillFocusDescription: 'Sprint mechanics: drive phase from start, acceleration, top-end form (tall posture, relaxed face/hands, high knee drive). Dodging: cut technique — plant outside foot at 45°, drop hips, and explode in new direction. Apply in conditioned game contexts.',
      activity1: {
        name: '1v1 Defending Drill',
        description: "One attacker starts with a ball behind a cone; one defender faces them 3m away. Attacker tries to dribble past the defender to a finish line 6m away. Defender tries to stay in front and force them wide. Swap after 5 attempts. Focus on the defender's side-step and recovery run.",
        duration: '12 mins',
      },
      activity2: {
        name: 'Flag Football',
        description: "Teams carry a ball and dodge defenders to cross the end zone. No tackling — defenders try to grab the flag (bib) from the ball carrier's waist. Build in a 3-pass rule before a player can cross the line. Develops explosive dodging and spatial awareness under real pressure.",
        duration: '12 mins',
      },
      coolDown: 'Cool-down jog x1 lap, then static stretches: hip flexors (lunge, 30s), hamstrings (standing fold, 30s), calves (wall, 30s each side).',
      equipment: ['Bibs/flags', 'Cones', 'Ball', 'Whistle'],
    },
    {
      week: 2,
      skillFocus: ['Jumping', 'Leaping'],
      warmUp: 'Skipping x2 laps, bounding strides x3 sets of 20m, plyometric squat jumps x10.',
      skillFocusDescription: 'Plyometric jumping: eccentric loading (dip), explosive concentric push, full arm swing. Leaping for distance: penultimate step, push off powerfully, hang in air, land on opposite foot and absorb. Apply to hurdles, bounding, and sport-specific contexts.',
      activity1: {
        name: 'Triple Jump Sequence',
        description: 'Mark a take-off zone. Teach the triple jump sequence: hop (same foot landing), step (opposite foot landing), jump (two-foot landing). Children practise the sequence at slow pace first, then build speed. Focus on rhythm and technique rather than distance. Measure best attempt.',
        duration: '12 mins',
      },
      activity2: {
        name: 'Hurdle Run',
        description: 'Set up 5 mini hurdles or low cones at 1m intervals. Children sprint and leap over each hurdle, landing on the opposite foot and continuing. Alternate lead leg on each run. Focus on not breaking stride. Progress to faster approaches as confidence builds.',
        duration: '10 mins',
      },
      coolDown: 'Lying single-leg hamstring stretch (30s each). Pigeon pose (30s each side). Spinal twist x5 each way.',
      equipment: ['Mini hurdles or cones', 'Tape', 'Measuring tape'],
    },
    {
      week: 3,
      skillFocus: ['Throwing', 'Catching'],
      warmUp: 'Shoulder mobility circuit: arm circles x15 each, cross-body stretch, resistance band if available. Partner throw warm-up at 5m, 8m, 10m.',
      skillFocusDescription: 'Throwing for accuracy and velocity: full hip and shoulder rotation, elbow leads the throw, wrist snap. Advanced catching: one-handed slips, catching while sprinting, catching under pressure from defenders. Both skills applied in a game context.',
      activity1: {
        name: 'Long Ball Accuracy Challenge',
        description: 'Mark three target zones at 10m, 15m, and 20m. Children attempt 6 throws each at their chosen target. Score 1, 2, or 3 points per target. Two rounds. Focus on mechanics: full rotation, step into throw, release point. Discuss grip adjustments for spin.',
        duration: '10 mins',
      },
      activity2: {
        name: 'Interceptor Game',
        description: 'Two teams of 4. Team A tries to make 5 consecutive passes without interception. Team B must intercept or force a bad pass. After 5 passes or a turnover, roles switch. Defenders can only intercept — no contact. Builds throwing under pressure and reading defence.',
        duration: '12 mins',
      },
      coolDown: "Thoracic rotation stretch. Wrist and forearm flex/extend (30s). Child's pose x30s.",
      equipment: ['Footballs or Gaelic footballs', 'Bibs', 'Cones'],
    },
    {
      week: 4,
      skillFocus: ['Kicking', 'Striking'],
      warmUp: 'Dribble and shoot routine for 3 minutes. 10 instep kicks at wall, 10 side-foot kicks at cones.',
      skillFocusDescription: 'Kicking: placement kick (inside foot, chest over ball) vs power kick (laces, hip through). Striking: mechanics of hurling/tennis/rounders swing — grip, stance, backswing, contact zone, follow-through. Analyse own technique against model.',
      activity1: {
        name: '3v2 Shooting Game',
        description: 'Attackers (3) vs defenders (2) plus goalkeeper. Attackers start from halfway and try to score. Defenders apply pressure. Rotate roles every 3 rounds. Focus attacker attention on when to shoot vs pass. Goalkeeper must stay on the line until ball is kicked.',
        duration: '12 mins',
      },
      activity2: {
        name: 'Striking Skills Station',
        description: 'Three stations (4 mins each): 1) Striking a suspended ball (target practice), 2) Rounders batting from a tee, 3) Tennis serve into a marked box. Emphasise the similarity of the swing mechanics across sports. Focus on timing and clean contact.',
        duration: '12 mins',
      },
      coolDown: 'Hip opener stretch (pigeon pose, 30s each). IT band stretch. Deep breathing x5.',
      equipment: ['Footballs', 'Rounders bat and ball', 'Tennis racquets and balls', 'Cones', 'Mini goals'],
    },
    {
      week: 5,
      skillFocus: ['Bouncing/Dribbling', 'Rolling'],
      warmUp: 'Basketball dribble warm-up: stationary, walking, jogging, direction changes, speed dribble. 3 minutes.',
      skillFocusDescription: 'Advanced dribbling: crossover, behind-the-back, and in-and-out moves in basketball; quick ground passes in other sports. Rolling in sport context: shoulder roll from a fall (safety), rolling a ball with backspin/topspin. Builds versatile object control.',
      activity1: {
        name: 'Basketball 3v3',
        description: 'Play 3v3 basketball on a half court. Focus on no-look passes, driving to the basket, and using the dribble to create space. Defenders play man-to-man. Rotate teams every 3 minutes. Award a bonus point for an assist that leads to a score.',
        duration: '12 mins',
      },
      activity2: {
        name: 'Bowling Target Challenge',
        description: 'Set up pins (or cones) in a triangle at three different distances. Children roll a football or basketball to knock them all down in as few rolls as possible. Experiment with speed and angle. Introduces rolling with control, aim, and release height.',
        duration: '10 mins',
      },
      coolDown: 'Foam roller or seated glute stretch (if available). Forward fold. Quad stretch standing. Slow neck stretches.',
      equipment: ['Basketballs', 'Footballs', 'Cones', 'Bibs'],
    },
    {
      week: 6,
      skillFocus: ['Balancing', 'Galloping'],
      warmUp: 'Yoga-inspired warm-up: sun salutation x3, warrior pose x30s each side, and a light jog for 1 minute.',
      skillFocusDescription: 'Balance in sport: single-leg landing mechanics, balance recovery after a contact, proprioceptive training. Galloping applied to sport: lateral defensive shuffle (analogous to galloping) and crossover step in court sports. Combine in game-based tasks.',
      activity1: {
        name: 'Defensive Slide Drill',
        description: 'Pairs face each other 2m apart. One leads, moving left and right. The partner mirrors using a lateral gallop/shuffle step to stay square. Progress to 3v3 in a small zone where defenders must use this footwork pattern throughout. Applied directly to basketball, football, and handball defence.',
        duration: '12 mins',
      },
      activity2: {
        name: 'Single-Leg Balance Circuit',
        description: 'Four stations: 1) Stand on one leg for 30s eyes open, then closed; 2) catch and throw while balanced on one foot; 3) hop to landing spot and freeze; 4) balance on a wobble board or folded mat. Focus on micro-adjustments and core engagement rather than just not falling.',
        duration: '10 mins',
      },
      coolDown: 'Full-body progressive muscle relaxation: tense and release each muscle group from feet to face. Finish lying still for 1 minute listening to calm music.',
      equipment: ['Cones', 'Bibs', 'Wobble boards or folded mats (optional)', 'Music player'],
    },
  ],
};

export const STATIC_PROGRAMMES: Record<string, ProgrammeData> = {
  'Infants': infants,
  '1st-2nd': firstSecond,
  '3rd-4th': thirdFourth,
  '5th-6th': fifthSixth,
};
