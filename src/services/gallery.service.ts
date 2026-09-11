import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import type { GalleryImage } from '@/types/models';
import type { GalleryImageFormData } from '@/schemas/gallery.schema';

const GALLERY_STORAGE_KEY = 'construcenter_admin_gallery';

function getLocalGallery(): GalleryImage[] {
  try {
    const raw = localStorage.getItem(GALLERY_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error al leer la galería local:', e);
  }
  return [];
}

function saveLocalGallery(images: GalleryImage[]) {
  try {
    localStorage.setItem(GALLERY_STORAGE_KEY, JSON.stringify(images));
  } catch (e) {
    console.error('Error al guardar la galería local:', e);
  }
}

export const galleryService = {
  async getGalleryImages(): Promise<GalleryImage[]> {
    if (!isSupabaseConfigured()) {
      return getLocalGallery();
    }

    const { data, error } = await supabase
      .from('gallery_images')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Fallo consulta a Supabase, recurriendo a la galería local:', error.message);
      return getLocalGallery();
    }

    return (data as GalleryImage[]) || [];
  },

  async createGalleryImage(payload: GalleryImageFormData): Promise<GalleryImage> {
    const newImage: GalleryImage = {
      id: crypto.randomUUID(),
      title: payload.title?.trim() || null,
      description: payload.description?.trim() || null,
      image_url: payload.image_url.trim(),
      is_active: payload.is_active,
      created_at: new Date().toISOString(),
    };

    if (!isSupabaseConfigured()) {
      const list = getLocalGallery();
      list.unshift(newImage);
      saveLocalGallery(list);
      return newImage;
    }

    const { data, error } = await supabase
      .from('gallery_images')
      .insert({
        title: payload.title?.trim() || null,
        description: payload.description?.trim() || null,
        image_url: payload.image_url.trim(),
        is_active: payload.is_active,
      })
      .select()
      .single();

    if (error) {
      console.warn('Error insertando en Supabase, guardando localmente:', error.message);
      const list = getLocalGallery();
      list.unshift(newImage);
      saveLocalGallery(list);
      return newImage;
    }
    return data as GalleryImage;
  },

  async updateGalleryImage(id: string, payload: Partial<GalleryImageFormData>): Promise<GalleryImage> {
    const updateLocal = () => {
      const list = getLocalGallery();
      const idx = list.findIndex((i) => i.id === id);
      if (idx === -1) throw new Error(`Imagen con ID ${id} no encontrada.`);
      const updated: GalleryImage = {
        ...list[idx],
        ...(payload.title !== undefined && { title: payload.title?.trim() || null }),
        ...(payload.description !== undefined && { description: payload.description?.trim() || null }),
        ...(payload.image_url !== undefined && { image_url: payload.image_url.trim() }),
        ...(payload.is_active !== undefined && { is_active: payload.is_active }),
        updated_at: new Date().toISOString(),
      };
      list[idx] = updated;
      saveLocalGallery(list);
      return updated;
    };

    if (!isSupabaseConfigured()) {
      return updateLocal();
    }

    const updateData: Record<string, any> = {};
    if (payload.title !== undefined) updateData.title = payload.title?.trim() || null;
    if (payload.description !== undefined) updateData.description = payload.description?.trim() || null;
    if (payload.image_url !== undefined) updateData.image_url = payload.image_url.trim();
    if (payload.is_active !== undefined) updateData.is_active = payload.is_active;

    const { data, error } = await supabase
      .from('gallery_images')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.warn('Error actualizando en Supabase, guardando localmente:', error.message);
      return updateLocal();
    }
    return data as GalleryImage;
  },

  async deleteGalleryImage(id: string): Promise<void> {
    if (!isSupabaseConfigured()) {
      saveLocalGallery(getLocalGallery().filter((i) => i.id !== id));
      return;
    }

    const { error } = await supabase.from('gallery_images').delete().eq('id', id);
    if (error) {
      console.warn('Error eliminando en Supabase, eliminando localmente:', error.message);
      saveLocalGallery(getLocalGallery().filter((i) => i.id !== id));
    }
  },
};
