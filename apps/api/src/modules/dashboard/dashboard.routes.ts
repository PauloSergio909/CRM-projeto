import { FastifyInstance } from 'fastify';
import { DashboardService } from './dashboard.service';
import { sendSuccess } from '../../utils/response';
import { authGuard } from '../../middleware/auth.middleware';

const dashboardService = new DashboardService();

// "2026-07" -> 1º de julho de 2026. undefined/inválido -> undefined (service usa o mês atual).
function parseMesReferencia(mes?: string): Date | undefined {
  if (!mes) return undefined;
  const match = /^(\d{4})-(\d{2})$/.exec(mes);
  if (!match) return undefined;
  return new Date(Number(match[1]), Number(match[2]) - 1, 1);
}

export async function dashboardRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authGuard);

  app.get('/resumo', async (request, reply) => {
    const usuarioId = (request.user as { id: string }).id;
    const { mes } = request.query as { mes?: string };
    const referencia = parseMesReferencia(mes);
    const resumo = referencia ? await dashboardService.resumo(usuarioId, referencia) : await dashboardService.resumo(usuarioId);
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
    const { mes } = request.query as { mes?: string };
    const referencia = parseMesReferencia(mes);
    const dados = referencia
      ? await dashboardService.despesasPorCategoria(usuarioId, referencia)
      : await dashboardService.despesasPorCategoria(usuarioId);
    return sendSuccess(reply, dados);
  });

  app.get('/atividades', async (request, reply) => {
    const usuarioId = (request.user as { id: string }).id;
    const { limite } = request.query as { limite?: string };
    const dados = await dashboardService.atividadesRecentes(usuarioId, limite ? Number(limite) : 10);
    return sendSuccess(reply, dados);
  });

  app.get('/previsao', async (request, reply) => {
    const usuarioId = (request.user as { id: string }).id;
    const { meses } = request.query as { meses?: string };
    const previsao = await dashboardService.previsaoFaturamento(usuarioId, meses ? Number(meses) : 3);
    return sendSuccess(reply, previsao);
  });
}
