-- AlterEnum
ALTER TYPE "catalog"."RequisiteType" ADD VALUE 'ATOMIC';

-- AlterTable
ALTER TABLE "catalog"."courses" ADD COLUMN     "raw_json" JSONB;
