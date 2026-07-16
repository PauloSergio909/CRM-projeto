-- AlterTable
ALTER TABLE "clientes" ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- CreateTable
CREATE TABLE "metas" (
    "id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "mes" TIMESTAMP(3) NOT NULL,
    "valor_meta" DECIMAL(12,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "metas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "metas_usuario_id_idx" ON "metas"("usuario_id");

-- CreateIndex
CREATE UNIQUE INDEX "metas_usuario_id_mes_key" ON "metas"("usuario_id", "mes");

-- AddForeignKey
ALTER TABLE "metas" ADD CONSTRAINT "metas_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
