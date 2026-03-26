-- DropForeignKey
ALTER TABLE "catalog"."_CourseSetToFieldOfStudy" DROP CONSTRAINT "_CourseSetToFieldOfStudy_A_fkey";

-- DropForeignKey
ALTER TABLE "catalog"."_CourseSetToFieldOfStudy" DROP CONSTRAINT "_CourseSetToFieldOfStudy_B_fkey";

-- DropTable
DROP TABLE "catalog"."_CourseSetToFieldOfStudy";

-- AlterTable
ALTER TABLE "catalog"."fields_of_study" ADD COLUMN "requisite_set_id" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "fields_of_study_requisite_set_id_key" ON "catalog"."fields_of_study"("requisite_set_id");

-- AddForeignKey
ALTER TABLE "catalog"."fields_of_study" ADD CONSTRAINT "fields_of_study_requisite_set_id_fkey" FOREIGN KEY ("requisite_set_id") REFERENCES "catalog"."requisite_sets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "catalog"."fields_of_study" DROP COLUMN "description", DROP COLUMN "notes";
