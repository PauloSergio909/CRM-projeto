import { useState } from 'react';
import { Target, Pencil, PartyPopper } from 'lucide-react';
import { useMeta } from '../../hooks/useApi';
import { formatCurrency } from '../../utils/formatters';
import { Button } from '../ui/Button';
import { MetaFormModal } from './MetaFormModal';

interface MetaCardProps {
  mes: string;
  receitas: number;
}

export function MetaCard({ mes, receitas }: MetaCardProps) {
  const { data: meta } = useMeta(mes);
  const [modalOpen, setModalOpen] = useState(false);

  const valorMeta = meta?.valorMeta ?? 0;
  const percentual = valorMeta > 0 ? Math.min(100, (receitas / valorMeta) * 100) : 0;
  const bateu = valorMeta > 0 && receitas >= valorMeta;

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Target size={15} className="text-cb-primary" />
            <h3 className="text-sm font-semibold text-gray-700">Meta de Faturamento</h3>
          </div>

          {meta ? (
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors duration-150"
            >
              <Pencil size={12} /> Editar
            </button>
          ) : null}
        </div>

        {!meta ? (
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-gray-400">Nenhuma meta definida para este mês.</p>
            <Button size="sm" onClick={() => setModalOpen(true)}>
              Definir meta
            </Button>
          </div>
        ) : (
          <div>
            <div className="flex items-end justify-between mb-2">
              <p className="text-sm text-gray-600">
                <span className="font-bold text-gray-900">{formatCurrency(receitas)}</span> de{' '}
                {formatCurrency(valorMeta)}
              </p>
              {bateu ? (
                <span className="flex items-center gap-1 text-xs font-semibold text-cb-success bg-emerald-50 px-2.5 py-1 rounded-full animate-scaleIn">
                  <PartyPopper size={13} /> Meta batida!
                </span>
              ) : (
                <span className="text-xs font-medium text-gray-500">{percentual.toFixed(0)}%</span>
              )}
            </div>

            <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${bateu ? 'bg-cb-success' : 'bg-cb-primary'}`}
                style={{ width: `${percentual}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <MetaFormModal open={modalOpen} onClose={() => setModalOpen(false)} mes={mes} meta={meta ?? null} />
    </>
  );
}
