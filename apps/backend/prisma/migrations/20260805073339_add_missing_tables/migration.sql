/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "Category" AS ENUM ('SOFTWARE_HARDWARE', 'INTERNET', 'E_OFFICE', 'OTHER');

-- CreateEnum
CREATE TYPE "ContactMethod" AS ENUM ('PTCL', 'INTERCOMM');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('NEW', 'ACKNOWLEDGED', 'IN_PROGRESS', 'ESCALATED', 'RESOLVED', 'CLOSED');

-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'IT_STAFF';

-- DropForeignKey
ALTER TABLE "PasswordReset" DROP CONSTRAINT "PasswordReset_userId_fkey";

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "fullName" VARCHAR(150) NOT NULL,
    "employeeId" TEXT NOT NULL,
    "department" "Department" NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(25),
    "role" "Role" NOT NULL DEFAULT 'USER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "complaints" (
    "id" TEXT NOT NULL,
    "complaintNumber" VARCHAR(30) NOT NULL,
    "roomNo" VARCHAR(15) NOT NULL,
    "block" VARCHAR(5) NOT NULL,
    "rank" SMALLINT NOT NULL,
    "category" "Category" NOT NULL,
    "contactMethod" "ContactMethod" NOT NULL,
    "contactNumber" VARCHAR(20) NOT NULL,
    "description" TEXT NOT NULL,
    "priorityLevel" SMALLINT NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'NEW',
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "timerExpiresAt" TIMESTAMP(3),
    "assignedToId" TEXT,
    "technicianName" VARCHAR(150),
    "dispatchTime" TIMESTAMP(3),

    CONSTRAINT "complaints_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "complaint_updates" (
    "id" TEXT NOT NULL,
    "complaintId" TEXT NOT NULL,
    "handledById" TEXT,
    "status" "Status" NOT NULL,
    "comment" TEXT,
    "updateDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "complaint_updates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "complaintId" TEXT NOT NULL,
    "recipientType" VARCHAR(30) NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "sid" VARCHAR NOT NULL,
    "sess" JSONB NOT NULL,
    "expire" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("sid")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_employeeId_key" ON "users"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE UNIQUE INDEX "complaints_complaintNumber_key" ON "complaints"("complaintNumber");

-- CreateIndex
CREATE INDEX "complaints_status_idx" ON "complaints"("status");

-- CreateIndex
CREATE INDEX "complaints_rank_idx" ON "complaints"("rank");

-- CreateIndex
CREATE INDEX "complaints_submittedAt_idx" ON "complaints"("submittedAt");

-- CreateIndex
CREATE INDEX "complaints_assignedToId_idx" ON "complaints"("assignedToId");

-- CreateIndex
CREATE INDEX "complaints_category_idx" ON "complaints"("category");

-- CreateIndex
CREATE INDEX "complaints_timerExpiresAt_idx" ON "complaints"("timerExpiresAt");

-- CreateIndex
CREATE INDEX "complaints_rank_submittedAt_idx" ON "complaints"("rank", "submittedAt");

-- CreateIndex
CREATE INDEX "complaint_updates_complaintId_idx" ON "complaint_updates"("complaintId");

-- CreateIndex
CREATE INDEX "complaint_updates_handledById_idx" ON "complaint_updates"("handledById");

-- CreateIndex
CREATE INDEX "complaint_updates_updateDate_idx" ON "complaint_updates"("updateDate");

-- CreateIndex
CREATE INDEX "notifications_complaintId_idx" ON "notifications"("complaintId");

-- CreateIndex
CREATE INDEX "notifications_sentAt_idx" ON "notifications"("sentAt");

-- CreateIndex
CREATE INDEX "notifications_isRead_idx" ON "notifications"("isRead");

-- CreateIndex
CREATE INDEX "sessions_expire_idx" ON "sessions"("expire");

-- AddForeignKey
ALTER TABLE "complaints" ADD CONSTRAINT "complaints_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "complaint_updates" ADD CONSTRAINT "complaint_updates_complaintId_fkey" FOREIGN KEY ("complaintId") REFERENCES "complaints"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "complaint_updates" ADD CONSTRAINT "complaint_updates_handledById_fkey" FOREIGN KEY ("handledById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_complaintId_fkey" FOREIGN KEY ("complaintId") REFERENCES "complaints"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "PasswordReset" ADD CONSTRAINT "PasswordReset_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
