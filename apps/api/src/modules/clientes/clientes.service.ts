import { prisma } from '../../config/database';
import type { Prisma } from '@prisma/client';
import {
  createClienteSchema,
  type ClientesQueryInput,
  type CreateClienteInput,
  type UpdateClienteInput,
  type CreateInteracaoInput,
} from '@clientebox/shared';
import { AppError } from '../../utils/app-error';

type SaudeCliente = 'saudavel' | 'atencao' | 'risco';

// Sinais de risco: inadimplência (lançamento vencido, ou pendente já passado do
// vencimento — mesmo critério de marcarVencidosAutomaticamente de
// lancamentos.service.ts, que não roda a partir do módulo de clientes) e tempo
// sem atividade. Ticket médio fica de fora — é sinal de valor, não de risco.
function calcularSaude(params: {
  status: string;
  createdAt: Date;
  ultimaInteracao?: Date;
  lancamentos: { valor: Prisma.Decimal; data: Date; status: string; dataVencimento: Date | null }[];
}): { saude: SaudeCliente | null; ticketMedio: number | null } {
  if (params.status !== 'ativo') {
    return { saude: null, ticketMedio: null };
  }

  const vendas = params.lancamentos.filter((l) => l.status === 'pago');
  const inadimplente = params.lancamentos.some(
    (l) => l.status === 'vencido' || (l.status === 'pendente' && l.dataVencimento !== null && l.dataVencimento < new Date()),
  );

  const datas = [params.createdAt, params.ultimaInteracao, ...vendas.map((v) => v.data)].filter(
    (d): d is Date => !!d,
  );
  const ultimaAtividade = datas.length > 0 ? new Date(Math.max(...datas.map((d) => d.getTime()))) : null;
  const diasSemAtividade = ultimaAtividade ? Math.floor((Date.now() - ultimaAtividade.getTime()) / 86_400_000) : null;

  let saude: SaudeCliente;
  if (inadimplente || diasSemAtividade === null || diasSemAtividade > 60) {
    saude = 'risco';
  } else if (diasSemAtividade > 30 || vendas.length === 0) {
    saude = 'atencao';
  } else {
    saude = 'saudavel';
  }

  const totalGasto = vendas.reduce((soma, v) => soma + Number(v.valor), 0);
  const ticketMedio = vendas.length > 0 ? totalGasto / vendas.length : null;

  return { saude, ticketMedio };
}

const COLUNAS_CSV = ['nome', 'telefone', 'email', 'cpfCnpj', 'cep', 'endereco', 'cidade', 'estado', 'status', 'tags', 'observacoes'] as const;

