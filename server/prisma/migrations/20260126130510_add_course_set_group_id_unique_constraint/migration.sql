/*
  Warnings:

  - A unique constraint covering the columns `[course_set_group_id]` on the table `course_sets` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "course_sets_course_set_group_id_key" ON "catalog"."course_sets"("course_set_group_id");
