import { prisma } from '../../config/database';
import type { Prisma } from '@prisma/client';
import type { LancamentosQueryInput, CreateLancamentoInput, UpdateLancamentoInput } from '@clientebox/shared';
import { AppError } from '../../utils/app-error';
import { gerarReciboPdf } from './recibo';

export class LancamentosService {
  // Substitui o trigger SQL marcar_lancamentos_vencidos() do documento original:
  // computado sob demanda no service layer em vez de rodar no banco.
  private async marcarVencidosAutomaticamente(usuarioId: string) {
    await prisma.lancamento.updateMany({
      where: { usuarioId, status: 'pendente', dataVencimento: { lt: new Date() } },
      data: { status: 'vencido' },
    });
  }

  // Gera as ocorrências mensais que faltam pra cada lançamento-modelo
  // (recorrente=true, recorrenciaOrigemId=null) até o mês atual — computado
  // sob demanda, mesmo espírito de marcarVencidosAutomaticamente, sem cron.
  private async gerarRecorrentesPendentes(usuarioId: string) {
    const modelos = await prisma.lancamento.findMany({
      where: { usuarioId, recorrente: true, recorrenciaOrigemId: null },
    });

    const hoje = new Date();
    const LIMITE_ITERACOES = 24;

    for (const modelo of modelos) {
      const diasParaVencimento = modelo.dataVencimento
        ? Math.round((modelo.dataVencimento.getTime() - modelo.data.getTime()) / 86_400_000)
        : null;

      let mesReferencia = new Date(modelo.data.getFullYear(), modelo.data.getMonth() + 1, modelo.data.getDate());
      let iteracoes = 0;

      while (mesReferencia <= hoje && iteracoes < LIMITE_ITERACOES) {
        const inicioMes = new Date(mesReferencia.getFullYear(), mesReferencia.getMonth(), 1);
        const fimMes = new Date(mesReferencia.getFullYear(), mesReferencia.getMonth() + 1, 1);

        const jaExiste = await prisma.lancamento.findFirst({
          where: { recorrenciaOrigemId: modelo.id, data: { gte: inicioMes, lt: fimMes } },
        });

        if (!jaExiste) {
          await prisma.lancamento.create({
            data: {
              usuarioId,
              tipo: modelo.tipo,
              categoriaId: modelo.categoriaId,
              clienteId: modelo.clienteId,
              produtoId: modelo.produtoId,
              descricao: modelo.descricao,
              valor: modelo.valor,
              data: mesReferencia,
              dataVencimento:
                diasParaVencimento !== null
                  ? new Date(mesReferencia.getTime() + diasParaVencimento * 86_400_000)
                  : null,
              formaPagamento: modelo.formaPagamento,
              recorrente: true,
              recorrenciaOrigemId: modelo.id,
              status: 'pendente',
            },
          });
        }

        mesReferencia = new Date(mesReferencia.getFullYear(), mesReferencia.getMonth() + 1, mesReferencia.getDate());
        iteracoes++;
      }
    }
  }

  async listar(usuarioId: string, params: LancamentosQueryInput) {
    await this.marcarVencidosAutomaticamente(usuarioId);
    await this.gerarRecorrentesPendentes(usuarioId);

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
        include: { categoria: true, cliente: { select: { id: true, nome: true } }, produto: true },
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
      include: { categoria: true, cliente: { select: { id: true, nome: true } }, produto: true },
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
        produtoId: data.produtoId || null,
        descricao: data.descricao,
        valor: data.valor,
        data: data.data ? new Date(data.data) : new Date(),
        dataVencimento: data.dataVencimento ? new Date(data.dataVencimento) : null,
        formaPagamento: data.formaPagamento || null,
        recorrente: data.recorrente ?? false,
        observacoes: data.observacoes || null,
      },
      include: { categoria: true, cliente: { select: { id: true, nome: true } }, produto: true },
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
        ...(data.produtoId !== undefined && { produtoId: data.produtoId || null }),
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
      include: { categoria: true, cliente: { select: { id: true, nome: true } }, produto: true },
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

  async gerarRecibo(usuarioId: string, id: string) {
    const lancamento = await prisma.lancamento.findFirst({
      where: { id, usuarioId },
      include: { cliente: true },
    });

    if (!lancamento) {
      throw new AppError('Lançamento não encontrado', 404);
    }
    if (!lancamento.clienteId) {
      throw new AppError('Este lançamento não tem cliente vinculado', 400);
    }

    const usuario = await prisma.usuario.findUniqueOrThrow({ where: { id: usuarioId } });
    const doc = gerarReciboPdf(lancamento, usuario);
    const filename = `recibo-${lancamento.id.slice(0, 8)}.pdf`;

    return { doc, filename };
  }
}
