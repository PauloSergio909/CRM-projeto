import { FastifyInstance } from 'fastify';
import { ClientesService } from './clientes.service';
import {
  clientesQuerySchema,
  createClienteSchema,
  updateClienteSchema,
  updateClienteStatusSchema,
  createInteracaoSchema,
} from '@clientebox/shared';
import { sendSuccess, sendCreated, sendPaginated } from '../../utils/response';
import { authGuard } from '../../middleware/auth.middleware';

const clientesService = new ClientesService();

export async function clientesRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authGuard);

  app.get('/', async (request, reply) => {
    const usuarioId = (request.user as { id: string }).id;
    const params = clientesQuerySchema.parse(request.query);
    const { clientes, total } = await clientesService.listar(usuarioId, params);
    return sendPaginated(reply, clientes, total, params.page, params.perPage);
  });

  app.get('/:id', async (request, reply) => {
    const usuarioId = (request.user as { id: string }).id;
    const { id } = request.params as { id: string };
    const cliente = await clientesService.buscar(usuarioId, id);
    return sendSuccess(reply, cliente);
  });

  app.post('/', async (request, reply) => {
    const usuarioId = (request.user as { id: string }).id;
    const data = createClienteSchema.parse(request.body);
    const cliente = await clientesService.criar(usuarioId, data);
    return sendCreated(reply, cliente, 'Cliente cadastrado com sucesso');
  });

  app.put('/:id', async (request, reply) => {
    const usuarioId = (request.user as { id: string }).id;
    const { id } = request.params as { id: string };
    const data = updateClienteSchema.parse(request.body);
    const cliente = await clientesService.atualizar(usuarioId, id, data);
    return sendSuccess(reply, cliente, 'Cliente atualizado com sucesso');
  });

  app.patch('/:id/status', async (request, reply) => {
    const usuarioId = (request.user as { id: string }).id;
    const { id } = request.params as { id: string };
    const { status } = updateClienteStatusSchema.parse(request.body);
    const cliente = await clientesService.atualizarStatus(usuarioId, id, status);
    return sendSuccess(reply, cliente, 'Status atualizado com sucesso');
  });

  app.post('/:id/interacoes', async (request, reply) => {
    const usuarioId = (request.user as { id: string }).id;
    const { id } = request.params as { id: string };
    const data = createInteracaoSchema.parse(request.body);
    const interacao = await clientesService.criarInteracao(usuarioId, id, data);
    return sendCreated(reply, interacao, 'Interação registrada com sucesso');
  });
}
