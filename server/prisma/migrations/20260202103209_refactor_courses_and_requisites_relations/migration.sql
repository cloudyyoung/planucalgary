/*
  Warnings:

  - You are about to drop the column `cid` on the `courses` table. All the data in the column will be lost.
  - You are about to drop the column `coursedog_id` on the `courses` table. All the data in the column will be lost.
  - You are about to drop the column `program_id` on the `requisites` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[course_id]` on the table `courses` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `course_id` to the `courses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `course_last_synced_at` to the `courses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `is_archived` to the `courses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `is_blind_grading` to the `courses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `is_can_schedule` to the `courses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `is_catalog_print` to the `courses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `is_course_approved` to the `courses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `is_exam_only_course` to the `courses` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "catalog"."requisites" DROP CONSTRAINT "requisites_program_id_fkey";

-- DropIndex
DROP INDEX "catalog"."courses_cid_key";

-- AlterTable
ALTER TABLE "catalog"."courses" DROP COLUMN "cid",
DROP COLUMN "coursedog_id",
ADD COLUMN     "antireq_id" TEXT,
ADD COLUMN     "consent" TEXT,
ADD COLUMN     "coreq_id" TEXT,
ADD COLUMN     "course_effective_end_date" TIMESTAMP(3),
ADD COLUMN     "course_id" TEXT NOT NULL,
ADD COLUMN     "course_last_synced_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "drop_consent" TEXT,
ADD COLUMN     "end_term" JSONB,
ADD COLUMN     "is_archived" BOOLEAN NOT NULL,
ADD COLUMN     "is_blind_grading" BOOLEAN NOT NULL,
ADD COLUMN     "is_can_schedule" BOOLEAN NOT NULL,
ADD COLUMN     "is_catalog_print" BOOLEAN NOT NULL,
ADD COLUMN     "is_course_approved" BOOLEAN NOT NULL,
ADD COLUMN     "is_exam_only_course" BOOLEAN NOT NULL,
ADD COLUMN     "prereq_id" TEXT,
ADD COLUMN     "start_term" JSONB,
ALTER COLUMN "course_effective_start_date" DROP NOT NULL;

-- AlterTable
ALTER TABLE "catalog"."requisites" DROP COLUMN "program_id";

-- CreateTable
CREATE TABLE "catalog"."_CourseToRequisite" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CourseToRequisite_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "catalog"."_CourseToRequisiteRule" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CourseToRequisiteRule_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "catalog"."_ProgramToRequisite" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ProgramToRequisite_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "catalog"."_ProgramToRequisiteRule" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ProgramToRequisiteRule_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_CourseToRequisite_B_index" ON "catalog"."_CourseToRequisite"("B");

-- CreateIndex
CREATE INDEX "_CourseToRequisiteRule_B_index" ON "catalog"."_CourseToRequisiteRule"("B");

-- CreateIndex
CREATE INDEX "_ProgramToRequisite_B_index" ON "catalog"."_ProgramToRequisite"("B");

-- CreateIndex
CREATE INDEX "_ProgramToRequisiteRule_B_index" ON "catalog"."_ProgramToRequisiteRule"("B");

-- CreateIndex
CREATE UNIQUE INDEX "courses_course_id_key" ON "catalog"."courses"("course_id");

-- AddForeignKey
ALTER TABLE "catalog"."courses" ADD CONSTRAINT "courses_prereq_id_fkey" FOREIGN KEY ("prereq_id") REFERENCES "catalog"."requisites"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog"."courses" ADD CONSTRAINT "courses_coreq_id_fkey" FOREIGN KEY ("coreq_id") REFERENCES "catalog"."requisites"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog"."courses" ADD CONSTRAINT "courses_antireq_id_fkey" FOREIGN KEY ("antireq_id") REFERENCES "catalog"."requisites"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog"."_CourseToRequisite" ADD CONSTRAINT "_CourseToRequisite_A_fkey" FOREIGN KEY ("A") REFERENCES "catalog"."courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog"."_CourseToRequisite" ADD CONSTRAINT "_CourseToRequisite_B_fkey" FOREIGN KEY ("B") REFERENCES "catalog"."requisites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog"."_CourseToRequisiteRule" ADD CONSTRAINT "_CourseToRequisiteRule_A_fkey" FOREIGN KEY ("A") REFERENCES "catalog"."courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog"."_CourseToRequisiteRule" ADD CONSTRAINT "_CourseToRequisiteRule_B_fkey" FOREIGN KEY ("B") REFERENCES "catalog"."requisite_rules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog"."_ProgramToRequisite" ADD CONSTRAINT "_ProgramToRequisite_A_fkey" FOREIGN KEY ("A") REFERENCES "catalog"."programs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog"."_ProgramToRequisite" ADD CONSTRAINT "_ProgramToRequisite_B_fkey" FOREIGN KEY ("B") REFERENCES "catalog"."requisites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog"."_ProgramToRequisiteRule" ADD CONSTRAINT "_ProgramToRequisiteRule_A_fkey" FOREIGN KEY ("A") REFERENCES "catalog"."programs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog"."_ProgramToRequisiteRule" ADD CONSTRAINT "_ProgramToRequisiteRule_B_fkey" FOREIGN KEY ("B") REFERENCES "catalog"."requisite_rules"("id") ON DELETE CASCADE ON UPDATE CASCADE;
