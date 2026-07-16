import { FastifyInstance } from 'fastify';
import { ClientesService } from './clientes.service';
import { AuditoriaService } from '../auditoria/auditoria.service';
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
const auditoriaService = new AuditoriaService();

export async function clientesRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authGuard);

  app.get('/', async (request, reply) => {
    const usuarioId = (request.user as { id: string }).id;
    const params = clientesQuerySchema.parse(request.query);
    const { clientes, total } = await clientesService.listar(usuarioId, params);
    return sendPaginated(reply, clientes, total, params.page, params.perPage);
  });

  // Precisa vir antes de "/:id" — senão "export" seria interpretado como um id.
  app.get('/export', async (request, reply) => {
    const usuarioId = (request.user as { id: string }).id;
    const csv = await clientesService.exportarCsv(usuarioId);
    reply.header('Content-Type', 'text/csv; charset=utf-8');
    reply.header('Content-Disposition', 'attachment; filename="clientes.csv"');
    return reply.send(csv);
  });

  app.post('/import', async (request, reply) => {
    const usuarioId = (request.user as { id: string }).id;
    const { clientes } = request.body as { clientes: Record<string, unknown>[] };
    const resultado = await clientesService.importarLote(usuarioId, clientes ?? []);
    return sendSuccess(reply, resultado, `${resultado.criados} cliente(s) importado(s)`);
  });

  app.get('/aniversariantes', async (request, reply) => {
    const usuarioId = (request.user as { id: string }).id;
    const aniversariantes = await clientesService.aniversariantesDaSemana(usuarioId);
    return sendSuccess(reply, aniversariantes);
  });

  app.get('/tags', async (request, reply) => {
    const usuarioId = (request.user as { id: string }).id;
    const tags = await clientesService.listarTags(usuarioId);
    return sendSuccess(reply, tags);
  });

  app.get('/verificar-duplicatas', async (request, reply) => {
    const usuarioId = (request.user as { id: string }).id;
    const { nome, telefone, cpfCnpj } = request.query as { nome?: string; telefone?: string; cpfCnpj?: string };
    const duplicatas = await clientesService.verificarDuplicatas(usuarioId, { nome, telefone, cpfCnpj });
    return sendSuccess(reply, duplicatas);
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
    await auditoriaService.registrar(usuarioId, 'criar', 'cliente', cliente.id, `Cliente cadastrado: ${cliente.nome}`);
    return sendCreated(reply, cliente, 'Cliente cadastrado com sucesso');
  });

  app.put('/:id', async (request, reply) => {
    const usuarioId = (request.user as { id: string }).id;
    const { id } = request.params as { id: string };
    const data = updateClienteSchema.parse(request.body);
    const cliente = await clientesService.atualizar(usuarioId, id, data);
    await auditoriaService.registrar(usuarioId, 'atualizar', 'cliente', cliente.id, `Cliente atualizado: ${cliente.nome}`);
    return sendSuccess(reply, cliente, 'Cliente atualizado com sucesso');
  });

  app.patch('/:id/status', async (request, reply) => {
    const usuarioId = (request.user as { id: string }).id;
    const { id } = request.params as { id: string };
    const { status } = updateClienteStatusSchema.parse(request.body);
    const cliente = await clientesService.atualizarStatus(usuarioId, id, status);
    await auditoriaService.registrar(
      usuarioId,
      'status',
      'cliente',
      cliente.id,
      `Cliente ${cliente.nome} marcado como ${status}`,
    );
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
