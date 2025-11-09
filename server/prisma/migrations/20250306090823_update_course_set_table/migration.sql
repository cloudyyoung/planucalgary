/*
  Warnings:

  - A unique constraint covering the columns `[csid]` on the table `course_sets` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `course_set_created_at` to the `course_sets` table without a default value. This is not possible if the table is not empty.
  - Added the required column `csid` to the `course_sets` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "catalog"."course_sets_course_set_group_id_key";

-- AlterTable
ALTER TABLE "catalog"."course_sets" ADD COLUMN     "course_set_created_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "csid" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "course_sets_csid_key" ON "catalog"."course_sets"("csid");
