/*
  Warnings:

  - Made the column `slab` on table `TransportTransaction` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "TransportTransaction" ALTER COLUMN "slab" SET NOT NULL;
