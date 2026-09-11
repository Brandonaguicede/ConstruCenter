import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import type { Category, Brand } from '@/types/models';
import type { CategoryFormData, BrandFormData } from '@/schemas/taxonomy.schema';
import { FALLBACK_PUBLIC_CATEGORIES, FALLBACK_PUBLIC_BRANDS } from '@/services/public.service';

const CATEGORIES_STORAGE_KEY = 'construcenter_admin_categories';
const BRANDS_STORAGE_KEY = 'construcenter_admin_brands';

function getLocalCategories(): Category[] {
  try {
    const raw = localStorage.getItem(CATEGORIES_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error al leer categorías locales:', e);
  }
  return FALLBACK_PUBLIC_CATEGORIES;
}

function saveLocalCategories(categories: Category[]) {
  try {
    localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
  } catch (e) {
    console.error('Error al guardar categorías locales:', e);
  }
}

function getLocalBrands(): Brand[] {
  try {
    const raw = localStorage.getItem(BRANDS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error al leer marcas locales:', e);
  }
  return FALLBACK_PUBLIC_BRANDS;
}

function saveLocalBrands(brands: Brand[]) {
  try {
    localStorage.setItem(BRANDS_STORAGE_KEY, JSON.stringify(brands));
  } catch (e) {
    console.error('Error al guardar marcas locales:', e);
  }
}

// Servicio de taxonomías con soporte para Supabase y fallback local persistente
export const taxonomyService = {
  // ==========================================
  // CATEGORÍAS
  // ==========================================

  async getCategories(onlyActive = false): Promise<Category[]> {
    if (!isSupabaseConfigured()) {
      const all = getLocalCategories();
      return onlyActive ? all.filter((c) => c.is_active) : all;
    }

    let query = supabase.from('categories').select('*').order('name', { ascending: true });
    if (onlyActive) {
      query = query.eq('is_active', true);
    }
    const { data, error } = await query;
    if (error) {
      const all = getLocalCategories();
      return onlyActive ? all.filter((c) => c.is_active) : all;
    }
    return (data as Category[]) || [];
  },

  async getCategoryById(id: string): Promise<Category> {
    if (!isSupabaseConfigured()) {
      const found = getLocalCategories().find((c) => c.id === id);
      if (!found) throw new Error(`Categoría con id ${id} no encontrada.`);
      return found;
    }

    const { data, error } = await supabase.from('categories').select('*').eq('id', id).single();
    if (error) {
      const found = getLocalCategories().find((c) => c.id === id);
      if (found) return found;
      throw new Error(`Error al obtener categoría: ${error.message}`);
    }
    return data as Category;
  },

  async createCategory(payload: CategoryFormData): Promise<Category> {
    const newCategory: Category = {
      id: crypto.randomUUID(),
      name: payload.name.trim(),
      slug: payload.slug.trim(),
      description: payload.description?.trim() || null,
      image_url: payload.image_url?.trim() || null,
      is_active: payload.is_active,
      created_at: new Date().toISOString(),
    };

    if (!isSupabaseConfigured()) {
      const list = getLocalCategories();
      const updated = [...list, newCategory];
      saveLocalCategories(updated);
      return newCategory;
    }

    const { data, error } = await supabase
      .from('categories')
      .insert({
        name: payload.name.trim(),
        slug: payload.slug.trim(),
        description: payload.description?.trim() || null,
        image_url: payload.image_url?.trim() || null,
        is_active: payload.is_active,
      })
      .select()
      .single();

    if (error) {
      // Fallback resiliente
      const list = getLocalCategories();
      saveLocalCategories([...list, newCategory]);
      return newCategory;
    }
    return data as Category;
  },

  async updateCategory(id: string, payload: Partial<CategoryFormData>): Promise<Category> {
    if (!isSupabaseConfigured()) {
      const list = getLocalCategories();
      const index = list.findIndex((c) => c.id === id);
      if (index === -1) throw new Error('Categoría no encontrada.');
      const updatedItem = {
        ...list[index],
        ...(payload.name ? { name: payload.name.trim() } : {}),
        ...(payload.slug ? { slug: payload.slug.trim() } : {}),
        description: payload.description !== undefined ? payload.description?.trim() || null : list[index].description,
        image_url: payload.image_url !== undefined ? payload.image_url?.trim() || null : list[index].image_url,
        ...(payload.is_active !== undefined ? { is_active: payload.is_active } : {}),
      };
      list[index] = updatedItem;
      saveLocalCategories(list);
      return updatedItem;
    }

    const { data, error } = await supabase
      .from('categories')
      .update({
        ...(payload.name ? { name: payload.name.trim() } : {}),
        ...(payload.slug ? { slug: payload.slug.trim() } : {}),
        description: payload.description !== undefined ? payload.description?.trim() || null : undefined,
        image_url: payload.image_url !== undefined ? payload.image_url?.trim() || null : undefined,
        ...(payload.is_active !== undefined ? { is_active: payload.is_active } : {}),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error al actualizar categoría en Supabase: ${error.message}`);
    }
    return data as Category;
  },

  async deleteCategory(id: string): Promise<void> {
    if (!isSupabaseConfigured()) {
      const list = getLocalCategories().filter((c) => c.id !== id);
      saveLocalCategories(list);
      return;
    }

    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) {
      throw new Error(`Error al eliminar categoría en Supabase: ${error.message}`);
    }
  },

  // ==========================================
  // MARCAS (BRANDS)
  // ==========================================

  async getBrands(onlyActive = false): Promise<Brand[]> {
    if (!isSupabaseConfigured()) {
      const all = getLocalBrands();
      return onlyActive ? all.filter((b) => b.is_active) : all;
    }

    let query = supabase.from('brands').select('*').order('name', { ascending: true });
    if (onlyActive) {
      query = query.eq('is_active', true);
    }
    const { data, error } = await query;
    if (error) {
      const all = getLocalBrands();
      return onlyActive ? all.filter((b) => b.is_active) : all;
    }
    return (data as Brand[]) || [];
  },

  async getBrandById(id: string): Promise<Brand> {
    if (!isSupabaseConfigured()) {
      const found = getLocalBrands().find((b) => b.id === id);
      if (!found) throw new Error(`Marca con id ${id} no encontrada.`);
      return found;
    }

    const { data, error } = await supabase.from('brands').select('*').eq('id', id).single();
    if (error) {
      const found = getLocalBrands().find((b) => b.id === id);
      if (found) return found;
      throw new Error(`Error al obtener marca: ${error.message}`);
    }
    return data as Brand;
  },

  async createBrand(payload: BrandFormData): Promise<Brand> {
    const newBrand: Brand = {
      id: crypto.randomUUID(),
      name: payload.name.trim(),
      slug: payload.slug.trim(),
      logo_url: payload.logo_url?.trim() || null,
      description: payload.description?.trim() || null,
      is_active: payload.is_active,
      created_at: new Date().toISOString(),
    };

    if (!isSupabaseConfigured()) {
      const list = getLocalBrands();
      const updated = [...list, newBrand];
      saveLocalBrands(updated);
      return newBrand;
    }

    const { data, error } = await supabase
      .from('brands')
      .insert({
        name: payload.name.trim(),
        slug: payload.slug.trim(),
        logo_url: payload.logo_url?.trim() || null,
        description: payload.description?.trim() || null,
        is_active: payload.is_active,
      })
      .select()
      .single();

    if (error) {
      const list = getLocalBrands();
      saveLocalBrands([...list, newBrand]);
      return newBrand;
    }
    return data as Brand;
  },

  async updateBrand(id: string, payload: Partial<BrandFormData>): Promise<Brand> {
    if (!isSupabaseConfigured()) {
      const list = getLocalBrands();
      const index = list.findIndex((b) => b.id === id);
      if (index === -1) throw new Error('Marca no encontrada.');
      const updatedItem = {
        ...list[index],
        ...(payload.name ? { name: payload.name.trim() } : {}),
        ...(payload.slug ? { slug: payload.slug.trim() } : {}),
        logo_url: payload.logo_url !== undefined ? payload.logo_url?.trim() || null : list[index].logo_url,
        description: payload.description !== undefined ? payload.description?.trim() || null : list[index].description,
        ...(payload.is_active !== undefined ? { is_active: payload.is_active } : {}),
      };
      list[index] = updatedItem;
      saveLocalBrands(list);
      return updatedItem;
    }

    const { data, error } = await supabase
      .from('brands')
      .update({
        ...(payload.name ? { name: payload.name.trim() } : {}),
        ...(payload.slug ? { slug: payload.slug.trim() } : {}),
        logo_url: payload.logo_url !== undefined ? payload.logo_url?.trim() || null : undefined,
        description: payload.description !== undefined ? payload.description?.trim() || null : undefined,
        ...(payload.is_active !== undefined ? { is_active: payload.is_active } : {}),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error al actualizar marca en Supabase: ${error.message}`);
    }
    return data as Brand;
  },

  async deleteBrand(id: string): Promise<void> {
    if (!isSupabaseConfigured()) {
      const list = getLocalBrands().filter((b) => b.id !== id);
      saveLocalBrands(list);
      return;
    }

    const { error } = await supabase.from('brands').delete().eq('id', id);
    if (error) {
      throw new Error(`Error al eliminar marca en Supabase: ${error.message}`);
    }
  },
};
