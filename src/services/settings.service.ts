import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import type { StoreSettings } from '@/types/models';

const DEFAULT_SETTINGS: StoreSettings = {
  id: 1,
  whatsapp_number: '50685252840',
  store_name: 'ConstruCenter Nicoya',
  support_email: 'ventas@construcenter.cr',
  updated_at: new Date().toISOString(),
};

// Variable local en memoria para persistir en caso de desarrollo sin conexión
let localSettings = { ...DEFAULT_SETTINGS };

export const settingsService = {
  /**
   * Obtiene la configuración comercial activa de la tienda (id = 1)
   */
  async getSettings(): Promise<StoreSettings> {
    if (!isSupabaseConfigured()) {
      return localSettings;
    }

    try {
      const { data, error } = await supabase
        .from('store_settings')
        .select('*')
        .eq('id', 1)
        .single();

      if (error || !data) {
        console.warn('Configuración store_settings no encontrada en Supabase, empleando valores por defecto.');
        return localSettings;
      }

      return data as StoreSettings;
    } catch {
      return localSettings;
    }
  },

  /**
   * Actualiza el número comercial de WhatsApp para cierre de pedidos y catálogos
   */
  async updateWhatsAppNumber(whatsapp_number: string, store_name?: string): Promise<StoreSettings> {
    const cleanNumber = whatsapp_number.replace(/[^0-9]/g, '');

    localSettings = {
      ...localSettings,
      whatsapp_number: cleanNumber,
      ...(store_name ? { store_name } : {}),
      updated_at: new Date().toISOString(),
    };

    if (!isSupabaseConfigured()) {
      return localSettings;
    }

    const { data, error } = await supabase
      .from('store_settings')
      .upsert({
        id: 1,
        whatsapp_number: cleanNumber,
        ...(store_name ? { store_name } : {}),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error al actualizar store_settings en Supabase:', error);
      throw new Error(`Error al guardar configuración: ${error.message}`);
    }

    return data as StoreSettings;
  },
};
