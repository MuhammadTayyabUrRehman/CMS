-- CreateTable
CREATE TABLE "sequence_counters" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "current" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sequence_counters_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sequence_counters_name_key" ON "sequence_counters"("name");

-- Backfill counters from existing complaints so the sequence continues from
-- the highest number already assigned (no-op on an empty complaints table).
INSERT INTO "sequence_counters" ("id", "name", "current", "updatedAt")
SELECT gen_random_uuid(),
       'complaint-' || EXTRACT(YEAR FROM "submittedAt")::int,
       MAX(CAST(SUBSTRING("complaintNumber" FROM '(\d+)$') AS INT)),
       NOW()
FROM "complaints"
GROUP BY EXTRACT(YEAR FROM "submittedAt")
ON CONFLICT ("name") DO NOTHING;
