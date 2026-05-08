// One-time demo seed — run with: node scripts/seed-demo.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ── existing IDs (from DB query) ─────────────────────────────────────────────
const ST_PAT   = 'cmoh277tt0001vhk0in3pgwra';   // St. Patrick's Primary School
const SCOIL    = 'cmoh278180002vhk06frywu9z';   // Scoil Bhríde

const SARAH    = 'cmoh278990004vhk0qi0a6ib9';   // Sarah Johnson (St. Pat's)
const CONOR    = 'cmoh278gy0006vhk0l3fvsag0';   // Conor Walsh   (St. Pat's)
const MICHAEL  = 'cmoh278qs000avhk0v9taj72o';   // Michael O'Donnell (Scoil)
const AOIFE    = 'cmoh278lv0008vhk08ap1r6ot';   // Aoife Brennan (Scoil)

const EMMA     = 'cmoh278ve000bvhk0tjdygds6';   // Emma Thompson (coach)
const LIAM     = 'cmoh2792q000cvhk0sv3t2nee';   // Liam Murphy   (coach)
const NIAMH    = 'cmoh2797c000dvhk09lbr0qc2';   // Niamh Kelly   (coach)

const FMS_PROG = 'cmoh279t7000nvhk05dpdf0zz';   // FMS Fundamentals (St. Pat's)
const GAA_PROG = 'cmoh279yn000pvhk0yjp0xo1z';   // GAA Skills       (Scoil)

// ── helpers ───────────────────────────────────────────────────────────────────
const d = (y, m, day) => new Date(y, m - 1, day);
const fms = obj => JSON.stringify(obj);

