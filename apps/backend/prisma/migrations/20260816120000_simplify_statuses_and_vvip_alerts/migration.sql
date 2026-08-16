-- Collapse legacy workflow states before replacing the PostgreSQL enum.
UPDATE "complaints"
SET "status" = 'ACKNOWLEDGED'
WHERE "status"::text IN ('IN_PROGRESS', 'ESCALATED', 'RESOLVED', 'CLOSED');

UPDATE "complaint_updates"
SET "status" = 'ACKNOWLEDGED'
WHERE "status"::text IN ('IN_PROGRESS', 'ESCALATED', 'RESOLVED', 'CLOSED');

ALTER TYPE "Status" RENAME TO "Status_old";
CREATE TYPE "Status" AS ENUM ('NEW', 'ACKNOWLEDGED');
ALTER TABLE "complaints" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "complaints" ALTER COLUMN "status" TYPE "Status" USING ("status"::text::"Status");
ALTER TABLE "complaints" ALTER COLUMN "status" SET DEFAULT 'NEW';
ALTER TABLE "complaint_updates" ALTER COLUMN "status" TYPE "Status" USING ("status"::text::"Status");
DROP TYPE "Status_old";

CREATE TYPE "NotificationType" AS ENUM ('NORMAL', 'VVIP_ALERT');
ALTER TABLE "notifications" ADD COLUMN "type" "NotificationType" NOT NULL DEFAULT 'NORMAL';
CREATE INDEX "notifications_recipientType_type_isRead_sentAt_idx"
ON "notifications"("recipientType", "type", "isRead", "sentAt");
