export interface Usuario {
  id: string;
  nome: string;
  email: string;
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Cliente {
  id: string;
  usuarioId: string;
  nome: string;
  email: string | null;
  telefone: string | null;
  cpfCnpj: string | null;
  cep: string | null;
  endereco: string | null;
  cidade: string | null;
  estado: string | null;
  dataNascimento: string | null;
  status: 'ativo' | 'inativo';
  tags: string[];
  observacoes: string | null;
  saude: 'saudavel' | 'atencao' | 'risco' | null;
  ticketMedio: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface Interacao {
  id: string;
  usuarioId: string;
  clienteId: string;
  tipo: 'whatsapp' | 'ligacao' | 'email' | 'visita' | 'venda' | 'orcamento' | 'outro';
  descricao: string;
  data: string;
  createdAt: string;
}

export interface Oportunidade {
  id: string;
  usuarioId: string;
  clienteId: string;
  titulo: string;
  descricao: string | null;
  valorEstimado: number;
  etapa: 'contato' | 'negociacao' | 'proposta' | 'fechado_ganho' | 'fechado_perdido';
  posicao: number;
  motivoPerda: string | null;
  dataFechamento: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Categoria {
  id: string;
  usuarioId: string;
  nome: string;
  tipo: 'receita' | 'despesa';
  cor: string | null;
  ativo: boolean;
  createdAt: string;
}

export interface Produto {
  id: string;
  usuarioId: string;
  nome: string;
  preco: number;
  categoriaId: string | null;
  descricao: string | null;
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Lancamento {
  id: string;
  usuarioId: string;
  categoriaId: string | null;
  clienteId: string | null;
  produtoId: string | null;
  tipo: 'receita' | 'despesa';
  descricao: string;
  valor: number;
  data: string;
  dataVencimento: string | null;
  dataPagamento: string | null;
  status: 'pendente' | 'pago' | 'vencido' | 'cancelado';
  formaPagamento: 'dinheiro' | 'pix' | 'cartao_debito' | 'cartao_credito' | 'boleto' | 'transferencia' | 'outro' | null;
  recorrente: boolean;
  recorrenciaOrigemId: string | null;
  observacoes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Meta {
  id: string;
  usuarioId: string;
  mes: string;
  valorMeta: number;
  createdAt: string;
  updatedAt: string;
}

export interface LogAuditoria {
  id: string;
  usuarioId: string;
  acao: string;
  entidade: string;
  entidadeId: string | null;
  descricao: string;
  createdAt: string;
}