async function main() {
  // ── 1. Classes ──────────────────────────────────────────────────────────────
  console.log('Creating classes…');
  const [cls5A, cls6B, cls4, cls3A, cls6S] = await Promise.all([
    prisma.class.create({ data: { name: '5th Class A', yearGroup: '5', schoolId: ST_PAT, teacherId: SARAH } }),
    prisma.class.create({ data: { name: '6th Class B', yearGroup: '6', schoolId: ST_PAT, teacherId: SARAH } }),
    prisma.class.create({ data: { name: '4th Class',   yearGroup: '4', schoolId: ST_PAT, teacherId: CONOR } }),
    prisma.class.create({ data: { name: '3rd Class A', yearGroup: '3', schoolId: SCOIL,  teacherId: MICHAEL } }),
    prisma.class.create({ data: { name: '6th Class',   yearGroup: '6', schoolId: SCOIL,  teacherId: AOIFE } }),
  ]);
  console.log('  ✓ 5 classes created');

  // ── 2. Assessments ──────────────────────────────────────────────────────────
  // 5th Class A — 4 assessments showing clear FMS improvement
  console.log('Creating assessments…');
  await prisma.assessment.createMany({ data: [
    {
      classId: cls5A.id, coachId: EMMA, date: d(2026, 1, 14),
      notes: 'Baseline assessment. Most pupils still developing core locomotor patterns.',
      fmsScores: fms({ Running: 1, Jumping: 1, Catching: 1, Throwing: 1, Balance: 1, Kicking: 1 }),
    },
    {
      classId: cls5A.id, coachId: EMMA, date: d(2026, 2, 11),
      notes: 'Good progress on balance and running. Catching still needs work.',
      fmsScores: fms({ Running: 2, Jumping: 1, Catching: 1, Throwing: 2, Balance: 2, Kicking: 1 }),
    },
    {
      classId: cls5A.id, coachId: EMMA, date: d(2026, 3, 11),
      notes: 'Strong session — most pupils now at competency level for running and balance.',
      fmsScores: fms({ Running: 2, Jumping: 2, Catching: 2, Throwing: 2, Balance: 2, Kicking: 2 }),
    },
    {
      classId: cls5A.id, coachId: EMMA, date: d(2026, 4, 8),
      notes: 'Excellent improvement across the board. Throwing and kicking showing most growth.',
      fmsScores: fms({ Running: 3, Jumping: 2, Catching: 2, Throwing: 3, Balance: 3, Kicking: 2 }),
    },
  ]});

  // 6th Class B — 3 assessments starting at a higher baseline
  await prisma.assessment.createMany({ data: [
    {
      classId: cls6B.id, coachId: LIAM, date: d(2025, 10, 8),
      notes: 'Strong baseline. 6th class pupils comfortable with most movements.',
      fmsScores: fms({ Running: 2, Jumping: 2, Catching: 2, Throwing: 2, Balance: 2, Kicking: 1 }),
    },
    {
      classId: cls6B.id, coachId: LIAM, date: d(2025, 11, 12),
      notes: 'Kicking technique improved significantly after targeted drills.',
      fmsScores: fms({ Running: 2, Jumping: 2, Catching: 2, Throwing: 2, Balance: 2, Kicking: 2 }),
    },
    {
      classId: cls6B.id, coachId: LIAM, date: d(2025, 12, 10),
      notes: 'Final assessment of term. Running, balance and throwing at mastery level.',
      fmsScores: fms({ Running: 3, Jumping: 3, Catching: 2, Throwing: 3, Balance: 3, Kicking: 2 }),
    },
  ]});

  // 4th Class — 2 assessments (just starting)
  await prisma.assessment.createMany({ data: [
    {
      classId: cls4.id, coachId: NIAMH, date: d(2026, 2, 19),
      notes: 'First assessment. Younger group, most skills at emerging stage.',
      fmsScores: fms({ Running: 1, Jumping: 1, Catching: 1, Throwing: 1, Balance: 1, Kicking: 0 }),
    },
    {
      classId: cls4.id, coachId: NIAMH, date: d(2026, 3, 25),
      notes: 'Balance and jumping showing nice gains after the FMS block.',
      fmsScores: fms({ Running: 1, Jumping: 2, Catching: 1, Throwing: 1, Balance: 2, Kicking: 1 }),
    },
  ]});

  // 3rd Class A — 2 assessments (GAA focused)
  await prisma.assessment.createMany({ data: [
    {
      classId: cls3A.id, coachId: EMMA, date: d(2026, 3, 5),
      notes: 'GAA skills baseline — kicking and catching are the focus this block.',
      fmsScores: fms({ Running: 1, Jumping: 1, Catching: 1, Throwing: 1, Kicking: 1 }),
    },
    {
      classId: cls3A.id, coachId: EMMA, date: d(2026, 4, 9),
      notes: 'Good improvement in catching and kicking after 4 weeks of GAA sessions.',
      fmsScores: fms({ Running: 2, Jumping: 1, Catching: 2, Throwing: 1, Kicking: 2 }),
    },
  ]});

  // 6th Class (Scoil) — 1 assessment
  await prisma.assessment.create({ data: {
    classId: cls6S.id, coachId: LIAM, date: d(2025, 11, 5),
    notes: 'High ability group. All movements at competency or mastery.',
    fmsScores: fms({ Running: 3, Jumping: 3, Catching: 3, Throwing: 2, Balance: 3, Kicking: 2 }),
  }});

  console.log('  ✓ 12 assessments created');

  // ── 3. Bookings ─────────────────────────────────────────────────────────────
  console.log('Creating bookings…');
  await prisma.booking.createMany({ data: [
    // 5th Class A — active FMS block
    { schoolId: ST_PAT, classId: cls5A.id, programmeId: FMS_PROG, coachId: EMMA,  startDate: d(2026, 1, 13), endDate: d(2026, 4, 25), status: 'confirmed' },
    // 6th Class B — completed FMS block last term
    { schoolId: ST_PAT, classId: cls6B.id, programmeId: FMS_PROG, coachId: LIAM,  startDate: d(2025, 10, 1), endDate: d(2025, 12, 19), status: 'completed' },
    // 4th Class — upcoming FMS block
    { schoolId: ST_PAT, classId: cls4.id,  programmeId: FMS_PROG, coachId: NIAMH, startDate: d(2026, 2, 17), endDate: d(2026, 5, 16), status: 'confirmed' },
    // 3rd Class A — active GAA block
    { schoolId: SCOIL,  classId: cls3A.id, programmeId: GAA_PROG, coachId: EMMA,  startDate: d(2026, 3, 3),  endDate: d(2026, 5, 30), status: 'confirmed' },
    // 6th Class (Scoil) — completed GAA block
    { schoolId: SCOIL,  classId: cls6S.id, programmeId: GAA_PROG, coachId: LIAM,  startDate: d(2025, 10, 6), endDate: d(2025, 12, 19), status: 'completed' },
  ]});
  console.log('  ✓ 5 bookings created');

  console.log('\nSeed complete. Log in as any teacher to see real data.\n');
  console.log('  sarah@stpatricks.ie  → 5th Class A, 6th Class B');
  console.log('  conor@stpatricks.ie  → 4th Class');
  console.log('  michael@scoilbhride.ie → 3rd Class A');
  console.log('  aoife@scoilbhride.ie   → 6th Class');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
