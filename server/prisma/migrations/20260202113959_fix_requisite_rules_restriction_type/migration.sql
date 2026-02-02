/*
  Warnings:

  - The `restriction` column on the `requisite_rules` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "catalog"."requisite_rules" DROP COLUMN "restriction",
ADD COLUMN     "restriction" INTEGER;
