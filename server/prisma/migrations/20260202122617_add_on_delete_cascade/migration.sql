-- DropForeignKey
ALTER TABLE "catalog"."requisite_rules" DROP CONSTRAINT "requisite_rules_parent_rule_id_fkey";

-- DropForeignKey
ALTER TABLE "catalog"."requisite_rules" DROP CONSTRAINT "requisite_rules_requisite_id_fkey";

-- AddForeignKey
ALTER TABLE "catalog"."requisite_rules" ADD CONSTRAINT "requisite_rules_requisite_id_fkey" FOREIGN KEY ("requisite_id") REFERENCES "catalog"."requisites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog"."requisite_rules" ADD CONSTRAINT "requisite_rules_parent_rule_id_fkey" FOREIGN KEY ("parent_rule_id") REFERENCES "catalog"."requisite_rules"("id") ON DELETE CASCADE ON UPDATE CASCADE;
