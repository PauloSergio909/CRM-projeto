import { NavLink } from 'react-router-dom';
import { Home, Users, Kanban, Wallet, BarChart3, History, Settings, Boxes, X } from 'lucide-react';
import { useAuthStore } from '../../stores/auth.store';

const navItemsBefore = [
  { to: '/', icon: Home, label: 'Dashboard' },
  { to: '/clientes', icon: Users, label: 'Clientes' },
  { to: '/pipeline', icon: Kanban, label: 'Pipeline' },
];

const financeiroSubItems = [
  { to: '/financeiro', label: 'Lançamentos' },
  { to: '/financeiro/contas-a-pagar', label: 'Contas a Pagar' },
  { to: '/financeiro/contas-a-receber', label: 'Contas a Receber' },
];

const navItemsAfter = [
  { to: '/relatorios', icon: BarChart3, label: 'Relatórios' },
  { to: '/auditoria', icon: History, label: 'Auditoria' },
  { to: '/configuracoes', icon: Settings, label: 'Configurações' },
];

function getInitials(nome: string): string {
  return nome
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join('');
}

const navLinkCls = (isOpen: boolean) => ({ isActive }: { isActive: boolean }) => `
  flex items-center gap-3 rounded-xl transition-all duration-200
  ${isOpen ? 'px-3.5 py-2.5' : 'px-0 py-2.5 justify-center'}
  ${isActive ? 'bg-cb-primary/20 text-cb-primary' : 'text-white/50 hover:text-white/80 hover:bg-white/5'}
`;

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user } = useAuthStore();

  return (
    <aside
      className={`
        ${isOpen ? 'w-64' : 'w-[72px]'}
        bg-cb-sidebar flex flex-col transition-all duration-300 ease-in-out flex-shrink-0 h-full
      `}
    >
      <div className={`${isOpen ? 'px-5' : 'px-3'} py-5 border-b border-white/10 flex items-center gap-3`}>
        <div className="w-10 h-10 rounded-xl bg-cb-primary flex items-center justify-center flex-shrink-0">
          <Boxes size={22} className="text-white" />
        </div>
        {isOpen && (
          <div className="flex-1 min-w-0">
            <div className="text-white font-bold text-lg tracking-tight">ClienteBox</div>
          </div>
        )}
        {isOpen && onClose && (
          <button
            onClick={onClose}
            aria-label="Fechar menu"
            className="lg:hidden p-1 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition flex-shrink-0"
          >
            <X size={18} />
          </button>
        )}
      </div>

      <nav className="flex-1 py-4 px-2 overflow-y-auto space-y-0.5">
        {navItemsBefore.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.to === '/'} className={navLinkCls(isOpen)}>
            <item.icon size={20} className="flex-shrink-0" />
            {isOpen && <span className="text-sm font-medium truncate flex-1">{item.label}</span>}
          </NavLink>
        ))}

        <NavLink to="/financeiro" end className={navLinkCls(isOpen)}>
          <Wallet size={20} className="flex-shrink-0" />
          {isOpen && <span className="text-sm font-medium truncate flex-1">Financeiro</span>}
        </NavLink>

        {isOpen && (
          <div className="pl-8 space-y-0.5">
            {financeiroSubItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end
                className={({ isActive }) => `
                  block px-3 py-1.5 rounded-lg text-xs font-medium transition
                  ${isActive ? 'text-cb-primary bg-cb-primary/10' : 'text-white/40 hover:text-white/70 hover:bg-white/5'}
                `}
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        )}

        {navItemsAfter.map((item) => (
          <NavLink key={item.to} to={item.to} className={navLinkCls(isOpen)}>
            <item.icon size={20} className="flex-shrink-0" />
            {isOpen && <span className="text-sm font-medium truncate flex-1">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className={`${isOpen ? 'px-4' : 'px-2.5'} py-4 border-t border-white/10 flex items-center gap-3`}>
        <div className="w-9 h-9 rounded-xl bg-cb-primary flex items-center justify-center flex-shrink-0">
          <span className="text-white text-xs font-bold">{user?.nome ? getInitials(user.nome) : '?'}</span>
        </div>
        {isOpen && (
          <div className="overflow-hidden flex-1 min-w-0">
            <div className="text-white text-sm font-semibold truncate">{user?.nome ?? '—'}</div>
            <div className="text-white/40 text-xs truncate">{user?.email ?? ''}</div>
          </div>
        )}
      </div>
    </aside>
  );
}
