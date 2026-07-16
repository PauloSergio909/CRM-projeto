import { useRef, useState, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import Papa from 'papaparse';
import { Search, Plus, Users, Download, Upload } from 'lucide-react';
import { useClientes, useImportarClientes, useClienteTags } from '../../hooks/useApi';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { api } from '../../services/api';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { Pagination } from '../../components/ui/Pagination';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { TagChip } from '../../components/ui/TagChip';
import { Button } from '../../components/ui/Button';
import { ClienteFormModal } from './ClienteFormModal';

export function ClientesPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [tag, setTag] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const debouncedSearch = useDebouncedValue(search, 300);
  const { data, isLoading, isError } = useClientes(page, debouncedSearch, status || undefined, tag || undefined);
  const { data: tagsDisponiveis } = useClienteTags();
  const importarClientes = useImportarClientes();

  const clientes = data?.data ?? [];

  const handleExportar = async () => {
    const resposta = await api.get('/clientes/export', { responseType: 'blob' });
    const url = URL.createObjectURL(resposta.data as Blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'clientes.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleArquivoSelecionado = (e: ChangeEvent<HTMLInputElement>) => {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;

    Papa.parse<Record<string, string>>(arquivo, {
      header: true,
      skipEmptyLines: true,
      complete: (resultado) => importarClientes.mutate(resultado.data),
    });

    e.target.value = '';
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-[240px]">
          <div className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Buscar por nome, telefone ou email..."
              className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-cb-primary/30 focus:border-cb-primary"
            />
          </div>

          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-sm rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-cb-primary/30 cursor-pointer"
          >
            <option value="">Todos os status</option>
            <option value="ativo">Ativos</option>
            <option value="inativo">Inativos</option>
          </select>

          {tagsDisponiveis && tagsDisponiveis.length > 0 && (
            <select
              value={tag}
              onChange={(e) => {
                setTag(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 text-sm rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-cb-primary/30 cursor-pointer"
            >
              <option value="">Todas as tags</option>
              {tagsDisponiveis.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={handleExportar}>
            <Download size={16} /> Exportar CSV
          </Button>
          <Button variant="secondary" onClick={() => fileInputRef.current?.click()} disabled={importarClientes.isPending}>
            <Upload size={16} /> Importar CSV
          </Button>
          <input ref={fileInputRef} type="file" accept=".csv" onChange={handleArquivoSelecionado} className="hidden" />
          <Button data-tour="novo-cliente" onClick={() => setModalOpen(true)}>
            <Plus size={16} /> Novo Cliente
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs text-gray-400 uppercase tracking-wide">
                <th className="px-4 py-3 font-medium">Nome</th>
                <th className="px-4 py-3 font-medium">Telefone</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Cidade</th>
                <th className="px-4 py-3 font-medium">Tags</th>
                <th className="px-4 py-3 font-medium">Interações</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Saúde</th>
              </tr>
            </thead>

            {isLoading ? (
              <TableSkeleton rows={6} cols={8} />
            ) : (
              <tbody>
                {clientes.map((cliente) => (
                  <tr
                    key={cliente.id}
                    onClick={() => navigate(`/clientes/${cliente.id}`)}
                    className="border-b border-gray-50 last:border-0 hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                  >
                    <td className="px-4 py-3 font-medium text-gray-900">{cliente.nome}</td>
                    <td className="px-4 py-3 text-gray-600">{cliente.telefone || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{cliente.email || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{cliente.cidade || '—'}</td>
                    <td className="px-4 py-3">
                      {cliente.tags.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {cliente.tags.map((t) => (
                            <TagChip key={t} tag={t} />
                          ))}
                        </div>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{cliente._count?.interacoes ?? 0}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={cliente.status} size="sm" />
                    </td>
                    <td className="px-4 py-3">
                      {cliente.saude ? <StatusBadge status={cliente.saude} size="sm" /> : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            )}
          </table>
        </div>

        {!isLoading && !isError && clientes.length === 0 && (
          <EmptyState
            icon={Users}
            title="Nenhum cliente encontrado"
            description={
              search || status || tag
                ? 'Tente ajustar a busca ou os filtros.'
                : 'Cadastre seu primeiro cliente para começar.'
            }
            action={{ label: 'Novo Cliente', onClick: () => setModalOpen(true) }}
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

      <ClienteFormModal open={modalOpen} onClose={() => setModalOpen(false)} cliente={null} />
    </div>
  );
}
