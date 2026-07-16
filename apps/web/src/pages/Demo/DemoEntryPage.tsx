import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Boxes, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../../stores/auth.store';

export function DemoEntryPage() {
  const navigate = useNavigate();
  const { isAuthenticated, entrarComoDemo } = useAuthStore();
  const [confirmado, setConfirmado] = useState(!isAuthenticated);
  const [erro, setErro] = useState(false);

  useEffect(() => {
    if (!confirmado) return;

    entrarComoDemo()
      .then(() => navigate('/'))
      .catch(() => setErro(true));
  }, [confirmado, entrarComoDemo, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-cb-bg p-8">
      <div className="w-full max-w-sm text-center">
        <div className="w-16 h-16 rounded-2xl bg-cb-primary flex items-center justify-center mx-auto mb-6">
          <Boxes size={30} className="text-white" />
        </div>

        {erro ? (
          <>
            <AlertCircle size={24} className="text-cb-danger mx-auto mb-3" />
            <p className="text-sm text-gray-600 mb-4">Não foi possível entrar no modo demonstração agora.</p>
            <Link to="/login" className="text-sm text-cb-primary font-medium hover:underline">
              Ir para o login
            </Link>
          </>
        ) : !confirmado ? (
          <>
            <p className="text-sm text-gray-700 mb-1 font-medium">Você já está logado.</p>
            <p className="text-sm text-gray-500 mb-6">
              Entrar no modo demonstração vai trocar para a conta de exemplo do ClienteBox.
            </p>
            <button
              onClick={() => setConfirmado(true)}
              className="w-full py-3 px-4 bg-cb-primary text-white rounded-xl font-semibold text-sm hover:opacity-90 transition"
            >
              Entrar na demonstração
            </button>
          </>
        ) : (
          <>
            <div className="w-8 h-8 border-4 border-cb-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm text-gray-500">Preparando a demonstração...</p>
          </>
        )}
      </div>
    </div>
  );
}
