import { prisma } from '../../config/database';

export class MetasService {
  async buscar(usuarioId: string, mes: Date) {
    return prisma.meta.findFirst({ where: { usuarioId, mes } });
  }

  async upsert(usuarioId: string, mes: Date, valorMeta: number) {
    const existente = await prisma.meta.findFirst({ where: { usuarioId, mes } });
    if (existente) {
      return prisma.meta.update({ where: { id: existente.id }, data: { valorMeta } });
    }

    return prisma.meta.create({ data: { usuarioId, mes, valorMeta } });
  }
}
