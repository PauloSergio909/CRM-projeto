import { TrendingUp } from 'lucide-react';
import { usePrevisaoFaturamento } from '../../hooks/useApi';
import { formatCurrency } from '../../utils/formatters';

export function ForecastCard() {
  const { data: previsao } = usePrevisaoFaturamento(3);

  if (!previsao) return null;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp size={15} className="text-cb-primary" />
        <h3 className="text-sm font-semibold text-gray-700">Previsão de Faturamento</h3>
      </div>

      <p className="text-2xl font-bold text-gray-900">{formatCurrency(previsao.totalPrevisto)}</p>
      <p className="text-xs text-gray-400 mb-2">previsão pros próximos {previsao.meses} meses</p>

      <p className="text-xs text-gray-500">
        {formatCurrency(previsao.receitaRecorrenteMensal * previsao.meses)} de clientes recorrentes +{' '}
        {formatCurrency(previsao.pipelinePonderado)} estimado do pipeline (por probabilidade de fechamento)
      </p>
    </div>
  );
}
