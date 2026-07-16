import { FastifyInstance } from 'fastify';
import { CategoriasService } from './categorias.service';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { createCategoriaSchema, updateCategoriaSchema, updateCategoriaStatusSchema } from '@clientebox/shared';
import { sendSuccess, sendCreated } from '../../utils/response';
import { authGuard } from '../../middleware/auth.middleware';

const categoriasService = new CategoriasService();
const auditoriaService = new AuditoriaService();

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
    await auditoriaService.registrar(usuarioId, 'criar', 'categoria', categoria.id, `Categoria criada: ${categoria.nome}`);
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
    await auditoriaService.registrar(
      usuarioId,
      'status',
      'categoria',
      categoria.id,
      `Categoria ${categoria.nome} marcada como ${ativo ? 'ativa' : 'inativa'}`,
    );
    return sendSuccess(reply, categoria, 'Status atualizado com sucesso');
  });
}
