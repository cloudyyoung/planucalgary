/*
  Warnings:

  - You are about to drop the column `requisites` on the `programs` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "catalog"."programs" RENAME COLUMN "requisites" TO "raw_requisites";

-- CreateTable
CREATE TABLE "catalog"."requisites" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "program_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "notes" TEXT,
    "raw_rules" JSONB,

    CONSTRAINT "requisites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalog"."requisite_rules" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "requisite_id" TEXT NOT NULL,
    "parent_rule_id" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "notes" TEXT,
    "condition" TEXT NOT NULL,
    "min_courses" INTEGER,
    "max_courses" INTEGER,
    "min_credits" INTEGER,
    "max_credits" INTEGER,
    "credits" INTEGER,
    "number" INTEGER,
    "restriction" TEXT,
    "grade" TEXT,
    "grade_type" TEXT,
    "raw_json" JSONB,

    CONSTRAINT "requisite_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalog"."_CourseSetToRequisiteRule" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CourseSetToRequisiteRule_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "catalog"."_RequisiteRuleToRequisiteSet" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_RequisiteRuleToRequisiteSet_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_CourseSetToRequisiteRule_B_index" ON "catalog"."_CourseSetToRequisiteRule"("B");

-- CreateIndex
CREATE INDEX "_RequisiteRuleToRequisiteSet_B_index" ON "catalog"."_RequisiteRuleToRequisiteSet"("B");

-- AddForeignKey
ALTER TABLE "catalog"."requisites" ADD CONSTRAINT "requisites_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "catalog"."programs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog"."requisite_rules" ADD CONSTRAINT "requisite_rules_requisite_id_fkey" FOREIGN KEY ("requisite_id") REFERENCES "catalog"."requisites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog"."requisite_rules" ADD CONSTRAINT "requisite_rules_parent_rule_id_fkey" FOREIGN KEY ("parent_rule_id") REFERENCES "catalog"."requisite_rules"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog"."_CourseSetToRequisiteRule" ADD CONSTRAINT "_CourseSetToRequisiteRule_A_fkey" FOREIGN KEY ("A") REFERENCES "catalog"."course_sets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog"."_CourseSetToRequisiteRule" ADD CONSTRAINT "_CourseSetToRequisiteRule_B_fkey" FOREIGN KEY ("B") REFERENCES "catalog"."requisite_rules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog"."_RequisiteRuleToRequisiteSet" ADD CONSTRAINT "_RequisiteRuleToRequisiteSet_A_fkey" FOREIGN KEY ("A") REFERENCES "catalog"."requisite_rules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog"."_RequisiteRuleToRequisiteSet" ADD CONSTRAINT "_RequisiteRuleToRequisiteSet_B_fkey" FOREIGN KEY ("B") REFERENCES "catalog"."requisite_sets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
