import { useState } from 'react';
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
import { AniversariantesCard } from '../../components/dashboard/AniversariantesCard';
import { MetaCard } from '../../components/dashboard/MetaCard';
import { ForecastCard } from '../../components/dashboard/ForecastCard';

function saudacao(): string {
  const hora = new Date().getHours();
  if (hora < 12) return 'Bom dia';
  if (hora < 18) return 'Boa tarde';
  return 'Boa noite';
}

function mesAtualISO(): string {
  const hoje = new Date();
  return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`;
}

export function DashboardPage() {
  const { user } = useAuthStore();
  const [mesSelecionado, setMesSelecionado] = useState(mesAtualISO());

  const { data: resumo, isLoading } = useDashboardResumo(mesSelecionado);
  const { data: faturamento } = useFaturamentoMensal(6);
  const { data: despesasPorCategoria } = useDespesasPorCategoria(mesSelecionado);
  const { data: atividades } = useAtividadesRecentes(10);

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h2 className="text-[clamp(1.05rem,2.5vw,1.25rem)] font-bold text-gray-900">
          {saudacao()}, {user?.nome?.split(' ')[0] ?? ''}!
        </h2>
        <input
          type="month"
          value={mesSelecionado}
          onChange={(e) => setMesSelecionado(e.target.value)}
          className="px-3 py-1.5 text-sm rounded-xl border border-gray-200 bg-white text-gray-600 focus:outline-none focus:ring-2 focus:ring-cb-primary/30"
        />
      </div>

      {isLoading || !resumo ? (
        <p className="text-sm text-gray-400 py-8 text-center">Carregando...</p>
      ) : (
        <>
          <div data-tour="dashboard-kpis" className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
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

          <MetaCard mes={mesSelecionado} receitas={resumo.receitas} />
          <ForecastCard />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            <FaturamentoChart dados={faturamento ?? []} />
            <DespesasPorCategoriaChart dados={despesasPorCategoria ?? []} />
          </div>

          <AniversariantesCard />

          <AtividadesFeed atividades={atividades ?? []} />
        </>
      )}
    </div>
  );
}
