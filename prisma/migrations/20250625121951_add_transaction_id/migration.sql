-- AlterTable
ALTER TABLE "TransportTransaction" ADD COLUMN     "transactionId" TEXT,
ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP;
