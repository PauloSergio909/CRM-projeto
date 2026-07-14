import { prisma } from '../../config/database';
import type { Prisma } from '@prisma/client';
import type {
  ClientesQueryInput,
  CreateClienteInput,
  UpdateClienteInput,
  CreateInteracaoInput,
} from '@clientebox/shared';
import { AppError } from '../../utils/app-error';

export class ClientesService {
  async listar(usuarioId: string, params: ClientesQueryInput) {
    const { page, perPage, search, status, cidade } = params;

    const where: Prisma.ClienteWhereInput = { usuarioId };
    if (status) where.status = status;
    if (cidade) where.cidade = { equals: cidade, mode: 'insensitive' };
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
        include: { _count: { select: { interacoes: true } } },
        orderBy: { nome: 'asc' },
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      prisma.cliente.count({ where }),
    ]);

    return { clientes, total };
  }

  async buscar(usuarioId: string, id: string) {
    const cliente = await prisma.cliente.findFirst({
      where: { id, usuarioId },
      include: {
        interacoes: { orderBy: { data: 'desc' }, take: 10 },
        _count: { select: { interacoes: true } },
      },
    });

    if (!cliente) {
      throw new AppError('Cliente não encontrado', 404);
    }

    return cliente;
  }

  async criar(usuarioId: string, data: CreateClienteInput) {
    return prisma.cliente.create({ data: { ...normalizarDados(data), usuarioId } });
  }

  async atualizar(usuarioId: string, id: string, data: UpdateClienteInput) {
    const existente = await prisma.cliente.findFirst({ where: { id, usuarioId } });
    if (!existente) {
      throw new AppError('Cliente não encontrado', 404);
    }

    return prisma.cliente.update({ where: { id }, data: normalizarDados(data) });
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
