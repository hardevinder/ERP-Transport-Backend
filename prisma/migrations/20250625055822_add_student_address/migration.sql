/*
  Warnings:

  - You are about to drop the column `addressLine` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `cityOrVillage` on the `Student` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Student" DROP COLUMN "addressLine",
DROP COLUMN "cityOrVillage";
