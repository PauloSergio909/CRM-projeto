import { create } from 'zustand';
import axios from 'axios';
import { api } from '../services/api';

interface AuthUser {
  id: string;
  nome: string;
  email: string;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  login: (email: string, senha: string) => Promise<void>;
  register: (nome: string, email: string, senha: string, confirmarSenha: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const API_URL = import.meta.env.VITE_API_URL ?? '/api';

function decodeUserFromToken(token: string): AuthUser | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.exp * 1000 <= Date.now()) return null;
    return { id: payload.id, email: payload.email, nome: payload.nome ?? '' };
  } catch {
    return null;
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (email, senha) => {
    const { data } = await api.post('/auth/login', { email, senha });

    localStorage.setItem('accessToken', data.data.accessToken);
    localStorage.setItem('refreshToken', data.data.refreshToken);

    set({ user: data.data.user, isAuthenticated: true });
  },

  register: async (nome, email, senha, confirmarSenha) => {
    const { data } = await api.post('/auth/register', { nome, email, senha, confirmarSenha });

    localStorage.setItem('accessToken', data.data.accessToken);
    localStorage.setItem('refreshToken', data.data.refreshToken);

    set({ user: data.data.user, isAuthenticated: true });
  },

  logout: async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    try {
      if (refreshToken) await api.post('/auth/logout', { refreshToken });
    } catch {
      // Falha silenciosa — o access token expira naturalmente pelo TTL curto
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      set({ user: null, isAuthenticated: false });
    }
  },

  checkAuth: async () => {
    const token = localStorage.getItem('accessToken');

    if (token) {
      const user = decodeUserFromToken(token);
      if (user) {
        set({ user, isAuthenticated: true, isLoading: false });
        return;
      }
    }

    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      try {
        const { data } = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
        const newAccessToken: string = data.data.accessToken;
        localStorage.setItem('accessToken', newAccessToken);
        localStorage.setItem('refreshToken', data.data.refreshToken);

        const user = decodeUserFromToken(newAccessToken);
        set({ user, isAuthenticated: !!user, isLoading: false });
        return;
      } catch {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      }
    }

    set({ isLoading: false });
  },
}));
