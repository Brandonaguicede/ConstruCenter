import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import type { LoginInput } from '@/schemas/auth.schema';
import type { Session, User } from '@supabase/supabase-js';

export const authService = {
  /**
   * Inicia sesión con correo y contraseña en Supabase Auth
   */
  async signIn({ email, password }: LoginInput): Promise<{ user: User | null; session: Session | null }> {
    if (!isSupabaseConfigured()) {
      throw new Error(
        'Conexión no configurada: Debes ingresar tu VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY reales en el archivo .env y reiniciar el servidor con "npm run dev".'
      );
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Credenciales incorrectas. Verifica tu correo y contraseña o crea el usuario en Supabase Authentication.');
        }
        if (error.message.includes('Email not confirmed')) {
          throw new Error('El correo no ha sido confirmado en Supabase Auth.');
        }
        throw new Error(error.message);
      }

      return {
        user: data.user,
        session: data.session,
      };
    } catch (err: any) {
      if (err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError') || err.name === 'TypeError') {
        throw new Error(
          'Error de red con Supabase: No se pudo contactar con tu servidor de Supabase. Revisa que VITE_SUPABASE_URL sea correcta y que tu proyecto no esté pausado.'
        );
      }
      throw err;
    }
  },

  /**
   * Cierra la sesión activa
   */
  async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(error.message);
    }
  },

  /**
   * Obtiene la sesión actual
   */
  async getSession(): Promise<Session | null> {
    if (!isSupabaseConfigured()) {
      return null;
    }
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Error al obtener la sesión:', error.message);
        return null;
      }
      return data.session;
    } catch (err) {
      console.warn('No se pudo verificar la sesión inicial con Supabase:', err);
      return null;
    }
  },

  /**
   * Obtiene el usuario actual verificado
   */
  async getCurrentUser(): Promise<User | null> {
    if (!isSupabaseConfigured()) {
      return null;
    }
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        return null;
      }
      return data.user;
    } catch {
      return null;
    }
  },

  /**
   * Suscripción reactiva a cambios de sesión (LOGIN, LOGOUT, TOKEN_REFRESHED)
   */
  onAuthStateChange(callback: (session: Session | null, user: User | null) => void) {
    if (!isSupabaseConfigured()) {
      return () => {};
    }
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      callback(session, session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  },
};
