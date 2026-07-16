import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { CATEGORIAS_PADRAO_RECEITA, CATEGORIAS_PADRAO_DESPESA } from '../src/modules/categorias/categorias.constants';

const prisma = new PrismaClient();

const UM_DIA_MS = 24 * 60 * 60 * 1000;

function diasAPartirDeHoje(dias: number): Date {
  return new Date(Date.now() + dias * UM_DIA_MS);
}

function noMes(mesesAtras: number, dia: number): Date {
  const hoje = new Date();
  return new Date(hoje.getFullYear(), hoje.getMonth() - mesesAtras, dia);
}

export async function seedDemoData(usuarioId: string) {
  // ─── Clientes ──────────────────────────────────────────────
  const totalClientes = await prisma.cliente.count({ where: { usuarioId } });
  const clientes = new Map<string, string>(); // nome -> id

  if (totalClientes === 0) {
    const hoje = new Date();
    const aniversarioProximo = new Date(Date.UTC(1990, hoje.getUTCMonth(), hoje.getUTCDate() + 3));

    const clientesSeed = [
      {
        nome: 'Maria Silva',
        telefone: '11987654321',
        email: 'maria.silva@example.com',
        cpfCnpj: '123.456.789-00',
        cidade: 'São Paulo',
        estado: 'SP',
        status: 'ativo' as const,
        tags: ['VIP'],
        criadoHaDias: 180,
      },
      {
        nome: 'João Santos',
        telefone: '11912345678',
        email: 'joao.santos@example.com',
        cidade: 'Campinas',
        estado: 'SP',
        status: 'ativo' as const,
        tags: [],
        criadoHaDias: 60,
      },
      {
        nome: 'Oficina Boa Vista',
        telefone: '11955556666',
        email: 'contato@oficinaboavista.com.br',
        cpfCnpj: '12.345.678/0001-90',
        cidade: 'Guarulhos',
        estado: 'SP',
        status: 'inativo' as const,
        tags: [],
        criadoHaDias: 200,
      },
      {
        nome: 'Carla Mendes',
        telefone: '13991112222',
        email: 'carla.mendes@example.com',
        cep: '11015-000',
        cidade: 'Santos',
        estado: 'SP',
        status: 'ativo' as const,
        tags: ['atacado'],
        criadoHaDias: 90,
      },
      {
        nome: 'Pedro Oliveira',
        telefone: '13988884444',
        email: 'pedro.oliveira@example.com',
        cidade: 'Santos',
        estado: 'SP',
        status: 'ativo' as const,
        tags: [],
        criadoHaDias: 100,
      },
      {
        nome: 'Ana Beatriz Costa',
        telefone: '24999887766',
        email: 'ana.costa@example.com',
        cidade: 'Santos Dumont',
        estado: 'MG',
        status: 'ativo' as const,
        tags: ['VIP'],
        dataNascimento: aniversarioProximo,
        criadoHaDias: 70,
      },
      {
        nome: 'Roberto Almeida',
        telefone: '11977776655',
        email: 'roberto.almeida@example.com',
        cidade: 'São Paulo',
        estado: 'SP',
        status: 'ativo' as const,
        tags: [],
        criadoHaDias: 5,
      },
      {
        nome: 'Loja Estrela Ltda',
        telefone: '13996665544',
        email: 'compras@lojaestrela.com.br',
        cpfCnpj: '23.456.789/0001-11',
        cidade: 'Santos',
        estado: 'SP',
        status: 'ativo' as const,
        tags: ['atacado', 'VIP'],
        criadoHaDias: 120,
      },
      {
        nome: 'Fernanda Rocha',
        telefone: '11955552211',
        email: 'fernanda.rocha@example.com',
        cep: '01310-100',
        cidade: 'São Paulo',
        estado: 'SP',
        status: 'ativo' as const,
        tags: [],
        criadoHaDias: 100,
      },
      {
        nome: 'Marcos Vieira',
        telefone: '11933334455',
        email: 'marcos.vieira@example.com',
        cidade: 'Osasco',
        estado: 'SP',
        status: 'inativo' as const,
        tags: [],
        criadoHaDias: 150,
      },
    ];

    for (const { criadoHaDias, ...cliente } of clientesSeed) {
      const criado = await prisma.cliente.create({
        data: { ...cliente, usuarioId, createdAt: diasAPartirDeHoje(-criadoHaDias) },
      });
      clientes.set(cliente.nome, criado.id);
    }

    const interacoesSeed: { cliente: string; tipo: string; descricao: string; dias: number }[] = [
      { cliente: 'Maria Silva', tipo: 'venda', descricao: 'Compra de R$ 450 em produtos.', dias: -25 },
      { cliente: 'Maria Silva', tipo: 'whatsapp', descricao: 'Confirmou interesse em novo pedido.', dias: -3 },
      { cliente: 'João Santos', tipo: 'ligacao', descricao: 'Primeiro contato, cliente interessado no serviço.', dias: -40 },
      { cliente: 'Oficina Boa Vista', tipo: 'email', descricao: 'Orçamento enviado, aguardando retorno.', dias: -70 },
      { cliente: 'Carla Mendes', tipo: 'venda', descricao: 'Pedido de atacado fechado.', dias: -5 },
      { cliente: 'Carla Mendes', tipo: 'whatsapp', descricao: 'Pediu catálogo atualizado.', dias: -1 },
      { cliente: 'Pedro Oliveira', tipo: 'ligacao', descricao: 'Cobrança amigável sobre fatura em aberto.', dias: -10 },
      { cliente: 'Ana Beatriz Costa', tipo: 'visita', descricao: 'Visita técnica agendada e realizada.', dias: -8 },
      { cliente: 'Ana Beatriz Costa', tipo: 'venda', descricao: 'Fechou pacote anual.', dias: -8 },
      { cliente: 'Loja Estrela Ltda', tipo: 'orcamento', descricao: 'Orçamento de reposição mensal enviado.', dias: -15 },
      { cliente: 'Loja Estrela Ltda', tipo: 'venda', descricao: 'Pedido recorrente confirmado.', dias: -2 },
      { cliente: 'Fernanda Rocha', tipo: 'venda', descricao: 'Compra única de kit de produtos.', dias: -75 },
      { cliente: 'Roberto Almeida', tipo: 'outro', descricao: 'Cadastro feito via indicação de cliente atual.', dias: -1 },
    ];

    for (const i of interacoesSeed) {
      const clienteId = clientes.get(i.cliente);
      if (!clienteId) continue;
      await prisma.interacao.create({
        data: { usuarioId, clienteId, tipo: i.tipo, descricao: i.descricao, data: diasAPartirDeHoje(i.dias) },
      });
    }

    console.log(`✅ ${clientesSeed.length} clientes de exemplo criados (com interações).`);
  } else {
    console.log(`✅ Usuário já possui ${totalClientes} cliente(s) — seed de clientes ignorado.`);
    (await prisma.cliente.findMany({ where: { usuarioId }, select: { id: true, nome: true } })).forEach((c) =>
      clientes.set(c.nome, c.id),
    );
  }

  // ─── Categorias ────────────────────────────────────────────
  const totalCategorias = await prisma.categoria.count({ where: { usuarioId } });
  if (totalCategorias === 0) {
    await prisma.categoria.createMany({
      data: [
        ...CATEGORIAS_PADRAO_RECEITA.map((nome) => ({ usuarioId, nome, tipo: 'receita' })),
        ...CATEGORIAS_PADRAO_DESPESA.map((nome) => ({ usuarioId, nome, tipo: 'despesa' })),
      ],
      skipDuplicates: true,
    });
    console.log('✅ Categorias padrão criadas.');
  } else {
    console.log(`✅ Usuário já possui ${totalCategorias} categoria(s) — seed de categorias ignorado.`);
  }

  const categoriaVendas = await prisma.categoria.findFirst({ where: { usuarioId, nome: 'Vendas', tipo: 'receita' } });
  const categoriaServicos = await prisma.categoria.findFirst({ where: { usuarioId, nome: 'Serviços', tipo: 'receita' } });
  const categoriaAluguel = await prisma.categoria.findFirst({ where: { usuarioId, nome: 'Aluguel', tipo: 'despesa' } });
  const categoriaFornecedores = await prisma.categoria.findFirst({ where: { usuarioId, nome: 'Fornecedores', tipo: 'despesa' } });
  const categoriaMarketing = await prisma.categoria.findFirst({ where: { usuarioId, nome: 'Marketing', tipo: 'despesa' } });
  const categoriaTransporte = await prisma.categoria.findFirst({ where: { usuarioId, nome: 'Transporte', tipo: 'despesa' } });

  // ─── Produtos ──────────────────────────────────────────────
  const totalProdutos = await prisma.produto.count({ where: { usuarioId } });
  const produtos = new Map<string, string>();

  if (totalProdutos === 0) {
    const produtosSeed = [
      { nome: 'Plano Mensal', preco: 350, categoriaId: categoriaServicos?.id, descricao: 'Assinatura mensal do serviço.' },
      { nome: 'Instalação Padrão', preco: 280, categoriaId: categoriaServicos?.id, descricao: 'Serviço de instalação inicial.' },
      { nome: 'Kit Produtos', preco: 120, categoriaId: categoriaVendas?.id, descricao: 'Kit padrão de produtos.' },
      { nome: 'Consultoria Avulsa', preco: 450, categoriaId: categoriaServicos?.id, descricao: 'Consultoria pontual.' },
      { nome: 'Peça de Reposição', preco: 95, categoriaId: categoriaVendas?.id, descricao: 'Peça avulsa de reposição.' },
    ];

    for (const produto of produtosSeed) {
      const criado = await prisma.produto.create({ data: { ...produto, usuarioId } });
      produtos.set(produto.nome, criado.id);
    }

    console.log(`✅ ${produtosSeed.length} produtos de exemplo criados.`);
  } else {
    console.log(`✅ Usuário já possui ${totalProdutos} produto(s) — seed de produtos ignorado.`);
    (await prisma.produto.findMany({ where: { usuarioId }, select: { id: true, nome: true } })).forEach((p) =>
      produtos.set(p.nome, p.id),
    );
  }

  // ─── Lançamentos ───────────────────────────────────────────
  const totalLancamentos = await prisma.lancamento.count({ where: { usuarioId } });
  if (totalLancamentos === 0) {
    const idMaria = clientes.get('Maria Silva');
    const idCarla = clientes.get('Carla Mendes');
    const idAna = clientes.get('Ana Beatriz Costa');
    const idLoja = clientes.get('Loja Estrela Ltda');
    const idPedro = clientes.get('Pedro Oliveira');
    const idFernanda = clientes.get('Fernanda Rocha');
    const idJoao = clientes.get('João Santos');

    const idPlanoMensal = produtos.get('Plano Mensal');
    const idInstalacao = produtos.get('Instalação Padrão');
    const idKit = produtos.get('Kit Produtos');
    const idConsultoria = produtos.get('Consultoria Avulsa');
    const idPeca = produtos.get('Peça de Reposição');

    // Receitas e despesas pagas nos últimos 6 meses, pra alimentar o gráfico
    // de faturamento e o ranking de clientes/produtos.
    const historico: {
      tipo: 'receita' | 'despesa';
      descricao: string;
      valor: number;
      data: Date;
      categoriaId?: string;
      clienteId?: string;
      produtoId?: string;
      formaPagamento?: string;
    }[] = [
      { tipo: 'receita', descricao: 'Plano Mensal — Maria Silva', valor: 350, data: noMes(5, 8), categoriaId: categoriaServicos?.id, clienteId: idMaria, produtoId: idPlanoMensal, formaPagamento: 'pix' },
      { tipo: 'receita', descricao: 'Kit Produtos — Carla Mendes', valor: 1200, data: noMes(5, 15), categoriaId: categoriaVendas?.id, clienteId: idCarla, produtoId: idKit, formaPagamento: 'transferencia' },
      { tipo: 'despesa', descricao: 'Aluguel do mês', valor: 1200, data: noMes(5, 5), categoriaId: categoriaAluguel?.id, formaPagamento: 'boleto' },

      { tipo: 'receita', descricao: 'Instalação Padrão — Ana Beatriz', valor: 280, data: noMes(4, 6), categoriaId: categoriaServicos?.id, clienteId: idAna, produtoId: idInstalacao, formaPagamento: 'pix' },
      { tipo: 'receita', descricao: 'Kit Produtos — Loja Estrela', valor: 1440, data: noMes(4, 12), categoriaId: categoriaVendas?.id, clienteId: idLoja, produtoId: idKit, formaPagamento: 'boleto' },
      { tipo: 'receita', descricao: 'Plano Mensal — Maria Silva', valor: 350, data: noMes(4, 20), categoriaId: categoriaServicos?.id, clienteId: idMaria, produtoId: idPlanoMensal, formaPagamento: 'pix' },
      { tipo: 'despesa', descricao: 'Aluguel do mês', valor: 1200, data: noMes(4, 5), categoriaId: categoriaAluguel?.id, formaPagamento: 'boleto' },
      { tipo: 'despesa', descricao: 'Compra de material com fornecedor', valor: 480, data: noMes(4, 18), categoriaId: categoriaFornecedores?.id, formaPagamento: 'cartao_credito' },

      { tipo: 'receita', descricao: 'Consultoria Avulsa — Loja Estrela', valor: 450, data: noMes(3, 9), categoriaId: categoriaServicos?.id, clienteId: idLoja, produtoId: idConsultoria, formaPagamento: 'transferencia' },
      { tipo: 'receita', descricao: 'Peça de Reposição — Pedro Oliveira', valor: 190, data: noMes(3, 14), categoriaId: categoriaVendas?.id, clienteId: idPedro, produtoId: idPeca, formaPagamento: 'dinheiro' },
      { tipo: 'receita', descricao: 'Plano Mensal — Maria Silva', valor: 350, data: noMes(3, 20), categoriaId: categoriaServicos?.id, clienteId: idMaria, produtoId: idPlanoMensal, formaPagamento: 'pix' },
      { tipo: 'despesa', descricao: 'Aluguel do mês', valor: 1200, data: noMes(3, 5), categoriaId: categoriaAluguel?.id, formaPagamento: 'boleto' },
      { tipo: 'despesa', descricao: 'Campanha de divulgação local', valor: 350, data: noMes(3, 22), categoriaId: categoriaMarketing?.id, formaPagamento: 'cartao_credito' },

      { tipo: 'receita', descricao: 'Kit Produtos — Carla Mendes', valor: 1200, data: noMes(2, 10), categoriaId: categoriaVendas?.id, clienteId: idCarla, produtoId: idKit, formaPagamento: 'transferencia' },
      { tipo: 'receita', descricao: 'Kit Produtos — Fernanda Rocha', valor: 120, data: noMes(2, 16), categoriaId: categoriaVendas?.id, clienteId: idFernanda, produtoId: idKit, formaPagamento: 'pix' },
      { tipo: 'receita', descricao: 'Plano Mensal — Maria Silva', valor: 350, data: noMes(2, 20), categoriaId: categoriaServicos?.id, clienteId: idMaria, produtoId: idPlanoMensal, formaPagamento: 'pix' },
      { tipo: 'despesa', descricao: 'Aluguel do mês', valor: 1200, data: noMes(2, 5), categoriaId: categoriaAluguel?.id, formaPagamento: 'boleto' },
      { tipo: 'despesa', descricao: 'Combustível e deslocamentos', valor: 220, data: noMes(2, 13), categoriaId: categoriaTransporte?.id, formaPagamento: 'dinheiro' },

      { tipo: 'receita', descricao: 'Consultoria Avulsa — Loja Estrela', valor: 450, data: noMes(1, 7), categoriaId: categoriaServicos?.id, clienteId: idLoja, produtoId: idConsultoria, formaPagamento: 'transferencia' },
      { tipo: 'receita', descricao: 'Instalação Padrão — Ana Beatriz', valor: 280, data: noMes(1, 11), categoriaId: categoriaServicos?.id, clienteId: idAna, produtoId: idInstalacao, formaPagamento: 'pix' },
      { tipo: 'receita', descricao: 'Kit Produtos — Loja Estrela', valor: 1440, data: noMes(1, 18), categoriaId: categoriaVendas?.id, clienteId: idLoja, produtoId: idKit, formaPagamento: 'boleto' },
      { tipo: 'receita', descricao: 'Plano Mensal — Maria Silva', valor: 350, data: noMes(1, 20), categoriaId: categoriaServicos?.id, clienteId: idMaria, produtoId: idPlanoMensal, formaPagamento: 'pix' },
      { tipo: 'despesa', descricao: 'Aluguel do mês', valor: 1200, data: noMes(1, 5), categoriaId: categoriaAluguel?.id, formaPagamento: 'boleto' },
      { tipo: 'despesa', descricao: 'Compra de material com fornecedor', valor: 610, data: noMes(1, 16), categoriaId: categoriaFornecedores?.id, formaPagamento: 'cartao_credito' },

      // Mês atual — parcial, mês ainda não fechou
      { tipo: 'receita', descricao: 'Plano Mensal — Maria Silva', valor: 350, data: noMes(0, 3), categoriaId: categoriaServicos?.id, clienteId: idMaria, produtoId: idPlanoMensal, formaPagamento: 'pix' },
      { tipo: 'receita', descricao: 'Kit Produtos — Carla Mendes', valor: 1200, data: noMes(0, 8), categoriaId: categoriaVendas?.id, clienteId: idCarla, produtoId: idKit, formaPagamento: 'transferencia' },
      { tipo: 'receita', descricao: 'Peça de Reposição — Loja Estrela', valor: 190, data: noMes(0, 10), categoriaId: categoriaVendas?.id, clienteId: idLoja, produtoId: idPeca, formaPagamento: 'boleto' },
    ];

    await prisma.lancamento.createMany({
      data: historico.map((h) => ({
        usuarioId,
        tipo: h.tipo,
        descricao: h.descricao,
        valor: h.valor,
        data: h.data,
        categoriaId: h.categoriaId,
        clienteId: h.clienteId,
        produtoId: h.produtoId,
        formaPagamento: h.formaPagamento,
        status: 'pago',
        dataPagamento: h.data,
      })),
    });

    // Pendentes a vencer nos próximos dias (KPI "Contas a Vencer") e vencidos
    // (pra alimentar inadimplência / score de saúde em risco).
    await prisma.lancamento.createMany({
      data: [
        {
          usuarioId,
          tipo: 'despesa',
          categoriaId: categoriaAluguel?.id,
          descricao: 'Aluguel do mês',
          valor: 1200,
          status: 'pendente',
          dataVencimento: diasAPartirDeHoje(5),
          formaPagamento: 'boleto',
        },
        {
          usuarioId,
          tipo: 'despesa',
          categoriaId: categoriaFornecedores?.id,
          descricao: 'Fornecedor — reposição de estoque',
          valor: 640,
          status: 'pendente',
          dataVencimento: diasAPartirDeHoje(3),
          formaPagamento: 'boleto',
        },
        {
          usuarioId,
          tipo: 'receita',
          categoriaId: categoriaServicos?.id,
          clienteId: idPedro,
          descricao: 'Consultoria Avulsa — Pedro Oliveira',
          valor: 450,
          status: 'pendente',
          dataVencimento: diasAPartirDeHoje(-12),
          formaPagamento: 'boleto',
        },
        {
          usuarioId,
          tipo: 'receita',
          categoriaId: categoriaVendas?.id,
          clienteId: idFernanda,
          descricao: 'Kit Produtos — Fernanda Rocha',
          valor: 120,
          status: 'pendente',
          dataVencimento: diasAPartirDeHoje(-30),
          formaPagamento: 'boleto',
        },
        {
          usuarioId,
          tipo: 'receita',
          categoriaId: categoriaServicos?.id,
          clienteId: idJoao,
          descricao: 'Orçamento aguardando aprovação — João Santos',
          valor: 350,
          status: 'pendente',
          dataVencimento: diasAPartirDeHoje(10),
          formaPagamento: 'pix',
        },
      ],
    });

    // Lançamento-modelo recorrente (receita), alimenta a previsão de faturamento.
    await prisma.lancamento.create({
      data: {
        usuarioId,
        tipo: 'receita',
        categoriaId: categoriaServicos?.id,
        clienteId: idMaria,
        descricao: 'Plano Mensal — Maria Silva',
        valor: 350,
        status: 'pendente',
        recorrente: true,
        formaPagamento: 'pix',
      },
    });

    console.log(`✅ ${historico.length + 6} lançamentos de exemplo criados (histórico, pendentes/vencidos e recorrente).`);
  } else {
    console.log(`✅ Usuário já possui ${totalLancamentos} lançamento(s) — seed de lançamentos ignorado.`);
  }

  // ─── Oportunidades (pipeline) ─────────────────────────────
  const totalOportunidades = await prisma.oportunidade.count({ where: { usuarioId } });
  if (totalOportunidades === 0 && clientes.size > 0) {
    const idJoao = clientes.get('João Santos');
    const idRoberto = clientes.get('Roberto Almeida');
    const idPedro = clientes.get('Pedro Oliveira');
    const idAna = clientes.get('Ana Beatriz Costa');
    const idLoja = clientes.get('Loja Estrela Ltda');
    const idCarla = clientes.get('Carla Mendes');
    const idMaria = clientes.get('Maria Silva');
    const idFernanda = clientes.get('Fernanda Rocha');

    const oportunidadesSeed = [
      { clienteId: idJoao, titulo: 'Plano mensal — João Santos', valorEstimado: 350, etapa: 'contato', posicao: 0 },
      { clienteId: idRoberto, titulo: 'Primeira compra — Roberto Almeida', valorEstimado: 500, etapa: 'contato', posicao: 1 },
      { clienteId: idFernanda, titulo: 'Novo pedido — Fernanda Rocha', valorEstimado: 300, etapa: 'contato', posicao: 2 },

      { clienteId: idPedro, titulo: 'Renovação de contrato — Pedro Oliveira', valorEstimado: 900, etapa: 'negociacao', posicao: 0 },
      { clienteId: idAna, titulo: 'Pacote anual — Ana Beatriz Costa', valorEstimado: 3200, etapa: 'negociacao', posicao: 1 },

      { clienteId: idLoja, titulo: 'Contrato de fornecimento — Loja Estrela', valorEstimado: 5400, etapa: 'proposta', posicao: 0 },
      { clienteId: idCarla, titulo: 'Ampliação de pedido — Carla Mendes', valorEstimado: 1800, etapa: 'proposta', posicao: 1 },

      {
        clienteId: idMaria,
        titulo: 'Upgrade de plano — Maria Silva',
        valorEstimado: 700,
        etapa: 'fechado_ganho',
        posicao: 0,
        dataFechamento: diasAPartirDeHoje(-6),
      },
      {
        clienteId: idLoja,
        titulo: 'Pedido inicial — Loja Estrela',
        valorEstimado: 1440,
        etapa: 'fechado_ganho',
        posicao: 1,
        dataFechamento: diasAPartirDeHoje(-40),
      },
      {
        clienteId: idRoberto,
        titulo: 'Proposta recusada — Roberto Almeida',
        valorEstimado: 600,
        etapa: 'fechado_perdido',
        posicao: 0,
        dataFechamento: diasAPartirDeHoje(-20),
        motivoPerda: 'Optou por concorrente com preço menor.',
      },
    ];

    for (const op of oportunidadesSeed) {
      if (!op.clienteId) continue;
      await prisma.oportunidade.create({ data: { ...op, usuarioId } });
    }

    console.log(`✅ ${oportunidadesSeed.length} oportunidades de exemplo criadas no pipeline.`);
  } else if (totalOportunidades > 0) {
    console.log(`✅ Usuário já possui ${totalOportunidades} oportunidade(s) — seed de oportunidades ignorado.`);
  }

  // ─── Meta do mês ───────────────────────────────────────────
  const hoje = new Date();
  const mesAtual = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  const metaExistente = await prisma.meta.findFirst({ where: { usuarioId, mes: mesAtual } });
  if (!metaExistente) {
    await prisma.meta.create({ data: { usuarioId, mes: mesAtual, valorMeta: 4000 } });
    console.log('✅ Meta do mês atual criada.');
  } else {
    console.log('✅ Meta do mês atual já existe — seed de meta ignorado.');
  }

  // ─── Log de auditoria ──────────────────────────────────────
  const totalLogs = await prisma.logAuditoria.count({ where: { usuarioId } });
  if (totalLogs === 0) {
    await prisma.logAuditoria.createMany({
      data: [
        { usuarioId, acao: 'criar', entidade: 'cliente', descricao: 'Cliente cadastrado: Loja Estrela Ltda', createdAt: diasAPartirDeHoje(-40) },
        { usuarioId, acao: 'criar', entidade: 'lancamento', descricao: 'Lançamento criado: Kit Produtos — Loja Estrela — R$ 1.440,00', createdAt: diasAPartirDeHoje(-18) },
        { usuarioId, acao: 'status', entidade: 'lancamento', descricao: 'Lançamento Plano Mensal — Maria Silva marcado como pago', createdAt: diasAPartirDeHoje(-3) },
        { usuarioId, acao: 'mover', entidade: 'oportunidade', descricao: 'Oportunidade Upgrade de plano — Maria Silva movida para fechado_ganho', createdAt: diasAPartirDeHoje(-6) },
        { usuarioId, acao: 'criar', entidade: 'cliente', descricao: 'Cliente cadastrado: Roberto Almeida', createdAt: diasAPartirDeHoje(-1) },
        { usuarioId, acao: 'atualizar', entidade: 'meta', descricao: 'Meta do mês definida: R$ 4.000,00', createdAt: diasAPartirDeHoje(-2) },
        { usuarioId, acao: 'status', entidade: 'cliente', descricao: 'Cliente Marcos Vieira marcado como inativo', createdAt: diasAPartirDeHoje(-15) },
      ],
    });
    console.log('✅ Log de auditoria de exemplo criado.');
  } else {
    console.log(`✅ Usuário já possui ${totalLogs} registro(s) de auditoria — seed de auditoria ignorado.`);
  }
}

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

  await seedDemoData(usuario.id);
}

if (require.main === module) {
  main()
    .catch((error) => {
      console.error(error);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}
