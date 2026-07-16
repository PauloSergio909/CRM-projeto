import { Settings } from 'lucide-react';
import { useMe } from '../../hooks/useApi';
import { CategoriasSection } from './CategoriasSection';
import { ProdutosSection } from './ProdutosSection';

export function ConfiguracoesPage() {
  const { data: user, isLoading, isError } = useMe();

  return (
    <div className="max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-cb-primary/10 rounded-2xl flex items-center justify-center">
          <Settings size={22} className="text-cb-primary" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">Configurações</h2>
          <p className="text-sm text-gray-500">Dados da empresa chegam numa próxima etapa.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Minha conta</h3>

        {isLoading && <p className="text-sm text-gray-400">Carregando...</p>}
        {isError && <p className="text-sm text-cb-danger">Não foi possível carregar seus dados.</p>}

        {user && (
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">Nome</dt>
              <dd className="font-medium text-gray-900">{user.nome}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Email</dt>
              <dd className="font-medium text-gray-900">{user.email}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Cadastrado em</dt>
              <dd className="font-medium text-gray-900">
                {new Date(user.createdAt).toLocaleDateString('pt-BR')}
              </dd>
            </div>
          </dl>
        )}
      </div>

      <CategoriasSection />
      <ProdutosSection />
    </div>
  );
}
