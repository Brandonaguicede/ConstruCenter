import { isSupabaseConfigured, supabase } from '@/lib/supabaseClient';
import { comboFormSchema, type ComboFormData } from '@/schemas/combo.schema';
import { productService } from '@/services/product.service';
import { z } from 'zod';

const comboProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  sku: z.string(),
  slug: z.string().nullish(),
  price: z.coerce.number(),
  images: z.array(z.string()).nullish().transform((value) => value ?? []),
  is_active: z.boolean(),
});

const comboItemSchema = z.object({
  product_id: z.string().min(1),
  quantity: z.number().int().positive(),
  product: comboProductSchema.nullable(),
});

const comboSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().nullish(),
  image_url: z.string().nullish(),
  features: z.array(z.string()).nullish().transform((value) => value ?? []),
  items: z.array(comboItemSchema).nullish().transform((value) => value ?? []),
});

const adminComboSchema = comboSchema.extend({
  is_active: z.boolean(),
});

export type EnergyCombo = z.infer<typeof comboSchema>;
export type AdminEnergyCombo = z.infer<typeof adminComboSchema>;
export type ComboProduct = z.infer<typeof comboProductSchema>;

interface StoredCombo {
  id: string;
  name: string;
  description?: string | null;
  image_url?: string | null;
  features: string[];
  is_active: boolean;
  items: {
    product_id: string;
    quantity: number;
  }[];
  created_at?: string;
}

const COMBOS_STORAGE_KEY = 'construcenter_admin_combos';

const FALLBACK_COMBOS: StoredCombo[] = [
  {
    id: 'c0000001-0000-4000-8000-000000000001',
    name: 'Kit Autonomía Total: Solar 5kW + Batería Litio 5.12kWh',
    description: 'Solución completa "Cero Apagones" con generación solar fotovoltaica y almacenamiento de litio en rack para respaldo las 24 horas.',
    features: [
      'Cero apagones: respaldo instantáneo automático',
      'Ahorro estimado de hasta el 90% en la factura eléctrica',
      'Monitoreo inteligente en tiempo real vía smartphone',
      'Instalación y asesoría garantizada en Nicoya y Guanacaste',
    ],
    is_active: true,
    items: [
      { product_id: 'f0000001-0000-4000-8000-000000000001', quantity: 1 },
      { product_id: 'f0000001-0000-4000-8000-000000000003', quantity: 1 },
    ],
    created_at: new Date().toISOString(),
  },
  {
    id: 'c0000001-0000-4000-8000-000000000002',
    name: 'Combo Híbrido Respaldo: Inversor 6kW + Generador Silencioso 4500W',
    description: 'El dúo definitivo contra cortes prolongados. Conmuta automáticamente y mantiene refrigeración, bombas e iluminación crítica siempre activas.',
    features: [
      'Conmutación ultra rápida menor a 10ms',
      'Operación silenciosa apta para residencias y comercios',
      'Compatible con red eléctrica y banco de baterías futuro',
      'Soporte técnico directo ConstruCenter',
    ],
    is_active: true,
    items: [
      { product_id: 'f0000001-0000-4000-8000-000000000002', quantity: 1 },
      { product_id: 'f0000001-0000-4000-8000-000000000005', quantity: 1 },
    ],
    created_at: new Date().toISOString(),
  },
  {
    id: 'c0000001-0000-4000-8000-000000000003',
    name: 'Paquete Eco-Eficiencia: Calentador Solar 200L + Smart Home 200A',
    description: 'Reduce de inmediato el mayor consumo térmico de tu propiedad y supervisa en tiempo real cada circuito eléctrico desde tu teléfono.',
    features: [
      'Agua caliente 100% solar con tanque presurizado de acero inoxidable',
      'Tablero inteligente con medición de consumo por circuito',
      'Retorno de inversión garantizado en menos de 24 meses',
      'Calidad superior y acabados de lujo',
    ],
    is_active: true,
    items: [
      { product_id: 'f0000001-0000-4000-8000-000000000004', quantity: 1 },
      { product_id: 'f0000001-0000-4000-8000-000000000006', quantity: 1 },
    ],
    created_at: new Date().toISOString(),
  },
];

