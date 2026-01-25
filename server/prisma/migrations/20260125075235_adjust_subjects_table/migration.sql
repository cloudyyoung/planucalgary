-- DropIndex
DROP INDEX "catalog"."subject_code_title_unique";

-- DropIndex
DROP INDEX "catalog"."subject_title_unique";

-- DropIndex
DROP INDEX "catalog"."subjects_title_key";

-- AlterTable
ALTER TABLE "catalog"."faculties" ADD COLUMN     "subjectId" TEXT;

-- AddForeignKey
ALTER TABLE "catalog"."faculties" ADD CONSTRAINT "faculties_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "catalog"."subjects"("id") ON DELETE SET NULL ON UPDATE CASCADE;
