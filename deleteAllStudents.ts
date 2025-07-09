import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const res = await prisma.student.deleteMany();
  console.log(`✅ Deleted ${res.count} students.`);
}

main().finally(() => prisma.$disconnect());
