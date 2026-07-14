import { MessageSquare, Wallet, UserPlus, Activity } from 'lucide-react';
import type { AtividadeRecente } from '../../hooks/useApi';
import { formatRelativeTime } from '../../utils/formatters';
import { EmptyState } from '../ui/EmptyState';

const iconePorTipo: Record<AtividadeRecente['tipo'], typeof MessageSquare> = {
  interacao: MessageSquare,
  pagamento: Wallet,
  novo_cliente: UserPlus,
};

interface AtividadesFeedProps {
  atividades: AtividadeRecente[];
}

export function AtividadesFeed({ atividades }: AtividadesFeedProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">Últimas Atividades</h3>

      {atividades.length === 0 ? (
        <EmptyState icon={Activity} title="Nenhuma atividade ainda" />
      ) : (
        <ul className="space-y-3.5">
          {atividades.map((atividade, index) => {
            const Icone = iconePorTipo[atividade.tipo];
            return (
              <li key={index} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-cb-primary/10 flex items-center justify-center flex-shrink-0">
                  <Icone size={14} className="text-cb-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-700 truncate">{atividade.descricao}</p>
                  <p className="text-xs text-gray-400">{formatRelativeTime(atividade.data)}</p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
