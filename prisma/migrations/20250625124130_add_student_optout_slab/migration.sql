-- CreateTable
CREATE TABLE "StudentOptOutSlab" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "feeStructureId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudentOptOutSlab_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StudentOptOutSlab_studentId_feeStructureId_key" ON "StudentOptOutSlab"("studentId", "feeStructureId");

-- AddForeignKey
ALTER TABLE "StudentOptOutSlab" ADD CONSTRAINT "StudentOptOutSlab_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentOptOutSlab" ADD CONSTRAINT "StudentOptOutSlab_feeStructureId_fkey" FOREIGN KEY ("feeStructureId") REFERENCES "TransportFeeStructure"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
