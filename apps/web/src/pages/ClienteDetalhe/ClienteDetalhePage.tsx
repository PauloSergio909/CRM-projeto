import { useState, type FormEvent } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Pencil, MessageCircle, Clock, AlertTriangle } from 'lucide-react';
import { useCliente, useCriarInteracao } from '../../hooks/useApi';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { inputCls, selectCls } from '../../components/ui/Modal';
import { whatsappLink } from '../../utils/whatsapp';
import { ClienteFormModal } from '../Clientes/ClienteFormModal';

const tiposInteracao = [
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'ligacao', label: 'Ligação' },
  { value: 'email', label: 'Email' },
  { value: 'visita', label: 'Visita' },
  { value: 'venda', label: 'Venda' },
  { value: 'orcamento', label: 'Orçamento' },
  { value: 'outro', label: 'Outro' },
];

function InfoRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex justify-between text-sm py-1.5">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-900 text-right">{value || '—'}</span>
    </div>
  );
}

export function ClienteDetalhePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: cliente, isLoading, isError } = useCliente(id ?? '');
  const criarInteracao = useCriarInteracao();

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [novaInteracao, setNovaInteracao] = useState({ tipo: 'ligacao', descricao: '' });

  const handleSubmitInteracao = async (e: FormEvent) => {
    e.preventDefault();
    if (!id || !novaInteracao.descricao.trim()) return;
    await criarInteracao.mutateAsync({ clienteId: id, ...novaInteracao });
    setNovaInteracao({ tipo: 'ligacao', descricao: '' });
  };

  if (isLoading) {
    return <div className="text-sm text-gray-400 py-12 text-center">Carregando...</div>;
  }

  if (isError || !cliente) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
        <AlertTriangle size={24} className="text-cb-danger" />
        <p className="text-sm text-gray-600">Cliente não encontrado.</p>
        <Link to="/clientes" className="text-sm text-cb-primary font-medium hover:underline">
          Voltar para clientes
        </Link>
      </div>
    );
  }

  const totalInteracoes = cliente._count?.interacoes ?? cliente.interacoes.length;

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={() => navigate('/clientes')}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4 transition"
      >
        <ArrowLeft size={16} /> Voltar
      </button>

      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-gray-900">{cliente.nome}</h1>
            <StatusBadge status={cliente.status} />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {cliente.telefone && (
            <a
              href={whatsappLink(cliente.telefone)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3.5 py-2 bg-cb-success text-white rounded-xl text-sm font-medium hover:opacity-90 transition"
            >
              <MessageCircle size={16} /> WhatsApp
            </a>
          )}
          <button
            onClick={() => setEditModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
          >
            <Pencil size={16} /> Editar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Contato</h3>
          <InfoRow label="Telefone" value={cliente.telefone} />
          <InfoRow label="Email" value={cliente.email} />
          <InfoRow label="CPF/CNPJ" value={cliente.cpfCnpj} />
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Endereço</h3>
          <InfoRow label="Endereço" value={cliente.endereco} />
          <InfoRow label="Cidade" value={cliente.cidade} />
          <InfoRow label="Estado" value={cliente.estado} />
        </div>

        {cliente.observacoes && (
          <div className="bg-white rounded-2xl border border-gray-200 p-5 md:col-span-2">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Observações</h3>
            <p className="text-sm text-gray-600 whitespace-pre-wrap">{cliente.observacoes}</p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          <Clock size={15} className="text-cb-primary" />
          <h3 className="text-sm font-semibold text-gray-700">Histórico de Interações</h3>
          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
            {cliente.interacoes.length}
          </span>
          {totalInteracoes > cliente.interacoes.length && (
            <span className="text-xs text-gray-400">· {totalInteracoes} total</span>
          )}
        </div>

        <form onSubmit={handleSubmitInteracao} className="px-5 py-4 border-b border-gray-100 flex gap-3 flex-wrap">
          <select
            value={novaInteracao.tipo}
            onChange={(e) => setNovaInteracao((n) => ({ ...n, tipo: e.target.value }))}
            className={`${selectCls} w-40`}
          >
            {tiposInteracao.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
          <input
            value={novaInteracao.descricao}
            onChange={(e) => setNovaInteracao((n) => ({ ...n, descricao: e.target.value }))}
            placeholder="Descreva a interação..."
            className={`${inputCls} flex-1 min-w-[200px]`}
          />
          <button
            type="submit"
            disabled={criarInteracao.isPending || !novaInteracao.descricao.trim()}
            className="px-4 py-2 bg-cb-primary text-white rounded-xl text-sm font-medium hover:opacity-90 transition disabled:opacity-50"
          >
            Registrar
          </button>
        </form>

        {cliente.interacoes.length === 0 ? (
          <p className="px-5 py-8 text-sm text-gray-400 text-center">Nenhuma interação registrada ainda.</p>
        ) : (
          <ul className="divide-y divide-gray-50">
            {cliente.interacoes.map((interacao) => (
              <li key={interacao.id} className="px-5 py-3.5 flex items-start gap-3">
                <StatusBadge status={interacao.tipo} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700">{interacao.descricao}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(interacao.data).toLocaleString('pt-BR')}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <ClienteFormModal open={editModalOpen} onClose={() => setEditModalOpen(false)} cliente={cliente} />
    </div>
  );
}
