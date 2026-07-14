import { lazy, Suspense, useEffect, type ComponentType } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './stores/auth.store';
import { MainLayout } from './components/layout/MainLayout';
import { ErrorBoundary, PageErrorFallback } from './components/ui/ErrorBoundary';
import { ScrollToTop } from './components/layout/ScrollToTop';

// Login carregado de forma síncrona — é a primeira rota exibida
import { LoginPage } from './pages/Login/LoginPage';

// Demais páginas sob demanda (code splitting por rota)
const CadastroPage = lazy(() => import('./pages/Cadastro/CadastroPage').then((m) => ({ default: m.CadastroPage })));
const DashboardPage = lazy(() => import('./pages/Dashboard/DashboardPage').then((m) => ({ default: m.DashboardPage })));
const ClientesPage = lazy(() => import('./pages/Clientes/ClientesPage').then((m) => ({ default: m.ClientesPage })));
const ClienteDetalhePage = lazy(() =>
  import('./pages/ClienteDetalhe/ClienteDetalhePage').then((m) => ({ default: m.ClienteDetalhePage })),
);
const PipelinePage = lazy(() => import('./pages/Pipeline/PipelinePage').then((m) => ({ default: m.PipelinePage })));
const LancamentosPage = lazy(() =>
  import('./pages/Financeiro/LancamentosPage').then((m) => ({ default: m.LancamentosPage })),
);
const ContasPagarPage = lazy(() =>
  import('./pages/Financeiro/ContasPagarPage').then((m) => ({ default: m.ContasPagarPage })),
);
const ContasReceberPage = lazy(() =>
  import('./pages/Financeiro/ContasReceberPage').then((m) => ({ default: m.ContasReceberPage })),
);
const RelatoriosPage = lazy(() => import('./pages/Relatorios/RelatoriosPage').then((m) => ({ default: m.RelatoriosPage })));
const ConfiguracoesPage = lazy(() => import('./pages/Configuracoes/ConfiguracoesPage').then((m) => ({ default: m.ConfiguracoesPage })));

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-cb-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function page(Page: ComponentType) {
  return (
    <ErrorBoundary fallback={(err, reset) => <PageErrorFallback error={err} reset={reset} />}>
      <Page />
    </ErrorBoundary>
  );
}

export default function App() {
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cb-bg">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cb-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Carregando ClienteBox...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: { borderRadius: '10px', fontFamily: 'Inter' },
        }}
      />

      <Suspense fallback={<PageLoader />}>
        <ScrollToTop />
        <Routes>
          <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <LoginPage />} />
          <Route path="/cadastro" element={isAuthenticated ? <Navigate to="/" /> : page(CadastroPage)} />

          <Route element={isAuthenticated ? <MainLayout /> : <Navigate to="/login" />}>
            <Route path="/" element={page(DashboardPage)} />
            <Route path="/clientes" element={page(ClientesPage)} />
            <Route path="/clientes/:id" element={page(ClienteDetalhePage)} />
            <Route path="/pipeline" element={page(PipelinePage)} />
            <Route path="/financeiro" element={page(LancamentosPage)} />
            <Route path="/financeiro/contas-a-pagar" element={page(ContasPagarPage)} />
            <Route path="/financeiro/contas-a-receber" element={page(ContasReceberPage)} />
            <Route path="/relatorios" element={page(RelatoriosPage)} />
            <Route path="/configuracoes" element={page(ConfiguracoesPage)} />
          </Route>

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}
