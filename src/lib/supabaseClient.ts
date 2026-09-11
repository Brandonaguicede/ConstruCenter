import { createClient } from '@supabase/supabase-js';

const rawUrl = import.meta.env.VITE_SUPABASE_URL?.trim() || '';
const rawAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() || '';

// Detección de configuración válida
export const isSupabaseConfigured = (): boolean => {
  if (!rawUrl || !rawAnonKey) return false;
  if (rawUrl.includes('placeholder-project') || rawAnonKey.includes('placeholder-anon-key')) return false;
  return rawUrl.startsWith('http://') || rawUrl.startsWith('https://');
};

export const supabaseUrl = rawUrl || 'https://placeholder-project.supabase.co';
export const supabaseAnonKey = rawAnonKey || 'placeholder-anon-key';

if (!isSupabaseConfigured()) {
  console.warn(
    '⚠️ [ConstruCenter - Supabase] No se ha detectado una conexión activa a Supabase.\n' +
    'Revisa tu archivo .env y asegúrate de configurar VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY con las credenciales de tu proyecto.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
