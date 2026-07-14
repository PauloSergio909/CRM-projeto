import { prisma } from '../../config/database';

function inicioMes(data: Date): Date {
  return new Date(data.getFullYear(), data.getMonth(), 1);
}

function inicioProximoMes(data: Date): Date {
  return new Date(data.getFullYear(), data.getMonth() + 1, 1);
}

function calcularVariacao(atual: number, anterior: number): number | null {
  if (anterior === 0) return atual === 0 ? 0 : null;
  return ((atual - anterior) / anterior) * 100;
}

export class DashboardService {
  async resumo(usuarioId: string) {
    const hoje = new Date();
    const inicioAtual = inicioMes(hoje);
    const inicioProximo = inicioProximoMes(hoje);
    const inicioAnterior = new Date(inicioAtual.getFullYear(), inicioAtual.getMonth() - 1, 1);
    const daquiA7Dias = new Date(hoje.getTime() + 7 * 24 * 60 * 60 * 1000);

    const [
      receitasAtual,
      despesasAtual,
      receitasAnterior,
      despesasAnterior,
      clientesNovos,
      contasAVencer,
      oportunidadesAbertas,
    ] = await Promise.all([
      prisma.lancamento.aggregate({
        where: { usuarioId, tipo: 'receita', status: 'pago', data: { gte: inicioAtual, lt: inicioProximo } },
        _sum: { valor: true },
      }),
      prisma.lancamento.aggregate({
        where: { usuarioId, tipo: 'despesa', status: 'pago', data: { gte: inicioAtual, lt: inicioProximo } },
        _sum: { valor: true },
      }),
      prisma.lancamento.aggregate({
        where: { usuarioId, tipo: 'receita', status: 'pago', data: { gte: inicioAnterior, lt: inicioAtual } },
        _sum: { valor: true },
      }),
      prisma.lancamento.aggregate({
        where: { usuarioId, tipo: 'despesa', status: 'pago', data: { gte: inicioAnterior, lt: inicioAtual } },
        _sum: { valor: true },
      }),
      prisma.cliente.count({ where: { usuarioId, createdAt: { gte: inicioAtual, lt: inicioProximo } } }),
      prisma.lancamento.count({
        where: { usuarioId, status: 'pendente', dataVencimento: { gte: hoje, lte: daquiA7Dias } },
      }),
      prisma.oportunidade.aggregate({
        where: { usuarioId, etapa: { notIn: ['fechado_ganho', 'fechado_perdido'] } },
        _count: true,
        _sum: { valorEstimado: true },
      }),
    ]);

    const receitas = Number(receitasAtual._sum.valor ?? 0);
    const despesas = Number(despesasAtual._sum.valor ?? 0);
    const receitasMesAnterior = Number(receitasAnterior._sum.valor ?? 0);
    const despesasMesAnterior = Number(despesasAnterior._sum.valor ?? 0);
    const saldo = receitas - despesas;
    const saldoMesAnterior = receitasMesAnterior - despesasMesAnterior;

    return {
      receitas,
      despesas,
      saldo,
      variacaoReceitas: calcularVariacao(receitas, receitasMesAnterior),
      variacaoDespesas: calcularVariacao(despesas, despesasMesAnterior),
      variacaoSaldo: calcularVariacao(saldo, saldoMesAnterior),
      clientesNovos,
      contasAVencer,
      oportunidadesAbertas: {
        quantidade: oportunidadesAbertas._count,
        valorTotal: Number(oportunidadesAbertas._sum.valorEstimado ?? 0),
      },
    };
  }

  async faturamentoMensal(usuarioId: string, meses: number) {
    const hoje = new Date();
    const resultado: { mes: string; receitas: number; despesas: number }[] = [];

    for (let i = meses - 1; i >= 0; i--) {
      const referencia = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
      const inicio = referencia;
      const fim = new Date(referencia.getFullYear(), referencia.getMonth() + 1, 1);

      const [receitas, despesas] = await Promise.all([
        prisma.lancamento.aggregate({
          where: { usuarioId, tipo: 'receita', status: 'pago', data: { gte: inicio, lt: fim } },
          _sum: { valor: true },
        }),
        prisma.lancamento.aggregate({
          where: { usuarioId, tipo: 'despesa', status: 'pago', data: { gte: inicio, lt: fim } },
          _sum: { valor: true },
        }),
      ]);

      resultado.push({
        mes: referencia.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
        receitas: Number(receitas._sum.valor ?? 0),
        despesas: Number(despesas._sum.valor ?? 0),
      });
    }

    return resultado;
  }

  async despesasPorCategoria(usuarioId: string) {
    const hoje = new Date();
    const inicio = inicioMes(hoje);
    const fim = inicioProximoMes(hoje);

    const grupos = await prisma.lancamento.groupBy({
      by: ['categoriaId'],
      where: { usuarioId, tipo: 'despesa', status: 'pago', data: { gte: inicio, lt: fim } },
      _sum: { valor: true },
    });

    const categoriaIds = grupos.map((g) => g.categoriaId).filter((id): id is string => !!id);
    const categorias = await prisma.categoria.findMany({ where: { id: { in: categoriaIds } } });

    return grupos.map((g) => {
      const categoria = categorias.find((c) => c.id === g.categoriaId);
      return {
        categoriaId: g.categoriaId,
        nome: categoria?.nome ?? 'Sem categoria',
        cor: categoria?.cor ?? '#6B7280',
        total: Number(g._sum.valor ?? 0),
      };
    });
  }

  async atividadesRecentes(usuarioId: string, limite: number) {
    const [interacoes, pagamentos, clientesNovos] = await Promise.all([
      prisma.interacao.findMany({
        where: { usuarioId },
        include: { cliente: { select: { nome: true } } },
        orderBy: { data: 'desc' },
        take: limite,
      }),
      prisma.lancamento.findMany({
        where: { usuarioId, status: 'pago', dataPagamento: { not: null } },
        include: { cliente: { select: { nome: true } } },
        orderBy: { dataPagamento: 'desc' },
        take: limite,
      }),
      prisma.cliente.findMany({
        where: { usuarioId },
        orderBy: { createdAt: 'desc' },
        take: limite,
      }),
    ]);

    const atividades = [
      ...interacoes.map((i) => ({
        tipo: 'interacao' as const,
        descricao: `${i.cliente.nome}: ${i.descricao}`,
        data: i.data.toISOString(),
      })),
      ...pagamentos.map((l) => ({
        tipo: 'pagamento' as const,
        descricao: `${l.tipo === 'receita' ? 'Recebido' : 'Pago'}: ${l.descricao}${l.cliente ? ` — ${l.cliente.nome}` : ''}`,
        data: (l.dataPagamento as Date).toISOString(),
      })),
      ...clientesNovos.map((c) => ({
        tipo: 'novo_cliente' as const,
        descricao: `Novo cliente: ${c.nome}`,
        data: c.createdAt.toISOString(),
      })),
    ];

    return atividades.sort((a, b) => (a.data < b.data ? 1 : -1)).slice(0, limite);
  }
}
