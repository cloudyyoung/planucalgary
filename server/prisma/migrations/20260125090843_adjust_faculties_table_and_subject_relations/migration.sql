/*
  Warnings:

  - You are about to drop the column `subjectId` on the `faculties` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "catalog"."faculties" DROP CONSTRAINT "faculties_subjectId_fkey";

-- AlterTable
ALTER TABLE "catalog"."faculties" DROP COLUMN "subjectId";

-- CreateTable
CREATE TABLE "catalog"."_FacultyToSubject" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_FacultyToSubject_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_FacultyToSubject_B_index" ON "catalog"."_FacultyToSubject"("B");

-- AddForeignKey
ALTER TABLE "catalog"."_FacultyToSubject" ADD CONSTRAINT "_FacultyToSubject_A_fkey" FOREIGN KEY ("A") REFERENCES "catalog"."faculties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog"."_FacultyToSubject" ADD CONSTRAINT "_FacultyToSubject_B_fkey" FOREIGN KEY ("B") REFERENCES "catalog"."subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
