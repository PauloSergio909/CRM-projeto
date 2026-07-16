import { useState } from 'react';
import { Plus, Package } from 'lucide-react';
import { useProdutos, useAtualizarStatusProduto, type Produto } from '../../hooks/useApi';
import { Button } from '../../components/ui/Button';
import { formatCurrency } from '../../utils/formatters';
import { ProdutoFormModal } from './ProdutoFormModal';

export function ProdutosSection() {
  const { data: produtos, isLoading } = useProdutos();
  const atualizarStatus = useAtualizarStatusProduto();
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState<Produto | null>(null);

  const abrirNovo = () => {
    setEditando(null);
    setModalOpen(true);
  };

  const abrirEdicao = (produto: Produto) => {
    setEditando(produto);
    setModalOpen(true);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 mt-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Package size={16} className="text-cb-primary" />
          <h3 className="text-sm font-semibold text-gray-700">Produtos e serviços</h3>
        </div>
        <Button size="sm" onClick={abrirNovo}>
          <Plus size={14} /> Novo produto
        </Button>
      </div>

      {isLoading && <p className="text-sm text-gray-400">Carregando...</p>}

      {produtos && produtos.length === 0 && (
        <p className="text-sm text-gray-400">Nenhum produto cadastrado ainda.</p>
      )}

      {produtos && produtos.length > 0 && (
        <ul className="divide-y divide-gray-50">
          {produtos.map((produto) => (
            <li key={produto.id} className="flex items-center justify-between py-2.5">
              <button
                onClick={() => abrirEdicao(produto)}
                className="flex items-center gap-2.5 text-left hover:opacity-70 transition"
              >
                <span className="text-sm text-gray-800">{produto.nome}</span>
                <span className="text-xs text-gray-400">{formatCurrency(produto.preco)}</span>
                {produto.categoria && <span className="text-xs text-gray-400">· {produto.categoria.nome}</span>}
              </button>

              <button
                onClick={() => atualizarStatus.mutate({ id: produto.id, ativo: !produto.ativo })}
                className={`text-xs font-medium px-2.5 py-1 rounded-full transition ${
                  produto.ativo ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {produto.ativo ? 'Ativo' : 'Inativo'}
              </button>
            </li>
          ))}
        </ul>
      )}

      <ProdutoFormModal open={modalOpen} onClose={() => setModalOpen(false)} produto={editando} />
    </div>
  );
}
