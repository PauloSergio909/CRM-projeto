import { prisma } from '../../config/database';
import type { Prisma } from '@prisma/client';
import type { LancamentosQueryInput, CreateLancamentoInput, UpdateLancamentoInput } from '@clientebox/shared';
import { AppError } from '../../utils/app-error';

export class LancamentosService {
  // Substitui o trigger SQL marcar_lancamentos_vencidos() do documento original:
  // computado sob demanda no service layer em vez de rodar no banco.
  private async marcarVencidosAutomaticamente(usuarioId: string) {
    await prisma.lancamento.updateMany({
      where: { usuarioId, status: 'pendente', dataVencimento: { lt: new Date() } },
      data: { status: 'vencido' },
    });
  }

  async listar(usuarioId: string, params: LancamentosQueryInput) {
    await this.marcarVencidosAutomaticamente(usuarioId);

    const { page, perPage, search, tipo, status, categoriaId, dataInicio, dataFim } = params;

    const where: Prisma.LancamentoWhereInput = { usuarioId };
    if (tipo) where.tipo = tipo;
    if (status) where.status = status;
    if (categoriaId) where.categoriaId = categoriaId;
    if (search) where.descricao = { contains: search, mode: 'insensitive' };
    if (dataInicio || dataFim) {
      where.dataVencimento = {
        ...(dataInicio ? { gte: new Date(dataInicio) } : {}),
        ...(dataFim ? { lte: new Date(dataFim) } : {}),
      };
    }

    const [lancamentos, total] = await Promise.all([
      prisma.lancamento.findMany({
        where,
        include: { categoria: true, cliente: { select: { id: true, nome: true } } },
        orderBy: { data: 'desc' },
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      prisma.lancamento.count({ where }),
    ]);

    return { lancamentos, total };
  }

  async buscar(usuarioId: string, id: string) {
    const lancamento = await prisma.lancamento.findFirst({
      where: { id, usuarioId },
      include: { categoria: true, cliente: { select: { id: true, nome: true } } },
    });

    if (!lancamento) {
      throw new AppError('Lançamento não encontrado', 404);
    }

    return lancamento;
  }

  async criar(usuarioId: string, data: CreateLancamentoInput) {
    return prisma.lancamento.create({
      data: {
        usuarioId,
        tipo: data.tipo,
        categoriaId: data.categoriaId || null,
        clienteId: data.clienteId || null,
        descricao: data.descricao,
        valor: data.valor,
        data: data.data ? new Date(data.data) : new Date(),
        dataVencimento: data.dataVencimento ? new Date(data.dataVencimento) : null,
        formaPagamento: data.formaPagamento || null,
        recorrente: data.recorrente ?? false,
        observacoes: data.observacoes || null,
      },
      include: { categoria: true, cliente: { select: { id: true, nome: true } } },
    });
  }

  async atualizar(usuarioId: string, id: string, data: UpdateLancamentoInput) {
    const existente = await prisma.lancamento.findFirst({ where: { id, usuarioId } });
    if (!existente) {
      throw new AppError('Lançamento não encontrado', 404);
    }

    return prisma.lancamento.update({
      where: { id },
      data: {
        ...(data.tipo !== undefined && { tipo: data.tipo }),
        ...(data.categoriaId !== undefined && { categoriaId: data.categoriaId || null }),
        ...(data.clienteId !== undefined && { clienteId: data.clienteId || null }),
        ...(data.descricao !== undefined && { descricao: data.descricao }),
        ...(data.valor !== undefined && { valor: data.valor }),
        ...(data.data !== undefined && { data: new Date(data.data) }),
        ...(data.dataVencimento !== undefined && {
          dataVencimento: data.dataVencimento ? new Date(data.dataVencimento) : null,
        }),
        ...(data.formaPagamento !== undefined && { formaPagamento: data.formaPagamento || null }),
        ...(data.recorrente !== undefined && { recorrente: data.recorrente }),
        ...(data.observacoes !== undefined && { observacoes: data.observacoes || null }),
      },
      include: { categoria: true, cliente: { select: { id: true, nome: true } } },
    });
  }

  async atualizarStatus(usuarioId: string, id: string, status: 'pendente' | 'pago' | 'vencido' | 'cancelado') {
    const existente = await prisma.lancamento.findFirst({ where: { id, usuarioId } });
    if (!existente) {
      throw new AppError('Lançamento não encontrado', 404);
    }

    return prisma.lancamento.update({
      where: { id },
      data: { status, dataPagamento: status === 'pago' ? new Date() : null },
    });
  }
}
