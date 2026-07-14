import { FastifyInstance } from 'fastify';
import { AuthService } from './auth.service';
import { loginSchema, registerSchema, refreshSchema } from '@clientebox/shared';
import { sendSuccess, sendError, sendCreated } from '../../utils/response';
import { authGuard } from '../../middleware/auth.middleware';
import { env } from '../../config/env';

const authService = new AuthService();

function makeAccessToken(app: FastifyInstance, user: { id: string; email: string; nome: string }) {
  return app.jwt.sign({ id: user.id, email: user.email, nome: user.nome }, { expiresIn: env.JWT_EXPIRES_IN });
}

export async function authRoutes(app: FastifyInstance) {
  app.post('/register', async (request, reply) => {
    const data = registerSchema.parse(request.body);
    const user = await authService.register(data);

    const accessToken = makeAccessToken(app, user);
    const refreshToken = await authService.issueRefreshToken(user.id, {
      userAgent: request.headers['user-agent'],
      ip: request.ip,
    });

    return sendCreated(reply, { user, accessToken, refreshToken }, 'Cadastro realizado com sucesso');
  });

  app.post(
    '/login',
    {
      config: {
        rateLimit: {
          max: 5,
          timeWindow: '15 minutes',
          errorResponseBuilder: () => ({
            error: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
          }),
        },
      },
    },
    async (request, reply) => {
      const data = loginSchema.parse(request.body);
      const user = await authService.validateLogin(data);

      if (!user) {
        return sendError(reply, 'Email ou senha incorretos', 401);
      }

      const accessToken = makeAccessToken(app, user);
      const refreshToken = await authService.issueRefreshToken(user.id, {
        userAgent: request.headers['user-agent'],
        ip: request.ip,
      });

      return sendSuccess(reply, { user, accessToken, refreshToken }, 'Login realizado com sucesso');
    },
  );

  app.post(
    '/refresh',
    {
      config: {
        rateLimit: {
          max: 20,
          timeWindow: '15 minutes',
          errorResponseBuilder: () => ({ error: 'Muitas tentativas. Tente novamente em 15 minutos.' }),
        },
      },
    },
    async (request, reply) => {
      const { refreshToken } = refreshSchema.parse(request.body);

      const result = await authService.rotateRefreshToken(refreshToken, {
        userAgent: request.headers['user-agent'],
        ip: request.ip,
      });

      const accessToken = makeAccessToken(app, result.usuario);

      return sendSuccess(reply, { accessToken, refreshToken: result.refreshToken });
    },
  );

  app.post('/logout', { preHandler: [authGuard] }, async (request, reply) => {
    const { refreshToken } = refreshSchema.parse(request.body);
    await authService.revokeRefreshToken(refreshToken);
    return sendSuccess(reply, null, 'Logout realizado com sucesso');
  });

  app.get('/me', { preHandler: [authGuard] }, async (request, reply) => {
    const payload = request.user as { id: string };
    const user = await authService.findById(payload.id);

    if (!user) {
      return sendError(reply, 'Usuário não encontrado', 404);
    }

    return sendSuccess(reply, user);
  });
}
