import { supabase, isSupabaseConfigured, supabaseUrl, supabaseAnonKey } from '@/lib/supabaseClient';

export interface DiagnosticResult {
  ok: boolean;
  code: 'OK' | 'MISSING_ENV' | 'PLACEHOLDER_ENV' | 'NETWORK_ERROR' | 'TABLES_MISSING' | 'AUTH_ERROR';
  title: string;
  message: string;
  solution: string;
  details?: string;
  url?: string;
}

export const supabaseDiagnostic = {
  /**
   * Ejecuta un test completo de conectividad y estado de base de datos
   */
  async checkConnection(): Promise<DiagnosticResult> {
    // 1. Validar si las variables están configuradas
    if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
      return {
        ok: false,
        code: 'MISSING_ENV',
        title: 'Variables de Entorno Faltantes',
        message: 'No se encontraron las variables VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en tu entorno.',
        solution: 'Crea o edita el archivo .env en la raíz del proyecto y agrega tus credenciales de Supabase.',
      };
    }

    if (!isSupabaseConfigured()) {
      return {
        ok: false,
        code: 'PLACEHOLDER_ENV',
        title: 'Credenciales de Ejemplo Detectadas',
        message: 'Tu archivo .env aún tiene valores de marcador de posición (placeholder-project).',
        solution: 'Reemplaza https://placeholder-project.supabase.co y placeholder-anon-key con las credenciales reales de tu proyecto de Supabase en el archivo .env y reinicia el servidor con "npm run dev".',
        url: supabaseUrl,
      };
    }

    // 2. Probar conectividad con Supabase
    try {
      // Intento de consulta a la tabla categories
      const { data, error } = await supabase
        .from('categories')
        .select('count', { count: 'exact', head: true });

      if (error) {
        // Código 42P01 en PostgreSQL: relation "categories" does not exist
        if (error.code === '42P01' || error.message?.includes('relation') || error.message?.includes('does not exist')) {
          return {
            ok: false,
            code: 'TABLES_MISSING',
            title: 'Tablas No Creadas en Supabase',
            message: 'La conexión con Supabase es correcta, pero la tabla "categories" no existe en la base de datos.',
            solution: 'Copia el contenido del archivo supabase/schema.sql y ejecútalo en el SQL Editor de tu consola de Supabase.',
            details: error.message,
            url: supabaseUrl,
          };
        }

        // Si es un error de autenticación / JWT
        if (error.code === 'PGRST301' || error.message?.includes('JWT') || error.message?.includes('apikey')) {
          return {
            ok: false,
            code: 'AUTH_ERROR',
            title: 'Clave Anon Inválida',
            message: 'Supabase rechazó la clave VITE_SUPABASE_ANON_KEY.',
            solution: 'Ve a Supabase > Project Settings > API y copia la "anon public key" correcta en tu archivo .env.',
            details: error.message,
            url: supabaseUrl,
          };
        }

        return {
          ok: false,
          code: 'NETWORK_ERROR',
          title: 'Error de Respuesta de Supabase',
          message: error.message || 'Error al comunicarse con Supabase.',
          solution: 'Verifica los logs en tu consola de Supabase y que el proyecto no esté pausado.',
          details: JSON.stringify(error),
          url: supabaseUrl,
        };
      }

      return {
        ok: true,
        code: 'OK',
        title: 'Conexión Exitosa',
        message: 'Conectado correctamente con Supabase. Las tablas y políticas RLS están activas.',
        solution: 'Todo listo para operar.',
        url: supabaseUrl,
      };
    } catch (err: any) {
      return {
        ok: false,
        code: 'NETWORK_ERROR',
        title: 'Fallo de Red con Supabase',
        message: err?.message || 'No se pudo alcanzar el host de Supabase.',
        solution: 'Verifica que la URL VITE_SUPABASE_URL sea correcta, que tu conexión a internet funcione y que el proyecto en Supabase no esté suspendido.',
        details: err?.toString(),
        url: supabaseUrl,
      };
    }
  },
};
