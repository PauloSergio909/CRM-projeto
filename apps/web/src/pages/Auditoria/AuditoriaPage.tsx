import { useState } from 'react';
import { History } from 'lucide-react';
import { useAuditoria } from '../../hooks/useApi';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { Pagination } from '../../components/ui/Pagination';
import { formatRelativeTime } from '../../utils/formatters';

const entidades = [
  { value: '', label: 'Todas as entidades' },
  { value: 'cliente', label: 'Cliente' },
  { value: 'lancamento', label: 'Lançamento' },
  { value: 'oportunidade', label: 'Oportunidade' },
  { value: 'categoria', label: 'Categoria' },
  { value: 'produto', label: 'Produto' },
  { value: 'meta', label: 'Meta' },
];

export function AuditoriaPage() {
  const [page, setPage] = useState(1);
  const [entidade, setEntidade] = useState('');

  const { data, isLoading } = useAuditoria(page, entidade || undefined);
  const logs = data?.data ?? [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h2 className="text-[clamp(1.05rem,2.5vw,1.25rem)] font-bold text-gray-900">Log de Auditoria</h2>
        <select
          value={entidade}
          onChange={(e) => {
            setEntidade(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 text-sm rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-cb-primary/30 cursor-pointer"
        >
          {entidades.map((e) => (
            <option key={e.value} value={e.value}>
              {e.label}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs text-gray-400 uppercase tracking-wide">
                <th className="px-4 py-3 font-medium">Quando</th>
                <th className="px-4 py-3 font-medium">Ação</th>
                <th className="px-4 py-3 font-medium">Descrição</th>
              </tr>
            </thead>

            {isLoading ? (
              <TableSkeleton rows={6} cols={3} />
            ) : (
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b border-gray-50 last:border-0">
                    <td className="px-4 py-3 text-gray-400 whitespace-nowrap">{formatRelativeTime(log.createdAt)}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-cb-primary capitalize">
                        {log.acao}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{log.descricao}</td>
                  </tr>
                ))}
              </tbody>
            )}
          </table>
        </div>

        {!isLoading && logs.length === 0 && (
          <EmptyState
            icon={History}
            title="Nenhum registro de auditoria ainda"
            description="Ações como cadastro de clientes e lançamentos aparecem aqui."
          />
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
    </div>
  );
}
