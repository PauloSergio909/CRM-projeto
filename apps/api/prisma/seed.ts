import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { CATEGORIAS_PADRAO_RECEITA, CATEGORIAS_PADRAO_DESPESA } from '../src/modules/categorias/categorias.constants';

const prisma = new PrismaClient();

async function main() {
  const senhaHash = await bcrypt.hash('demo123', 12);

  const usuario = await prisma.usuario.upsert({
    where: { email: 'demo@clientebox.com.br' },
    update: {},
    create: {
      nome: 'Usuário Demo',
      email: 'demo@clientebox.com.br',
      senhaHash,
    },
  });

  console.log(`✅ Usuário demo pronto: ${usuario.email} / senha: demo123`);

  const totalClientes = await prisma.cliente.count({ where: { usuarioId: usuario.id } });
  if (totalClientes === 0) {
    const clientesSeed = [
      {
        nome: 'Maria Silva',
        telefone: '11987654321',
        email: 'maria.silva@example.com',
        cpfCnpj: '123.456.789-00',
        cidade: 'São Paulo',
        estado: 'SP',
        status: 'ativo' as const,
        interacoes: [
          { tipo: 'venda' as const, descricao: 'Compra de R$ 450 em produtos.' },
          { tipo: 'whatsapp' as const, descricao: 'Confirmou interesse em novo pedido.' },
        ],
      },
      {
        nome: 'João Santos',
        telefone: '11912345678',
        email: 'joao.santos@example.com',
        cidade: 'Campinas',
        estado: 'SP',
        status: 'ativo' as const,
        interacoes: [{ tipo: 'ligacao' as const, descricao: 'Primeiro contato, cliente interessado no serviço.' }],
      },
      {
        nome: 'Oficina Boa Vista',
        telefone: '11955556666',
        email: 'contato@oficinaboavista.com.br',
        cpfCnpj: '12.345.678/0001-90',
        cidade: 'Guarulhos',
        estado: 'SP',
        status: 'inativo' as const,
        interacoes: [{ tipo: 'email' as const, descricao: 'Orçamento enviado, aguardando retorno.' }],
      },
    ];

    for (const { interacoes, ...cliente } of clientesSeed) {
      await prisma.cliente.create({
        data: {
          ...cliente,
          usuarioId: usuario.id,
          interacoes: { create: interacoes.map((i) => ({ ...i, usuarioId: usuario.id })) },
        },
      });
    }

    console.log(`✅ ${clientesSeed.length} clientes de exemplo criados.`);
  } else {
    console.log(`✅ Usuário já possui ${totalClientes} cliente(s) — seed de clientes ignorado.`);
  }

  const totalCategorias = await prisma.categoria.count({ where: { usuarioId: usuario.id } });
  if (totalCategorias === 0) {
    await prisma.categoria.createMany({
      data: [
        ...CATEGORIAS_PADRAO_RECEITA.map((nome) => ({ usuarioId: usuario.id, nome, tipo: 'receita' })),
        ...CATEGORIAS_PADRAO_DESPESA.map((nome) => ({ usuarioId: usuario.id, nome, tipo: 'despesa' })),
      ],
      skipDuplicates: true,
    });
    console.log('✅ Categorias padrão criadas.');
  } else {
    console.log(`✅ Usuário já possui ${totalCategorias} categoria(s) — seed de categorias ignorado.`);
  }

  const totalLancamentos = await prisma.lancamento.count({ where: { usuarioId: usuario.id } });
  if (totalLancamentos === 0) {
    const categoriaVendas = await prisma.categoria.findFirst({
      where: { usuarioId: usuario.id, nome: 'Vendas', tipo: 'receita' },
    });
    const categoriaAluguel = await prisma.categoria.findFirst({
      where: { usuarioId: usuario.id, nome: 'Aluguel', tipo: 'despesa' },
    });
    const primeiroCliente = await prisma.cliente.findFirst({ where: { usuarioId: usuario.id } });

    await prisma.lancamento.createMany({
      data: [
        {
          usuarioId: usuario.id,
          tipo: 'receita',
          categoriaId: categoriaVendas?.id,
          clienteId: primeiroCliente?.id,
          descricao: 'Venda de produtos',
          valor: 450,
          status: 'pago',
          dataPagamento: new Date(),
          formaPagamento: 'pix',
        },
        {
          usuarioId: usuario.id,
          tipo: 'despesa',
          categoriaId: categoriaAluguel?.id,
          descricao: 'Aluguel do mês',
          valor: 1200,
          status: 'pendente',
          dataVencimento: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          formaPagamento: 'boleto',
        },
        {
          usuarioId: usuario.id,
          tipo: 'despesa',
          categoriaId: categoriaAluguel?.id,
          descricao: 'Conta de internet vencida',
          valor: 120,
          status: 'pendente',
          dataVencimento: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        },
      ],
    });
    console.log('✅ Lançamentos de exemplo criados.');
  } else {
    console.log(`✅ Usuário já possui ${totalLancamentos} lançamento(s) — seed de lançamentos ignorado.`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
