import { prisma } from '../../config/database';
import type { CreateProdutoInput, UpdateProdutoInput } from '@clientebox/shared';
import { AppError } from '../../utils/app-error';

function normalizarDados<T extends Record<string, unknown>>(data: T): T {
  const normalizado = { ...data };
  for (const key of Object.keys(normalizado)) {
    if (normalizado[key] === '') {
      (normalizado as Record<string, unknown>)[key] = null;
    }
  }
  return normalizado;
}

export class ProdutosService {
  async listar(usuarioId: string, ativo?: boolean) {
    return prisma.produto.findMany({
      where: { usuarioId, ...(ativo !== undefined ? { ativo } : {}) },
      include: { categoria: true },
      orderBy: { nome: 'asc' },
    });
  }

  async criar(usuarioId: string, data: CreateProdutoInput) {
    const existente = await prisma.produto.findFirst({ where: { usuarioId, nome: data.nome } });
    if (existente) {
      throw new AppError('Já existe um produto com esse nome', 409);
    }

    return prisma.produto.create({ data: { ...normalizarDados(data), usuarioId } });
  }

  async atualizar(usuarioId: string, id: string, data: UpdateProdutoInput) {
    const existente = await prisma.produto.findFirst({ where: { id, usuarioId } });
    if (!existente) {
      throw new AppError('Produto não encontrado', 404);
    }

    return prisma.produto.update({ where: { id }, data: normalizarDados(data) });
  }

  async atualizarStatus(usuarioId: string, id: string, ativo: boolean) {
    const existente = await prisma.produto.findFirst({ where: { id, usuarioId } });
    if (!existente) {
      throw new AppError('Produto não encontrado', 404);
    }

    return prisma.produto.update({ where: { id }, data: { ativo } });
  }
}
