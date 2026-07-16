interface StatusConfig {
  bg: string;
  text: string;
  dot: string;
  label: string;
}

const statusConfig: Record<string, StatusConfig> = {
  ativo: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500', label: 'Ativo' },
  inativo: { bg: 'bg-red-50', text: 'text-red-600', dot: 'bg-red-400', label: 'Inativo' },
  pendente: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500', label: 'Pendente' },
  pago: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500', label: 'Pago' },
  vencido: { bg: 'bg-red-50', text: 'text-red-600', dot: 'bg-red-400', label: 'Vencido' },
  cancelado: { bg: 'bg-gray-100', text: 'text-gray-500', dot: 'bg-gray-400', label: 'Cancelado' },
  whatsapp: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500', label: 'WhatsApp' },
  ligacao: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500', label: 'Ligação' },
  email: { bg: 'bg-purple-50', text: 'text-purple-700', dot: 'bg-purple-500', label: 'Email' },
  visita: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500', label: 'Visita' },
  venda: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500', label: 'Venda' },
  orcamento: { bg: 'bg-cyan-50', text: 'text-cyan-700', dot: 'bg-cyan-500', label: 'Orçamento' },
  outro: { bg: 'bg-gray-50', text: 'text-gray-600', dot: 'bg-gray-400', label: 'Outro' },
  saudavel: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500', label: 'Saudável' },
  atencao: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500', label: 'Atenção' },
  risco: { bg: 'bg-red-50', text: 'text-red-600', dot: 'bg-red-400', label: 'Em risco' },
};

const defaultConfig: StatusConfig = { bg: 'bg-gray-50', text: 'text-gray-600', dot: 'bg-gray-400', label: '—' };

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = statusConfig[status] || defaultConfig;
  const padding = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-medium ${config.bg} ${config.text} ${padding}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}
