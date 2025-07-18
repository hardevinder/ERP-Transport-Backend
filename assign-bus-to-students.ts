import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function assignBusToAllStudents() {
  const vehicleId = 'c7e5ae53-b410-4f06-8fc6-bb00894d3180'; // Bus No. 1

  const updated = await prisma.student.updateMany({
    data: {
      vehicleId,
    },
  });

  console.log(`✅ Assigned Bus No. 1 to ${updated.count} students`);
}

assignBusToAllStudents()
  .catch((err) => {
    console.error('❌ Error updating students:', err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