function escaparCsv(valor: string): string {
  if (/[",\n\r]/.test(valor)) {
    return `"${valor.replace(/"/g, '""')}"`;
  }
  return valor;
}

export class ClientesService {
  async listar(usuarioId: string, params: ClientesQueryInput) {
    const { page, perPage, search, status, cidade, tag } = params;

    const where: Prisma.ClienteWhereInput = { usuarioId };
    if (status) where.status = status;
    if (cidade) where.cidade = { equals: cidade, mode: 'insensitive' };
    if (tag) where.tags = { has: tag };
    if (search) {
      where.OR = [
        { nome: { contains: search, mode: 'insensitive' } },
        { telefone: { contains: search } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [clientes, total] = await Promise.all([
      prisma.cliente.findMany({
        where,
        include: {
          _count: { select: { interacoes: true } },
          interacoes: { orderBy: { data: 'desc' }, take: 1, select: { data: true } },
          lancamentos: { select: { valor: true, data: true, status: true, dataVencimento: true } },
        },
        orderBy: { nome: 'asc' },
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      prisma.cliente.count({ where }),
    ]);

    return {
      clientes: clientes.map(({ interacoes, lancamentos, ...resto }) => ({
        ...resto,
        ...calcularSaude({ status: resto.status, createdAt: resto.createdAt, ultimaInteracao: interacoes[0]?.data, lancamentos }),
      })),
      total,
    };
  }

  async buscar(usuarioId: string, id: string) {
    const cliente = await prisma.cliente.findFirst({
      where: { id, usuarioId },
      include: {
        interacoes: { orderBy: { data: 'desc' }, take: 10 },
        lancamentos: { select: { valor: true, data: true, status: true, dataVencimento: true } },
        _count: { select: { interacoes: true } },
      },
    });

    if (!cliente) {
      throw new AppError('Cliente não encontrado', 404);
    }

    const { lancamentos, ...resto } = cliente;
    return {
      ...resto,
      ...calcularSaude({
        status: resto.status,
        createdAt: resto.createdAt,
        ultimaInteracao: resto.interacoes[0]?.data,
        lancamentos,
      }),
    };
  }

  async criar(usuarioId: string, data: CreateClienteInput) {
    const normalizado = normalizarDados(data);
    return prisma.cliente.create({
      data: { ...normalizado, dataNascimento: paraData(normalizado.dataNascimento), usuarioId },
    });
  }

  async atualizar(usuarioId: string, id: string, data: UpdateClienteInput) {
    const existente = await prisma.cliente.findFirst({ where: { id, usuarioId } });
    if (!existente) {
      throw new AppError('Cliente não encontrado', 404);
    }

    const normalizado = normalizarDados(data);
    return prisma.cliente.update({
      where: { id },
      data: { ...normalizado, dataNascimento: paraData(normalizado.dataNascimento) },
    });
  }

  async atualizarStatus(usuarioId: string, id: string, status: 'ativo' | 'inativo') {
    const existente = await prisma.cliente.findFirst({ where: { id, usuarioId } });
    if (!existente) {
      throw new AppError('Cliente não encontrado', 404);
    }

    return prisma.cliente.update({ where: { id }, data: { status } });
  }

  async criarInteracao(usuarioId: string, clienteId: string, data: CreateInteracaoInput) {
    const cliente = await prisma.cliente.findFirst({ where: { id: clienteId, usuarioId } });
    if (!cliente) {
      throw new AppError('Cliente não encontrado', 404);
    }

    return prisma.interacao.create({
      data: {
        usuarioId,
        clienteId,
        tipo: data.tipo,
        descricao: data.descricao,
        data: data.data ? new Date(data.data) : new Date(),
      },
    });
  }

  async exportarCsv(usuarioId: string): Promise<string> {
    const clientes = await prisma.cliente.findMany({ where: { usuarioId }, orderBy: { nome: 'asc' } });

    const linhas = [
      COLUNAS_CSV.join(','),
      ...clientes.map((cliente) =>
        COLUNAS_CSV.map((coluna) =>
          escaparCsv(coluna === 'tags' ? cliente.tags.join(';') : String(cliente[coluna] ?? '')),
        ).join(','),
      ),
    ];

    return linhas.join('\r\n');
  }

  async importarLote(usuarioId: string, linhas: Record<string, unknown>[]) {
    let criados = 0;
    const erros: { linha: number; motivo: string }[] = [];

    for (let i = 0; i < linhas.length; i++) {
      const linha = { ...linhas[i] };
      if (typeof linha.tags === 'string') {
        linha.tags = linha.tags
          .split(';')
          .map((t) => t.trim())
          .filter(Boolean);
      }

      const resultado = createClienteSchema.safeParse(linha);
      if (!resultado.success) {
        erros.push({ linha: i + 1, motivo: resultado.error.issues.map((e) => e.message).join('; ') });
        continue;
      }

      const normalizado = normalizarDados(resultado.data);
      await prisma.cliente.create({
        data: { ...normalizado, dataNascimento: paraData(normalizado.dataNascimento), usuarioId },
      });
      criados++;
    }

    return { criados, erros };
  }

  async listarTags(usuarioId: string): Promise<string[]> {
    const clientes = await prisma.cliente.findMany({ where: { usuarioId }, select: { tags: true } });
    const tags = new Set<string>();
    for (const cliente of clientes) {
      for (const tag of cliente.tags) tags.add(tag);
    }
    return Array.from(tags).sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }

  async verificarDuplicatas(usuarioId: string, params: { nome?: string; telefone?: string; cpfCnpj?: string }) {
    const nome = params.nome?.trim().toLowerCase();
    const telefone = params.telefone?.replace(/\D/g, '');
    const cpfCnpj = params.cpfCnpj?.replace(/\D/g, '');

    if (!nome && !telefone && !cpfCnpj) return [];

    const clientes = await prisma.cliente.findMany({
      where: { usuarioId },
      select: { id: true, nome: true, telefone: true, cpfCnpj: true },
    });

    return clientes.filter((c) => {
      if (nome && c.nome.trim().toLowerCase() === nome) return true;
      if (telefone && c.telefone && c.telefone.replace(/\D/g, '') === telefone) return true;
      if (cpfCnpj && c.cpfCnpj && c.cpfCnpj.replace(/\D/g, '') === cpfCnpj) return true;
      return false;
    });
  }

  async aniversariantesDaSemana(usuarioId: string) {
    const clientes = await prisma.cliente.findMany({
      where: { usuarioId, status: 'ativo', dataNascimento: { not: null } },
      select: { id: true, nome: true, telefone: true, dataNascimento: true },
    });

    // dataNascimento é um campo "só data" (sem hora com significado) — chega do
    // front como "YYYY-MM-DD" e o JS interpreta isso como meia-noite UTC. Comparar
    // com getMonth()/getDate() (hora local) quebra em fusos atrás de UTC (ex.:
    // America/Sao_Paulo) porque meia-noite UTC já é o dia anterior aqui. Por isso
    // a comparação inteira usa os métodos UTC, consistente com como foi salvo.
    const hoje = new Date();
    const diasAlvo = new Set<string>();
    for (let i = 0; i < 7; i++) {
      const d = new Date(Date.UTC(hoje.getUTCFullYear(), hoje.getUTCMonth(), hoje.getUTCDate() + i));
      diasAlvo.add(`${d.getUTCMonth()}-${d.getUTCDate()}`);
    }

    return clientes
      .filter((c) => {
        const nascimento = c.dataNascimento as Date;
        return diasAlvo.has(`${nascimento.getUTCMonth()}-${nascimento.getUTCDate()}`);
      })
      .map((c) => ({
        id: c.id,
        nome: c.nome,
        telefone: c.telefone,
        dataNascimento: (c.dataNascimento as Date).toISOString(),
      }));
  }
}

// Campos opcionais chegam como string vazia do formulário — normaliza pra null
// antes de persistir, já que o schema Zod aceita '' mas o banco espera null.
function normalizarDados<T extends Record<string, unknown>>(data: T): T {
  const normalizado = { ...data };
  for (const key of Object.keys(normalizado)) {
    if (normalizado[key] === '') {
      (normalizado as Record<string, unknown>)[key] = null;
    }
  }
  return normalizado;
}

function paraData(valor: string | null | undefined): Date | null | undefined {
  if (valor === undefined) return undefined;
  return valor ? new Date(valor) : null;
}
