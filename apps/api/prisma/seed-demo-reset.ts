import { PrismaClient } from '@prisma/client';
import { seedDemoData } from './seed';

const prisma = new PrismaClient();

async function main() {
  const usuario = await prisma.usuario.findUnique({ where: { email: 'demo@clientebox.com.br' } });
  if (!usuario) {
    console.log('⚠️  Usuário demo não existe ainda — rode "npm run db:seed" primeiro.');
    return;
  }

  await prisma.logAuditoria.deleteMany({ where: { usuarioId: usuario.id } });
  await prisma.interacao.deleteMany({ where: { usuarioId: usuario.id } });
  await prisma.oportunidade.deleteMany({ where: { usuarioId: usuario.id } });
  await prisma.lancamento.deleteMany({ where: { usuarioId: usuario.id } });
  await prisma.cliente.deleteMany({ where: { usuarioId: usuario.id } });

  console.log('🧹 Dados de demonstração anteriores removidos.');

  await seedDemoData(usuario.id);

  console.log('✅ Conta de demonstração resetada.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