function getLocalCombos(): StoredCombo[] {
  try {
    const raw = localStorage.getItem(COMBOS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error al leer combos locales:', e);
  }
  return FALLBACK_COMBOS;
}

function saveLocalCombos(combos: StoredCombo[]) {
  try {
    localStorage.setItem(COMBOS_STORAGE_KEY, JSON.stringify(combos));
  } catch (e) {
    console.error('Error al guardar combos locales:', e);
  }
}

async function hydrateComboProducts(storedCombos: StoredCombo[]): Promise<AdminEnergyCombo[]> {
  try {
    const products = await productService.getProducts();
    const prodMap = new Map(products.map((p) => [p.id, p]));

    return storedCombos.map((combo) => ({
      id: combo.id,
      name: combo.name,
      description: combo.description || null,
      image_url: combo.image_url || null,
      features: combo.features || [],
      is_active: combo.is_active,
      items: (combo.items || []).map((item) => {
        const p = prodMap.get(item.product_id);
        return {
          product_id: item.product_id,
          quantity: item.quantity,
          product: p
            ? {
                id: p.id,
                name: p.name,
                sku: p.sku,
                slug: p.slug,
                price: p.price,
                images: p.images ?? [],
                is_active: p.is_active,
              }
            : null,
        };
      }),
    }));
  } catch {
    return storedCombos.map((combo) => ({
      id: combo.id,
      name: combo.name,
      description: combo.description || null,
      image_url: combo.image_url || null,
      features: combo.features || [],
      is_active: combo.is_active,
      items: combo.items.map((it) => ({
        product_id: it.product_id,
        quantity: it.quantity,
        product: null,
      })),
    }));
  }
}

export const comboService = {
  /**
   * Obtiene los combos activos para mostrar en la página de inicio
   */
  async getActiveCombos(): Promise<EnergyCombo[]> {
    if (!isSupabaseConfigured()) {
      const local = getLocalCombos().filter((c) => c.is_active);
      return hydrateComboProducts(local);
    }

    try {
      const { data, error } = await supabase
        .from('energy_combos')
        .select(
          'id, name, description, features, image_url, items:energy_combo_products(product_id, quantity, product:products(id, name, sku, slug, price, images, is_active))'
        )
        .eq('is_active', true)
        .order('id');

      if (error) {
        console.warn('Fallo consulta a Supabase en getActiveCombos, usando local:', error.message);
        const local = getLocalCombos().filter((c) => c.is_active);
        return hydrateComboProducts(local);
      }

      return z.array(comboSchema).parse(data ?? []);
    } catch {
      const local = getLocalCombos().filter((c) => c.is_active);
      return hydrateComboProducts(local);
    }
  },

  /**
   * Obtiene todos los combos para el panel administrativo
   */
  async getCombos(): Promise<AdminEnergyCombo[]> {
    if (!isSupabaseConfigured()) {
      const stored = getLocalCombos();
      return hydrateComboProducts(stored);
    }

    try {
      const { data, error } = await supabase
        .from('energy_combos')
        .select(
          'id, name, description, features, is_active, items:energy_combo_products(product_id, quantity, product:products(id, name, sku, price, is_active))'
        )
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Fallo consulta a Supabase en getCombos, usando local:', error.message);
        const stored = getLocalCombos();
        return hydrateComboProducts(stored);
      }

      return z.array(adminComboSchema).parse(data ?? []);
    } catch {
      const stored = getLocalCombos();
      return hydrateComboProducts(stored);
    }
  },

  /**
   * Guarda o actualiza un combo en la base de datos o almacenamiento local
   */
  async saveCombo(id: string | null, input: ComboFormData): Promise<string> {
    const payload = comboFormSchema.parse(input);
    const resolvedId = id || crypto.randomUUID();

    const saveLocal = () => {
      const combos = getLocalCombos();
      const existingIdx = combos.findIndex((c) => c.id === resolvedId);
      const newRecord: StoredCombo = {
        id: resolvedId,
        name: payload.name.trim(),
        description: payload.description?.trim() || null,
        image_url: payload.image_url?.trim() || null,
        features: payload.features || [],
        is_active: payload.is_active,
        items: payload.items.map((it) => ({
          product_id: it.product_id,
          quantity: it.quantity,
        })),
        created_at: existingIdx >= 0 ? combos[existingIdx].created_at : new Date().toISOString(),
      };

      if (existingIdx >= 0) {
        combos[existingIdx] = newRecord;
      } else {
        combos.unshift(newRecord);
      }
      saveLocalCombos(combos);
      return resolvedId;
    };

    if (!isSupabaseConfigured()) {
      return saveLocal();
    }

    try {
      const { data, error } = await supabase.rpc('save_energy_combo', {
        p_id: id,
        p_name: payload.name,
        p_description: payload.description,
        p_features: payload.features,
        p_is_active: payload.is_active,
        p_items: payload.items,
        p_image_url: payload.image_url || null,
      });

      if (error) {
        console.warn('Fallo RPC en Supabase, guardando localmente:', error.message);
        return saveLocal();
      }

      return z.string().min(1).parse(data);
    } catch {
      return saveLocal();
    }
  },

  /**
   * Elimina un combo
   */
  async deleteCombo(id: string): Promise<void> {
    const deleteLocal = () => {
      const combos = getLocalCombos().filter((c) => c.id !== id);
      saveLocalCombos(combos);
    };

    if (!isSupabaseConfigured()) {
      deleteLocal();
      return;
    }

    try {
      const { error } = await supabase.from('energy_combos').delete().eq('id', id);
      if (error) {
        console.warn('Fallo eliminación en Supabase, eliminando localmente:', error.message);
        deleteLocal();
      }
    } catch {
      deleteLocal();
    }
  },
};
