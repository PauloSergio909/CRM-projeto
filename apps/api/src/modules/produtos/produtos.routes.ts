import { FastifyInstance } from 'fastify';
import { ProdutosService } from './produtos.service';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { createProdutoSchema, updateProdutoSchema, updateProdutoStatusSchema } from '@clientebox/shared';
import { sendSuccess, sendCreated } from '../../utils/response';
import { authGuard } from '../../middleware/auth.middleware';

const produtosService = new ProdutosService();
const auditoriaService = new AuditoriaService();

export async function produtosRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authGuard);

  app.get('/', async (request, reply) => {
    const usuarioId = (request.user as { id: string }).id;
    const { ativo } = request.query as { ativo?: string };
    const produtos = await produtosService.listar(usuarioId, ativo !== undefined ? ativo === 'true' : undefined);
    return sendSuccess(reply, produtos);
  });

  app.post('/', async (request, reply) => {
    const usuarioId = (request.user as { id: string }).id;
    const data = createProdutoSchema.parse(request.body);
    const produto = await produtosService.criar(usuarioId, data);
    await auditoriaService.registrar(usuarioId, 'criar', 'produto', produto.id, `Produto criado: ${produto.nome}`);
    return sendCreated(reply, produto, 'Produto criado com sucesso');
  });

  app.put('/:id', async (request, reply) => {
    const usuarioId = (request.user as { id: string }).id;
    const { id } = request.params as { id: string };
    const data = updateProdutoSchema.parse(request.body);
    const produto = await produtosService.atualizar(usuarioId, id, data);
    return sendSuccess(reply, produto, 'Produto atualizado com sucesso');
  });

  app.patch('/:id/status', async (request, reply) => {
    const usuarioId = (request.user as { id: string }).id;
    const { id } = request.params as { id: string };
    const { ativo } = updateProdutoStatusSchema.parse(request.body);
    const produto = await produtosService.atualizarStatus(usuarioId, id, ativo);
    await auditoriaService.registrar(
      usuarioId,
      'status',
      'produto',
      produto.id,
      `Produto ${produto.nome} marcado como ${ativo ? 'ativo' : 'inativo'}`,
    );
    return sendSuccess(reply, produto, 'Status atualizado com sucesso');
  });
}
