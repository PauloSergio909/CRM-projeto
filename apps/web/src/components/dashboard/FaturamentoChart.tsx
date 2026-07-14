import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import type { FaturamentoMensalItem } from '../../hooks/useApi';
import { formatCurrency } from '../../utils/formatters';

interface FaturamentoChartProps {
  dados: FaturamentoMensalItem[];
}

export function FaturamentoChart({ dados }: FaturamentoChartProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">Faturamento Mensal</h3>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={dados}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
          <XAxis dataKey="mes" tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} tickLine={false} width={40} />
          <Tooltip formatter={(value: number) => formatCurrency(value)} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="receitas" name="Receitas" fill="#22C55E" radius={[4, 4, 0, 0]} />
          <Bar dataKey="despesas" name="Despesas" fill="#EF4444" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
