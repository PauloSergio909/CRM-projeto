import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email é obrigatório' })
    .trim()
    .toLowerCase()
    .email({ message: 'Email inválido' }),

  senha: z
    .string({ required_error: 'Senha é obrigatória' })
    .min(6, { message: 'Senha deve ter pelo menos 6 caracteres' }),
});

export const registerSchema = loginSchema
  .extend({
    nome: z.string().trim().min(3, 'Nome deve ter pelo menos 3 caracteres').max(100),
    confirmarSenha: z.string().min(6, 'Confirmação deve ter pelo menos 6 caracteres'),
  })
  .refine((data) => data.senha === data.confirmarSenha, {
    message: 'Senhas não conferem',
    path: ['confirmarSenha'],
  });

export const refreshSchema = z.object({
  refreshToken: z.string({ required_error: 'refreshToken é obrigatório' }).min(1),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  perPage: z.coerce.number().int().min(1).max(500).default(20),
  search: z.string().optional(),
  orderBy: z.string().optional(),
  order: z.enum(['asc', 'desc']).default('desc'),
});

export const createClienteSchema = z.object({
  nome: z.string().trim().min(3, 'Nome deve ter pelo menos 3 caracteres').max(200),
  telefone: z.string().trim().min(8, 'Telefone inválido').max(20).optional().or(z.literal('')),
  email: z.string().trim().toLowerCase().email('Email inválido').optional().or(z.literal('')),
  cpfCnpj: z.string().trim().max(20).optional().or(z.literal('')),
  endereco: z.string().trim().max(300).optional().or(z.literal('')),
  cidade: z.string().trim().max(100).optional().or(z.literal('')),
  estado: z.string().trim().length(2, 'Use a sigla do estado (2 letras)').optional().or(z.literal('')),
  observacoes: z.string().trim().optional().or(z.literal('')),
});

export const updateClienteSchema = createClienteSchema.partial();

export const updateClienteStatusSchema = z.object({
  status: z.enum(['ativo', 'inativo']),
});

export const clientesQuerySchema = paginationSchema.extend({
  status: z.enum(['ativo', 'inativo']).optional(),
  cidade: z.string().optional(),
});

export const createInteracaoSchema = z.object({
  tipo: z.enum(['whatsapp', 'ligacao', 'email', 'visita', 'venda', 'orcamento', 'outro']),
  descricao: z.string().trim().min(1, 'Descrição é obrigatória').max(1000),
  data: z.string().datetime().optional(),
});

const dateStringSchema = z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida'));

export const createCategoriaSchema = z.object({
  nome: z.string().trim().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100),
  tipo: z.enum(['receita', 'despesa']),
  cor: z
    .string()
    .trim()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Cor inválida')
    .default('#6B7280'),
});

export const updateCategoriaSchema = createCategoriaSchema.partial();

export const updateCategoriaStatusSchema = z.object({
  ativo: z.boolean(),
});

export const createLancamentoSchema = z.object({
  tipo: z.enum(['receita', 'despesa']),
  categoriaId: z.string().uuid('Categoria inválida').optional().or(z.literal('')),
  clienteId: z.string().uuid('Cliente inválido').optional().or(z.literal('')),
  descricao: z.string().trim().min(1, 'Descrição é obrigatória').max(300),
  valor: z.coerce.number().positive('Valor deve ser maior que zero'),
  data: dateStringSchema.optional(),
  dataVencimento: dateStringSchema.optional().or(z.literal('')),
  formaPagamento: z
    .enum(['dinheiro', 'pix', 'cartao_debito', 'cartao_credito', 'boleto', 'transferencia', 'outro'])
    .optional()
    .or(z.literal('')),
  recorrente: z.boolean().optional(),
  observacoes: z.string().trim().optional().or(z.literal('')),
});

export const updateLancamentoSchema = createLancamentoSchema.partial();

export const updateLancamentoStatusSchema = z.object({
  status: z.enum(['pendente', 'pago', 'vencido', 'cancelado']),
});

export const lancamentosQuerySchema = paginationSchema.extend({
  tipo: z.enum(['receita', 'despesa']).optional(),
  status: z.enum(['pendente', 'pago', 'vencido', 'cancelado']).optional(),
  categoriaId: z.string().uuid().optional(),
  dataInicio: dateStringSchema.optional(),
  dataFim: dateStringSchema.optional(),
});

export const createOportunidadeSchema = z.object({
  clienteId: z.string().uuid('Cliente é obrigatório'),
  titulo: z.string().trim().min(3, 'Título deve ter pelo menos 3 caracteres').max(200),
  descricao: z.string().trim().optional().or(z.literal('')),
  valorEstimado: z.coerce.number().min(0, 'Valor não pode ser negativo').default(0),
});

export const updateOportunidadeSchema = createOportunidadeSchema.partial();

export const moverOportunidadeSchema = z.object({
  etapa: z.enum(['contato', 'negociacao', 'proposta', 'fechado_ganho', 'fechado_perdido']),
  posicao: z.coerce.number().int().min(0),
  motivoPerda: z.string().trim().optional().or(z.literal('')),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type RefreshInput = z.infer<typeof refreshSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type CreateClienteInput = z.infer<typeof createClienteSchema>;
export type UpdateClienteInput = z.infer<typeof updateClienteSchema>;
export type UpdateClienteStatusInput = z.infer<typeof updateClienteStatusSchema>;
export type ClientesQueryInput = z.infer<typeof clientesQuerySchema>;
export type CreateInteracaoInput = z.infer<typeof createInteracaoSchema>;
export type CreateCategoriaInput = z.infer<typeof createCategoriaSchema>;
export type UpdateCategoriaInput = z.infer<typeof updateCategoriaSchema>;
export type UpdateCategoriaStatusInput = z.infer<typeof updateCategoriaStatusSchema>;
export type CreateLancamentoInput = z.infer<typeof createLancamentoSchema>;
export type UpdateLancamentoInput = z.infer<typeof updateLancamentoSchema>;
export type UpdateLancamentoStatusInput = z.infer<typeof updateLancamentoStatusSchema>;
export type LancamentosQueryInput = z.infer<typeof lancamentosQuerySchema>;
export type CreateOportunidadeInput = z.infer<typeof createOportunidadeSchema>;
export type UpdateOportunidadeInput = z.infer<typeof updateOportunidadeSchema>;
export type MoverOportunidadeInput = z.infer<typeof moverOportunidadeSchema>;
