import { prisma } from '../../config/database';
import type { CreateCategoriaInput, UpdateCategoriaInput } from '@clientebox/shared';
import { AppError } from '../../utils/app-error';
import { CATEGORIAS_PADRAO_RECEITA, CATEGORIAS_PADRAO_DESPESA } from './categorias.constants';

export class CategoriasService {
  async listar(usuarioId: string, tipo?: 'receita' | 'despesa') {
    return prisma.categoria.findMany({
      where: { usuarioId, ...(tipo ? { tipo } : {}) },
      orderBy: { nome: 'asc' },
    });
  }

  async criar(usuarioId: string, data: CreateCategoriaInput) {
    const existente = await prisma.categoria.findFirst({
      where: { usuarioId, nome: data.nome, tipo: data.tipo },
    });
    if (existente) {
      throw new AppError('Já existe uma categoria com esse nome e tipo', 409);
    }

    return prisma.categoria.create({ data: { ...data, usuarioId } });
  }

  async atualizar(usuarioId: string, id: string, data: UpdateCategoriaInput) {
    const existente = await prisma.categoria.findFirst({ where: { id, usuarioId } });
    if (!existente) {
      throw new AppError('Categoria não encontrada', 404);
    }

    return prisma.categoria.update({ where: { id }, data });
  }

  async atualizarStatus(usuarioId: string, id: string, ativo: boolean) {
    const existente = await prisma.categoria.findFirst({ where: { id, usuarioId } });
    if (!existente) {
      throw new AppError('Categoria não encontrada', 404);
    }

    return prisma.categoria.update({ where: { id }, data: { ativo } });
  }

  async criarPadrao(usuarioId: string) {
    await prisma.categoria.createMany({
      data: [
        ...CATEGORIAS_PADRAO_RECEITA.map((nome) => ({ usuarioId, nome, tipo: 'receita' })),
        ...CATEGORIAS_PADRAO_DESPESA.map((nome) => ({ usuarioId, nome, tipo: 'despesa' })),
      ],
      skipDuplicates: true,
    });
  }
}
