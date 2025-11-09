-- CreateTable
CREATE TABLE "catalog"."course_sets" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "course_set_group_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "json" JSONB,
    "course_set_last_updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "course_sets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "course_sets_course_set_group_id_key" ON "catalog"."course_sets"("course_set_group_id");
