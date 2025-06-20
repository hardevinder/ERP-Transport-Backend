-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "concessionId" TEXT;

-- AlterTable
ALTER TABLE "TransportTransaction" ADD COLUMN     "concession" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "dueAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "fine" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "fineConcession" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "ConcessionSetting" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConcessionSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FineSetting" (
    "id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "duration" TEXT NOT NULL,
    "applyFrom" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FineSetting_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_concessionId_fkey" FOREIGN KEY ("concessionId") REFERENCES "ConcessionSetting"("id") ON DELETE SET NULL ON UPDATE CASCADE;
