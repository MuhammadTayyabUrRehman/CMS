-- AlterTable
ALTER TABLE "complaints" ADD COLUMN     "submittedById" TEXT;

-- CreateIndex
CREATE INDEX "complaints_submittedById_idx" ON "complaints"("submittedById");

-- AddForeignKey
ALTER TABLE "complaints" ADD CONSTRAINT "complaints_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
