/*
  Warnings:

  - You are about to drop the column `csid` on the `requisite_sets` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "catalog"."requisite_sets_csid_key";

-- AlterTable
ALTER TABLE "catalog"."course_sets" ADD COLUMN     "course_list" TEXT[];

-- AlterTable
ALTER TABLE "catalog"."requisite_sets" DROP COLUMN "csid",
ADD COLUMN     "requisite_set_effective_end_date" TIMESTAMP(3),
ADD COLUMN     "requisite_set_effective_start_date" TIMESTAMP(3);
