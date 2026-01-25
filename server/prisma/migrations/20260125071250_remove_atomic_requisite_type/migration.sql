/*
  Warnings:

  - The values [ATOMIC] on the enum `RequisiteType` will be removed. If these variants are still used in the database, this will fail.

*/
-- Drop ATOMIC data
DELETE FROM "catalog"."requisites_jsons" WHERE "requisite_type" = 'ATOMIC';

-- AlterEnum
BEGIN;
CREATE TYPE "catalog"."RequisiteType_new" AS ENUM ('PREREQ', 'COREQ', 'ANTIREQ', 'COURSE_SET', 'REQUISITE_SET');
ALTER TABLE "catalog"."requisites_jsons" ALTER COLUMN "requisite_type" TYPE "catalog"."RequisiteType_new" USING ("requisite_type"::text::"catalog"."RequisiteType_new");
ALTER TYPE "catalog"."RequisiteType" RENAME TO "RequisiteType_old";
ALTER TYPE "catalog"."RequisiteType_new" RENAME TO "RequisiteType";
DROP TYPE "catalog"."RequisiteType_old";
COMMIT;
