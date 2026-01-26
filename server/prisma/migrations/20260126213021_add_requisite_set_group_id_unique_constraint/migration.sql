/*
  Warnings:

  - A unique constraint covering the columns `[requisite_set_group_id]` on the table `requisite_sets` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "requisite_sets_requisite_set_group_id_key" ON "catalog"."requisite_sets"("requisite_set_group_id");
