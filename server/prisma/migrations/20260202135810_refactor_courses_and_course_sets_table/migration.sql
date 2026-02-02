/*
  Warnings:

  - You are about to drop the column `csid` on the `course_sets` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[course_group_id]` on the table `courses` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "catalog"."course_sets_csid_key";

-- AlterTable
ALTER TABLE "catalog"."course_sets" DROP COLUMN "csid",
ADD COLUMN     "course_set_effective_end_date" TIMESTAMP(3),
ADD COLUMN     "course_set_effective_start_date" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "catalog"."_CourseToCourseSet" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CourseToCourseSet_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_CourseToCourseSet_B_index" ON "catalog"."_CourseToCourseSet"("B");

-- CreateIndex
CREATE UNIQUE INDEX "courses_course_group_id_key" ON "catalog"."courses"("course_group_id");

-- AddForeignKey
ALTER TABLE "catalog"."_CourseToCourseSet" ADD CONSTRAINT "_CourseToCourseSet_A_fkey" FOREIGN KEY ("A") REFERENCES "catalog"."courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog"."_CourseToCourseSet" ADD CONSTRAINT "_CourseToCourseSet_B_fkey" FOREIGN KEY ("B") REFERENCES "catalog"."course_sets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
