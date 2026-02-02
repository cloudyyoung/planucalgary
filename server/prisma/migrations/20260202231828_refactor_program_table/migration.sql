/*
  Warnings:

  - You are about to drop the column `coursedog_id` on the `programs` table. All the data in the column will be lost.
  - You are about to drop the column `pid` on the `programs` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[program_group_id]` on the table `programs` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `program_last_synced_at` to the `programs` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "catalog"."programs_pid_key";

-- AlterTable
ALTER TABLE "catalog"."programs" DROP COLUMN "coursedog_id",
DROP COLUMN "pid",
ADD COLUMN     "end_term" JSONB,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "program_effective_end_date" TIMESTAMP(3),
ADD COLUMN     "program_last_synced_at" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "program_effective_start_date" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "programs_program_group_id_key" ON "catalog"."programs"("program_group_id");
