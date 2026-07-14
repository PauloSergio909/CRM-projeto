import { FastifyRequest, FastifyReply } from 'fastify';
import { sendError } from '../utils/response';

export async function authGuard(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify();
  } catch {
    return sendError(reply, 'Token inválido ou expirado. Faça login novamente.', 401);
  }
}
