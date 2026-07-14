import { prisma } from '../../config/database';
import type { CreateOportunidadeInput, UpdateOportunidadeInput, MoverOportunidadeInput } from '@clientebox/shared';
import { AppError } from '../../utils/app-error';

const ETAPAS_FECHADAS = ['fechado_ganho', 'fechado_perdido'];

export class OportunidadesService {
  async listar(usuarioId: string) {
    return prisma.oportunidade.findMany({
      where: { usuarioId },
      include: { cliente: { select: { id: true, nome: true } } },
      orderBy: { posicao: 'asc' },
    });
  }

  async criar(usuarioId: string, data: CreateOportunidadeInput) {
    const cliente = await prisma.cliente.findFirst({ where: { id: data.clienteId, usuarioId } });
    if (!cliente) {
      throw new AppError('Cliente não encontrado', 404);
    }

    const totalNaEtapa = await prisma.oportunidade.count({ where: { usuarioId, etapa: 'contato' } });

    return prisma.oportunidade.create({
      data: {
        usuarioId,
        clienteId: data.clienteId,
        titulo: data.titulo,
        descricao: data.descricao || null,
        valorEstimado: data.valorEstimado,
        etapa: 'contato',
        posicao: totalNaEtapa,
      },
      include: { cliente: { select: { id: true, nome: true } } },
    });
  }

  async atualizar(usuarioId: string, id: string, data: UpdateOportunidadeInput) {
    const existente = await prisma.oportunidade.findFirst({ where: { id, usuarioId } });
    if (!existente) {
      throw new AppError('Oportunidade não encontrada', 404);
    }

    return prisma.oportunidade.update({
      where: { id },
      data: {
        ...(data.clienteId !== undefined && { clienteId: data.clienteId }),
        ...(data.titulo !== undefined && { titulo: data.titulo }),
        ...(data.descricao !== undefined && { descricao: data.descricao || null }),
        ...(data.valorEstimado !== undefined && { valorEstimado: data.valorEstimado }),
      },
      include: { cliente: { select: { id: true, nome: true } } },
    });
  }

  async mover(usuarioId: string, id: string, params: MoverOportunidadeInput) {
    const oportunidade = await prisma.oportunidade.findFirst({ where: { id, usuarioId } });
    if (!oportunidade) {
      throw new AppError('Oportunidade não encontrada', 404);
    }

    const { etapa: novaEtapa, posicao: novaPosicao, motivoPerda } = params;
    const etapaAntiga = oportunidade.etapa;
    const posicaoAntiga = oportunidade.posicao;

    await prisma.$transaction(async (tx) => {
      if (etapaAntiga === novaEtapa) {
        if (novaPosicao > posicaoAntiga) {
          await tx.oportunidade.updateMany({
            where: { usuarioId, etapa: novaEtapa, posicao: { gt: posicaoAntiga, lte: novaPosicao } },
            data: { posicao: { decrement: 1 } },
          });
        } else if (novaPosicao < posicaoAntiga) {
          await tx.oportunidade.updateMany({
            where: { usuarioId, etapa: novaEtapa, posicao: { gte: novaPosicao, lt: posicaoAntiga } },
            data: { posicao: { increment: 1 } },
          });
        }
      } else {
        await tx.oportunidade.updateMany({
          where: { usuarioId, etapa: etapaAntiga, posicao: { gt: posicaoAntiga } },
          data: { posicao: { decrement: 1 } },
        });
        await tx.oportunidade.updateMany({
          where: { usuarioId, etapa: novaEtapa, posicao: { gte: novaPosicao } },
          data: { posicao: { increment: 1 } },
        });
      }

      await tx.oportunidade.update({
        where: { id },
        data: {
          etapa: novaEtapa,
          posicao: novaPosicao,
          dataFechamento: ETAPAS_FECHADAS.includes(novaEtapa) ? new Date() : null,
          ...(novaEtapa === 'fechado_perdido' && motivoPerda && { motivoPerda }),
          ...(novaEtapa !== 'fechado_perdido' && { motivoPerda: null }),
        },
      });
    });

    return prisma.oportunidade.findFirst({
      where: { id, usuarioId },
      include: { cliente: { select: { id: true, nome: true } } },
    });
  }
}
