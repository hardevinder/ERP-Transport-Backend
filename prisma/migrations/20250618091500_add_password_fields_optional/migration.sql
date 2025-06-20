-- AlterTable
ALTER TABLE "Driver" ADD COLUMN     "password" TEXT;

-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "password" TEXT;

-- CreateTable
CREATE TABLE "TransportOrgProfile" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "contact" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "website" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TransportOrgProfile_pkey" PRIMARY KEY ("id")
);
