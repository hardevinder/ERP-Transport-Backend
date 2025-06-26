-- DropForeignKey
ALTER TABLE "RouteStop" DROP CONSTRAINT "RouteStop_routeId_fkey";

-- AlterTable
ALTER TABLE "RouteStop" ALTER COLUMN "routeId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "RouteStop" ADD CONSTRAINT "RouteStop_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "Route"("id") ON DELETE SET NULL ON UPDATE CASCADE;
