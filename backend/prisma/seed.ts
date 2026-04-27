import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding local dev database...');

  // ── Admin ────────────────────────────────────────────────────────────────
  const adminHash = await bcrypt.hash('Reds1234', 10);
  await prisma.user.upsert({
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
  console.log('Coaches created');

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

  console.log('\nDone! Login details:');
  console.log('  Admin:    bryansoraghan@activerootsacademy.com / Reds1234');
  console.log('  Teachers: sarah@stpatricks.ie / Teacher123  (and conor, aoife, michael)');
  console.log('  School codes: STPAT1 (St Patricks) · SBRID2 (Scoil Bhride)');
}

main()
  .catch(e => { console.error('Seed failed:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
