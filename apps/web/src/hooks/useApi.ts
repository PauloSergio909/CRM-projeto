import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { api } from '../services/api';

// Hooks de domínio (clientes, lançamentos, oportunidades...) entram aqui
// conforme cada módulo for implementado.

export function apiError(error: unknown, fallback: string): string {
  const err = error as { response?: { data?: { error?: string } } };
  return err?.response?.data?.error ?? fallback;
}

export interface PaginatedResponse<T> {
  data: T[];
  message: string;
  pagination: { page: number; perPage: number; total: number; totalPages: number };
}

export function useMe() {
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const { data } = await api.get('/auth/me');
      return data.data as { id: string; nome: string; email: string; ativo: boolean; createdAt: string };
    },
  });
}

// ─── Clientes ───────────────────────────────────────────────

export interface Cliente {
  id: string;
  nome: string;
  email: string | null;
  telefone: string | null;
  cpfCnpj: string | null;
  endereco: string | null;
  cidade: string | null;
  estado: string | null;
  status: 'ativo' | 'inativo';
  observacoes: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { interacoes: number };
}

export interface Interacao {
  id: string;
  clienteId: string;
  tipo: 'whatsapp' | 'ligacao' | 'email' | 'visita' | 'venda' | 'orcamento' | 'outro';
  descricao: string;
  data: string;
  createdAt: string;
}

export interface ClienteDetalhe extends Cliente {
  interacoes: Interacao[];
}

export function useClientes(page: number, search: string, status?: string) {
  return useQuery({
    queryKey: ['clientes', page, search, status],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), perPage: '20' });
      if (search) params.set('search', search);
      if (status) params.set('status', status);
      const { data } = await api.get(`/clientes?${params.toString()}`);
      return data as PaginatedResponse<Cliente>;
    },
  });
}

export function useCliente(id: string) {
  return useQuery({
    queryKey: ['cliente', id],
    queryFn: async () => {
      const { data } = await api.get(`/clientes/${id}`);
      return data.data as ClienteDetalhe;
    },
    enabled: !!id,
  });
}

export function useCriarCliente() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (dados: Record<string, unknown>) => {
      const { data } = await api.post('/clientes', dados);
      return data.data as Cliente;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      toast.success('Cliente cadastrado!');
    },
    onError: (error) => toast.error(apiError(error, 'Erro ao cadastrar cliente')),
  });
}

export function useAtualizarCliente() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...dados }: { id: string } & Record<string, unknown>) => {
      const { data } = await api.put(`/clientes/${id}`, dados);
      return data.data as Cliente;
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      queryClient.invalidateQueries({ queryKey: ['cliente', vars.id] });
      toast.success('Cliente atualizado!');
    },
    onError: (error) => toast.error(apiError(error, 'Erro ao atualizar cliente')),
  });
}

export function useAtualizarStatusCliente() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'ativo' | 'inativo' }) => {
      const { data } = await api.patch(`/clientes/${id}/status`, { status });
      return data.data as Cliente;
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      queryClient.invalidateQueries({ queryKey: ['cliente', vars.id] });
    },
    onError: (error) => toast.error(apiError(error, 'Erro ao atualizar status')),
  });
}

export function useCriarInteracao() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ clienteId, ...dados }: { clienteId: string; tipo: string; descricao: string }) => {
      const { data } = await api.post(`/clientes/${clienteId}/interacoes`, dados);
      return data.data as Interacao;
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ['cliente', vars.clienteId] });
      toast.success('Interação registrada!');
    },
    onError: (error) => toast.error(apiError(error, 'Erro ao registrar interação')),
  });
}

// ─── Categorias ─────────────────────────────────────────────

export interface Categoria {
  id: string;
  nome: string;
  tipo: 'receita' | 'despesa';
  cor: string | null;
  ativo: boolean;
  createdAt: string;
}

export function useCategorias(tipo?: 'receita' | 'despesa') {
  return useQuery({
    queryKey: ['categorias', tipo],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (tipo) params.set('tipo', tipo);
      const { data } = await api.get(`/categorias?${params.toString()}`);
      return data.data as Categoria[];
    },
  });
}

export function useCriarCategoria() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (dados: { nome: string; tipo: 'receita' | 'despesa'; cor?: string }) => {
      const { data } = await api.post('/categorias', dados);
      return data.data as Categoria;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] });
      toast.success('Categoria criada!');
    },
    onError: (error) => toast.error(apiError(error, 'Erro ao criar categoria')),
  });
}

export function useAtualizarCategoria() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...dados }: { id: string } & Record<string, unknown>) => {
      const { data } = await api.put(`/categorias/${id}`, dados);
      return data.data as Categoria;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] });
      toast.success('Categoria atualizada!');
    },
    onError: (error) => toast.error(apiError(error, 'Erro ao atualizar categoria')),
  });
}

export function useAtualizarStatusCategoria() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ativo }: { id: string; ativo: boolean }) => {
      const { data } = await api.patch(`/categorias/${id}/status`, { ativo });
      return data.data as Categoria;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categorias'] }),
    onError: (error) => toast.error(apiError(error, 'Erro ao atualizar status')),
  });
}

// ─── Lançamentos ────────────────────────────────────────────

export type FormaPagamento =
  | 'dinheiro'
  | 'pix'
  | 'cartao_debito'
  | 'cartao_credito'
  | 'boleto'
  | 'transferencia'
  | 'outro';

export interface Lancamento {
  id: string;
  tipo: 'receita' | 'despesa';
  categoriaId: string | null;
  clienteId: string | null;
  descricao: string;
  valor: number;
  data: string;
  dataVencimento: string | null;
  dataPagamento: string | null;
  status: 'pendente' | 'pago' | 'vencido' | 'cancelado';
  formaPagamento: FormaPagamento | null;
  recorrente: boolean;
  observacoes: string | null;
  createdAt: string;
  updatedAt: string;
  categoria?: Categoria | null;
  cliente?: { id: string; nome: string } | null;
}

