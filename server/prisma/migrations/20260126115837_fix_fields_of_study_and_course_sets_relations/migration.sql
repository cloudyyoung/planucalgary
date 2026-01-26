/*
  Warnings:

  - You are about to drop the column `fieldOfStudyId` on the `course_sets` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "catalog"."course_sets" DROP CONSTRAINT "course_sets_fieldOfStudyId_fkey";

-- AlterTable
ALTER TABLE "catalog"."course_sets" DROP COLUMN "fieldOfStudyId";

-- CreateTable
CREATE TABLE "catalog"."_CourseSetToFieldOfStudy" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CourseSetToFieldOfStudy_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_CourseSetToFieldOfStudy_B_index" ON "catalog"."_CourseSetToFieldOfStudy"("B");

-- AddForeignKey
ALTER TABLE "catalog"."_CourseSetToFieldOfStudy" ADD CONSTRAINT "_CourseSetToFieldOfStudy_A_fkey" FOREIGN KEY ("A") REFERENCES "catalog"."course_sets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog"."_CourseSetToFieldOfStudy" ADD CONSTRAINT "_CourseSetToFieldOfStudy_B_fkey" FOREIGN KEY ("B") REFERENCES "catalog"."fields_of_study"("id") ON DELETE CASCADE ON UPDATE CASCADE;
