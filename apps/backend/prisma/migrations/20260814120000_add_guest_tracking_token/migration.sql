-- Add the unguessable guest-only lookup credential.
ALTER TABLE "complaints" ADD COLUMN "trackingToken" VARCHAR(64);

CREATE UNIQUE INDEX "complaints_trackingToken_key" ON "complaints"("trackingToken");

-- Supports the complainant unread-notification polling query.
CREATE INDEX "notifications_recipientType_isRead_sentAt_idx"
ON "notifications"("recipientType", "isRead", "sentAt");
