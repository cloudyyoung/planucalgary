-- DropForeignKey
ALTER TABLE "catalog"."courses" DROP CONSTRAINT "courses_antireq_id_fkey";

-- DropForeignKey
ALTER TABLE "catalog"."courses" DROP CONSTRAINT "courses_coreq_id_fkey";

-- DropForeignKey
ALTER TABLE "catalog"."courses" DROP CONSTRAINT "courses_prereq_id_fkey";

-- AddForeignKey
ALTER TABLE "catalog"."courses" ADD CONSTRAINT "courses_prereq_id_fkey" FOREIGN KEY ("prereq_id") REFERENCES "catalog"."requisites"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog"."courses" ADD CONSTRAINT "courses_coreq_id_fkey" FOREIGN KEY ("coreq_id") REFERENCES "catalog"."requisites"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog"."courses" ADD CONSTRAINT "courses_antireq_id_fkey" FOREIGN KEY ("antireq_id") REFERENCES "catalog"."requisites"("id") ON DELETE SET NULL ON UPDATE CASCADE;
