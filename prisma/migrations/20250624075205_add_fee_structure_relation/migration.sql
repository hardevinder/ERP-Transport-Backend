/*
  Warnings:

  - Added the required column `feeStructureId` to the `TransportTransaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TransportTransaction" ADD COLUMN     "feeStructureId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "TransportTransaction" ADD CONSTRAINT "TransportTransaction_feeStructureId_fkey" FOREIGN KEY ("feeStructureId") REFERENCES "TransportFeeStructure"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