export interface LancamentosFiltros {
  tipo?: 'receita' | 'despesa';
  status?: string;
  categoriaId?: string;
  dataInicio?: string;
  dataFim?: string;
}

export function useLancamentos(page: number, search: string, filtros: LancamentosFiltros) {
  return useQuery({
    queryKey: ['lancamentos', page, search, filtros],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), perPage: '20' });
      if (search) params.set('search', search);
      if (filtros.tipo) params.set('tipo', filtros.tipo);
      if (filtros.status) params.set('status', filtros.status);
      if (filtros.categoriaId) params.set('categoriaId', filtros.categoriaId);
      if (filtros.dataInicio) params.set('dataInicio', filtros.dataInicio);
      if (filtros.dataFim) params.set('dataFim', filtros.dataFim);
      const { data } = await api.get(`/lancamentos?${params.toString()}`);
      return data as PaginatedResponse<Lancamento>;
    },
  });
}

export function useCriarLancamento() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (dados: Record<string, unknown>) => {
      const { data } = await api.post('/lancamentos', dados);
      return data.data as Lancamento;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lancamentos'] });
      toast.success('Lançamento registrado!');
    },
    onError: (error) => toast.error(apiError(error, 'Erro ao registrar lançamento')),
  });
}

export function useAtualizarLancamento() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...dados }: { id: string } & Record<string, unknown>) => {
      const { data } = await api.put(`/lancamentos/${id}`, dados);
      return data.data as Lancamento;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lancamentos'] });
      toast.success('Lançamento atualizado!');
    },
    onError: (error) => toast.error(apiError(error, 'Erro ao atualizar lançamento')),
  });
}

export function useAtualizarStatusLancamento() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Lancamento['status'] }) => {
      const { data } = await api.patch(`/lancamentos/${id}/status`, { status });
      return data.data as Lancamento;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lancamentos'] });
      toast.success('Status atualizado!');
    },
    onError: (error) => toast.error(apiError(error, 'Erro ao atualizar status')),
  });
}

// ─── Oportunidades (Pipeline) ───────────────────────────────

export interface Oportunidade {
  id: string;
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
  cliente?: { id: string; nome: string };
}

export function useOportunidades() {
  return useQuery({
    queryKey: ['oportunidades'],
    queryFn: async () => {
      const { data } = await api.get('/oportunidades');
      return data.data as Oportunidade[];
    },
  });
}

export function useCriarOportunidade() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (dados: Record<string, unknown>) => {
      const { data } = await api.post('/oportunidades', dados);
      return data.data as Oportunidade;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['oportunidades'] });
      toast.success('Oportunidade criada!');
    },
    onError: (error) => toast.error(apiError(error, 'Erro ao criar oportunidade')),
  });
}

export function useAtualizarOportunidade() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...dados }: { id: string } & Record<string, unknown>) => {
      const { data } = await api.put(`/oportunidades/${id}`, dados);
      return data.data as Oportunidade;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['oportunidades'] });
      toast.success('Oportunidade atualizada!');
    },
    onError: (error) => toast.error(apiError(error, 'Erro ao atualizar oportunidade')),
  });
}

export function useMoverOportunidade() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      etapa,
      posicao,
      motivoPerda,
    }: {
      id: string;
      etapa: Oportunidade['etapa'];
      posicao: number;
      motivoPerda?: string;
    }) => {
      const { data } = await api.patch(`/oportunidades/${id}/mover`, { etapa, posicao, motivoPerda });
      return data.data as Oportunidade;
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['oportunidades'] }),
    onError: (error) => toast.error(apiError(error, 'Erro ao mover oportunidade')),
  });
}

// ─── Dashboard ──────────────────────────────────────────────

export interface DashboardResumo {
  receitas: number;
  despesas: number;
  saldo: number;
  variacaoReceitas: number | null;
  variacaoDespesas: number | null;
  variacaoSaldo: number | null;
  clientesNovos: number;
  contasAVencer: number;
  oportunidadesAbertas: { quantidade: number; valorTotal: number };
}

export interface FaturamentoMensalItem {
  mes: string;
  receitas: number;
  despesas: number;
}

export interface DespesaPorCategoriaItem {
  categoriaId: string | null;
  nome: string;
  cor: string;
  total: number;
}

export interface AtividadeRecente {
  tipo: 'interacao' | 'pagamento' | 'novo_cliente';
  descricao: string;
  data: string;
}

export function useDashboardResumo() {
  return useQuery({
    queryKey: ['dashboard', 'resumo'],
    queryFn: async () => {
      const { data } = await api.get('/dashboard/resumo');
      return data.data as DashboardResumo;
    },
  });
}

export function useFaturamentoMensal(meses = 6) {
  return useQuery({
    queryKey: ['dashboard', 'faturamento-mensal', meses],
    queryFn: async () => {
      const { data } = await api.get(`/dashboard/faturamento-mensal?meses=${meses}`);
      return data.data as FaturamentoMensalItem[];
    },
  });
}

export function useDespesasPorCategoria() {
  return useQuery({
    queryKey: ['dashboard', 'despesas-por-categoria'],
    queryFn: async () => {
      const { data } = await api.get('/dashboard/despesas-por-categoria');
      return data.data as DespesaPorCategoriaItem[];
    },
  });
}

export function useAtividadesRecentes(limite = 10) {
  return useQuery({
    queryKey: ['dashboard', 'atividades', limite],
    queryFn: async () => {
      const { data } = await api.get(`/dashboard/atividades?limite=${limite}`);
      return data.data as AtividadeRecente[];
    },
  });
}
