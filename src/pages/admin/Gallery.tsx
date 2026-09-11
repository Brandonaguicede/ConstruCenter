import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Images,
  Plus,
  MagnifyingGlass as Search,
  PencilSimple as Edit2,
  Trash as Trash2,
  CheckCircle as CheckCircle2,
  XCircle,
  X,
  WarningCircle as AlertCircle,
  CircleNotch as Loader2,
} from '@phosphor-icons/react';
import { galleryService } from '@/services/gallery.service';
import { galleryImageSchema, type GalleryImageFormData } from '@/schemas/gallery.schema';
import { ImageUpload } from '@/components/ui/ImageUpload';
import type { GalleryImage } from '@/types/models';

export const AdminGallery: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingImage, setEditingImage] = useState<GalleryImage | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const {
    data: images = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['admin-gallery'],
    queryFn: () => galleryService.getGalleryImages(),
  });

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<GalleryImageFormData>({
    resolver: zodResolver(galleryImageSchema),
    defaultValues: {
      title: '',
      description: '',
      image_url: '',
      is_active: true,
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: GalleryImageFormData) => galleryService.createGalleryImage(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-gallery'] });
      queryClient.invalidateQueries({ queryKey: ['public-gallery'] });
      closeModal();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: GalleryImageFormData }) =>
      galleryService.updateGalleryImage(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-gallery'] });
      queryClient.invalidateQueries({ queryKey: ['public-gallery'] });
      closeModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => galleryService.deleteGalleryImage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-gallery'] });
      queryClient.invalidateQueries({ queryKey: ['public-gallery'] });
      setDeleteConfirmId(null);
    },
  });

  const openCreateModal = () => {
    setEditingImage(null);
    reset({ title: '', description: '', image_url: '', is_active: true });
    setIsModalOpen(true);
  };

  const openEditModal = (img: GalleryImage) => {
    setEditingImage(img);
    reset({
      title: img.title || '',
      description: img.description || '',
      image_url: img.image_url,
      is_active: img.is_active,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingImage(null);
    reset();
  };

  const onSubmit = (formData: GalleryImageFormData) => {
    if (editingImage) {
      updateMutation.mutate({ id: editingImage.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const filteredImages = images.filter((i) =>
    (i.title || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      {/* Header Superior */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-200/80">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-green-50 rounded-xl">
              <Images className="w-6 h-6 text-constru-primary" />
            </div>
            <h1 className="text-2xl font-black text-constru-dark tracking-tight">Galería del Proyecto</h1>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Sube fotos de instalaciones y trabajos realizados para mostrarlas en el sitio
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-constru-primary hover:bg-constru-primary-hover text-white rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 text-constru-accent" />
          <span>Nueva Foto</span>
        </button>
      </div>

      {/* Barra de Búsqueda */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar foto por título..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-constru-primary focus:border-constru-primary shadow-sm"
          />
        </div>
        <div className="text-xs font-semibold text-gray-500 bg-white px-3.5 py-2 rounded-xl border border-gray-200">
          Total: <span className="text-constru-primary font-bold">{images.length}</span> fotos
        </div>
      </div>

      {/* Grilla de Listado */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-constru-primary animate-spin" />
            <p className="text-sm font-semibold text-gray-500">Cargando galería...</p>
          </div>
        ) : isError ? (
          <div className="p-8 text-center">
            <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-2" />
            <p className="text-base font-bold text-gray-800">Error al cargar datos</p>
            <p className="text-sm text-gray-500 mt-1">{(error as Error)?.message}</p>
          </div>
        ) : filteredImages.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
              <Images className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-base font-bold text-constru-dark">No se encontraron fotos</p>
            <p className="text-sm text-gray-400 mt-1">
              {searchTerm ? 'Prueba con otros términos de búsqueda.' : 'Sube tu primera foto usando el botón superior.'}
            </p>
          </div>
        ) : (
          <div className="p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredImages.map((img) => (
              <div key={img.id} className="group relative rounded-xl overflow-hidden border border-gray-200 bg-gray-50 aspect-square">
                <img src={img.image_url} alt={img.title || ''} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  <button
                    onClick={() => openEditModal(img)}
                    className="p-2 bg-white text-constru-primary rounded-lg shadow-md hover:bg-gray-100 transition-colors cursor-pointer"
                    title="Editar foto"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(img.id)}
                    className="p-2 bg-white text-red-600 rounded-lg shadow-md hover:bg-red-50 transition-colors cursor-pointer"
                    title="Eliminar foto"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="absolute top-2 left-2">
                  {img.is_active ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-800">
                      <CheckCircle2 className="w-3 h-3 text-constru-accent" />
                      Activa
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-600">
                      <XCircle className="w-3 h-3 text-gray-400" />
                      Inactiva
                    </span>
                  )}
                </div>
                {img.title && (
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent px-3 py-2">
                    <p className="text-white text-xs font-bold truncate">{img.title}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Crear / Editar */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-fadeIn my-8">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-constru-primary text-white">
              <div className="flex items-center gap-2">
                <Images className="w-5 h-5 text-constru-accent" />
                <h3 className="text-lg font-black">
                  {editingImage ? 'Editar Foto' : 'Nueva Foto'}
                </h3>
              </div>
              <button
                onClick={closeModal}
                className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {(createMutation.isError || updateMutation.isError) && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-medium">
                  {((createMutation.error || updateMutation.error) as Error)?.message}
                </div>
              )}

              {/* Foto */}
              <div>
                <Controller
                  control={control}
                  name="image_url"
                  render={({ field }) => (
                    <ImageUpload
                      value={field.value}
                      onChange={field.onChange}
                      label="Fotografía del Proyecto"
                      error={errors.image_url?.message}
                    />
                  )}
                />
                <label className="block text-sm font-medium mt-2">O pega una URL de imagen
                  <input
                    type="url"
                    className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
                    placeholder="https://..."
                    {...register('image_url')}
                  />
                </label>
              </div>

              {/* Título */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Título (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ej. Instalación residencial en Nicoya"
                  {...register('title')}
                  className={`w-full px-3.5 py-2 text-sm rounded-xl border ${
                    errors.title ? 'border-red-400' : 'border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-constru-primary`}
                />
                {errors.title && (
                  <p className="mt-1 text-xs text-red-500 font-semibold">{errors.title.message}</p>
                )}
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Descripción (Opcional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Breve detalle del proyecto..."
                  {...register('description')}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-constru-primary"
                />
              </div>

              {/* Estado Activo */}
              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="is_active"
                  {...register('is_active')}
                  className="w-4 h-4 text-constru-primary rounded-sm border-gray-300 focus:ring-constru-accent accent-constru-primary"
                />
                <label htmlFor="is_active" className="text-sm font-semibold text-gray-700 cursor-pointer">
                  Foto Activa (Visible en la galería del sitio)
                </label>
              </div>

              {/* Botones de Acción */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold bg-constru-primary hover:bg-constru-primary-hover text-white shadow-md transition-all disabled:opacity-60 cursor-pointer"
                >
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingImage ? 'Guardar Cambios' : 'Subir Foto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmación para Eliminar */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center animate-scaleUp">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">¿Eliminar foto?</h3>
            <p className="text-xs text-gray-500 mt-2">
              Esta acción no se puede deshacer. La foto dejará de mostrarse en la galería del sitio.
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => deleteMutation.mutate(deleteConfirmId)}
                disabled={deleteMutation.isPending}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-red-600 hover:bg-red-700 text-white shadow-md transition-all cursor-pointer"
              >
                {deleteMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminGallery;
