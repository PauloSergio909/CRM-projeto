import { PrismaClient, Prisma } from '@prisma/client';
import { env } from './env';
import { logger } from '../utils/logger';

// Decimal (campos monetários como valor/valorEstimado) serializa como string
// em JSON.stringify por padrão — quebra qualquer soma feita no front (ex.:
// total por coluna do kanban vira concatenação de string). Os valores aqui
// cabem com folga na precisão segura de Number, então convertemos direto.
Prisma.Decimal.prototype.toJSON = function () {
  return this.toNumber();
};

export const prisma = new PrismaClient({
  log: env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});

export async function connectDatabase(): Promise<void> {
  try {
    await prisma.$connect();
    logger.info('Banco de dados conectado com sucesso');
  } catch (error) {
    logger.error('Falha ao conectar no banco de dados', { error });
    process.exit(1);
  }
}

export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
  logger.info('Banco de dados desconectado');
}
