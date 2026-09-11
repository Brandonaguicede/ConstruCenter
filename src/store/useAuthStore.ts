import { create } from 'zustand';
import type { User, Session } from '@supabase/supabase-js';
import { authService } from '@/services/auth.service';
import type { LoginInput } from '@/schemas/auth.schema';

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  isDemoMode: boolean;
  login: (credentials: LoginInput) => Promise<void>;
  loginDemo: () => void;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  isLoading: true,
  isInitialized: false,
  error: null,
  isDemoMode: false,

  initialize: async () => {
    try {
      set({ isLoading: true });
      const session = await authService.getSession();
      const user = session?.user ?? null;
      set({ user, session, isLoading: false, isInitialized: true });

      // Escuchar cambios de autenticación
      authService.onAuthStateChange((newSession, newUser) => {
        set({ session: newSession, user: newUser, isLoading: false });
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al inicializar sesión';
      set({ user: null, session: null, isLoading: false, isInitialized: true, error: message });
    }
  },

  login: async (credentials: LoginInput) => {
    try {
      set({ isLoading: true, error: null });
      const { user, session } = await authService.signIn(credentials);
      set({ user, session, isLoading: false, isDemoMode: false, error: null });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Credenciales inválidas';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  loginDemo: () => {
    const mockUser: any = {
      id: 'demo-admin-uuid-0001',
      email: 'admin.demo@construcenter.com',
      role: 'authenticated',
      aud: 'authenticated',
      app_metadata: {},
      user_metadata: { full_name: 'Administrador Demo' },
      created_at: new Date().toISOString(),
    };
    set({
      user: mockUser,
      session: null,
      isDemoMode: true,
      isLoading: false,
      error: null,
    });
  },

  logout: async () => {
    try {
      set({ isLoading: true });
      if (!get().isDemoMode) {
        await authService.signOut();
      }
      set({ user: null, session: null, isDemoMode: false, isLoading: false, error: null });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al cerrar sesión';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  clearError: () => set({ error: null }),
}));
