/*
  Warnings:

  - The `slipId` column on the `TransportTransaction` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "TransportTransaction" ALTER COLUMN "paymentDate" DROP DEFAULT,
ALTER COLUMN "createdAt" DROP DEFAULT,
ALTER COLUMN "concession" DROP NOT NULL,
ALTER COLUMN "concession" DROP DEFAULT,
ALTER COLUMN "dueAmount" DROP DEFAULT,
ALTER COLUMN "fine" DROP NOT NULL,
ALTER COLUMN "fine" DROP DEFAULT,
DROP COLUMN "slipId",
ADD COLUMN     "slipId" INTEGER;
