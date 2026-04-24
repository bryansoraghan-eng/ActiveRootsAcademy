import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create schools
  const school1 = await prisma.school.create({
    data: {
      name: 'St. Patrick\'s Primary School',
      address: '123 Main Street, Dublin',
      phone: '01-234-5678',
      principal: 'Ms. Catherine Murphy',
      email: 'principal@stpatricks.ie',
    },
  });

  const school2 = await prisma.school.create({
    data: {
      name: 'Scoil Bhríde',
      address: '456 Oak Avenue, Cork',
      phone: '021-987-6543',
      principal: 'Mr. John O\'Brien',
      email: 'principal@scoilbhride.ie',
    },
  });

  console.log('✅ Created schools');

  // Create teachers
  const teacher1 = await prisma.teacher.create({
    data: {
      name: 'Sarah Johnson',
      email: 'sarah@stpatricks.ie',
      password: 'hashedPassword123', // In real app, hash this
      school: { connect: { id: school1.id } },
    },
  });

  const teacher2 = await prisma.teacher.create({
    data: {
      name: 'Michael O\'Donnell',
      email: 'michael@scoilbhride.ie',
      password: 'hashedPassword456',
      school: { connect: { id: school2.id } },
    },
  });

  console.log('✅ Created teachers');

  // Create classes
  const class1 = await prisma.class.create({
    data: {
      name: '5th Class',
      yearGroup: 'Fifth Year',
      school: { connect: { id: school1.id } },
      teacher: { connect: { id: teacher1.id } },
    },
  });

  const class2 = await prisma.class.create({
    data: {
      name: '6th Class',
      yearGroup: 'Sixth Year',
      school: { connect: { id: school1.id } },
      teacher: { connect: { id: teacher1.id } },
    },
  });

  const class3 = await prisma.class.create({
    data: {
      name: '4th Class',
      yearGroup: 'Fourth Year',
      school: { connect: { id: school2.id } },
      teacher: { connect: { id: teacher2.id } },
    },
  });

  console.log('✅ Created classes');

  // Create coaches
  const coach1 = await prisma.coach.create({
    data: {
      name: 'Emma Thompson',
      email: 'emma@activeroots.ie',
      phone: '087-1234567',
      specialisation: 'FMS',
    },
  });

  const coach2 = await prisma.coach.create({
    data: {
      name: 'Liam Murphy',
      email: 'liam@activeroots.ie',
      phone: '087-9876543',
      specialisation: 'PE',
    },
  });

  console.log('✅ Created coaches');

  // Create programme blocks
  const prog1 = await prisma.programmeBlock.create({
    data: {
      name: 'FMS Fundamentals',
      description: '6-week Fundamental Movement Skills programme',
      duration: 6,
      type: 'fms',
      school: { connect: { id: school1.id } },
    },
  });

  const prog2 = await prisma.programmeBlock.create({
    data: {
      name: 'PE Active Lifestyle',
      description: '4-week Physical Education & Active Lifestyle programme',
      duration: 4,
      type: 'pe',
      school: { connect: { id: school1.id } },
    },
  });

  console.log('✅ Created programme blocks');

  // Create bookings
  const booking1 = await prisma.booking.create({
    data: {
      school: { connect: { id: school1.id } },
      class: { connect: { id: class1.id } },
      programme: { connect: { id: prog1.id } },
      coach: { connect: { id: coach1.id } },
      startDate: new Date('2026-05-01'),
      endDate: new Date('2026-06-12'),
      status: 'confirmed',
    },
  });

  console.log('✅ Created bookings');

  // Create assessments
  const assessment1 = await prisma.assessment.create({
    data: {
      class: { connect: { id: class1.id } },
      coach: { connect: { id: coach1.id } },
      date: new Date('2026-04-20'),
      notes: 'Good progress on balance and coordination',
      fmsScores: JSON.stringify({
        balance: 7,
        coordination: 6,
        strength: 8,
        flexibility: 5,
        overall: 6.5,
      }),
    },
  });

  console.log('✅ Created assessments');

  // Create placements
  const placement1 = await prisma.placement.create({
    data: {
      coach: { connect: { id: coach1.id } },
      school: { connect: { id: school1.id } },
      hours: 40,
      notes: 'Excellent progress. Ready for advanced training.',
    },
  });

  console.log('✅ Created placements');

  // Create placement students
  const placementStudent1 = await prisma.placementStudent.create({
    data: {
      name: 'Aoife Kelly',
      school: { connect: { id: school1.id } },
      yeartarget: '6th year',
      collegeTarget: 'DCU',
      notes: 'Interested in PE teaching',
    },
  });

  console.log('✅ Created placement students');

  // Create movement breaks
  const movementBreak1 = await prisma.movementBreak.create({
    data: {
      title: '5-Minute Energy Boost',
      description: 'Quick movement break to re-energize the class',
      duration: 300,
      ageGroup: 'junior',
      instructions: '1. Stand up\n2. Do 10 jumping jacks\n3. Do 5 star jumps\n4. Spin around 5 times\n5. Shake it out!',
    },
  });

  console.log('✅ Created movement breaks');

  // Create nutrition lessons
  const nutritionLesson1 = await prisma.nutritionLesson.create({
    data: {
      title: 'Balanced Diet Basics',
      description: 'Understanding the food pyramid and balanced nutrition',
      resources: JSON.stringify({
        video: 'https://example.com/nutrition-basics',
        pdf: 'https://example.com/nutrition-guide.pdf',
      }),
    },
  });

  console.log('✅ Created nutrition lessons');

  // Create users
  const user1 = await prisma.user.create({
    data: {
      email: 'principal@stpatricks.ie',
      password: 'hashedPassword789',
      name: 'Ms. Catherine Murphy',
      role: 'principal',
      school: { connect: { id: school1.id } },
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'coach1@activeroots.ie',
      password: 'hashedPassword999',
      name: 'Emma Thompson',
      role: 'coach',
      school: { connect: { id: school1.id } },
    },
  });

  console.log('✅ Created users');

  console.log('🎉 Database seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
