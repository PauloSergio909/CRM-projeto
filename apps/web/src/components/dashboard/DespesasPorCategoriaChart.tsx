import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { PieChart as PieChartIcon } from 'lucide-react';
import type { DespesaPorCategoriaItem } from '../../hooks/useApi';
import { formatCurrency } from '../../utils/formatters';
import { EmptyState } from '../ui/EmptyState';

interface DespesasPorCategoriaChartProps {
  dados: DespesaPorCategoriaItem[];
}

export function DespesasPorCategoriaChart({ dados }: DespesasPorCategoriaChartProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">Despesas por Categoria</h3>
      {dados.length === 0 ? (
        <EmptyState icon={PieChartIcon} title="Sem despesas pagas neste mês" />
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie data={dados} dataKey="total" nameKey="nome" innerRadius={55} outerRadius={90} paddingAngle={2}>
              {dados.map((item) => (
                <Cell key={item.categoriaId ?? 'sem-categoria'} fill={item.cor} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => formatCurrency(value)} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
