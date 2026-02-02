/*
  Warnings:

  - The primary key for the `subjects` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `subjects` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "catalog"."_DepartmentToSubject" DROP CONSTRAINT "_DepartmentToSubject_B_fkey";

-- DropForeignKey
ALTER TABLE "catalog"."_FacultyToSubject" DROP CONSTRAINT "_FacultyToSubject_B_fkey";

-- AlterTable
ALTER TABLE "catalog"."subjects" DROP CONSTRAINT "subjects_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "subjects_pkey" PRIMARY KEY ("code");

-- AddForeignKey
ALTER TABLE "catalog"."_FacultyToSubject" ADD CONSTRAINT "_FacultyToSubject_B_fkey" FOREIGN KEY ("B") REFERENCES "catalog"."subjects"("code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog"."_DepartmentToSubject" ADD CONSTRAINT "_DepartmentToSubject_B_fkey" FOREIGN KEY ("B") REFERENCES "catalog"."subjects"("code") ON DELETE CASCADE ON UPDATE CASCADE;
