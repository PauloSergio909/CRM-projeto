import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { formatCurrency } from '../../utils/formatters';
import type { Oportunidade } from '../../hooks/useApi';

interface OportunidadeCardProps {
  oportunidade: Oportunidade;
  onClick: () => void;
}

export function OportunidadeCard({ oportunidade, onClick }: OportunidadeCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: oportunidade.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className="bg-white rounded-xl border border-gray-200 p-3.5 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow duration-200 select-none"
    >
      <p className="text-sm font-medium text-gray-900 mb-1">{oportunidade.titulo}</p>
      <p className="text-xs text-gray-500 mb-2">{oportunidade.cliente?.nome}</p>
      <p className="text-sm font-semibold text-cb-primary">{formatCurrency(oportunidade.valorEstimado)}</p>
    </div>
  );
}
