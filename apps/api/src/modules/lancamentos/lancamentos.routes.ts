import { FastifyInstance } from 'fastify';
import { LancamentosService } from './lancamentos.service';
import { AuditoriaService } from '../auditoria/auditoria.service';
import {
  lancamentosQuerySchema,
  createLancamentoSchema,
  updateLancamentoSchema,
  updateLancamentoStatusSchema,
} from '@clientebox/shared';
import { sendSuccess, sendCreated, sendPaginated } from '../../utils/response';
import { authGuard } from '../../middleware/auth.middleware';
import { formatarMoeda } from '../../utils/formatters';

const lancamentosService = new LancamentosService();
const auditoriaService = new AuditoriaService();

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
    await auditoriaService.registrar(
      usuarioId,
      'criar',
      'lancamento',
      lancamento.id,
      `Lançamento criado: ${lancamento.descricao} — ${formatarMoeda(Number(lancamento.valor))}`,
    );
    return sendCreated(reply, lancamento, 'Lançamento registrado com sucesso');
  });

  app.put('/:id', async (request, reply) => {
    const usuarioId = (request.user as { id: string }).id;
    const { id } = request.params as { id: string };
    const data = updateLancamentoSchema.parse(request.body);
    const lancamento = await lancamentosService.atualizar(usuarioId, id, data);
    await auditoriaService.registrar(
      usuarioId,
      'atualizar',
      'lancamento',
      lancamento.id,
      `Lançamento atualizado: ${lancamento.descricao}`,
    );
    return sendSuccess(reply, lancamento, 'Lançamento atualizado com sucesso');
  });

  app.patch('/:id/status', async (request, reply) => {
    const usuarioId = (request.user as { id: string }).id;
    const { id } = request.params as { id: string };
    const { status } = updateLancamentoStatusSchema.parse(request.body);
    const lancamento = await lancamentosService.atualizarStatus(usuarioId, id, status);
    await auditoriaService.registrar(
      usuarioId,
      'status',
      'lancamento',
      lancamento.id,
      `Lançamento ${lancamento.descricao} marcado como ${status}`,
    );
    return sendSuccess(reply, lancamento, 'Status atualizado com sucesso');
  });

  app.get('/:id/recibo', async (request, reply) => {
    const usuarioId = (request.user as { id: string }).id;
    const { id } = request.params as { id: string };
    const { doc, filename } = await lancamentosService.gerarRecibo(usuarioId, id);
    reply.header('Content-Disposition', `attachment; filename="${filename}"`);
    reply.type('application/pdf');
    doc.end();
    return reply.send(doc);
  });
}
