-- AlterTable
ALTER TABLE "lancamentos" ADD COLUMN     "recorrencia_origem_id" TEXT;

-- CreateIndex
CREATE INDEX "lancamentos_recorrencia_origem_id_idx" ON "lancamentos"("recorrencia_origem_id");

-- AddForeignKey
ALTER TABLE "lancamentos" ADD CONSTRAINT "lancamentos_recorrencia_origem_id_fkey" FOREIGN KEY ("recorrencia_origem_id") REFERENCES "lancamentos"("id") ON DELETE SET NULL ON UPDATE CASCADE;
