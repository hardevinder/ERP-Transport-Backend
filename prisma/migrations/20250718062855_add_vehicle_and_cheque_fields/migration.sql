-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "vehicleId" TEXT;

-- AlterTable
ALTER TABLE "TransportTransaction" ADD COLUMN     "bankName" TEXT,
ADD COLUMN     "chequeDate" TIMESTAMP(3),
ADD COLUMN     "chequeNo" TEXT;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE SET NULL ON UPDATE CASCADE;
