import { Wallet, TrendingDown, TrendingUp, Users, Clock, Kanban } from 'lucide-react';
import { useAuthStore } from '../../stores/auth.store';
import {
  useDashboardResumo,
  useFaturamentoMensal,
  useDespesasPorCategoria,
  useAtividadesRecentes,
} from '../../hooks/useApi';
import { formatCurrency } from '../../utils/formatters';
import { KPICard } from '../../components/ui/KPICard';
import { FaturamentoChart } from '../../components/dashboard/FaturamentoChart';
import { DespesasPorCategoriaChart } from '../../components/dashboard/DespesasPorCategoriaChart';
import { AtividadesFeed } from '../../components/dashboard/AtividadesFeed';

function saudacao(): string {
  const hora = new Date().getHours();
  if (hora < 12) return 'Bom dia';
  if (hora < 18) return 'Boa tarde';
  return 'Boa noite';
}

export function DashboardPage() {
  const { user } = useAuthStore();
  const { data: resumo, isLoading } = useDashboardResumo();
  const { data: faturamento } = useFaturamentoMensal(6);
  const { data: despesasPorCategoria } = useDespesasPorCategoria();
  const { data: atividades } = useAtividadesRecentes(10);

  const mesAtual = new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-gray-900">
          {saudacao()}, {user?.nome?.split(' ')[0] ?? ''}!
        </h2>
        <span className="text-sm text-gray-400 capitalize">{mesAtual}</span>
      </div>

      {isLoading || !resumo ? (
        <p className="text-sm text-gray-400 py-8 text-center">Carregando...</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <KPICard titulo="Receitas do mês" valor={formatCurrency(resumo.receitas)} variacao={resumo.variacaoReceitas} icon={TrendingUp} />
            <KPICard titulo="Despesas do mês" valor={formatCurrency(resumo.despesas)} variacao={resumo.variacaoDespesas} icon={TrendingDown} />
            <KPICard titulo="Saldo do mês" valor={formatCurrency(resumo.saldo)} variacao={resumo.variacaoSaldo} icon={Wallet} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <KPICard titulo="Clientes Novos" valor={String(resumo.clientesNovos)} icon={Users} />
            <KPICard titulo="Contas a Vencer (7 dias)" valor={String(resumo.contasAVencer)} icon={Clock} />
            <KPICard
              titulo="Oportunidades Abertas"
              valor={`${resumo.oportunidadesAbertas.quantidade} · ${formatCurrency(resumo.oportunidadesAbertas.valorTotal)}`}
              icon={Kanban}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            <FaturamentoChart dados={faturamento ?? []} />
            <DespesasPorCategoriaChart dados={despesasPorCategoria ?? []} />
          </div>

          <AtividadesFeed atividades={atividades ?? []} />
        </>
      )}
    </div>
  );
}
