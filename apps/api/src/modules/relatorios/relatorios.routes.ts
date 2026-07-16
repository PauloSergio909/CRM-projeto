import { FastifyInstance } from 'fastify';
import { RelatoriosService } from './relatorios.service';
import { DashboardService } from '../dashboard/dashboard.service';
import { gerarRelatorioPdf } from './relatorio-pdf';
import { sendSuccess } from '../../utils/response';
import { authGuard } from '../../middleware/auth.middleware';
import { prisma } from '../../config/database';
import { AppError } from '../../utils/app-error';

const relatoriosService = new RelatoriosService();
const dashboardService = new DashboardService();

export async function relatoriosRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authGuard);

  app.get('/ranking-clientes', async (request, reply) => {
    const usuarioId = (request.user as { id: string }).id;
    const { limite } = request.query as { limite?: string };
    const ranking = await relatoriosService.rankingClientes(usuarioId, limite ? Number(limite) : 10);
    return sendSuccess(reply, ranking);
  });

  app.get('/ranking-produtos', async (request, reply) => {
    const usuarioId = (request.user as { id: string }).id;
    const { limite } = request.query as { limite?: string };
    const ranking = await relatoriosService.rankingProdutos(usuarioId, limite ? Number(limite) : 10);
    return sendSuccess(reply, ranking);
  });

  app.get('/clientes-inativos', async (request, reply) => {
    const usuarioId = (request.user as { id: string }).id;
    const { dias } = request.query as { dias?: string };
    const inativos = await relatoriosService.clientesInativos(usuarioId, dias ? Number(dias) : 30);
    return sendSuccess(reply, inativos);
  });

  app.get('/pdf', async (request, reply) => {
    const usuarioId = (request.user as { id: string }).id;

    const [usuario, rankingClientes, rankingProdutos, clientesInativos, faturamentoMensal] = await Promise.all([
      prisma.usuario.findUnique({ where: { id: usuarioId } }),
      relatoriosService.rankingClientes(usuarioId, 10),
      relatoriosService.rankingProdutos(usuarioId, 10),
      relatoriosService.clientesInativos(usuarioId, 30),
      dashboardService.faturamentoMensal(usuarioId, 6),
    ]);

    if (!usuario) {
      throw new AppError('Usuário não encontrado', 404);
    }

    const doc = gerarRelatorioPdf({ usuario, rankingClientes, rankingProdutos, clientesInativos, faturamentoMensal });
    reply.header('Content-Disposition', 'attachment; filename="relatorio-gerencial.pdf"');
    reply.type('application/pdf');
    doc.end();
    return reply.send(doc);
  });
}
