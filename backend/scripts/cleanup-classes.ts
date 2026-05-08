import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const deletedAssessments = await prisma.assessment.deleteMany({});
  console.log(`Deleted ${deletedAssessments.count} assessment(s)`);

  const deletedClasses = await prisma.class.deleteMany({});
  console.log(`Deleted ${deletedClasses.count} class(es)`);

  console.log('Done. Database is clean — recreate your classes via the admin panel.');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
