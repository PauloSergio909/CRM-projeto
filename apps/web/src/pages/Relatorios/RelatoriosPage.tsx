import { BarChart3 } from 'lucide-react';

export function RelatoriosPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center gap-3 py-24">
      <div className="w-14 h-14 bg-cb-primary/10 rounded-2xl flex items-center justify-center">
        <BarChart3 size={26} className="text-cb-primary" />
      </div>
      <h2 className="text-lg font-bold text-gray-900">Relatórios</h2>
      <p className="text-sm text-gray-500 max-w-sm">
        Faturamento mensal, ranking de clientes e fluxo de caixa chegam numa próxima etapa.
      </p>
    </div>
  );
}
