import { LucideIcon, ArrowUp, ArrowDown } from 'lucide-react';

interface KPICardProps {
  titulo: string;
  valor: string;
  variacao?: number | null;
  icon?: LucideIcon;
}

export function KPICard({ titulo, valor, variacao, icon: Icon }: KPICardProps) {
  const mostrarVariacao = variacao !== undefined && variacao !== null;
  const positiva = (variacao ?? 0) >= 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-medium text-gray-500">{titulo}</p>
        {Icon && <Icon size={16} className="text-gray-300" />}
      </div>
      <p className="text-xl font-bold text-gray-900">{valor}</p>
      {mostrarVariacao && (
        <p className={`text-xs font-medium mt-1 flex items-center gap-1 ${positiva ? 'text-cb-success' : 'text-cb-danger'}`}>
          {positiva ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
          {Math.abs(variacao!).toFixed(1)}% vs mês anterior
        </p>
      )}
    </div>
  );
}
