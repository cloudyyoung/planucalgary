/*
  Warnings:

  - You are about to drop the column `json` on the `course_sets` table. All the data in the column will be lost.
  - You are about to drop the column `antireq_json` on the `courses` table. All the data in the column will be lost.
  - You are about to drop the column `coreq_json` on the `courses` table. All the data in the column will be lost.
  - You are about to drop the column `prereq_json` on the `courses` table. All the data in the column will be lost.
  - You are about to drop the column `json` on the `requisite_sets` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "catalog"."course_sets" DROP COLUMN "json";

-- AlterTable
ALTER TABLE "catalog"."courses" DROP COLUMN "antireq_json",
DROP COLUMN "coreq_json",
DROP COLUMN "prereq_json";

-- AlterTable
ALTER TABLE "catalog"."requisite_sets" DROP COLUMN "json";
