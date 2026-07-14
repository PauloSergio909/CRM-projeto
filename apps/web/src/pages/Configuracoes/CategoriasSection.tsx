import { useState } from 'react';
import { Plus, Tag } from 'lucide-react';
import { useCategorias, useAtualizarStatusCategoria, type Categoria } from '../../hooks/useApi';
import { CategoriaFormModal } from './CategoriaFormModal';

export function CategoriasSection() {
  const { data: categorias, isLoading } = useCategorias();
  const atualizarStatus = useAtualizarStatusCategoria();
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState<Categoria | null>(null);

  const abrirNova = () => {
    setEditando(null);
    setModalOpen(true);
  };

  const abrirEdicao = (categoria: Categoria) => {
    setEditando(categoria);
    setModalOpen(true);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 mt-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Tag size={16} className="text-cb-primary" />
          <h3 className="text-sm font-semibold text-gray-700">Categorias financeiras</h3>
        </div>
        <button
          onClick={abrirNova}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-cb-primary text-white rounded-lg text-xs font-medium hover:opacity-90 transition"
        >
          <Plus size={14} /> Nova categoria
        </button>
      </div>

      {isLoading && <p className="text-sm text-gray-400">Carregando...</p>}

      {categorias && categorias.length === 0 && (
        <p className="text-sm text-gray-400">Nenhuma categoria cadastrada ainda.</p>
      )}

      {categorias && categorias.length > 0 && (
        <ul className="divide-y divide-gray-50">
          {categorias.map((categoria) => (
            <li key={categoria.id} className="flex items-center justify-between py-2.5">
              <button
                onClick={() => abrirEdicao(categoria)}
                className="flex items-center gap-2.5 text-left hover:opacity-70 transition"
              >
                <span
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: categoria.cor ?? '#6B7280' }}
                />
                <span className="text-sm text-gray-800">{categoria.nome}</span>
                <span className="text-xs text-gray-400 capitalize">{categoria.tipo}</span>
              </button>

              <button
                onClick={() => atualizarStatus.mutate({ id: categoria.id, ativo: !categoria.ativo })}
                className={`text-xs font-medium px-2.5 py-1 rounded-full transition ${
                  categoria.ativo ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {categoria.ativo ? 'Ativa' : 'Inativa'}
              </button>
            </li>
          ))}
        </ul>
      )}

      <CategoriaFormModal open={modalOpen} onClose={() => setModalOpen(false)} categoria={editando} />
    </div>
  );
}
