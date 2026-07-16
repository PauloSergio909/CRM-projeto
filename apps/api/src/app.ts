import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import jwt from '@fastify/jwt';
import rateLimit from '@fastify/rate-limit';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';

import { env } from './config/env';
import { errorHandler } from './middleware/error-handler';
import { prisma } from './config/database';

import { authRoutes } from './modules/auth/auth.routes';
import { clientesRoutes } from './modules/clientes/clientes.routes';
import { categoriasRoutes } from './modules/categorias/categorias.routes';
import { lancamentosRoutes } from './modules/lancamentos/lancamentos.routes';
import { oportunidadesRoutes } from './modules/oportunidades/oportunidades.routes';
import { dashboardRoutes } from './modules/dashboard/dashboard.routes';
import { relatoriosRoutes } from './modules/relatorios/relatorios.routes';
import { produtosRoutes } from './modules/produtos/produtos.routes';
import { metasRoutes } from './modules/metas/metas.routes';
import { auditoriaRoutes } from './modules/auditoria/auditoria.routes';

export async function buildApp() {
  const app = Fastify({
    logger: env.NODE_ENV === 'development',
    bodyLimit: 1_048_576, // 1 MB
    connectionTimeout: 30_000,
  });

  await app.register(swagger, {
    openapi: {
      info: {
        title: 'ClienteBox API',
        description: 'API do CRM + Financeiro ClienteBox',
        version: '1.0.0',
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
      security: [{ bearerAuth: [] }],
    },
  });

  await app.register(swaggerUi, {
    routePrefix: '/api/docs',
    uiConfig: { docExpansion: 'list', deepLinking: true },
    staticCSP: true,
  });

  const allowedOrigins: string[] =
    env.NODE_ENV === 'development'
      ? ['http://localhost:5173', 'http://localhost:5174']
      : env.ALLOWED_ORIGIN
        ? env.ALLOWED_ORIGIN.split(',').map((o) => o.trim()).filter(Boolean)
        : [];

  app.log.info({ allowedOrigins }, 'CORS origins');

  await app.register(cors, {
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  });

  await app.register(helmet);

  await app.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
  });

  await app.register(jwt, {
    secret: env.JWT_SECRET,
  });

  app.setErrorHandler(errorHandler);

  app.get('/api/health', async (_request, reply) => {
    const dbOk = await prisma.$queryRaw`SELECT 1`.then(() => true).catch(() => false);
    const mem = process.memoryUsage();

    return reply.status(dbOk ? 200 : 503).send({
      status: dbOk ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      version: env.NODE_ENV,
      services: {
        database: dbOk ? 'ok' : 'error',
      },
      memory: {
        heapUsedMB: Math.round(mem.heapUsed / 1024 / 1024),
        heapTotalMB: Math.round(mem.heapTotal / 1024 / 1024),
        rssMB: Math.round(mem.rss / 1024 / 1024),
      },
    });
  });

  await app.register(authRoutes, { prefix: '/api/auth' });
  await app.register(clientesRoutes, { prefix: '/api/clientes' });
  await app.register(categoriasRoutes, { prefix: '/api/categorias' });
  await app.register(lancamentosRoutes, { prefix: '/api/lancamentos' });
  await app.register(oportunidadesRoutes, { prefix: '/api/oportunidades' });
  await app.register(dashboardRoutes, { prefix: '/api/dashboard' });
  await app.register(relatoriosRoutes, { prefix: '/api/relatorios' });
  await app.register(produtosRoutes, { prefix: '/api/produtos' });
  await app.register(metasRoutes, { prefix: '/api/metas' });
  await app.register(auditoriaRoutes, { prefix: '/api/auditoria' });

  return app;
}
