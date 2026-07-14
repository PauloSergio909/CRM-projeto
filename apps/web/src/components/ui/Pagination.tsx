import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  perPage: number;
  onChange: (page: number) => void;
}

export function Pagination({ page, totalPages, total, perPage, onChange }: PaginationProps) {
  if (total === 0) return null;

  const start = (page - 1) * perPage + 1;
  const end = Math.min(page * perPage, total);

  if (totalPages <= 1) {
    return (
      <div className="text-xs text-gray-400 px-1 py-3">
        Exibindo {start}–{end} de {total} registros
      </div>
    );
  }

  const pages: number[] = [];
  for (let p = 1; p <= totalPages; p++) pages.push(p);

  return (
    <div className="flex items-center justify-between px-1 py-3 flex-wrap gap-3">
      <div className="text-xs text-gray-400">
        Exibindo {start}–{end} de {total} registros
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onChange(page - 1)}
          disabled={page <= 1}
          aria-label="Página anterior"
          className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={16} />
        </button>
        {pages.map((p) => (
          <button
            key={p}
            onClick={() => onChange(p)}
            className={`min-w-[32px] h-8 px-2 rounded-lg text-xs font-medium transition ${
              p === page ? 'bg-cb-primary text-white' : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            {p}
          </button>
        ))}
        <button
          onClick={() => onChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Próxima página"
          className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
