import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { registerSchema } from '@shared/validations';
import { useAuthStore } from '../../stores/auth.store';
import { Boxes, Eye, EyeOff, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

type CadastroForm = { nome: string; email: string; senha: string; confirmarSenha: string };

export function CadastroPage() {
  const { register: registerUser } = useAuthStore();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CadastroForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { nome: '', email: '', senha: '', confirmarSenha: '' },
  });

  const onSubmit = async (data: CadastroForm) => {
    try {
      await registerUser(data.nome, data.email, data.senha, data.confirmarSenha);
      toast.success('Cadastro realizado com sucesso!');
      navigate('/');
    } catch (error) {
      const msg =
        (error as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Erro ao cadastrar';
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-cb-bg">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-10 h-10 rounded-xl bg-cb-primary flex items-center justify-center">
            <Boxes size={22} className="text-white" />
          </div>
          <span className="text-xl font-bold text-cb-sidebar">ClienteBox</span>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-1 text-center">Crie sua conta</h2>
        <p className="text-gray-500 text-sm mb-8 text-center">Comece a organizar seus clientes e finanças</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Nome</label>
            <input
              {...register('nome')}
              type="text"
              autoComplete="name"
              placeholder="Seu nome completo"
              className={`
                w-full px-4 py-3 rounded-xl border text-sm transition
                focus:outline-none focus:ring-2
                ${errors.nome ? 'border-cb-danger focus:ring-cb-danger/30' : 'border-gray-200 focus:ring-cb-primary/30 focus:border-cb-primary'}
              `}
            />
            {errors.nome && (
              <p className="mt-1.5 text-xs text-cb-danger flex items-center gap-1">
                <AlertCircle size={12} /> {errors.nome.message}
              </p>
            )}
          </div>

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
                autoComplete="new-password"
                placeholder="Mínimo 6 caracteres"
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirmar senha</label>
            <input
              {...register('confirmarSenha')}
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Repita a senha"
              className={`
                w-full px-4 py-3 rounded-xl border text-sm transition
                focus:outline-none focus:ring-2
                ${errors.confirmarSenha ? 'border-cb-danger focus:ring-cb-danger/30' : 'border-gray-200 focus:ring-cb-primary/30 focus:border-cb-primary'}
              `}
            />
            {errors.confirmarSenha && (
              <p className="mt-1.5 text-xs text-cb-danger flex items-center gap-1">
                <AlertCircle size={12} /> {errors.confirmarSenha.message}
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
                Criando conta...
              </span>
            ) : (
              'Criar conta'
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Já tem conta?{' '}
          <Link to="/login" className="text-cb-primary font-medium hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
