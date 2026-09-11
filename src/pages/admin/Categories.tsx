import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Stack as Layers,
  Plus,
  MagnifyingGlass as Search,
  PencilSimple as Edit2,
  Trash as Trash2,
  CheckCircle as CheckCircle2,
  XCircle,
  X,
  WarningCircle as AlertCircle,
  CircleNotch as Loader2,
  Sparkle as Sparkles,
} from '@phosphor-icons/react';
import { taxonomyService } from '@/services/taxonomy.service';
import { categorySchema, type CategoryFormData } from '@/schemas/taxonomy.schema';
import { generateSlug } from '@/utils/slug';
import type { Category } from '@/types/models';

export const AdminCategories: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [autoSlugEnabled, setAutoSlugEnabled] = useState(true);

  // 1. React Query: Obtener categorías
  const {
    data: categories = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: () => taxonomyService.getCategories(),
  });

  // 2. React Hook Form
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      image_url: '',
      is_active: true,
    },
  });

  const nameValue = watch('name');

  // Sincronizar auto-slug al cambiar el nombre (solo si está habilitado)
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setValue('name', value, { shouldValidate: true });
    if (autoSlugEnabled) {
      setValue('slug', generateSlug(value), { shouldValidate: true });
    }
  };

  // 3. Mutaciones React Query
  const createMutation = useMutation({
    mutationFn: (data: CategoryFormData) => taxonomyService.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      queryClient.invalidateQueries({ queryKey: ['admin-categories-active'] });
      queryClient.invalidateQueries({ queryKey: ['public-categories'] });
      closeModal();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CategoryFormData }) =>
      taxonomyService.updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      queryClient.invalidateQueries({ queryKey: ['admin-categories-active'] });
      queryClient.invalidateQueries({ queryKey: ['public-categories'] });
      closeModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => taxonomyService.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      queryClient.invalidateQueries({ queryKey: ['admin-categories-active'] });
      queryClient.invalidateQueries({ queryKey: ['public-categories'] });
      setDeleteConfirmId(null);
    },
  });

  const openCreateModal = () => {
    setEditingCategory(null);
    setAutoSlugEnabled(true);
    reset({
      name: '',
      slug: '',
      description: '',
      image_url: '',
      is_active: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setAutoSlugEnabled(false);
    reset({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
      image_url: cat.image_url || '',
      is_active: cat.is_active,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    reset();
  };

  const onSubmit = (formData: CategoryFormData) => {
    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  // Filtrado reactivo en UI
  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      {/* Header Superior */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-200/80">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-green-50 rounded-xl">
              <Layers className="w-6 h-6 text-constru-primary" />
            </div>
            <h1 className="text-2xl font-black text-constru-dark tracking-tight">Categorías</h1>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Gestiona la jerarquía y clasificación comercial de productos
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-constru-primary hover:bg-constru-primary-hover text-white rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 text-constru-accent" />
          <span>Nueva Categoría</span>
        </button>
      </div>

      {/* Barra de Búsqueda y Estadísticas */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar categoría por nombre o slug..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-constru-primary focus:border-constru-primary shadow-sm"
          />
        </div>
        <div className="text-xs font-semibold text-gray-500 bg-white px-3.5 py-2 rounded-xl border border-gray-200">
          Total: <span className="text-constru-primary font-bold">{categories.length}</span> categorías
        </div>
      </div>

      {/* Tabla de Listado */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-constru-primary animate-spin" />
            <p className="text-sm font-semibold text-gray-500">Cargando categorías...</p>
          </div>
        ) : isError ? (
          <div className="p-8 text-center">
            <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-2" />
            <p className="text-base font-bold text-gray-800">Error al cargar datos</p>
            <p className="text-sm text-gray-500 mt-1">{(error as Error)?.message}</p>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
              <Layers className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-base font-bold text-constru-dark">No se encontraron categorías</p>
            <p className="text-sm text-gray-400 mt-1">
              {searchTerm ? 'Prueba con otros términos de búsqueda.' : 'Crea tu primera categoría usando el botón superior.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/75 text-xs font-bold uppercase tracking-wider text-gray-600">
                  <th className="py-3.5 px-6">Categoría</th>
                  <th className="py-3.5 px-6">Slug</th>
                  <th className="py-3.5 px-6">Descripción</th>
                  <th className="py-3.5 px-6 text-center">Estado</th>
                  <th className="py-3.5 px-6 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filteredCategories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-green-50/30 transition-colors">
                    <td className="py-4 px-6 font-bold text-constru-dark">
                      <div className="flex items-center gap-3">
                        {cat.image_url ? (
                          <img
                            src={cat.image_url}
                            alt={cat.name}
                            className="w-10 h-10 rounded-lg object-cover border border-gray-200"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 font-bold text-xs">
                            {cat.name.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <span>{cat.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-500 font-mono text-xs">
                      <span className="bg-gray-100 px-2 py-1 rounded-md">{cat.slug}</span>
                    </td>
                    <td className="py-4 px-6 text-gray-500 max-w-xs truncate">
                      {cat.description || '—'}
                    </td>
                    <td className="py-4 px-6 text-center">
                      {cat.is_active ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800">
                          <CheckCircle2 className="w-3.5 h-3.5 text-constru-accent" />
                          Activo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600">
                          <XCircle className="w-3.5 h-3.5 text-gray-400" />
                          Inactivo
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(cat)}
                        className="p-1.5 text-gray-500 hover:text-constru-primary hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                        title="Editar categoría"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(cat.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Eliminar categoría"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Crear / Editar */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-fadeIn">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-constru-primary text-white">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-constru-accent" />
                <h3 className="text-lg font-black">
                  {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
                </h3>
              </div>
              <button
                onClick={closeModal}
                className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              {(createMutation.isError || updateMutation.isError) && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-medium">
                  {((createMutation.error || updateMutation.error) as Error)?.message}
                </div>
              )}

              {/* Nombre */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Nombre de la Categoría *
                </label>
                <input
                  type="text"
                  placeholder="Ej. Paneles Solares"
                  {...register('name')}
                  onChange={handleNameChange}
                  className={`w-full px-3.5 py-2 text-sm rounded-xl border ${
                    errors.name ? 'border-red-400' : 'border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-constru-primary`}
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-red-500 font-semibold">{errors.name.message}</p>
                )}
              </div>

              {/* Slug */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                    Slug (URL amigable) *
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setAutoSlugEnabled(!autoSlugEnabled);
                      if (!autoSlugEnabled && nameValue) {
                        setValue('slug', generateSlug(nameValue), { shouldValidate: true });
                      }
                    }}
                    className="text-[11px] text-constru-primary font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3 text-constru-accent" />
                    {autoSlugEnabled ? 'Slug automático activo' : 'Habilitar auto-slug'}
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="paneles-solares"
                  {...register('slug')}
                  className={`w-full px-3.5 py-2 text-sm rounded-xl border font-mono ${
                    errors.slug ? 'border-red-400' : 'border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-constru-primary`}
                />
                {errors.slug && (
                  <p className="mt-1 text-xs text-red-500 font-semibold">{errors.slug.message}</p>
                )}
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Descripción (Opcional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Breve reseña de la categoría..."
                  {...register('description')}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-constru-primary"
                />
              </div>

              {/* Imagen URL */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  URL de Imagen de Portada (Opcional)
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  {...register('image_url')}
                  className={`w-full px-3.5 py-2 text-sm rounded-xl border ${
                    errors.image_url ? 'border-red-400' : 'border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-constru-primary`}
                />
                {errors.image_url && (
                  <p className="mt-1 text-xs text-red-500 font-semibold">{errors.image_url.message}</p>
                )}
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
                  Categoría Activa (Visible en catálogo comercial)
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
                  {editingCategory ? 'Guardar Cambios' : 'Crear Categoría'}
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
            <h3 className="text-lg font-bold text-gray-900">¿Eliminar categoría?</h3>
            <p className="text-xs text-gray-500 mt-2">
              Primero reasigna los productos de esta categoría. Solo puedes eliminarla cuando no tenga productos vinculados.
            </p>
            {deleteMutation.isError && <p role="alert" className="mt-3 text-sm text-red-700">{deleteMutation.error.message}</p>}
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
export default AdminCategories;
