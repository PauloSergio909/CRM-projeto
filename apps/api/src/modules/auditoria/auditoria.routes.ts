import { FastifyInstance } from 'fastify';
import { AuditoriaService } from './auditoria.service';
import { auditoriaQuerySchema } from '@clientebox/shared';
import { sendPaginated } from '../../utils/response';
import { authGuard } from '../../middleware/auth.middleware';

const auditoriaService = new AuditoriaService();

export async function auditoriaRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authGuard);

  app.get('/', async (request, reply) => {
    const usuarioId = (request.user as { id: string }).id;
    const params = auditoriaQuerySchema.parse(request.query);
    const { logs, total } = await auditoriaService.listar(usuarioId, params);
    return sendPaginated(reply, logs, total, params.page, params.perPage);
  });
}
