import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding local dev database...');

  // ── Admin ────────────────────────────────────────────────────────────────
  const adminHash = await bcrypt.hash('Reds1234', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'bryansoraghan@activerootsacademy.com' },
    update: {},
    create: {
      email: 'bryansoraghan@activerootsacademy.com',
      password: adminHash,
      name: 'Bryan Soraghan',
      role: 'admin',
    },
  });
  console.log('Admin user created — bryansoraghan@activerootsacademy.com / Reds1234');

  // ── Schools ──────────────────────────────────────────────────────────────
  const school1 = await prisma.school.upsert({
    where: { name: "St. Patrick's Primary School" },
    update: {},
    create: {
      name: "St. Patrick's Primary School",
      schoolCode: 'STPAT1',
      address: '12 Main Street, Dublin 7',
      phone: '01-234-5678',
      principal: 'Ms. Catherine Murphy',
      email: 'principal@stpatricks.ie',
    },
  });

  const school2 = await prisma.school.upsert({
    where: { name: 'Scoil Bhríde' },
    update: {},
    create: {
      name: 'Scoil Bhríde',
      schoolCode: 'SBRID2',
      address: '45 Oak Avenue, Cork',
      phone: '021-987-6543',
      principal: "Mr. John O'Brien",
      email: 'principal@scoilbhride.ie',
    },
  });
  console.log('Schools created — codes: STPAT1, SBRID2');

  // ── Teachers ─────────────────────────────────────────────────────────────
  const teacherHash = await bcrypt.hash('Teacher123', 10);

  const teacher1 = await prisma.teacher.upsert({
    where: { email: 'sarah@stpatricks.ie' },
    update: {},
    create: {
      name: 'Sarah Johnson',
      email: 'sarah@stpatricks.ie',
      password: teacherHash,
      schoolId: school1.id,
    },
  });

  const teacher2 = await prisma.teacher.upsert({
    where: { email: 'conor@stpatricks.ie' },
    update: {},
    create: {
      name: 'Conor Walsh',
      email: 'conor@stpatricks.ie',
      password: teacherHash,
      schoolId: school1.id,
    },
  });

  const teacher3 = await prisma.teacher.upsert({
    where: { email: 'aoife@scoilbhride.ie' },
    update: {},
    create: {
      name: 'Aoife Brennan',
      email: 'aoife@scoilbhride.ie',
      password: teacherHash,
      schoolId: school2.id,
    },
  });

  const teacher4 = await prisma.teacher.upsert({
    where: { email: 'michael@scoilbhride.ie' },
    update: {},
    create: {
      name: "Michael O'Donnell",
      email: 'michael@scoilbhride.ie',
      password: teacherHash,
      schoolId: school2.id,
    },
  });
  console.log('Teachers created — all use password: Teacher123');

  // ── Coaches ──────────────────────────────────────────────────────────────
  const coachHash = await bcrypt.hash('Coach123', 10);

  // User accounts (for login)
  await prisma.user.upsert({
    where: { email: 'emma@activeroots.ie' },
    update: {},
    create: { email: 'emma@activeroots.ie', password: coachHash, name: 'Emma Thompson', role: 'coach' },
  });
  await prisma.user.upsert({
    where: { email: 'liam@activeroots.ie' },
    update: {},
    create: { email: 'liam@activeroots.ie', password: coachHash, name: 'Liam Murphy', role: 'coach' },
  });
  await prisma.user.upsert({
    where: { email: 'niamh@activeroots.ie' },
    update: {},
    create: { email: 'niamh@activeroots.ie', password: coachHash, name: 'Niamh Kelly', role: 'coach' },
  });

  // Operational coach records (for bookings/assessments)
  const coach1 = await prisma.coach.upsert({
    where: { email: 'emma@activeroots.ie' },
    update: {},
    create: {
      name: 'Emma Thompson',
      email: 'emma@activeroots.ie',
      phone: '087-111-2233',
      specialisation: 'FMS',
      isPlacement: false,
    },
  });

  const coach2 = await prisma.coach.upsert({
    where: { email: 'liam@activeroots.ie' },
    update: {},
    create: {
      name: 'Liam Murphy',
      email: 'liam@activeroots.ie',
      phone: '087-444-5566',
      specialisation: 'PE',
      isPlacement: false,
    },
  });

  const coach3 = await prisma.coach.upsert({
    where: { email: 'niamh@activeroots.ie' },
    update: {},
    create: {
      name: 'Niamh Kelly',
      email: 'niamh@activeroots.ie',
      phone: '085-777-8899',
      specialisation: 'GAA',
      isPlacement: true,
    },
  });
  console.log('Coaches created — all use password: Coach123');

  // ── Classes ──────────────────────────────────────────────────────────────
  const class1 = await prisma.class.create({
    data: { name: '5th Class A', yearGroup: '5th Class', schoolId: school1.id, teacherId: teacher1.id },
  });
  const class2 = await prisma.class.create({
    data: { name: '6th Class B', yearGroup: '6th Class', schoolId: school1.id, teacherId: teacher2.id },
  });
  const class3 = await prisma.class.create({
    data: { name: '3rd Class', yearGroup: '3rd Class', schoolId: school2.id, teacherId: teacher3.id },
  });
  const class4 = await prisma.class.create({
    data: { name: '4th Class', yearGroup: '4th Class', schoolId: school2.id, teacherId: teacher4.id },
  });
  console.log('Classes created');

  // ── Programmes ───────────────────────────────────────────────────────────
  const prog1 = await prisma.programmeBlock.create({
    data: {
      name: 'FMS Fundamentals',
      description: '6-week Fundamental Movement Skills programme',
      duration: 6,
      type: 'fms',
      schoolId: school1.id,
    },
  });

  const prog2 = await prisma.programmeBlock.create({
    data: {
      name: 'GAA Skills',
      description: '4-week GAA skills development programme',
      duration: 4,
      type: 'pe',
      schoolId: school2.id,
    },
  });
  console.log('Programmes created');

  // ── Bookings ─────────────────────────────────────────────────────────────
  await prisma.booking.create({
    data: {
      schoolId: school1.id,
      classId: class1.id,
      programmeId: prog1.id,
      coachId: coach1.id,
      startDate: new Date('2026-05-05'),
      endDate: new Date('2026-06-16'),
      status: 'confirmed',
    },
  });

  await prisma.booking.create({
    data: {
      schoolId: school1.id,
      classId: class2.id,
      programmeId: prog1.id,
      coachId: coach2.id,
      startDate: new Date('2026-05-12'),
      endDate: new Date('2026-06-23'),
      status: 'confirmed',
    },
  });

  await prisma.booking.create({
    data: {
      schoolId: school2.id,
      classId: class3.id,
      programmeId: prog2.id,
      coachId: coach3.id,
      startDate: new Date('2026-05-19'),
      endDate: new Date('2026-06-09'),
      status: 'pending',
    },
  });
  console.log('Bookings created');

  // ── Assessments ──────────────────────────────────────────────────────────
  await prisma.assessment.create({
    data: {
      classId: class1.id,
      coachId: coach1.id,
      date: new Date('2026-04-22'),
      notes: 'Good progress on balance and coordination. A few students need extra support with throwing.',
      fmsScores: JSON.stringify({ balance: 7, coordination: 6, strength: 8, flexibility: 5, overall: 6.5 }),
    },
  });

  await prisma.assessment.create({
    data: {
      classId: class2.id,
      coachId: coach2.id,
      date: new Date('2026-04-23'),
      notes: 'Strong group overall. Jumping technique needs work.',
      fmsScores: JSON.stringify({ balance: 8, coordination: 7, strength: 7, flexibility: 6, overall: 7 }),
    },
  });
  console.log('Assessments created');

  // ── Placements ───────────────────────────────────────────────────────────
  await prisma.placement.create({
    data: { coachId: coach3.id, schoolId: school2.id, hours: 20, notes: 'Midterm placement — performing well' },
  });
  console.log('Placements created');

  // ── Movement Breaks ───────────────────────────────────────────────────────
  await prisma.movementBreak.createMany({
    data: [
      {
        title: '5-Minute Energy Boost',
        description: 'Quick movement break to re-energise the class',
        duration: 300,
        ageGroup: 'junior',
        instructions: '1. Stand up\n2. Do 10 jumping jacks\n3. Do 5 star jumps\n4. Spin around slowly\n5. Shake it out!',
      },
      {
        title: 'Brain Break Stretch',
        description: 'Gentle stretching and breathing to refocus',
        duration: 180,
        ageGroup: 'senior',
        instructions: '1. Stand tall\n2. Reach arms to the sky — hold 5 seconds\n3. Touch your toes slowly\n4. Roll shoulders back x5\n5. Take 3 deep breaths',
      },
    ],
  });
  console.log('Movement breaks created');

  // ── Admin is also the coach — no separate account needed ─────────────────
  const onlineCoachUser = adminUser;
  console.log('Coach linked to admin account — bryansoraghan@activerootsacademy.com / Reds1234');

  // ── Example client ───────────────────────────────────────────────────────
  const clientHash = await bcrypt.hash('Client123', 10);
  const clientUser = await prisma.user.upsert({
    where: { email: 'john.kelly@example.com' },
    update: {},
    create: {
      email: 'john.kelly@example.com',
      password: clientHash,
      name: 'John Kelly',
      role: 'client',
    },
  });

  const existingClient = await prisma.coachingClient.findUnique({ where: { userId: clientUser.id } });
  if (!existingClient) {
    const client = await prisma.coachingClient.create({
      data: {
        userId: clientUser.id,
        coachId: onlineCoachUser.id,
        age: 28,
        startingWeight: 88.5,
        height: 180,
        goals: 'Build lean muscle, improve strength on the big lifts, and drop body fat to around 12%. Want to run a 5k without stopping by end of the block.',
        startDate: new Date('2026-03-01'),
        status: 'active',
      },
    });

    // Training plan
    const plan = await prisma.trainingPlan.create({
      data: {
        clientId: client.id,
        coachId: onlineCoachUser.id,
        name: '12-Week Strength Block',
        notes: 'Progressive overload focusing on compound lifts. 4 days per week upper/lower split.',
        startDate: new Date('2026-03-03'),
        isActive: true,
      },
    });

    // Day 1 — Upper A
    const day1 = await prisma.trainingDay.create({
      data: { planId: plan.id, name: 'Upper A — Push', dayOfWeek: 1, order: 1 },
    });
    await prisma.exercise.createMany({
      data: [
        { dayId: day1.id, name: 'Barbell Bench Press', sets: 4, reps: '6', weight: '80', rpe: 8, order: 1, notes: 'Full ROM, pause at chest' },
        { dayId: day1.id, name: 'Overhead Press', sets: 3, reps: '8', weight: '50', rpe: 7, order: 2 },
        { dayId: day1.id, name: 'Incline Dumbbell Press', sets: 3, reps: '10', weight: '28', rpe: 7, order: 3 },
        { dayId: day1.id, name: 'Tricep Pushdown', sets: 3, reps: '12', weight: '25', rpe: 6, order: 4 },
      ],
    });

    // Day 2 — Lower A
    const day2 = await prisma.trainingDay.create({
      data: { planId: plan.id, name: 'Lower A — Squat Focus', dayOfWeek: 3, order: 2 },
    });
    await prisma.exercise.createMany({
      data: [
        { dayId: day2.id, name: 'Back Squat', sets: 4, reps: '5', weight: '110', rpe: 8, order: 1, notes: 'Hit depth, brace hard' },
        { dayId: day2.id, name: 'Romanian Deadlift', sets: 3, reps: '10', weight: '80', rpe: 7, order: 2 },
        { dayId: day2.id, name: 'Leg Press', sets: 3, reps: '12', weight: '160', rpe: 7, order: 3 },
        { dayId: day2.id, name: 'Calf Raise', sets: 4, reps: '15', weight: '60', rpe: 6, order: 4 },
      ],
    });

    // Day 3 — Upper B
    const day3 = await prisma.trainingDay.create({
      data: { planId: plan.id, name: 'Upper B — Pull', dayOfWeek: 5, order: 3 },
    });
    await prisma.exercise.createMany({
      data: [
        { dayId: day3.id, name: 'Deadlift', sets: 3, reps: '5', weight: '140', rpe: 8, order: 1 },
        { dayId: day3.id, name: 'Barbell Row', sets: 4, reps: '8', weight: '70', rpe: 7, order: 2 },
        { dayId: day3.id, name: 'Pull-ups', sets: 3, reps: '8', weight: '0', rpe: 7, order: 3, notes: 'Bodyweight, full dead hang' },
        { dayId: day3.id, name: 'Barbell Curl', sets: 3, reps: '12', weight: '30', rpe: 6, order: 4 },
      ],
    });

    // Nutrition targets
    await prisma.coachingNutritionTarget.create({
      data: {
        clientId: client.id,
        coachId: onlineCoachUser.id,
        calories: 2600,
        protein: 190,
        carbs: 270,
        fats: 75,
        water: 3.5,
        notes: 'High protein to support muscle gain. Carbs timed around training.',
      },
    });

    // Check-ins (last 6 weeks)
    const checkIns = [
      { daysAgo: 42, weight: 88.5, energy: 6, sleep: 6, mood: 6, notes: 'First week, adjusting to the volume.' },
      { daysAgo: 35, weight: 88.1, energy: 7, sleep: 7, mood: 7, notes: 'Feeling better. Bench pressing smoother.' },
      { daysAgo: 28, weight: 87.6, energy: 7, sleep: 7, mood: 8, notes: 'Good week. Hit a new squat PB.' },
      { daysAgo: 21, weight: 87.2, energy: 8, sleep: 8, mood: 8, notes: 'Energy through the roof. Sleep is great.' },
      { daysAgo: 14, weight: 86.9, energy: 8, sleep: 7, mood: 8, notes: 'Slight DOMS but loving the progress.' },
      { daysAgo: 7,  weight: 86.4, energy: 9, sleep: 8, mood: 9, notes: 'Feeling lean and strong. Clothes fitting better.' },
    ];
    for (const ci of checkIns) {
      const d = new Date(); d.setDate(d.getDate() - ci.daysAgo);
      await prisma.coachingCheckIn.create({
        data: {
          clientId: client.id,
          date: d.toISOString().slice(0, 10),
          weight: ci.weight,
          energyLevel: ci.energy,
          sleepQuality: ci.sleep,
          mood: ci.mood,
          notes: ci.notes,
        },
      });
      await prisma.coachingProgressEntry.create({
        data: { clientId: client.id, weight: ci.weight, date: d.toISOString().slice(0, 10) },
      });
    }

    // Personal records
    await prisma.coachingPersonalRecord.createMany({
      data: [
        { clientId: client.id, exerciseName: 'Back Squat', weight: 117.5, reps: 3, loggedAt: new Date(Date.now() - 14 * 86400000) },
        { clientId: client.id, exerciseName: 'Deadlift', weight: 150, reps: 1, loggedAt: new Date(Date.now() - 21 * 86400000) },
        { clientId: client.id, exerciseName: 'Barbell Bench Press', weight: 87.5, reps: 3, loggedAt: new Date(Date.now() - 7 * 86400000) },
      ],
    });

    // Goals
    await prisma.coachingGoal.createMany({
      data: [
        { clientId: client.id, coachId: onlineCoachUser.id, type: 'strength', title: '120kg Squat', description: 'Hit 120kg for a solid triple', startValue: 100, currentValue: 117.5, targetValue: 120, unit: 'kg', status: 'active', deadline: new Date('2026-06-01') },
        { clientId: client.id, coachId: onlineCoachUser.id, type: 'weight', title: 'Drop to 84kg', description: 'Reduce bodyweight while keeping strength', startValue: 88.5, currentValue: 86.4, targetValue: 84, unit: 'kg', status: 'active', deadline: new Date('2026-06-01') },
        { clientId: client.id, coachId: onlineCoachUser.id, type: 'strength', title: '100kg Bench Press', description: 'Three-plate bench', startValue: 80, currentValue: 87.5, targetValue: 100, unit: 'kg', status: 'active', deadline: new Date('2026-07-01') },
      ],
    });

    console.log('Example client created — john.kelly@example.com / Client123');
  } else {
    console.log('Example client already exists — skipping');
  }

  console.log('\nDone! Login details:');
  console.log('  Admin/Coach:  bryansoraghan@activerootsacademy.com / Reds1234');
  console.log('  Client:       john.kelly@example.com / Client123');
  console.log('  Teachers:     sarah@stpatricks.ie / Teacher123  (and conor, aoife, michael)');
  console.log('  Coaches:      emma@activeroots.ie / Coach123  (and liam, niamh)');
  console.log('  School codes: STPAT1 (St Patricks) · SBRID2 (Scoil Bhride)');
}

main()
  .catch(e => { console.error('Seed failed:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
