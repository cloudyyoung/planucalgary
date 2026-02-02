/*
  Warnings:

  - You are about to drop the column `raw_json` on the `courses` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "catalog"."courses" RENAME COLUMN "raw_json" TO "raw_requisites";
