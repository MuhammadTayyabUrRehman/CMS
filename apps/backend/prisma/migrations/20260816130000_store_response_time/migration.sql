ALTER TABLE "complaints" ADD COLUMN "responseTimeSeconds" INTEGER;

UPDATE "complaints"
SET "responseTimeSeconds" = GREATEST(0, EXTRACT(EPOCH FROM ("dispatchTime" - "submittedAt"))::int)
WHERE "dispatchTime" IS NOT NULL;
