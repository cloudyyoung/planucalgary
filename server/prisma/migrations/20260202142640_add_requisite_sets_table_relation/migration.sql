-- CreateTable
CREATE TABLE "catalog"."_RequisiteToRequisiteSet" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_RequisiteToRequisiteSet_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_RequisiteToRequisiteSet_B_index" ON "catalog"."_RequisiteToRequisiteSet"("B");

-- AddForeignKey
ALTER TABLE "catalog"."_RequisiteToRequisiteSet" ADD CONSTRAINT "_RequisiteToRequisiteSet_A_fkey" FOREIGN KEY ("A") REFERENCES "catalog"."requisites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog"."_RequisiteToRequisiteSet" ADD CONSTRAINT "_RequisiteToRequisiteSet_B_fkey" FOREIGN KEY ("B") REFERENCES "catalog"."requisite_sets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
