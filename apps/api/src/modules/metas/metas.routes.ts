import { FastifyInstance } from 'fastify';
import { MetasService } from './metas.service';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { upsertMetaSchema } from '@clientebox/shared';
import { sendSuccess } from '../../utils/response';
import { authGuard } from '../../middleware/auth.middleware';
import { formatarMoeda } from '../../utils/formatters';

const metasService = new MetasService();
const auditoriaService = new AuditoriaService();

// "2026-07" -> 1º de julho de 2026.
function parseMes(mes: string): Date {
  const [ano, mesNum] = mes.split('-').map(Number);
  return new Date(ano, mesNum - 1, 1);
}

function mesAtual(): Date {
  const hoje = new Date();
  return new Date(hoje.getFullYear(), hoje.getMonth(), 1);
}

export async function metasRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authGuard);

  app.get('/', async (request, reply) => {
    const usuarioId = (request.user as { id: string }).id;
    const { mes } = request.query as { mes?: string };
    const referencia = mes && /^\d{4}-\d{2}$/.test(mes) ? parseMes(mes) : mesAtual();
    const meta = await metasService.buscar(usuarioId, referencia);
    return sendSuccess(reply, meta);
  });

  app.put('/', async (request, reply) => {
    const usuarioId = (request.user as { id: string }).id;
    const { mes, valorMeta } = upsertMetaSchema.parse(request.body);
    const meta = await metasService.upsert(usuarioId, parseMes(mes), valorMeta);
    await auditoriaService.registrar(
      usuarioId,
      'atualizar',
      'meta',
      meta.id,
      `Meta de ${mes} definida: ${formatarMoeda(Number(meta.valorMeta))}`,
    );
    return sendSuccess(reply, meta, 'Meta salva com sucesso');
  });
}
