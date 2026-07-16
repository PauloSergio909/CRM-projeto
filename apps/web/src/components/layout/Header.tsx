import { useLocation } from 'react-router-dom';
import { Menu, LogOut } from 'lucide-react';
import { useAuthStore } from '../../stores/auth.store';

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/clientes': 'Clientes',
  '/pipeline': 'Pipeline',
  '/financeiro': 'Lançamentos',
  '/financeiro/contas-a-pagar': 'Contas a Pagar',
  '/financeiro/contas-a-receber': 'Contas a Receber',
  '/relatorios': 'Relatórios',
  '/configuracoes': 'Configurações',
};

function getInitials(nome: string): string {
  return nome.split(' ').filter(Boolean).slice(0, 2).map((n) => n[0].toUpperCase()).join('');
}

interface HeaderProps {
  onToggleSidebar: () => void;
}

export function Header({ onToggleSidebar }: HeaderProps) {
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const title = pageTitles[location.pathname] ?? 'ClienteBox';

  const today = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <header className="bg-white border-b border-gray-200 px-4 md:px-6 h-16 flex items-center justify-between flex-shrink-0">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          aria-label="Alternar menu lateral"
          className="p-1.5 rounded-lg hover:bg-gray-100 transition"
        >
          <Menu size={20} className="text-gray-500" />
        </button>
        <div>
          <h1 className="text-[clamp(0.95rem,2vw,1.125rem)] font-bold text-gray-900 leading-tight">{title}</h1>
          <p className="text-xs text-gray-400 capitalize hidden md:block">{today}</p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 pl-2">
        <div className="w-8 h-8 rounded-xl bg-cb-primary flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
          {user?.nome ? getInitials(user.nome) : '?'}
        </div>
        <div className="hidden md:block">
          <p className="text-xs font-semibold text-gray-800 leading-tight">{user?.nome || '—'}</p>
        </div>
        <button
          onClick={logout}
          aria-label="Sair do sistema"
          className="p-1.5 rounded-lg hover:bg-red-50 transition text-gray-400 hover:text-red-500"
        >
          <LogOut size={16} />
        </button>
      </div>
    </header>
  );
}
