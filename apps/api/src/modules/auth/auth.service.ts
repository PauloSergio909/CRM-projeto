import bcrypt from 'bcryptjs';
import ms from 'ms';
import { prisma } from '../../config/database';
import type { LoginInput, RegisterInput } from '@clientebox/shared';
import { AppError } from '../../utils/app-error';
import { env } from '../../config/env';
import { generateRefreshToken, hashToken } from '../../utils/tokens';
import { CategoriasService } from '../categorias/categorias.service';

const categoriasService = new CategoriasService();

export class AuthService {
  async register(data: RegisterInput) {
    const existingUser = await prisma.usuario.findUnique({ where: { email: data.email } });

    if (existingUser) {
      throw new AppError('Email já cadastrado no sistema', 409);
    }

    const senhaHash = await bcrypt.hash(data.senha, 12);

    const usuario = await prisma.usuario.create({
      data: { email: data.email, nome: data.nome, senhaHash },
      select: { id: true, email: true, nome: true, ativo: true, createdAt: true },
    });

    await categoriasService.criarPadrao(usuario.id);

    return usuario;
  }

  async validateLogin(data: LoginInput) {
    const user = await prisma.usuario.findUnique({ where: { email: data.email } });

    // Sempre roda bcrypt.compare para não vazar, por tempo de resposta, se o email existe
    const dummyHash = '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.i8e2';
    const senhaValida = await bcrypt.compare(data.senha, user?.senhaHash ?? dummyHash);

    if (!user || !user.ativo || !senhaValida) return null;

    return { id: user.id, email: user.email, nome: user.nome };
  }

  async findById(id: string) {
    return prisma.usuario.findUnique({
      where: { id },
      select: { id: true, email: true, nome: true, ativo: true, createdAt: true, updatedAt: true },
    });
  }

  async issueRefreshToken(usuarioId: string, meta?: { userAgent?: string; ip?: string }) {
    const rawToken = generateRefreshToken();
    const expiresAt = new Date(Date.now() + ms(env.JWT_REFRESH_EXPIRES_IN));

    await prisma.refreshToken.create({
      data: {
        usuarioId,
        tokenHash: hashToken(rawToken),
        expiresAt,
        userAgent: meta?.userAgent,
        ip: meta?.ip,
      },
    });

    return rawToken;
  }

  async rotateRefreshToken(rawToken: string, meta?: { userAgent?: string; ip?: string }) {
    const tokenHash = hashToken(rawToken);
    const existing = await prisma.refreshToken.findUnique({ where: { tokenHash } });

    if (!existing) {
      throw new AppError('Refresh token inválido', 401);
    }

    if (existing.revokedAt) {
      // Reuso de token já revogado: possível roubo — revoga todas as sessões do usuário
      await prisma.refreshToken.updateMany({
        where: { usuarioId: existing.usuarioId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      throw new AppError('Sessão inválida. Faça login novamente.', 401);
    }

    if (existing.expiresAt < new Date()) {
      throw new AppError('Refresh token expirado', 401);
    }

    const user = await prisma.usuario.findUnique({ where: { id: existing.usuarioId } });
    if (!user || !user.ativo) {
      throw new AppError('Usuário não encontrado ou desativado', 401);
    }

    const newRawToken = generateRefreshToken();
    const newTokenHash = hashToken(newRawToken);
    const newExpiresAt = new Date(Date.now() + ms(env.JWT_REFRESH_EXPIRES_IN));

    await prisma.$transaction([
      prisma.refreshToken.update({
        where: { id: existing.id },
        data: { revokedAt: new Date(), replacedByTokenHash: newTokenHash },
      }),
      prisma.refreshToken.create({
        data: {
          usuarioId: existing.usuarioId,
          tokenHash: newTokenHash,
          expiresAt: newExpiresAt,
          userAgent: meta?.userAgent,
          ip: meta?.ip,
        },
      }),
    ]);

    return { usuario: { id: user.id, email: user.email, nome: user.nome }, refreshToken: newRawToken };
  }

  async revokeRefreshToken(rawToken: string) {
    const tokenHash = hashToken(rawToken);
    await prisma.refreshToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
}
