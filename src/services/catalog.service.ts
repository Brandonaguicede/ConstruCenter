import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import type { CatalogPDF } from '@/types/models';
import type { CatalogFormData } from '@/schemas/catalog.schema';
import { taxonomyService } from '@/services/taxonomy.service';

const CATALOGS_STORAGE_KEY = 'construcenter_admin_catalogs';

function getLocalCatalogs(): CatalogPDF[] {
  try {
    const raw = localStorage.getItem(CATALOGS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error al leer catálogos locales:', e);
  }
  return [];
}

function saveLocalCatalogs(catalogs: CatalogPDF[]) {
  try {
    localStorage.setItem(CATALOGS_STORAGE_KEY, JSON.stringify(catalogs));
  } catch (e) {
    console.error('Error al guardar catálogos locales:', e);
  }
}

async function hydrateCatalogBrand(catalogs: CatalogPDF[]): Promise<CatalogPDF[]> {
  try {
    const brands = await taxonomyService.getBrands();
    const brandMap = new Map(brands.map((b) => [b.id, b]));
    return catalogs.map((c) => ({
      ...c,
      brand: (c.brand_id ? brandMap.get(c.brand_id) : undefined) ?? c.brand ?? null,
    }));
  } catch {
    return catalogs;
  }
}

export const catalogService = {
  async getCatalogs(): Promise<CatalogPDF[]> {
    if (!isSupabaseConfigured()) {
      return hydrateCatalogBrand(getLocalCatalogs());
    }

    const { data, error } = await supabase
      .from('catalog_pdfs')
      .select('*, brand:brands(id, name, logo_url)')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Fallo consulta a Supabase, recurriendo a catálogos locales:', error.message);
      return hydrateCatalogBrand(getLocalCatalogs());
    }

    return (data as CatalogPDF[]) || [];
  },

  async getCatalogById(id: string): Promise<CatalogPDF> {
    if (!isSupabaseConfigured()) {
      const all = await hydrateCatalogBrand(getLocalCatalogs());
      const found = all.find((c) => c.id === id);
      if (!found) throw new Error(`Catálogo con ID ${id} no encontrado.`);
      return found;
    }

    const { data, error } = await supabase
      .from('catalog_pdfs')
      .select('*, brand:brands(id, name, logo_url)')
      .eq('id', id)
      .single();

    if (error) {
      const all = await hydrateCatalogBrand(getLocalCatalogs());
      const found = all.find((c) => c.id === id);
      if (found) return found;
      throw new Error(`Error al obtener catálogo: ${error.message}`);
    }
    return data as CatalogPDF;
  },

  async createCatalog(payload: CatalogFormData): Promise<CatalogPDF> {
    const newCatalog: CatalogPDF = {
      id: crypto.randomUUID(),
      title: payload.title.trim(),
      file_url: payload.file_url.trim(),
      cover_image_url: payload.cover_image_url?.trim() || null,
      brand_id: payload.brand_id?.trim() || null,
      file_size_bytes: payload.file_size_bytes ?? null,
      is_active: payload.is_active,
      created_at: new Date().toISOString(),
    };

    if (!isSupabaseConfigured()) {
      const list = getLocalCatalogs();
      list.unshift(newCatalog);
      saveLocalCatalogs(list);
      const [hydrated] = await hydrateCatalogBrand([newCatalog]);
      return hydrated;
    }

    const { data, error } = await supabase
      .from('catalog_pdfs')
      .insert({
        title: payload.title.trim(),
        file_url: payload.file_url.trim(),
        cover_image_url: payload.cover_image_url?.trim() || null,
        brand_id: payload.brand_id?.trim() || null,
        file_size_bytes: payload.file_size_bytes ?? null,
        is_active: payload.is_active,
      })
      .select('*, brand:brands(id, name, logo_url)')
      .single();

    if (error) {
      console.warn('Error insertando en Supabase, guardando localmente:', error.message);
      const list = getLocalCatalogs();
      list.unshift(newCatalog);
      saveLocalCatalogs(list);
      const [hydrated] = await hydrateCatalogBrand([newCatalog]);
      return hydrated;
    }
    return data as CatalogPDF;
  },

  async updateCatalog(id: string, payload: Partial<CatalogFormData>): Promise<CatalogPDF> {
    const updateLocal = async () => {
      const list = getLocalCatalogs();
      const idx = list.findIndex((c) => c.id === id);
      if (idx === -1) throw new Error(`Catálogo con ID ${id} no encontrado.`);
      const updated: CatalogPDF = {
        ...list[idx],
        ...(payload.title !== undefined && { title: payload.title.trim() }),
        ...(payload.file_url !== undefined && { file_url: payload.file_url.trim() }),
        cover_image_url: payload.cover_image_url !== undefined ? payload.cover_image_url?.trim() || null : list[idx].cover_image_url,
        brand_id: payload.brand_id !== undefined ? payload.brand_id?.trim() || null : list[idx].brand_id,
        file_size_bytes: payload.file_size_bytes !== undefined ? payload.file_size_bytes ?? null : list[idx].file_size_bytes,
        ...(payload.is_active !== undefined && { is_active: payload.is_active }),
        updated_at: new Date().toISOString(),
      };
      list[idx] = updated;
      saveLocalCatalogs(list);
      const [hydrated] = await hydrateCatalogBrand([updated]);
      return hydrated;
    };

    if (!isSupabaseConfigured()) {
      return updateLocal();
    }

    const updateData: Record<string, any> = {};
    if (payload.title !== undefined) updateData.title = payload.title.trim();
    if (payload.file_url !== undefined) updateData.file_url = payload.file_url.trim();
    if (payload.cover_image_url !== undefined) updateData.cover_image_url = payload.cover_image_url?.trim() || null;
    if (payload.brand_id !== undefined) updateData.brand_id = payload.brand_id?.trim() || null;
    if (payload.file_size_bytes !== undefined) updateData.file_size_bytes = payload.file_size_bytes ?? null;
    if (payload.is_active !== undefined) updateData.is_active = payload.is_active;

    const { data, error } = await supabase
      .from('catalog_pdfs')
      .update(updateData)
      .eq('id', id)
      .select('*, brand:brands(id, name, logo_url)')
      .single();

    if (error) {
      console.warn('Error actualizando en Supabase, guardando localmente:', error.message);
      return updateLocal();
    }
    return data as CatalogPDF;
  },

  async deleteCatalog(id: string): Promise<void> {
    if (!isSupabaseConfigured()) {
      saveLocalCatalogs(getLocalCatalogs().filter((c) => c.id !== id));
      return;
    }

    const { error } = await supabase.from('catalog_pdfs').delete().eq('id', id);
    if (error) {
      console.warn('Error eliminando en Supabase, eliminando localmente:', error.message);
      saveLocalCatalogs(getLocalCatalogs().filter((c) => c.id !== id));
    }
  },
};
