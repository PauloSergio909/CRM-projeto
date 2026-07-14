import { FastifyInstance } from 'fastify';
import { CategoriasService } from './categorias.service';
import { createCategoriaSchema, updateCategoriaSchema, updateCategoriaStatusSchema } from '@clientebox/shared';
import { sendSuccess, sendCreated } from '../../utils/response';
import { authGuard } from '../../middleware/auth.middleware';

const categoriasService = new CategoriasService();

export async function categoriasRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authGuard);

  app.get('/', async (request, reply) => {
    const usuarioId = (request.user as { id: string }).id;
    const { tipo } = request.query as { tipo?: 'receita' | 'despesa' };
    const categorias = await categoriasService.listar(usuarioId, tipo);
    return sendSuccess(reply, categorias);
  });

  app.post('/', async (request, reply) => {
    const usuarioId = (request.user as { id: string }).id;
    const data = createCategoriaSchema.parse(request.body);
    const categoria = await categoriasService.criar(usuarioId, data);
    return sendCreated(reply, categoria, 'Categoria criada com sucesso');
  });

  app.put('/:id', async (request, reply) => {
    const usuarioId = (request.user as { id: string }).id;
    const { id } = request.params as { id: string };
    const data = updateCategoriaSchema.parse(request.body);
    const categoria = await categoriasService.atualizar(usuarioId, id, data);
    return sendSuccess(reply, categoria, 'Categoria atualizada com sucesso');
  });

  app.patch('/:id/status', async (request, reply) => {
    const usuarioId = (request.user as { id: string }).id;
    const { id } = request.params as { id: string };
    const { ativo } = updateCategoriaStatusSchema.parse(request.body);
    const categoria = await categoriasService.atualizarStatus(usuarioId, id, ativo);
    return sendSuccess(reply, categoria, 'Status atualizado com sucesso');
  });
}
