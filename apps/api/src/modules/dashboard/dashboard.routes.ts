import { FastifyInstance } from 'fastify';
import { DashboardService } from './dashboard.service';
import { sendSuccess } from '../../utils/response';
import { authGuard } from '../../middleware/auth.middleware';

const dashboardService = new DashboardService();

export async function dashboardRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authGuard);

  app.get('/resumo', async (request, reply) => {
    const usuarioId = (request.user as { id: string }).id;
    const resumo = await dashboardService.resumo(usuarioId);
    return sendSuccess(reply, resumo);
  });

  app.get('/faturamento-mensal', async (request, reply) => {
    const usuarioId = (request.user as { id: string }).id;
    const { meses } = request.query as { meses?: string };
    const dados = await dashboardService.faturamentoMensal(usuarioId, meses ? Number(meses) : 6);
    return sendSuccess(reply, dados);
  });

  app.get('/despesas-por-categoria', async (request, reply) => {
    const usuarioId = (request.user as { id: string }).id;
    const dados = await dashboardService.despesasPorCategoria(usuarioId);
    return sendSuccess(reply, dados);
  });

  app.get('/atividades', async (request, reply) => {
    const usuarioId = (request.user as { id: string }).id;
    const { limite } = request.query as { limite?: string };
    const dados = await dashboardService.atividadesRecentes(usuarioId, limite ? Number(limite) : 10);
    return sendSuccess(reply, dados);
  });
}
