-- AlterTable
ALTER TABLE "catalog"."course_sets" ADD COLUMN     "raw_json" JSONB;

-- AlterTable
ALTER TABLE "catalog"."requisite_sets" ADD COLUMN     "raw_json" JSONB;
