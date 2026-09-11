import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import type { Product } from '@/types/models';
import type { ProductFormData } from '@/schemas/product.schema';
import { FALLBACK_PUBLIC_PRODUCTS } from '@/services/public.service';
import { taxonomyService } from '@/services/taxonomy.service';

export interface ProductFilters {
  searchTerm?: string;
  categoryId?: string;
  brandId?: string;
  isActive?: boolean;
}

const PRODUCTS_STORAGE_KEY = 'construcenter_admin_products';

function getLocalProducts(): Product[] {
  try {
    const raw = localStorage.getItem(PRODUCTS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error al leer productos locales:', e);
  }
  return FALLBACK_PUBLIC_PRODUCTS;
}

function saveLocalProducts(products: Product[]) {
  try {
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
  } catch (e) {
    console.error('Error al guardar productos locales:', e);
  }
}

async function hydrateProductRelations(products: Product[]): Promise<Product[]> {
  try {
    const [categories, brands] = await Promise.all([
      taxonomyService.getCategories(),
      taxonomyService.getBrands(),
    ]);

    const catMap = new Map(categories.map(c => [c.id, c]));
    const brandMap = new Map(brands.map(b => [b.id, b]));

    return products.map(p => ({
      ...p,
      category: catMap.get(p.category_id) ?? p.category ?? null,
      brand: brandMap.get(p.brand_id) ?? p.brand ?? null,
    }));
  } catch {
    return products;
  }
}

export const productService = {
  /**
   * Obtiene la lista de productos con datos relacionales de Categoría y Marca
   */
  async getProducts(filters: ProductFilters = {}): Promise<Product[]> {
    if (!isSupabaseConfigured()) {
      return this.getLocalProductsFiltered(filters);
    }

    try {
      let query = supabase
        .from('products')
        .select('*, category:categories(id, name, slug), brand:brands(id, name, slug)')
        .order('created_at', { ascending: false });

      if (filters.categoryId) {
        query = query.eq('category_id', filters.categoryId);
      }

      if (filters.brandId) {
        query = query.eq('brand_id', filters.brandId);
      }

      if (filters.isActive !== undefined) {
        query = query.eq('is_active', filters.isActive);
      }

      if (filters.searchTerm) {
        const term = filters.searchTerm.trim();
        query = query.or(`name.ilike.%${term}%,sku.ilike.%${term}%,description.ilike.%${term}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.warn('Fallo consulta a Supabase, recurriendo a productos locales:', error.message);
        return this.getLocalProductsFiltered(filters);
      }

      return (data as Product[]) || [];
    } catch {
      return this.getLocalProductsFiltered(filters);
    }
  },

  async getLocalProductsFiltered(filters: ProductFilters = {}): Promise<Product[]> {
    let items = getLocalProducts();
    items = await hydrateProductRelations(items);

    if (filters.categoryId) {
      items = items.filter(p => p.category_id === filters.categoryId);
    }

    if (filters.brandId) {
      items = items.filter(p => p.brand_id === filters.brandId);
    }

    if (filters.isActive !== undefined) {
      items = items.filter(p => p.is_active === filters.isActive);
    }

    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase().trim();
      items = items.filter(p =>
        p.name.toLowerCase().includes(term) ||
        p.sku.toLowerCase().includes(term) ||
        (Boolean(p.description) && (p.description as string).toLowerCase().includes(term))
      );
    }

    return items;
  },

  /**
   * Obtiene un producto por su identificador con sus relaciones
   */
  async getProductById(id: string): Promise<Product> {
    if (!isSupabaseConfigured()) {
      const all = await this.getLocalProductsFiltered();
      const found = all.find(p => p.id === id);
      if (!found) throw new Error(`Producto con ID ${id} no encontrado.`);
      return found;
    }

    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, category:categories(id, name, slug), brand:brands(id, name, slug)')
        .eq('id', id)
        .single();

      if (error) {
        const all = await this.getLocalProductsFiltered();
        const found = all.find(p => p.id === id);
        if (found) return found;
        throw new Error(`Error al consultar el producto (${id}): ${error.message}`);
      }

      return data as Product;
    } catch {
      const all = await this.getLocalProductsFiltered();
      const found = all.find(p => p.id === id);
      if (found) return found;
      throw new Error(`Producto con ID ${id} no encontrado.`);
    }
  },

  /**
   * Crea un nuevo producto validado
   */
  async createProduct(payload: ProductFormData): Promise<Product> {
    const newId = crypto.randomUUID();
    const now = new Date().toISOString();

    const localProduct: Product = {
      id: newId,
      sku: payload.sku.trim().toUpperCase(),
      name: payload.name.trim(),
      slug: payload.slug.trim(),
      description: payload.description?.trim() || null,
      price: payload.price,
      compare_at_price: payload.compare_at_price ?? null,
      cost_price: payload.cost_price ?? null,
      stock: payload.stock,
      category_id: payload.category_id,
      brand_id: payload.brand_id,
      images: payload.images || [],
      is_active: payload.is_active,
      is_featured: payload.is_featured,
      specs: payload.specs || {},
      created_at: now,
      updated_at: now,
    };

    if (!isSupabaseConfigured()) {
      const all = getLocalProducts();
      all.unshift(localProduct);
      saveLocalProducts(all);
      const [hydrated] = await hydrateProductRelations([localProduct]);
      return hydrated;
    }

    try {
      const { data, error } = await supabase
        .from('products')
        .insert({
          sku: payload.sku.trim().toUpperCase(),
          name: payload.name.trim(),
          slug: payload.slug.trim(),
          description: payload.description?.trim() || null,
          price: payload.price,
          compare_at_price: payload.compare_at_price ?? null,
          cost_price: payload.cost_price ?? null,
          stock: payload.stock,
          category_id: payload.category_id,
          brand_id: payload.brand_id,
          images: payload.images,
          is_active: payload.is_active,
          is_featured: payload.is_featured,
          specs: payload.specs || {},
        })
        .select('*, category:categories(id, name, slug), brand:brands(id, name, slug)')
        .single();

      if (error) {
        console.warn('Error insertando en Supabase, guardando localmente:', error.message);
        const all = getLocalProducts();
        all.unshift(localProduct);
        saveLocalProducts(all);
        const [hydrated] = await hydrateProductRelations([localProduct]);
        return hydrated;
      }

      return data as Product;
    } catch {
      const all = getLocalProducts();
      all.unshift(localProduct);
      saveLocalProducts(all);
      const [hydrated] = await hydrateProductRelations([localProduct]);
      return hydrated;
    }
  },

  /**
   * Actualiza un producto existente
   */
  async updateProduct(id: string, payload: Partial<ProductFormData>): Promise<Product> {
    const updateLocal = async () => {
      const all = getLocalProducts();
      const idx = all.findIndex(p => p.id === id);
      if (idx === -1) throw new Error(`Producto con ID ${id} no encontrado.`);

      const updated: Product = {
        ...all[idx],
        ...(payload.sku !== undefined && { sku: payload.sku.trim().toUpperCase() }),
        ...(payload.name !== undefined && { name: payload.name.trim() }),
        ...(payload.slug !== undefined && { slug: payload.slug.trim() }),
        ...(payload.description !== undefined && { description: payload.description?.trim() || null }),
        ...(payload.price !== undefined && { price: payload.price }),
        ...(payload.compare_at_price !== undefined && { compare_at_price: payload.compare_at_price ?? null }),
        ...(payload.cost_price !== undefined && { cost_price: payload.cost_price ?? null }),
        ...(payload.stock !== undefined && { stock: payload.stock }),
        ...(payload.category_id !== undefined && { category_id: payload.category_id }),
        ...(payload.brand_id !== undefined && { brand_id: payload.brand_id }),
        ...(payload.images !== undefined && { images: payload.images }),
        ...(payload.is_active !== undefined && { is_active: payload.is_active }),
        ...(payload.is_featured !== undefined && { is_featured: payload.is_featured }),
        ...(payload.specs !== undefined && { specs: payload.specs }),
        updated_at: new Date().toISOString(),
      };

      all[idx] = updated;
      saveLocalProducts(all);
      const [hydrated] = await hydrateProductRelations([updated]);
      return hydrated;
    };

    if (!isSupabaseConfigured()) {
      return updateLocal();
    }

    try {
      const updateData: Record<string, any> = {};
      if (payload.sku !== undefined) updateData.sku = payload.sku.trim().toUpperCase();
      if (payload.name !== undefined) updateData.name = payload.name.trim();
      if (payload.slug !== undefined) updateData.slug = payload.slug.trim();
      if (payload.description !== undefined) updateData.description = payload.description?.trim() || null;
      if (payload.price !== undefined) updateData.price = payload.price;
      if (payload.compare_at_price !== undefined) updateData.compare_at_price = payload.compare_at_price ?? null;
      if (payload.cost_price !== undefined) updateData.cost_price = payload.cost_price ?? null;
      if (payload.stock !== undefined) updateData.stock = payload.stock;
      if (payload.category_id !== undefined) updateData.category_id = payload.category_id;
      if (payload.brand_id !== undefined) updateData.brand_id = payload.brand_id;
      if (payload.images !== undefined) updateData.images = payload.images;
      if (payload.is_active !== undefined) updateData.is_active = payload.is_active;
      if (payload.is_featured !== undefined) updateData.is_featured = payload.is_featured;
      if (payload.specs !== undefined) updateData.specs = payload.specs;

      const { data, error } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', id)
        .select('*, category:categories(id, name, slug), brand:brands(id, name, slug)')
        .single();

      if (error) {
        console.warn('Error actualizando en Supabase, guardando localmente:', error.message);
        return updateLocal();
      }

      return data as Product;
    } catch {
      return updateLocal();
    }
  },

  /**
   * Elimina un producto por ID
   */
  async deleteProduct(id: string): Promise<void> {
    const deleteLocal = () => {
      const all = getLocalProducts().filter(p => p.id !== id);
      saveLocalProducts(all);
    };

    if (!isSupabaseConfigured()) {
      deleteLocal();
      return;
    }

    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) {
        console.warn('Error eliminando en Supabase, eliminando localmente:', error.message);
        deleteLocal();
      }
    } catch {
      deleteLocal();
    }
  },
};
