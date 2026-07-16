import { prisma } from '../../config/database';

export class RelatoriosService {
  async rankingClientes(usuarioId: string, limite = 10) {
    const grupos = await prisma.lancamento.groupBy({
      by: ['clienteId'],
      where: { usuarioId, tipo: 'receita', status: 'pago', clienteId: { not: null } },
      _sum: { valor: true },
      _count: { _all: true },
      _max: { data: true },
      orderBy: { _sum: { valor: 'desc' } },
      take: limite,
    });

    const clienteIds = grupos.map((g) => g.clienteId).filter((id): id is string => !!id);
    const clientes = await prisma.cliente.findMany({
      where: { id: { in: clienteIds } },
      select: { id: true, nome: true, telefone: true },
    });

    return grupos.map((g) => {
      const cliente = clientes.find((c) => c.id === g.clienteId);
      return {
        clienteId: g.clienteId,
        nome: cliente?.nome ?? 'Cliente removido',
        telefone: cliente?.telefone ?? null,
        totalGasto: Number(g._sum.valor ?? 0),
        totalCompras: g._count._all,
        ultimaCompra: g._max.data?.toISOString() ?? null,
      };
    });
  }

  async rankingProdutos(usuarioId: string, limite = 10) {
    const grupos = await prisma.lancamento.groupBy({
      by: ['produtoId'],
      where: { usuarioId, tipo: 'receita', status: 'pago', produtoId: { not: null } },
      _sum: { valor: true },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: limite,
    });

    const produtoIds = grupos.map((g) => g.produtoId).filter((id): id is string => !!id);
    const produtos = await prisma.produto.findMany({
      where: { id: { in: produtoIds } },
      select: { id: true, nome: true },
    });

    return grupos.map((g) => {
      const produto = produtos.find((p) => p.id === g.produtoId);
      return {
        produtoId: g.produtoId,
        nome: produto?.nome ?? 'Produto removido',
        totalVendido: g._count.id,
        totalFaturado: Number(g._sum.valor ?? 0),
      };
    });
  }

  async clientesInativos(usuarioId: string, dias = 30) {
    const clientes = await prisma.cliente.findMany({
      where: { usuarioId, status: 'ativo' },
      select: {
        id: true,
        nome: true,
        telefone: true,
        createdAt: true,
        interacoes: { orderBy: { data: 'desc' }, take: 1, select: { data: true } },
        lancamentos: {
          where: { tipo: 'receita', status: 'pago' },
          orderBy: { data: 'desc' },
          take: 1,
          select: { data: true },
        },
      },
    });

    const corte = new Date(Date.now() - dias * 86_400_000);

    return clientes
      .map((c) => {
        const datas = [c.createdAt, c.interacoes[0]?.data, c.lancamentos[0]?.data].filter(
          (d): d is Date => !!d,
        );
        const ultimaAtividade = new Date(Math.max(...datas.map((d) => d.getTime())));
        return {
          id: c.id,
          nome: c.nome,
          telefone: c.telefone,
          ultimaAtividade: ultimaAtividade.toISOString(),
        };
      })
      .filter((c) => new Date(c.ultimaAtividade) < corte)
      .sort((a, b) => new Date(a.ultimaAtividade).getTime() - new Date(b.ultimaAtividade).getTime());
  }
}
