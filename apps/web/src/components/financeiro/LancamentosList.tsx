import { useState } from 'react';
import { Search, Plus, Wallet, Check, Repeat, Receipt } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  useLancamentos,
  useCategorias,
  useAtualizarStatusLancamento,
  type LancamentosFiltros,
} from '../../hooks/useApi';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { api } from '../../services/api';
import { TableSkeleton } from '../ui/Skeleton';
import { EmptyState } from '../ui/EmptyState';
import { Pagination } from '../ui/Pagination';
import { StatusBadge } from '../ui/StatusBadge';
import { Button } from '../ui/Button';
import { formatCurrency } from '../../utils/formatters';
import { LancamentoFormModal } from './LancamentoFormModal';

const statusOptions = [
  { value: '', label: 'Todos os status' },
  { value: 'pendente', label: 'Pendente' },
  { value: 'pago', label: 'Pago' },
  { value: 'vencido', label: 'Vencido' },
  { value: 'cancelado', label: 'Cancelado' },
];

interface LancamentosListProps {
  tipoFixo?: 'receita' | 'despesa';
  titulo: string;
}

export function LancamentosList({ tipoFixo, titulo }: LancamentosListProps) {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);

  const debouncedSearch = useDebouncedValue(search, 300);
  const { data: categorias } = useCategorias(tipoFixo);
  const atualizarStatus = useAtualizarStatusLancamento();

  const filtros: LancamentosFiltros = {
    tipo: tipoFixo,
    status: status || undefined,
    categoriaId: categoriaId || undefined,
    dataInicio: dataInicio || undefined,
    dataFim: dataFim || undefined,
  };

  const { data, isLoading, isError } = useLancamentos(page, debouncedSearch, filtros);
  const lancamentos = data?.data ?? [];

  const resetPage = () => setPage(1);

  const handleGerarRecibo = async (id: string) => {
    try {
      const resposta = await api.get(`/lancamentos/${id}/recibo`, { responseType: 'blob' });
      const url = URL.createObjectURL(resposta.data as Blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `recibo-${id.slice(0, 8)}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Erro ao gerar recibo');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h2 className="text-lg font-bold text-gray-900">{titulo}</h2>
        <Button data-tour="novo-lancamento" onClick={() => setModalOpen(true)}>
          <Plus size={16} /> Novo Lançamento
        </Button>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              resetPage();
            }}
            placeholder="Buscar por descrição..."
            className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-cb-primary/30 focus:border-cb-primary"
          />
        </div>

        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            resetPage();
          }}
          className="px-3 py-2 text-sm rounded-xl border border-gray-200 bg-white cursor-pointer"
        >
          {statusOptions.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>

        <select
          value={categoriaId}
          onChange={(e) => {
            setCategoriaId(e.target.value);
            resetPage();
          }}
          className="px-3 py-2 text-sm rounded-xl border border-gray-200 bg-white cursor-pointer"
        >
          <option value="">Todas as categorias</option>
          {categorias?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={dataInicio}
          onChange={(e) => {
            setDataInicio(e.target.value);
            resetPage();
          }}
          className="px-3 py-2 text-sm rounded-xl border border-gray-200 bg-white"
          title="Vencimento a partir de"
        />
        <input
          type="date"
          value={dataFim}
          onChange={(e) => {
            setDataFim(e.target.value);
            resetPage();
          }}
          className="px-3 py-2 text-sm rounded-xl border border-gray-200 bg-white"
          title="Vencimento até"
        />
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs text-gray-400 uppercase tracking-wide">
                <th className="px-4 py-3 font-medium">Descrição</th>
                <th className="px-4 py-3 font-medium">Categoria</th>
                <th className="px-4 py-3 font-medium">Cliente</th>
                <th className="px-4 py-3 font-medium">Vencimento</th>
                <th className="px-4 py-3 font-medium">Valor</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>

            {isLoading ? (
              <TableSkeleton rows={6} cols={7} />
            ) : (
              <tbody>
                {lancamentos.map((lancamento) => (
                  <tr key={lancamento.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      <span className="flex items-center gap-1.5">
                        {(lancamento.recorrente || lancamento.recorrenciaOrigemId) && (
                          <Repeat size={12} className="text-gray-400 flex-shrink-0" />
                        )}
                        {lancamento.descricao}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{lancamento.categoria?.nome ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{lancamento.cliente?.nome ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {lancamento.dataVencimento ? new Date(lancamento.dataVencimento).toLocaleDateString('pt-BR') : '—'}
                    </td>
                    <td className={`px-4 py-3 font-medium ${lancamento.tipo === 'receita' ? 'text-cb-success' : 'text-cb-danger'}`}>
                      {lancamento.tipo === 'receita' ? '+' : '-'} {formatCurrency(lancamento.valor)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={lancamento.status} size="sm" />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {lancamento.clienteId && (
                          <button
                            onClick={() => handleGerarRecibo(lancamento.id)}
                            title="Gerar recibo"
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-gray-500 bg-gray-100 hover:bg-gray-200 transition"
                          >
                            <Receipt size={12} /> Recibo
                          </button>
                        )}
                        {(lancamento.status === 'pendente' || lancamento.status === 'vencido') && (
                          <button
                            onClick={() => atualizarStatus.mutate({ id: lancamento.id, status: 'pago' })}
                            title="Marcar como pago"
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-cb-success bg-emerald-50 hover:bg-emerald-100 transition"
                          >
                            <Check size={12} /> Pago
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            )}
          </table>
        </div>

        {!isLoading && !isError && lancamentos.length === 0 && (
          <EmptyState
            icon={Wallet}
            title="Nenhum lançamento encontrado"
            description="Ajuste os filtros ou registre um novo lançamento."
            action={{ label: 'Novo Lançamento', onClick: () => setModalOpen(true) }}
          />
        )}

        {isError && (
          <div className="px-4 py-8 text-center text-sm text-cb-danger">
            Falha ao carregar a lista. Verifique a conexão e tente novamente.
          </div>
        )}

        {data && (
          <div className="px-4">
            <Pagination
              page={data.pagination.page}
              totalPages={data.pagination.totalPages}
              total={data.pagination.total}
              perPage={data.pagination.perPage}
              onChange={setPage}
            />
          </div>
        )}
      </div>

      <LancamentoFormModal open={modalOpen} onClose={() => setModalOpen(false)} lancamento={null} tipoFixo={tipoFixo} />
    </div>
  );
}
