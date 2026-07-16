import { prisma } from '../../config/database';
import type { Prisma } from '@prisma/client';
import type { AuditoriaQueryInput } from '@clientebox/shared';

export class AuditoriaService {
  async registrar(usuarioId: string, acao: string, entidade: string, entidadeId: string | null, descricao: string) {
    return prisma.logAuditoria.create({ data: { usuarioId, acao, entidade, entidadeId, descricao } });
  }

  async listar(usuarioId: string, params: AuditoriaQueryInput) {
    const { page, perPage, entidade } = params;

    const where: Prisma.LogAuditoriaWhereInput = { usuarioId };
    if (entidade) where.entidade = entidade;

    const [logs, total] = await Promise.all([
      prisma.logAuditoria.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      prisma.logAuditoria.count({ where }),
    ]);

    return { logs, total };
  }
}
