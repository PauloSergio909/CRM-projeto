import { Trophy, UserX, MessageCircle, Package, Download } from 'lucide-react';
import { useRankingClientes, useClientesInativos, useFaturamentoMensal, useRankingProdutos } from '../../hooks/useApi';
import { FaturamentoChart } from '../../components/dashboard/FaturamentoChart';
import { EmptyState } from '../../components/ui/EmptyState';
import { Button } from '../../components/ui/Button';
import { formatCurrency, formatRelativeTime } from '../../utils/formatters';
import { whatsappLink } from '@clientebox/shared';
import { api } from '../../services/api';

export function RelatoriosPage() {
  const { data: faturamento } = useFaturamentoMensal(12);
  const { data: ranking, isLoading: rankingCarregando } = useRankingClientes(10);
  const { data: rankingProdutos, isLoading: rankingProdutosCarregando } = useRankingProdutos(10);
  const { data: inativos, isLoading: inativosCarregando } = useClientesInativos(30);

  const handleBaixarPdf = async () => {
    const resposta = await api.get('/relatorios/pdf', { responseType: 'blob' });
    const url = URL.createObjectURL(resposta.data as Blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'relatorio-gerencial.pdf';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-[clamp(1.05rem,2.5vw,1.25rem)] font-bold text-gray-900">Relatórios</h2>
        <Button variant="secondary" onClick={handleBaixarPdf}>
          <Download size={16} /> Baixar PDF
        </Button>
      </div>

      <FaturamentoChart dados={faturamento ?? []} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <Trophy size={15} className="text-cb-warning" />
            <h3 className="text-sm font-semibold text-gray-700">Ranking de Clientes</h3>
          </div>

          {!rankingCarregando && (!ranking || ranking.length === 0) ? (
            <EmptyState icon={Trophy} title="Nenhuma venda registrada ainda" />
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100">
                  <th className="px-5 py-2.5 font-medium">Cliente</th>
                  <th className="px-5 py-2.5 font-medium">Compras</th>
                  <th className="px-5 py-2.5 font-medium">Total gasto</th>
                </tr>
              </thead>
              <tbody>
                {ranking?.map((item, index) => (
                  <tr key={item.clienteId ?? index} className="border-b border-gray-50 last:border-0">
                    <td className="px-5 py-3">
                      <p className="font-medium text-gray-900">{item.nome}</p>
                      {item.ultimaCompra && (
                        <p className="text-xs text-gray-400">
                          última compra {formatRelativeTime(item.ultimaCompra)}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-3 text-gray-600">{item.totalCompras}</td>
                    <td className="px-5 py-3 font-semibold text-cb-success">{formatCurrency(item.totalGasto)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <UserX size={15} className="text-cb-danger" />
            <h3 className="text-sm font-semibold text-gray-700">Clientes Inativos</h3>
            <span className="text-xs text-gray-400">sem contato há 30+ dias</span>
          </div>

          {!inativosCarregando && (!inativos || inativos.length === 0) ? (
            <EmptyState icon={UserX} title="Nenhum cliente inativo" description="Todos os clientes ativos tiveram contato recente." />
          ) : (
            <ul className="divide-y divide-gray-50">
              {inativos?.map((cliente) => (
                <li key={cliente.id} className="px-5 py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 truncate">{cliente.nome}</p>
                    <p className="text-xs text-gray-400">
                      última atividade {formatRelativeTime(cliente.ultimaAtividade)}
                    </p>
                  </div>
                  {cliente.telefone && (
                    <a
                      href={whatsappLink(cliente.telefone)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-cb-success bg-emerald-50 hover:bg-emerald-100 transition-colors duration-150 flex-shrink-0"
                    >
                      <MessageCircle size={13} /> WhatsApp
                    </a>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          <Package size={15} className="text-cb-primary" />
          <h3 className="text-sm font-semibold text-gray-700">Produtos Mais Vendidos</h3>
        </div>

        {!rankingProdutosCarregando && (!rankingProdutos || rankingProdutos.length === 0) ? (
          <EmptyState icon={Package} title="Nenhuma venda com produto vinculado ainda" />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100">
                <th className="px-5 py-2.5 font-medium">Produto</th>
                <th className="px-5 py-2.5 font-medium">Vendas</th>
                <th className="px-5 py-2.5 font-medium">Faturado</th>
              </tr>
            </thead>
            <tbody>
              {rankingProdutos?.map((item, index) => (
                <tr key={item.produtoId ?? index} className="border-b border-gray-50 last:border-0">
                  <td className="px-5 py-3 font-medium text-gray-900">{item.nome}</td>
                  <td className="px-5 py-3 text-gray-600">{item.totalVendido}</td>
                  <td className="px-5 py-3 font-semibold text-cb-success">{formatCurrency(item.totalFaturado)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
