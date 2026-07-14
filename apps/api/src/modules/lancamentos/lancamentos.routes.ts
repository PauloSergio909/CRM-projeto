import { FastifyInstance } from 'fastify';
import { LancamentosService } from './lancamentos.service';
import {
  lancamentosQuerySchema,
  createLancamentoSchema,
  updateLancamentoSchema,
  updateLancamentoStatusSchema,
} from '@clientebox/shared';
import { sendSuccess, sendCreated, sendPaginated } from '../../utils/response';
import { authGuard } from '../../middleware/auth.middleware';

const lancamentosService = new LancamentosService();

export async function lancamentosRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authGuard);

  app.get('/', async (request, reply) => {
    const usuarioId = (request.user as { id: string }).id;
    const params = lancamentosQuerySchema.parse(request.query);
    const { lancamentos, total } = await lancamentosService.listar(usuarioId, params);
    return sendPaginated(reply, lancamentos, total, params.page, params.perPage);
  });

  app.get('/:id', async (request, reply) => {
    const usuarioId = (request.user as { id: string }).id;
    const { id } = request.params as { id: string };
    const lancamento = await lancamentosService.buscar(usuarioId, id);
    return sendSuccess(reply, lancamento);
  });

  app.post('/', async (request, reply) => {
    const usuarioId = (request.user as { id: string }).id;
    const data = createLancamentoSchema.parse(request.body);
    const lancamento = await lancamentosService.criar(usuarioId, data);
    return sendCreated(reply, lancamento, 'Lançamento registrado com sucesso');
  });

  app.put('/:id', async (request, reply) => {
    const usuarioId = (request.user as { id: string }).id;
    const { id } = request.params as { id: string };
    const data = updateLancamentoSchema.parse(request.body);
    const lancamento = await lancamentosService.atualizar(usuarioId, id, data);
    return sendSuccess(reply, lancamento, 'Lançamento atualizado com sucesso');
  });

  app.patch('/:id/status', async (request, reply) => {
    const usuarioId = (request.user as { id: string }).id;
    const { id } = request.params as { id: string };
    const { status } = updateLancamentoStatusSchema.parse(request.body);
    const lancamento = await lancamentosService.atualizarStatus(usuarioId, id, status);
    return sendSuccess(reply, lancamento, 'Status atualizado com sucesso');
  });
}
