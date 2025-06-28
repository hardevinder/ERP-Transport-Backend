/*
  Warnings:

  - A unique constraint covering the columns `[razorpayPaymentId]` on the table `TransportTransaction` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "TransportTransaction" ADD COLUMN     "razorpayOrderId" TEXT,
ADD COLUMN     "razorpayPaymentId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "TransportTransaction_razorpayPaymentId_key" ON "TransportTransaction"("razorpayPaymentId");
