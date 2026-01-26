-- AlterTable
ALTER TABLE "catalog"."course_sets" ADD COLUMN     "fieldOfStudyId" TEXT;

-- CreateTable
CREATE TABLE "catalog"."fields_of_study" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "notes" TEXT,

    CONSTRAINT "fields_of_study_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "fields_of_study_name_key" ON "catalog"."fields_of_study"("name");

-- AddForeignKey
ALTER TABLE "catalog"."course_sets" ADD CONSTRAINT "course_sets_fieldOfStudyId_fkey" FOREIGN KEY ("fieldOfStudyId") REFERENCES "catalog"."fields_of_study"("id") ON DELETE SET NULL ON UPDATE CASCADE;
