/*
  Warnings:

  - You are about to drop the `_CourseToRequisite` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "catalog"."_CourseToRequisite" DROP CONSTRAINT "_CourseToRequisite_A_fkey";

-- DropForeignKey
ALTER TABLE "catalog"."_CourseToRequisite" DROP CONSTRAINT "_CourseToRequisite_B_fkey";

-- AlterTable
ALTER TABLE "catalog"."course_sets" ADD COLUMN     "requisiteId" TEXT;

-- DropTable
DROP TABLE "catalog"."_CourseToRequisite";

-- AddForeignKey
ALTER TABLE "catalog"."course_sets" ADD CONSTRAINT "course_sets_requisiteId_fkey" FOREIGN KEY ("requisiteId") REFERENCES "catalog"."requisites"("id") ON DELETE SET NULL ON UPDATE CASCADE;
