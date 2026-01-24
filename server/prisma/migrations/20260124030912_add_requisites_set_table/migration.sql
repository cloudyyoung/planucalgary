-- CreateTable
CREATE TABLE "catalog"."requisite_sets" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "csid" TEXT NOT NULL,
    "requisite_set_group_id" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "json" JSONB,
    "requisite_set_created_at" TIMESTAMP(3) NOT NULL,
    "requisite_set_last_updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "requisite_sets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "requisite_sets_csid_key" ON "catalog"."requisite_sets"("csid");
