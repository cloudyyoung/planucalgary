/*
  Warnings:

  - You are about to drop the column `requisiteId` on the `course_sets` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "catalog"."course_sets" DROP CONSTRAINT "course_sets_requisiteId_fkey";

-- AlterTable
ALTER TABLE "catalog"."course_sets" DROP COLUMN "requisiteId";

-- CreateTable
CREATE TABLE "catalog"."_CourseSetToRequisite" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CourseSetToRequisite_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_CourseSetToRequisite_B_index" ON "catalog"."_CourseSetToRequisite"("B");

-- AddForeignKey
ALTER TABLE "catalog"."_CourseSetToRequisite" ADD CONSTRAINT "_CourseSetToRequisite_A_fkey" FOREIGN KEY ("A") REFERENCES "catalog"."course_sets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog"."_CourseSetToRequisite" ADD CONSTRAINT "_CourseSetToRequisite_B_fkey" FOREIGN KEY ("B") REFERENCES "catalog"."requisites"("id") ON DELETE CASCADE ON UPDATE CASCADE;
