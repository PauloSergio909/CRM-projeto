import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { loginSchema } from '@shared/validations';
import { useAuthStore } from '../../stores/auth.store';
import { Boxes, Eye, EyeOff, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

type LoginForm = { email: string; senha: string };

export function LoginPage() {
  const { login } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', senha: '' },
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      await login(data.email, data.senha);
      toast.success('Login realizado com sucesso!');
    } catch (error) {
      const msg =
        (error as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Erro ao fazer login';
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-cb-sidebar relative overflow-hidden items-center justify-center">
        <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-cb-primary/10" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-cb-primary/10" />

        <div className="relative z-10 text-center px-16">
          <div className="w-20 h-20 rounded-2xl bg-cb-primary flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-cb-primary/30">
            <Boxes size={40} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">ClienteBox</h1>
          <p className="text-white/50 text-lg leading-relaxed max-w-md">
            Seus clientes, suas vendas e seu dinheiro num lugar só.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 bg-cb-bg">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-cb-primary flex items-center justify-center">
              <Boxes size={22} className="text-white" />
            </div>
            <span className="text-xl font-bold text-cb-sidebar">ClienteBox</span>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-1">Bem-vindo de volta</h2>
          <p className="text-gray-500 text-sm mb-8">Entre com suas credenciais para acessar o sistema</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input
                {...register('email')}
                type="email"
                autoComplete="email"
                placeholder="seu@email.com.br"
                className={`
                  w-full px-4 py-3 rounded-xl border text-sm transition
                  focus:outline-none focus:ring-2
                  ${errors.email ? 'border-cb-danger focus:ring-cb-danger/30' : 'border-gray-200 focus:ring-cb-primary/30 focus:border-cb-primary'}
                `}
              />
              {errors.email && (
                <p className="mt-1.5 text-xs text-cb-danger flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Senha</label>
              <div className="relative">
                <input
                  {...register('senha')}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Sua senha"
                  className={`
                    w-full px-4 py-3 pr-12 rounded-xl border text-sm transition
                    focus:outline-none focus:ring-2
                    ${errors.senha ? 'border-cb-danger focus:ring-cb-danger/30' : 'border-gray-200 focus:ring-cb-primary/30 focus:border-cb-primary'}
                  `}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.senha && (
                <p className="mt-1.5 text-xs text-cb-danger flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.senha.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-cb-primary text-white rounded-xl font-semibold text-sm hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Entrando...
                </span>
              ) : (
                'Entrar no sistema'
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Não tem conta?{' '}
            <Link to="/cadastro" className="text-cb-primary font-medium hover:underline">
              Cadastre-se
            </Link>
          </p>

          {import.meta.env.DEV && (
            <div className="mt-6 p-4 rounded-xl bg-cb-primary/5 border border-cb-primary/20">
              <p className="text-xs font-medium text-cb-primary mb-1">Credenciais de teste:</p>
              <p className="text-xs text-gray-500">demo@clientebox.com.br / demo123</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
