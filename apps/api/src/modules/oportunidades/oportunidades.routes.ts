import { FastifyInstance } from 'fastify';
import { OportunidadesService } from './oportunidades.service';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { createOportunidadeSchema, updateOportunidadeSchema, moverOportunidadeSchema } from '@clientebox/shared';
import { sendSuccess, sendCreated } from '../../utils/response';
import { authGuard } from '../../middleware/auth.middleware';
import { AppError } from '../../utils/app-error';

const oportunidadesService = new OportunidadesService();
const auditoriaService = new AuditoriaService();

export async function oportunidadesRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authGuard);

  app.get('/', async (request, reply) => {
    const usuarioId = (request.user as { id: string }).id;
    const oportunidades = await oportunidadesService.listar(usuarioId);
    return sendSuccess(reply, oportunidades);
  });

  app.post('/', async (request, reply) => {
    const usuarioId = (request.user as { id: string }).id;
    const data = createOportunidadeSchema.parse(request.body);
    const oportunidade = await oportunidadesService.criar(usuarioId, data);
    await auditoriaService.registrar(
      usuarioId,
      'criar',
      'oportunidade',
      oportunidade.id,
      `Oportunidade criada: ${oportunidade.titulo}`,
    );
    return sendCreated(reply, oportunidade, 'Oportunidade criada com sucesso');
  });

  app.put('/:id', async (request, reply) => {
    const usuarioId = (request.user as { id: string }).id;
    const { id } = request.params as { id: string };
    const data = updateOportunidadeSchema.parse(request.body);
    const oportunidade = await oportunidadesService.atualizar(usuarioId, id, data);
    return sendSuccess(reply, oportunidade, 'Oportunidade atualizada com sucesso');
  });

  app.patch('/:id/mover', async (request, reply) => {
    const usuarioId = (request.user as { id: string }).id;
    const { id } = request.params as { id: string };
    const data = moverOportunidadeSchema.parse(request.body);
    const oportunidade = await oportunidadesService.mover(usuarioId, id, data);
    if (!oportunidade) {
      throw new AppError('Oportunidade não encontrada', 404);
    }
    await auditoriaService.registrar(
      usuarioId,
      'mover',
      'oportunidade',
      oportunidade.id,
      `Oportunidade ${oportunidade.titulo} movida para ${data.etapa}`,
    );
    return sendSuccess(reply, oportunidade, 'Oportunidade movida com sucesso');
  });
}
