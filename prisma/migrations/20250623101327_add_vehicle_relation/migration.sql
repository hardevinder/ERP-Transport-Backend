/*
  Warnings:

  - A unique constraint covering the columns `[vehicleId]` on the table `Route` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Route" ADD COLUMN     "vehicleId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Route_vehicleId_key" ON "Route"("vehicleId");

-- AddForeignKey
ALTER TABLE "Route" ADD CONSTRAINT "Route_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE SET NULL ON UPDATE CASCADE;
