import {
  Boxes,
  Users,
  Wallet,
  Kanban,
  Target,
  BarChart3,
  History,
  MessageCircle,
  ArrowRight,
  Check,
} from 'lucide-react';
import { whatsappLink } from '@clientebox/shared';

// TODO: trocar pelo número de WhatsApp real do negócio antes de publicar.
const TELEFONE_CONTATO = '11999999999';
const APP_URL = import.meta.env.VITE_APP_URL ?? 'http://localhost:5173';

const linkDemo = `${APP_URL}/demo`;
const linkWhatsapp = whatsappLink(TELEFONE_CONTATO, 'Olá! Quero conhecer o ClienteBox.');

const funcionalidades = [
  { icon: Users, titulo: 'Clientes', descricao: 'Cadastro completo, histórico de interações, tags e busca rápida.' },
  { icon: Wallet, titulo: 'Financeiro', descricao: 'Contas a pagar e a receber, recorrência automática e recibos em PDF.' },
  { icon: Kanban, titulo: 'Pipeline', descricao: 'Funil de vendas visual, arraste os cards entre as etapas do negócio.' },
  { icon: Target, titulo: 'Metas', descricao: 'Defina a meta do mês e acompanhe o progresso em tempo real.' },
  { icon: BarChart3, titulo: 'Relatórios', descricao: 'Ranking de clientes, produtos mais vendidos e previsão de faturamento.' },
  { icon: History, titulo: 'Auditoria', descricao: 'Histórico de quem fez o quê — cadastros, vendas e mudanças de status.' },
];

const planos = [
  {
    nome: 'Essencial',
    descricao: 'Pra quem está começando a organizar o negócio.',
    itens: ['Cadastro de clientes', 'Contas a pagar e a receber', 'Dashboard com KPIs do mês', 'Exportação em CSV'],
  },
  {
    nome: 'Completo',
    descricao: 'Pra quem quer o sistema todo, sem abrir mão de nada.',
    destaque: true,
    itens: [
      'Tudo do plano Essencial',
      'Pipeline de vendas',
      'Metas e previsão de faturamento',
      'Recibos em PDF e log de auditoria',
    ],
  },
];

function MockupDashboard() {
  return (
    <div className="rounded-2xl bg-white border border-gray-200 shadow-xl shadow-cb-primary/10 p-5 w-full max-w-md mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="h-2.5 w-24 rounded-full bg-gray-200" />
        <div className="h-6 w-16 rounded-lg bg-cb-primary/10" />
      </div>
      <div className="grid grid-cols-3 gap-2 mb-4">
        {[
          { label: 'Receitas', value: 'R$ 12.400', tone: 'text-cb-success' },
          { label: 'Despesas', value: 'R$ 4.180', tone: 'text-cb-danger' },
          { label: 'Saldo', value: 'R$ 8.220', tone: 'text-cb-primary' },
        ].map((kpi) => (
          <div key={kpi.label} className="rounded-xl border border-gray-100 p-2.5">
            <div className="h-1.5 w-10 rounded-full bg-gray-100 mb-2" />
            <p className={`text-sm font-bold ${kpi.tone}`}>{kpi.value}</p>
          </div>
        ))}
      </div>
      <div className="flex items-end gap-1.5 h-20 mb-4">
        {[40, 65, 50, 80, 60, 95, 70].map((h, i) => (
          <div key={i} className="flex-1 rounded-t-md bg-cb-primary/70" style={{ height: `${h}%` }} />
        ))}
      </div>
      <div className="space-y-2">
        {['Maria Silva', 'Oficina Boa Vista', 'João Santos'].map((nome) => (
          <div key={nome} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-cb-primary/20" />
              <span className="text-xs font-medium text-gray-700">{nome}</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium">
              Saudável
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cb-primary flex items-center justify-center">
              <Boxes size={18} className="text-white" />
            </div>
            <span className="font-bold text-gray-900">ClienteBox</span>
          </div>
          <a
            href={linkDemo}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cb-primary text-white text-sm font-semibold hover:opacity-90 transition"
          >
            Ver demonstração
          </a>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-6 pt-16 pb-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div>
          <p className="text-sm font-semibold text-cb-primary mb-3">CRM + Financeiro para pequenos negócios</p>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 mb-5 text-balance">
            Seus clientes, suas vendas e seu dinheiro num lugar só.
          </h1>
          <p className="text-lg text-gray-500 mb-8 max-w-lg">
            Chega de planilha espalhada e caderninho de anotação. Cadastre clientes, controle o financeiro e
            acompanhe seu funil de vendas — tudo simples, tudo num só sistema.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href={linkDemo}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-cb-primary text-white font-semibold text-sm hover:opacity-90 transition"
            >
              Ver demonstração ao vivo <ArrowRight size={16} />
            </a>
            <a
              href={linkWhatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition"
            >
              <MessageCircle size={16} className="text-cb-success" /> Falar no WhatsApp
            </a>
          </div>
        </div>

        <MockupDashboard />
      </section>

      <section className="bg-cb-bg py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Tudo que seu negócio precisa</h2>
          <p className="text-gray-500 mb-10">Um módulo pra cada parte do dia a dia — sem complicação.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {funcionalidades.map((f) => (
              <div key={f.titulo} className="bg-white rounded-2xl border border-gray-200 p-5">
                <div className="w-10 h-10 rounded-xl bg-cb-primary/10 flex items-center justify-center mb-3">
                  <f.icon size={20} className="text-cb-primary" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{f.titulo}</h3>
                <p className="text-sm text-gray-500">{f.descricao}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Planos</h2>
        <p className="text-gray-500 mb-10">Fale com a gente pra achar o plano certo pro seu negócio.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl">
          {planos.map((plano) => (
            <div
              key={plano.nome}
              className={`rounded-2xl border p-6 ${plano.destaque ? 'border-cb-primary bg-cb-primary/5' : 'border-gray-200'}`}
            >
              <h3 className="font-bold text-lg text-gray-900 mb-1">{plano.nome}</h3>
              <p className="text-sm text-gray-500 mb-5">{plano.descricao}</p>
              <ul className="space-y-2.5 mb-6">
                {plano.itens.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-gray-700">
                    <Check size={16} className="text-cb-success flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
              <a
                href={linkWhatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition w-full justify-center ${
                  plano.destaque
                    ? 'bg-cb-primary text-white hover:opacity-90'
                    : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Fale conosco
              </a>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-gray-100 py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-cb-primary flex items-center justify-center">
              <Boxes size={14} className="text-white" />
            </div>
            <span className="font-semibold text-gray-700 text-sm">ClienteBox</span>
          </div>
          <a href={linkWhatsapp} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 hover:text-cb-primary transition">
            Falar no WhatsApp
          </a>
        </div>
      </footer>
    </div>
  );
}
