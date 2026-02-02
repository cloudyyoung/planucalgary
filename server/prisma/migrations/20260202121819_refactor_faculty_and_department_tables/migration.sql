/*
  Warnings:

  - The primary key for the `departments` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `departments` table. All the data in the column will be lost.
  - The primary key for the `faculties` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `faculties` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "catalog"."_CourseToDepartment" DROP CONSTRAINT "_CourseToDepartment_B_fkey";

-- DropForeignKey
ALTER TABLE "catalog"."_CourseToFaculty" DROP CONSTRAINT "_CourseToFaculty_B_fkey";

-- DropForeignKey
ALTER TABLE "catalog"."_DepartmentToFaculty" DROP CONSTRAINT "_DepartmentToFaculty_A_fkey";

-- DropForeignKey
ALTER TABLE "catalog"."_DepartmentToFaculty" DROP CONSTRAINT "_DepartmentToFaculty_B_fkey";

-- DropForeignKey
ALTER TABLE "catalog"."_DepartmentToProgram" DROP CONSTRAINT "_DepartmentToProgram_A_fkey";

-- DropForeignKey
ALTER TABLE "catalog"."_DepartmentToSubject" DROP CONSTRAINT "_DepartmentToSubject_A_fkey";

-- DropForeignKey
ALTER TABLE "catalog"."_FacultyToProgram" DROP CONSTRAINT "_FacultyToProgram_A_fkey";

-- DropForeignKey
ALTER TABLE "catalog"."_FacultyToSubject" DROP CONSTRAINT "_FacultyToSubject_A_fkey";

-- DropForeignKey
ALTER TABLE "catalog"."courses_topics" DROP CONSTRAINT "courses_topics_course_id_fkey";

-- DropIndex
DROP INDEX "catalog"."departments_code_key";

-- DropIndex
DROP INDEX "catalog"."faculties_code_key";

-- AlterTable
ALTER TABLE "catalog"."departments" DROP CONSTRAINT "departments_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "departments_pkey" PRIMARY KEY ("code");

-- AlterTable
ALTER TABLE "catalog"."faculties" DROP CONSTRAINT "faculties_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "faculties_pkey" PRIMARY KEY ("code");

-- AddForeignKey
ALTER TABLE "catalog"."courses_topics" ADD CONSTRAINT "courses_topics_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "catalog"."courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog"."_CourseToDepartment" ADD CONSTRAINT "_CourseToDepartment_B_fkey" FOREIGN KEY ("B") REFERENCES "catalog"."departments"("code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog"."_CourseToFaculty" ADD CONSTRAINT "_CourseToFaculty_B_fkey" FOREIGN KEY ("B") REFERENCES "catalog"."faculties"("code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog"."_FacultyToProgram" ADD CONSTRAINT "_FacultyToProgram_A_fkey" FOREIGN KEY ("A") REFERENCES "catalog"."faculties"("code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog"."_FacultyToSubject" ADD CONSTRAINT "_FacultyToSubject_A_fkey" FOREIGN KEY ("A") REFERENCES "catalog"."faculties"("code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog"."_DepartmentToFaculty" ADD CONSTRAINT "_DepartmentToFaculty_A_fkey" FOREIGN KEY ("A") REFERENCES "catalog"."departments"("code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog"."_DepartmentToFaculty" ADD CONSTRAINT "_DepartmentToFaculty_B_fkey" FOREIGN KEY ("B") REFERENCES "catalog"."faculties"("code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog"."_DepartmentToSubject" ADD CONSTRAINT "_DepartmentToSubject_A_fkey" FOREIGN KEY ("A") REFERENCES "catalog"."departments"("code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog"."_DepartmentToProgram" ADD CONSTRAINT "_DepartmentToProgram_A_fkey" FOREIGN KEY ("A") REFERENCES "catalog"."departments"("code") ON DELETE CASCADE ON UPDATE CASCADE;
